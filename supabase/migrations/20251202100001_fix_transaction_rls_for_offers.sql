-- =====================================================
-- FIX TRANSACTION RLS FOR OFFER-BASED TRANSACTIONS
-- =====================================================
-- The existing INSERT policy only allows creating transactions
-- when there's a matching inquiry_id. This blocks creating
-- transactions from accepted offers.
-- =====================================================

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can create transactions from their inquiries" ON transactions;

-- Create a new policy that allows:
-- 1. Creating transactions from inquiries (existing behavior)
-- 2. Creating transactions from accepted offers (new behavior)
CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT WITH CHECK (
    -- Allow if user is the buyer or seller of the transaction
    (buyer_id = auth.uid() OR seller_id = auth.uid())
    AND (
      -- Option 1: Transaction linked to an inquiry they own
      (
        inquiry_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM inquiries
          WHERE inquiries.id = inquiry_id
          AND (inquiries.buyer_id = auth.uid() OR inquiries.seller_id = auth.uid())
        )
      )
      OR
      -- Option 2: Transaction linked to an accepted offer on a property they own/bought
      (
        inquiry_id IS NULL
        AND property_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM property_offers
          WHERE property_offers.property_id = transactions.property_id
          AND property_offers.status = 'accepted'
          AND (property_offers.buyer_id = auth.uid() OR property_offers.seller_id = auth.uid())
        )
      )
      OR
      -- Option 3: Direct transaction creation by buyer/seller (fallback)
      (
        inquiry_id IS NULL
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
      )
    )
  );

-- Also ensure RLS is enabled
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
