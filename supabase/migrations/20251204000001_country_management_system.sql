-- =====================================================
-- COUNTRY MANAGEMENT SYSTEM
-- =====================================================
-- This migration adds:
-- 1. Country activation/configuration settings
-- 2. Lawyer document requirements per country
-- =====================================================

-- =====================================================
-- 1. ENHANCE COUNTRIES TABLE
-- =====================================================

-- Add activation and configuration columns to countries
ALTER TABLE countries
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS flag_emoji VARCHAR(10),
ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for active countries
CREATE INDEX IF NOT EXISTS idx_countries_active ON countries(is_active);

-- Add comments
COMMENT ON COLUMN countries.is_active IS 'Whether this country is available on the platform';
COMMENT ON COLUMN countries.phone_code IS 'International phone code (e.g., +27 for South Africa)';
COMMENT ON COLUMN countries.flag_emoji IS 'Flag emoji for display';
COMMENT ON COLUMN countries.date_format IS 'Preferred date format for this country';

-- =====================================================
-- 2. LAWYER DOCUMENT REQUIREMENTS PER COUNTRY
-- =====================================================

-- Create table for country-specific lawyer document requirements
CREATE TABLE IF NOT EXISTS country_lawyer_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  document_name VARCHAR(100) NOT NULL,
  document_key VARCHAR(50) NOT NULL, -- e.g., 'practicing_certificate', 'bar_license'
  description TEXT,
  help_text TEXT, -- Instructions for the lawyer
  is_required BOOLEAN DEFAULT true,
  accepted_file_types TEXT[] DEFAULT ARRAY['application/pdf', 'image/jpeg', 'image/png'],
  max_file_size_mb INTEGER DEFAULT 5,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_id, document_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_country_lawyer_requirements_country ON country_lawyer_requirements(country_id);
CREATE INDEX IF NOT EXISTS idx_country_lawyer_requirements_active ON country_lawyer_requirements(is_active);

-- Add comments
COMMENT ON TABLE country_lawyer_requirements IS 'Document requirements for lawyers per country';
COMMENT ON COLUMN country_lawyer_requirements.document_key IS 'Unique key for this document type within the country';
COMMENT ON COLUMN country_lawyer_requirements.is_required IS 'Whether this document is mandatory for verification';
COMMENT ON COLUMN country_lawyer_requirements.help_text IS 'Instructions shown to lawyers when uploading';

-- =====================================================
-- 3. LAWYER DOCUMENTS TABLE (stores uploaded docs)
-- =====================================================

-- Create table to store lawyer document uploads (linked to requirements)
CREATE TABLE IF NOT EXISTS lawyer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES country_lawyer_requirements(id) ON DELETE SET NULL,
  document_key VARCHAR(50) NOT NULL, -- Keeps reference even if requirement deleted
  file_path TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lawyer_documents_lawyer ON lawyer_documents(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_documents_status ON lawyer_documents(status);

-- Add comments
COMMENT ON TABLE lawyer_documents IS 'Documents uploaded by lawyers for verification';

-- =====================================================
-- 4. ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE country_lawyer_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_documents ENABLE ROW LEVEL SECURITY;

-- Country lawyer requirements - public read, admin write
CREATE POLICY "Anyone can view active requirements" ON country_lawyer_requirements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage requirements" ON country_lawyer_requirements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
  );

-- Lawyer documents - lawyers can manage own, admins can view all
CREATE POLICY "Lawyers can view own documents" ON lawyer_documents
  FOR SELECT USING (
    lawyer_id IN (SELECT id FROM lawyers WHERE profile_id = auth.uid())
  );

CREATE POLICY "Lawyers can upload own documents" ON lawyer_documents
  FOR INSERT WITH CHECK (
    lawyer_id IN (SELECT id FROM lawyers WHERE profile_id = auth.uid())
  );

CREATE POLICY "Lawyers can update own documents" ON lawyer_documents
  FOR UPDATE USING (
    lawyer_id IN (SELECT id FROM lawyers WHERE profile_id = auth.uid())
  );

CREATE POLICY "Admins can view all documents" ON lawyer_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admins can update documents" ON lawyer_documents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
  );

-- =====================================================
-- 5. INITIAL DATA - ACTIVATE SOUTH AFRICA
-- =====================================================

-- Update South Africa with full details and activate it
UPDATE countries
SET
  is_active = true,
  phone_code = '+27',
  flag_emoji = '🇿🇦',
  currency = 'ZAR',
  currency_symbol = 'R',
  updated_at = NOW()
WHERE code = 'ZA';

-- Add default document requirements for South Africa
INSERT INTO country_lawyer_requirements (country_id, document_name, document_key, description, help_text, is_required, display_order)
SELECT
  c.id,
  'Fidelity Fund Certificate',
  'fidelity_fund_certificate',
  'Annual Fidelity Fund Certificate issued by the Legal Practice Council',
  'Upload your current Fidelity Fund Certificate. This must be valid and not expired.',
  true,
  1
FROM countries c WHERE c.code = 'ZA'
ON CONFLICT (country_id, document_key) DO NOTHING;

INSERT INTO country_lawyer_requirements (country_id, document_name, document_key, description, help_text, is_required, display_order)
SELECT
  c.id,
  'ID Document',
  'id_document',
  'South African ID or Passport',
  'Upload a clear copy of your South African ID card or valid passport.',
  true,
  2
FROM countries c WHERE c.code = 'ZA'
ON CONFLICT (country_id, document_key) DO NOTHING;

INSERT INTO country_lawyer_requirements (country_id, document_name, document_key, description, help_text, is_required, display_order)
SELECT
  c.id,
  'Professional Indemnity Insurance',
  'professional_indemnity',
  'Professional indemnity insurance certificate',
  'Upload your professional indemnity insurance certificate if you have one.',
  false,
  3
FROM countries c WHERE c.code = 'ZA'
ON CONFLICT (country_id, document_key) DO NOTHING;

-- Also set up Namibia as inactive with basic info
UPDATE countries
SET
  is_active = false,
  phone_code = '+264',
  flag_emoji = '🇳🇦',
  currency = 'NAD',
  currency_symbol = 'N$',
  updated_at = NOW()
WHERE code = 'NA';

-- =====================================================
-- 6. FUNCTION TO GET COUNTRY REQUIREMENTS
-- =====================================================

-- Function to get all document requirements for a country
CREATE OR REPLACE FUNCTION get_country_lawyer_requirements(p_country_id UUID)
RETURNS TABLE (
  id UUID,
  document_name VARCHAR(100),
  document_key VARCHAR(50),
  description TEXT,
  help_text TEXT,
  is_required BOOLEAN,
  accepted_file_types TEXT[],
  max_file_size_mb INTEGER,
  display_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    clr.id,
    clr.document_name,
    clr.document_key,
    clr.description,
    clr.help_text,
    clr.is_required,
    clr.accepted_file_types,
    clr.max_file_size_mb,
    clr.display_order
  FROM country_lawyer_requirements clr
  WHERE clr.country_id = p_country_id
    AND clr.is_active = true
  ORDER BY clr.display_order, clr.document_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
