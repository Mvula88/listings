-- Migration: Fix Fee Model Schema - Remove Buyer Fees & Align with Seller-Only Model
-- Description: Remove buyer fee tracking, update to seller-only platform fee model
-- Date: 2025-11-24

-- ============================================================================
-- 1. REMOVE BUYER FEE FIELDS FROM TRANSACTIONS
-- ============================================================================

-- Remove buyer success fee tracking (buyers pay ZERO platform fees)
ALTER TABLE transactions
DROP COLUMN IF EXISTS buyer_success_fee_paid,
DROP COLUMN IF EXISTS buyer_lawyer_fee_paid;

-- Rename seller_success_fee_paid to align with new model
-- Note: We'll keep seller_lawyer_fee_paid for now but it's tracked separately by lawyers
ALTER TABLE transactions
DROP COLUMN IF EXISTS seller_success_fee_paid,
DROP COLUMN IF EXISTS seller_lawyer_fee_paid;

-- The correct fields are already in place from migration 003:
-- - platform_fee_amount (tiered fee based on property price)
-- - fee_collected (lawyer confirms they collected it)
-- - fee_remitted (lawyer confirms they sent it to us)

-- ============================================================================
-- 2. ADD LAWYER COMMISSION TRACKING (10% Revenue Share Model)
-- ============================================================================

-- Add commission tracking to transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS lawyer_commission_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS lawyer_commission_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lawyer_commission_paid_at TIMESTAMP WITH TIME ZONE;

-- Add commission tracking to fee_remittances
ALTER TABLE fee_remittances
ADD COLUMN IF NOT EXISTS lawyer_commission_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS net_remittance_amount DECIMAL(10, 2);

-- Create function to calculate lawyer commission (10% of platform fee)
CREATE OR REPLACE FUNCTION calculate_lawyer_commission(platform_fee DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  RETURN ROUND(platform_fee * 0.10, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update the transaction trigger to also set lawyer commission
CREATE OR REPLACE FUNCTION set_transaction_platform_fee()
RETURNS TRIGGER AS $$
DECLARE
  property_price DECIMAL;
  platform_fee DECIMAL;
BEGIN
  -- Get property price
  SELECT price INTO property_price FROM properties WHERE id = NEW.property_id;

  -- Calculate platform fee using tiered structure
  platform_fee := calculate_platform_fee(property_price);

  -- Set platform fee and lawyer commission
  NEW.platform_fee_amount := platform_fee;
  NEW.lawyer_commission_amount := calculate_lawyer_commission(platform_fee);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. ADD REMITTANCE ENFORCEMENT FIELDS
-- ============================================================================

-- Add overdue tracking to transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS remittance_due_date DATE,
ADD COLUMN IF NOT EXISTS remittance_overdue BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS remittance_reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- Add enforcement fields to lawyers table
ALTER TABLE lawyers
ADD COLUMN IF NOT EXISTS remittance_status VARCHAR(50) DEFAULT 'good_standing',
ADD COLUMN IF NOT EXISTS suspended_for_non_payment BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS suspension_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_remittance_date DATE,
ADD COLUMN IF NOT EXISTS total_outstanding_fees DECIMAL(10, 2) DEFAULT 0;

-- Create index for enforcement queries
CREATE INDEX IF NOT EXISTS idx_transactions_remittance_due ON transactions(remittance_due_date)
  WHERE fee_collected = TRUE AND fee_remitted = FALSE;
CREATE INDEX IF NOT EXISTS idx_lawyers_suspended ON lawyers(suspended_for_non_payment)
  WHERE suspended_for_non_payment = TRUE;

-- ============================================================================
-- 4. ENHANCE AUDIT LOGGING
-- ============================================================================

-- Note: audit_logs table already exists from migration 20251105142237_admin_panel_system.sql
-- It uses resource_type/resource_id instead of entity_type/entity_id
-- We'll work with the existing schema

-- Add specific indexes for fee-related audit queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_fee_actions ON audit_logs(action)
  WHERE action IN ('fee_collected', 'fee_remitted', 'lawyer_suspended', 'commission_paid');
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id)
  WHERE resource_type IN ('transaction', 'lawyer');

-- Function to log fee-related actions
-- Note: Using resource_type/resource_id to match existing audit_logs schema
CREATE OR REPLACE FUNCTION log_fee_action()
RETURNS TRIGGER AS $$
BEGIN
  -- Log fee collection
  IF (TG_OP = 'UPDATE' AND NEW.fee_collected = TRUE AND OLD.fee_collected = FALSE) THEN
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id, new_values, metadata)
    VALUES (
      NEW.deal_closed_by,
      'fee_collected',
      'transaction',
      NEW.id,
      jsonb_build_object(
        'platform_fee_amount', NEW.platform_fee_amount,
        'lawyer_commission_amount', NEW.lawyer_commission_amount,
        'settlement_reference', NEW.settlement_reference,
        'deal_closed_at', NEW.deal_closed_at
      ),
      jsonb_build_object('event', 'platform_fee_collection')
    );
  END IF;

  -- Log fee remittance
  IF (TG_OP = 'UPDATE' AND NEW.fee_remitted = TRUE AND OLD.fee_remitted = FALSE) THEN
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id, new_values, metadata)
    VALUES (
      auth.uid(),
      'fee_remitted',
      'transaction',
      NEW.id,
      jsonb_build_object(
        'platform_fee_amount', NEW.platform_fee_amount,
        'lawyer_commission_amount', NEW.lawyer_commission_amount,
        'net_remittance', (NEW.platform_fee_amount - COALESCE(NEW.lawyer_commission_amount, 0)),
        'fee_remitted_at', NEW.fee_remitted_at
      ),
      jsonb_build_object('event', 'platform_fee_remittance')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS transaction_fee_audit_trigger ON transactions;
CREATE TRIGGER transaction_fee_audit_trigger
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION log_fee_action();

-- ============================================================================
-- 5. CREATE AUTOMATED REMITTANCE TRACKING FUNCTION
-- ============================================================================

-- Function to set remittance due date when fee is collected
CREATE OR REPLACE FUNCTION set_remittance_due_date()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.fee_collected = TRUE AND OLD.fee_collected = FALSE) THEN
    -- Set due date to 30 days after deal closure
    NEW.remittance_due_date := (NEW.deal_closed_at::DATE + INTERVAL '30 days')::DATE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_remittance_due_trigger ON transactions;
CREATE TRIGGER set_remittance_due_trigger
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION set_remittance_due_date();

-- Function to check and mark overdue remittances (run daily via cron)
CREATE OR REPLACE FUNCTION mark_overdue_remittances()
RETURNS TABLE(transaction_id UUID, lawyer_id UUID, days_overdue INTEGER) AS $$
BEGIN
  -- Mark transactions as overdue
  UPDATE transactions
  SET remittance_overdue = TRUE
  WHERE fee_collected = TRUE
    AND fee_remitted = FALSE
    AND remittance_due_date < CURRENT_DATE
    AND remittance_overdue = FALSE;

  -- Return overdue transactions with lawyer info
  RETURN QUERY
  SELECT
    t.id,
    t.seller_lawyer_id,
    (CURRENT_DATE - t.remittance_due_date)::INTEGER as days_overdue
  FROM transactions t
  WHERE t.remittance_overdue = TRUE
    AND t.fee_remitted = FALSE
  ORDER BY t.remittance_due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total outstanding fees per lawyer
CREATE OR REPLACE FUNCTION update_lawyer_outstanding_fees(lawyer_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_outstanding DECIMAL;
BEGIN
  SELECT COALESCE(SUM(platform_fee_amount), 0)
  INTO total_outstanding
  FROM transactions
  WHERE seller_lawyer_id = lawyer_uuid
    AND fee_collected = TRUE
    AND fee_remitted = FALSE;

  UPDATE lawyers
  SET total_outstanding_fees = total_outstanding
  WHERE id = lawyer_uuid;

  RETURN total_outstanding;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. UPDATE RECONCILIATION REPORTS SCHEMA
-- ============================================================================

-- Update lawyer_reconciliation_reports to include commission tracking
ALTER TABLE lawyer_reconciliation_reports
DROP COLUMN IF EXISTS report_month,
DROP COLUMN IF EXISTS deals_closed,
DROP COLUMN IF EXISTS total_platform_fees_collected,
DROP COLUMN IF EXISTS total_remitted,
DROP COLUMN IF EXISTS balance_outstanding,
DROP COLUMN IF EXISTS report_submitted_by,
DROP COLUMN IF EXISTS reconciled,
DROP COLUMN IF EXISTS reconciled_by,
DROP COLUMN IF EXISTS reconciled_at;

-- Add corrected columns
ALTER TABLE lawyer_reconciliation_reports
ADD COLUMN IF NOT EXISTS reporting_period_start DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS reporting_period_end DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS total_deals_closed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_fees_collected DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_fees_remitted DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_commission_earned DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS outstanding_balance DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS report_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- 7. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN transactions.platform_fee_amount IS 'Tiered platform fee (R4,500-R45,000) based on property value - paid by SELLER ONLY, collected by lawyer';
COMMENT ON COLUMN transactions.lawyer_commission_amount IS '10% commission earned by lawyer from platform fee';
COMMENT ON COLUMN transactions.fee_collected IS 'Lawyer confirms platform fee collected from seller at closing';
COMMENT ON COLUMN transactions.fee_remitted IS 'Lawyer has remitted net amount (90%) to PropLinka';
COMMENT ON COLUMN transactions.remittance_due_date IS '30 days after deal closure - lawyer must remit by this date';
COMMENT ON COLUMN transactions.remittance_overdue IS 'TRUE if past due date and not yet remitted';

COMMENT ON COLUMN lawyers.remittance_status IS 'good_standing, warning, overdue, suspended';
COMMENT ON COLUMN lawyers.suspended_for_non_payment IS 'TRUE if lawyer suspended for overdue fees (60+ days)';
COMMENT ON COLUMN lawyers.total_outstanding_fees IS 'Sum of all collected but not yet remitted fees';

COMMENT ON FUNCTION calculate_lawyer_commission(DECIMAL) IS 'Returns 10% of platform fee as lawyer commission';
COMMENT ON FUNCTION mark_overdue_remittances() IS 'Daily cron job to mark overdue remittances and return list for alerts';
COMMENT ON FUNCTION update_lawyer_outstanding_fees(UUID) IS 'Recalculates total outstanding fees for a lawyer';

-- ============================================================================
-- 8. UPDATE RLS POLICIES FOR NEW FIELDS
-- ============================================================================

-- Lawyers can view their commission amounts
-- Note: Dropping and recreating since IF NOT EXISTS is not supported for policies
DROP POLICY IF EXISTS lawyer_view_commission ON transactions;
CREATE POLICY lawyer_view_commission ON transactions
  FOR SELECT
  USING (
    lawyer_seller_id IN (
      SELECT id FROM lawyers WHERE profile_id = auth.uid()
    ) OR lawyer_buyer_id IN (
      SELECT id FROM lawyers WHERE profile_id = auth.uid()
    )
  );

-- ============================================================================
-- 9. DATA MIGRATION - BACKFILL EXISTING TRANSACTIONS
-- ============================================================================

-- Set lawyer commission for existing transactions
UPDATE transactions
SET lawyer_commission_amount = calculate_lawyer_commission(platform_fee_amount)
WHERE lawyer_commission_amount IS NULL
  AND platform_fee_amount IS NOT NULL;

-- Set remittance due dates for already collected fees
UPDATE transactions
SET remittance_due_date = (deal_closed_at::DATE + INTERVAL '30 days')::DATE
WHERE fee_collected = TRUE
  AND remittance_due_date IS NULL
  AND deal_closed_at IS NOT NULL;

-- Mark currently overdue remittances
UPDATE transactions
SET remittance_overdue = TRUE
WHERE fee_collected = TRUE
  AND fee_remitted = FALSE
  AND remittance_due_date < CURRENT_DATE;

-- Update lawyer outstanding fees
DO $$
DECLARE
  lawyer_record RECORD;
BEGIN
  FOR lawyer_record IN SELECT id FROM lawyers LOOP
    PERFORM update_lawyer_outstanding_fees(lawyer_record.id);
  END LOOP;
END $$;
