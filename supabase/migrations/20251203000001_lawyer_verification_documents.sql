-- =====================================================
-- LAWYER VERIFICATION DOCUMENTS
-- =====================================================
-- This migration adds document upload support for lawyer verification
-- =====================================================

-- Add document columns to lawyers table
ALTER TABLE lawyers
ADD COLUMN IF NOT EXISTS practicing_certificate_url TEXT,
ADD COLUMN IF NOT EXISTS id_document_url TEXT,
ADD COLUMN IF NOT EXISTS insurance_certificate_url TEXT,
ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id);

-- Create index for verification status queries
CREATE INDEX IF NOT EXISTS idx_lawyers_verified ON lawyers(verified);
CREATE INDEX IF NOT EXISTS idx_lawyers_verification_submitted ON lawyers(verification_submitted_at);

-- Add comments for documentation
COMMENT ON COLUMN lawyers.practicing_certificate_url IS 'URL to uploaded practicing certificate / fidelity fund certificate';
COMMENT ON COLUMN lawyers.id_document_url IS 'URL to uploaded government-issued ID document';
COMMENT ON COLUMN lawyers.insurance_certificate_url IS 'URL to uploaded professional indemnity insurance certificate (optional)';
COMMENT ON COLUMN lawyers.verification_submitted_at IS 'When the lawyer submitted their verification documents';
COMMENT ON COLUMN lawyers.verification_notes IS 'Admin notes about the verification decision';
COMMENT ON COLUMN lawyers.verified_at IS 'When the lawyer was verified by admin';
COMMENT ON COLUMN lawyers.verified_by IS 'Admin who verified the lawyer';

-- Create storage bucket for lawyer documents (if not exists)
-- Note: This needs to be run in Supabase dashboard or via Supabase CLI
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('lawyer-documents', 'lawyer-documents', false)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies will be set up in Supabase dashboard:
-- 1. Lawyers can upload to their own folder: lawyer-documents/{user_id}/*
-- 2. Lawyers can view their own documents
-- 3. Admins can view all documents
