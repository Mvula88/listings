-- Add property_id column to existing payments table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'property_id') THEN
    ALTER TABLE payments ADD COLUMN property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'metadata') THEN
    ALTER TABLE payments ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'updated_at') THEN
    ALTER TABLE payments ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Add indexes for better query performance if columns exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'user_id') THEN
    CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'property_id') THEN
    CREATE INDEX IF NOT EXISTS idx_payments_property_id ON payments(property_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'stripe_checkout_session_id') THEN
    CREATE INDEX IF NOT EXISTS idx_payments_stripe_session_id ON payments(stripe_checkout_session_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'status') THEN
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'created_at') THEN
    CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
  END IF;
END $$;

-- Add featured fields to properties table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'featured') THEN
    ALTER TABLE properties ADD COLUMN featured BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'featured_until') THEN
    ALTER TABLE properties ADD COLUMN featured_until TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'premium') THEN
    ALTER TABLE properties ADD COLUMN premium BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create index for featured properties
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured, featured_until);

-- Add RLS policies for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only authenticated users can create payments (via API)
CREATE POLICY "Service role can manage payments" ON payments
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add trigger to automatically unfeatured properties when featured_until expires
CREATE OR REPLACE FUNCTION check_featured_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.featured = TRUE AND NEW.featured_until IS NOT NULL AND NEW.featured_until < now() THEN
    NEW.featured = FALSE;
    NEW.premium = FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_featured_expiry
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION check_featured_expiry();

COMMENT ON TABLE payments IS 'Stores payment transactions for featured listings and premium placements';
COMMENT ON COLUMN payments.type IS 'Type of payment: success_fee_buyer, success_fee_seller, lawyer_referral, premium_listing';
COMMENT ON COLUMN payments.metadata IS 'Additional payment metadata like plan details and duration';
