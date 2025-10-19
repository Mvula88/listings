-- Migration: Update to Lawyer-Collected Fee Model
-- Description: Remove Stripe fields and add deal closure tracking for lawyer-collected platform fees

-- Remove Stripe-related columns from profiles
ALTER TABLE profiles
DROP COLUMN IF EXISTS stripe_customer_id,
DROP COLUMN IF EXISTS stripe_connect_account_id;

-- Remove Stripe-related columns from lawyers
ALTER TABLE lawyers
DROP COLUMN IF EXISTS stripe_account_id,
DROP COLUMN IF EXISTS stripe_onboarding_complete;

-- Add deal closure tracking fields to transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS platform_fee_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS deal_closed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deal_closed_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS settlement_reference VARCHAR(255),
ADD COLUMN IF NOT EXISTS fee_collected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fee_remitted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fee_remitted_at TIMESTAMP WITH TIME ZONE;

-- Create table for tracking platform fee remittances from lawyers
CREATE TABLE IF NOT EXISTS fee_remittances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE RESTRICT,
  platform_fee_amount DECIMAL(10, 2) NOT NULL,
  remittance_date DATE NOT NULL,
  remittance_reference VARCHAR(255),
  proof_of_payment_url TEXT,
  notes TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for lawyer fee remittances
CREATE INDEX IF NOT EXISTS idx_fee_remittances_lawyer ON fee_remittances(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_fee_remittances_transaction ON fee_remittances(transaction_id);
CREATE INDEX IF NOT EXISTS idx_fee_remittances_date ON fee_remittances(remittance_date);
CREATE INDEX IF NOT EXISTS idx_fee_remittances_verified ON fee_remittances(verified);

-- Create table for lawyer monthly reconciliation reports
CREATE TABLE IF NOT EXISTS lawyer_reconciliation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  report_month DATE NOT NULL, -- First day of month
  deals_closed INTEGER DEFAULT 0,
  total_platform_fees_collected DECIMAL(10, 2) DEFAULT 0,
  total_remitted DECIMAL(10, 2) DEFAULT 0,
  balance_outstanding DECIMAL(10, 2) DEFAULT 0,
  report_submitted_at TIMESTAMP WITH TIME ZONE,
  report_submitted_by UUID REFERENCES profiles(id),
  reconciled BOOLEAN DEFAULT FALSE,
  reconciled_by UUID REFERENCES profiles(id),
  reconciled_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lawyer_id, report_month)
);

-- Create index for reconciliation reports
CREATE INDEX IF NOT EXISTS idx_reconciliation_lawyer ON lawyer_reconciliation_reports(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_month ON lawyer_reconciliation_reports(report_month);
CREATE INDEX IF NOT EXISTS idx_reconciliation_reconciled ON lawyer_reconciliation_reports(reconciled);

-- Update payments table to track lawyer-collected fees instead of Stripe
-- Remove Stripe fields
ALTER TABLE payments
DROP COLUMN IF EXISTS stripe_payment_intent_id,
DROP COLUMN IF EXISTS stripe_checkout_session_id,
DROP COLUMN IF EXISTS stripe_invoice_id;

-- Add lawyer collection tracking
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS collected_by_lawyer BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS lawyer_id UUID REFERENCES lawyers(id),
ADD COLUMN IF NOT EXISTS settlement_statement_url TEXT,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'settlement';

-- Update existing payment records to reflect new model
UPDATE payments SET collected_by_lawyer = TRUE, payment_method = 'settlement' WHERE payment_method IS NULL;

-- Create function to calculate platform fee based on property value
CREATE OR REPLACE FUNCTION calculate_platform_fee(property_price DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  RETURN CASE
    WHEN property_price <= 500000 THEN 3000
    WHEN property_price <= 1000000 THEN 6000
    WHEN property_price <= 2000000 THEN 10000
    WHEN property_price <= 5000000 THEN 15000
    ELSE 25000
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to automatically set platform fee when transaction is created
CREATE OR REPLACE FUNCTION set_transaction_platform_fee()
RETURNS TRIGGER AS $$
DECLARE
  property_price DECIMAL;
BEGIN
  -- Get property price
  SELECT price INTO property_price FROM properties WHERE id = NEW.property_id;

  -- Set platform fee
  NEW.platform_fee_amount := calculate_platform_fee(property_price);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS transaction_platform_fee_trigger ON transactions;
CREATE TRIGGER transaction_platform_fee_trigger
  BEFORE INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION set_transaction_platform_fee();

-- Update RLS policies for new tables
ALTER TABLE fee_remittances ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_reconciliation_reports ENABLE ROW LEVEL SECURITY;

-- Lawyers can view their own remittances
CREATE POLICY lawyer_view_own_remittances ON fee_remittances
  FOR SELECT
  USING (
    lawyer_id IN (
      SELECT id FROM lawyers WHERE profile_id = auth.uid()
    )
  );

-- Lawyers can insert their own remittances
CREATE POLICY lawyer_insert_own_remittances ON fee_remittances
  FOR INSERT
  WITH CHECK (
    lawyer_id IN (
      SELECT id FROM lawyers WHERE profile_id = auth.uid()
    )
  );

-- Lawyers can view their own reconciliation reports
CREATE POLICY lawyer_view_own_reports ON lawyer_reconciliation_reports
  FOR SELECT
  USING (
    lawyer_id IN (
      SELECT id FROM lawyers WHERE profile_id = auth.uid()
    )
  );

-- Lawyers can insert/update their own reports
CREATE POLICY lawyer_manage_own_reports ON lawyer_reconciliation_reports
  FOR ALL
  USING (
    lawyer_id IN (
      SELECT id FROM lawyers WHERE profile_id = auth.uid()
    )
  );

-- Add comment documenting the new model
COMMENT ON TABLE fee_remittances IS 'Tracks platform fees collected by lawyers and remitted to DealDirect';
COMMENT ON TABLE lawyer_reconciliation_reports IS 'Monthly reconciliation reports submitted by lawyers showing deals closed and fees collected';
COMMENT ON COLUMN transactions.platform_fee_amount IS 'Tiered platform fee based on property value, collected by lawyer at closing';
COMMENT ON COLUMN transactions.deal_closed_at IS 'When the lawyer reported the deal as closed';
COMMENT ON COLUMN transactions.fee_collected IS 'Whether the platform fee has been collected from client';
COMMENT ON COLUMN transactions.fee_remitted IS 'Whether the lawyer has remitted the platform fee to DealDirect';
