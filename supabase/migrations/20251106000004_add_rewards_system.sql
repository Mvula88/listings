-- Create referral_rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  free_featured_listings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create referral_transactions table (track point changes)
CREATE TABLE IF NOT EXISTS referral_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'bonus', 'expired')),
  reason TEXT NOT NULL,
  related_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  related_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create reward_redemptions table
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('featured_listing', 'premium_listing', 'priority_support', 'discount')),
  points_cost INTEGER NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'used', 'expired')),
  expires_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_tier ON referral_rewards(tier);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_lifetime_points ON referral_rewards(lifetime_points DESC);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_user_id ON referral_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_created_at ON referral_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_status ON reward_redemptions(status);

-- Add RLS policies
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own rewards
CREATE POLICY "Users can view own rewards" ON referral_rewards
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON referral_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own redemptions
CREATE POLICY "Users can view own redemptions" ON reward_redemptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create redemptions
CREATE POLICY "Users can create redemptions" ON reward_redemptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can manage all
CREATE POLICY "Service role can manage rewards" ON referral_rewards
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage transactions" ON referral_transactions
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage redemptions" ON reward_redemptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to calculate tier based on lifetime points
CREATE OR REPLACE FUNCTION calculate_referral_tier(lifetime_points INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF lifetime_points >= 500 THEN
    RETURN 'platinum';
  ELSIF lifetime_points >= 250 THEN
    RETURN 'gold';
  ELSIF lifetime_points >= 100 THEN
    RETURN 'silver';
  ELSE
    RETURN 'bronze';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to award referral points
CREATE OR REPLACE FUNCTION award_referral_points(
  referrer_id UUID,
  referee_id UUID,
  points_amount INTEGER,
  reason TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Create or update referral_rewards for referrer
  INSERT INTO referral_rewards (user_id, points, lifetime_points)
  VALUES (referrer_id, points_amount, points_amount)
  ON CONFLICT (user_id) DO UPDATE
  SET
    points = referral_rewards.points + points_amount,
    lifetime_points = referral_rewards.lifetime_points + points_amount,
    tier = calculate_referral_tier(referral_rewards.lifetime_points + points_amount),
    updated_at = now();

  -- Create transaction record
  INSERT INTO referral_transactions (user_id, points, type, reason, related_user_id)
  VALUES (referrer_id, points_amount, 'earned', reason, referee_id);

  -- Award bonus featured listing at certain tiers
  IF (SELECT lifetime_points FROM referral_rewards WHERE user_id = referrer_id) >= 100 THEN
    UPDATE referral_rewards
    SET free_featured_listings = free_featured_listings + 1
    WHERE user_id = referrer_id
    AND (SELECT COUNT(*) FROM referral_transactions WHERE user_id = referrer_id AND type = 'bonus' AND reason LIKE '%100 points%') = 0;

    INSERT INTO referral_transactions (user_id, points, type, reason)
    SELECT referrer_id, 0, 'bonus', 'Reached 100 points - Free featured listing!'
    WHERE NOT EXISTS (
      SELECT 1 FROM referral_transactions
      WHERE user_id = referrer_id AND type = 'bonus' AND reason LIKE '%100 points%'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to award points when referee makes first transaction
CREATE OR REPLACE FUNCTION award_points_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
  referrer_id UUID;
BEGIN
  -- Check if buyer was referred
  SELECT referred_by INTO referrer_id
  FROM profiles
  WHERE id = NEW.buyer_id;

  -- Award points if referrer exists and this is first transaction
  IF referrer_id IS NOT NULL THEN
    -- Check if this is buyer's first completed transaction
    IF (SELECT COUNT(*) FROM transactions WHERE buyer_id = NEW.buyer_id AND status IN ('completed', 'lawyers_selected')) = 1 THEN
      PERFORM award_referral_points(
        referrer_id,
        NEW.buyer_id,
        50, -- 50 points for referral completing first transaction
        'Referral completed first transaction'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_award_referral_points ON transactions;
CREATE TRIGGER trigger_award_referral_points
  AFTER INSERT OR UPDATE OF status ON transactions
  FOR EACH ROW
  WHEN (NEW.status IN ('completed', 'lawyers_selected'))
  EXECUTE FUNCTION award_points_on_transaction();

-- Function to redeem points for featured listing
CREATE OR REPLACE FUNCTION redeem_featured_listing(
  user_id_param UUID,
  property_id_param UUID,
  days INTEGER
)
RETURNS JSONB AS $$
DECLARE
  points_required INTEGER;
  user_points INTEGER;
  free_listings INTEGER;
  result JSONB;
BEGIN
  -- Calculate points required (100 points per week)
  points_required := days * 15; -- ~15 points per day

  -- Get user's current points and free listings
  SELECT points, free_featured_listings
  INTO user_points, free_listings
  FROM referral_rewards
  WHERE user_id = user_id_param;

  -- Check if user has free listing
  IF free_listings > 0 THEN
    -- Use free listing
    UPDATE referral_rewards
    SET free_featured_listings = free_featured_listings - 1
    WHERE user_id = user_id_param;

    -- Create redemption record
    INSERT INTO reward_redemptions (user_id, reward_type, points_cost, property_id, status, expires_at)
    VALUES (
      user_id_param,
      'featured_listing',
      0,
      property_id_param,
      'active',
      now() + (days || ' days')::INTERVAL
    );

    result := jsonb_build_object('success', true, 'used_free_listing', true);
  ELSIF user_points >= points_required THEN
    -- Deduct points
    UPDATE referral_rewards
    SET points = points - points_required
    WHERE user_id = user_id_param;

    -- Create transaction record
    INSERT INTO referral_transactions (user_id, points, type, reason, related_property_id)
    VALUES (user_id_param, -points_required, 'redeemed', 'Featured listing for ' || days || ' days', property_id_param);

    -- Create redemption record
    INSERT INTO reward_redemptions (user_id, reward_type, points_cost, property_id, status, expires_at)
    VALUES (
      user_id_param,
      'featured_listing',
      points_required,
      property_id_param,
      'active',
      now() + (days || ' days')::INTERVAL
    );

    result := jsonb_build_object('success', true, 'points_used', points_required);
  ELSE
    result := jsonb_build_object('success', false, 'error', 'Insufficient points');
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE referral_rewards IS 'User referral points and rewards';
COMMENT ON TABLE referral_transactions IS 'History of points earned and spent';
COMMENT ON TABLE reward_redemptions IS 'Redeemed rewards (featured listings, etc)';
