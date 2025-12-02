-- =====================================================
-- VIEWING AND OFFER SYSTEM
-- =====================================================
-- This migration adds:
-- 1. Property viewings table for scheduling appointments
-- 2. Property offers table for formal offer submissions
-- 3. Transaction documents table for document management
-- =====================================================

-- =====================================================
-- 1. PROPERTY VIEWINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS property_viewings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Scheduling
  requested_date DATE NOT NULL,
  requested_time_slot VARCHAR(50) NOT NULL, -- e.g., 'morning', 'afternoon', 'evening', or specific time
  confirmed_date DATE,
  confirmed_time TIME,

  -- Buyer financing status (collected before viewing)
  financing_status VARCHAR(50) NOT NULL DEFAULT 'exploring',
  -- Values: 'cash', 'pre_approved', 'financing_in_progress', 'exploring'
  pre_approval_amount DECIMAL(15, 2), -- If pre-approved, how much

  -- Status tracking
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  -- Values: 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'

  -- Notes
  buyer_message TEXT,
  seller_response TEXT,
  cancellation_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Prevent duplicate viewing requests for same property/buyer on same date
  UNIQUE(property_id, buyer_id, requested_date)
);

-- Indexes for viewings
CREATE INDEX idx_viewings_property ON property_viewings(property_id);
CREATE INDEX idx_viewings_buyer ON property_viewings(buyer_id);
CREATE INDEX idx_viewings_seller ON property_viewings(seller_id);
CREATE INDEX idx_viewings_status ON property_viewings(status);
CREATE INDEX idx_viewings_date ON property_viewings(requested_date);

-- =====================================================
-- 2. PROPERTY OFFERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS property_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewing_id UUID REFERENCES property_viewings(id) ON DELETE SET NULL, -- Optional link to viewing

  -- Offer details
  offer_amount DECIMAL(15, 2) NOT NULL,

  -- Payment type
  payment_type VARCHAR(30) NOT NULL DEFAULT 'cash',
  -- Values: 'cash', 'bank_financed', 'cash_and_bond'

  -- Financing details (if applicable)
  financing_status VARCHAR(50),
  -- Values: 'pre_approved', 'in_progress', 'not_started'
  pre_approval_amount DECIMAL(15, 2),
  financing_bank VARCHAR(100),
  cash_portion DECIMAL(15, 2), -- For cash_and_bond

  -- Offer message/conditions
  message TEXT,
  conditions TEXT, -- Any conditions (subject to inspection, etc.)

  -- Status tracking
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  -- Values: 'pending', 'accepted', 'rejected', 'countered', 'withdrawn', 'expired'

  -- Counter offer (if seller counters)
  counter_amount DECIMAL(15, 2),
  counter_message TEXT,

  -- Response
  seller_response TEXT,

  -- Validity
  valid_until TIMESTAMPTZ, -- Offer expiration

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,

  -- Link to transaction if offer accepted
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL
);

-- Indexes for offers
CREATE INDEX idx_offers_property ON property_offers(property_id);
CREATE INDEX idx_offers_buyer ON property_offers(buyer_id);
CREATE INDEX idx_offers_seller ON property_offers(seller_id);
CREATE INDEX idx_offers_status ON property_offers(status);
CREATE INDEX idx_offers_created ON property_offers(created_at DESC);

-- =====================================================
-- 3. TRANSACTION DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transaction_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,

  -- Document info
  document_type VARCHAR(50) NOT NULL,
  -- Values: 'fica_id', 'fica_proof_of_address', 'fica_proof_of_income',
  --         'pre_approval_letter', 'offer_to_purchase', 'deed_of_sale',
  --         'compliance_certificate', 'rates_clearance', 'levy_clearance',
  --         'electrical_certificate', 'plumbing_certificate', 'other'

  document_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  mime_type VARCHAR(100),

  -- Who uploaded
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  uploaded_by_role VARCHAR(20), -- 'buyer', 'seller', 'lawyer', 'admin'

  -- Visibility
  visible_to_buyer BOOLEAN DEFAULT true,
  visible_to_seller BOOLEAN DEFAULT true,
  visible_to_lawyers BOOLEAN DEFAULT true,

  -- Verification
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for documents
CREATE INDEX idx_documents_transaction ON transaction_documents(transaction_id);
CREATE INDEX idx_documents_type ON transaction_documents(document_type);
CREATE INDEX idx_documents_uploaded_by ON transaction_documents(uploaded_by);

-- =====================================================
-- 4. RLS POLICIES FOR VIEWINGS
-- =====================================================
ALTER TABLE property_viewings ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own viewing requests
CREATE POLICY "Buyers can view own viewings"
  ON property_viewings FOR SELECT
  USING (auth.uid() = buyer_id);

-- Sellers can view viewings for their properties
CREATE POLICY "Sellers can view property viewings"
  ON property_viewings FOR SELECT
  USING (auth.uid() = seller_id);

-- Buyers can create viewing requests
CREATE POLICY "Buyers can create viewings"
  ON property_viewings FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Buyers can update their own pending viewings (cancel)
CREATE POLICY "Buyers can update own viewings"
  ON property_viewings FOR UPDATE
  USING (auth.uid() = buyer_id AND status = 'pending');

-- Sellers can update viewings for their properties (confirm, reject)
CREATE POLICY "Sellers can update property viewings"
  ON property_viewings FOR UPDATE
  USING (auth.uid() = seller_id);

-- =====================================================
-- 5. RLS POLICIES FOR OFFERS
-- =====================================================
ALTER TABLE property_offers ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own offers
CREATE POLICY "Buyers can view own offers"
  ON property_offers FOR SELECT
  USING (auth.uid() = buyer_id);

-- Sellers can view offers on their properties
CREATE POLICY "Sellers can view property offers"
  ON property_offers FOR SELECT
  USING (auth.uid() = seller_id);

-- Buyers can create offers
CREATE POLICY "Buyers can create offers"
  ON property_offers FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Buyers can update their own pending offers (withdraw)
CREATE POLICY "Buyers can update own offers"
  ON property_offers FOR UPDATE
  USING (auth.uid() = buyer_id AND status IN ('pending', 'countered'));

-- Sellers can update offers on their properties (accept, reject, counter)
CREATE POLICY "Sellers can update property offers"
  ON property_offers FOR UPDATE
  USING (auth.uid() = seller_id);

-- =====================================================
-- 6. RLS POLICIES FOR DOCUMENTS
-- =====================================================
ALTER TABLE transaction_documents ENABLE ROW LEVEL SECURITY;

-- Transaction participants can view documents
CREATE POLICY "Transaction participants can view documents"
  ON transaction_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_documents.transaction_id
      AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );

-- Transaction participants can upload documents
CREATE POLICY "Transaction participants can upload documents"
  ON transaction_documents FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by
    AND EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_documents.transaction_id
      AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );

-- Uploaders can update their own documents
CREATE POLICY "Uploaders can update own documents"
  ON transaction_documents FOR UPDATE
  USING (auth.uid() = uploaded_by);

-- Uploaders can delete their own documents
CREATE POLICY "Uploaders can delete own documents"
  ON transaction_documents FOR DELETE
  USING (auth.uid() = uploaded_by);

-- =====================================================
-- 7. ADMIN POLICIES
-- =====================================================

-- Admins can view all viewings
CREATE POLICY "Admins can view all viewings"
  ON property_viewings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid()
    )
  );

-- Admins can view all offers
CREATE POLICY "Admins can view all offers"
  ON property_offers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid()
    )
  );

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
  ON transaction_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid()
    )
  );

-- =====================================================
-- 8. FUNCTIONS FOR UPDATED_AT
-- =====================================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_property_viewings_updated_at
  BEFORE UPDATE ON property_viewings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_offers_updated_at
  BEFORE UPDATE ON property_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transaction_documents_updated_at
  BEFORE UPDATE ON transaction_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. STORAGE BUCKET FOR TRANSACTION DOCUMENTS
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'transaction-documents',
  'transaction-documents',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for transaction documents
CREATE POLICY "Transaction participants can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'transaction-documents'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Transaction participants can view documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'transaction-documents'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Document owners can delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'transaction-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
