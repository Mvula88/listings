-- =====================================================
-- BACKFILL MISSING TRANSACTIONS FOR ACCEPTED OFFERS
-- =====================================================
-- Some offers were accepted but transaction creation failed
-- due to the old RLS policy. This creates missing transactions.
-- =====================================================

-- Insert transactions for accepted offers that don't have one
INSERT INTO transactions (property_id, buyer_id, seller_id, agreed_price, status, created_at, updated_at)
SELECT
  po.property_id,
  po.buyer_id,
  po.seller_id,
  po.offer_amount,
  'initiated',
  NOW(),
  NOW()
FROM property_offers po
WHERE po.status = 'accepted'
AND NOT EXISTS (
  SELECT 1 FROM transactions t
  WHERE t.property_id = po.property_id
  AND t.buyer_id = po.buyer_id
  AND t.seller_id = po.seller_id
);

-- Update the offer to link to the transaction
UPDATE property_offers po
SET transaction_id = t.id
FROM transactions t
WHERE po.status = 'accepted'
AND t.property_id = po.property_id
AND t.buyer_id = po.buyer_id
AND t.seller_id = po.seller_id
AND po.transaction_id IS NULL;
