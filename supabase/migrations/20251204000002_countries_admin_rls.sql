-- =====================================================
-- FIX: ALLOW ADMINS TO UPDATE COUNTRIES
-- =====================================================
-- The countries table has RLS but no policy for admin updates
-- =====================================================

-- Add policy for admins to update countries
CREATE POLICY "Admins can update countries" ON countries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
  );

-- Add policy for admins to insert countries
CREATE POLICY "Admins can insert countries" ON countries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
  );

-- Ensure everyone can read countries (should already exist but just in case)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'countries' AND policyname = 'Anyone can view countries'
  ) THEN
    CREATE POLICY "Anyone can view countries" ON countries FOR SELECT USING (true);
  END IF;
END $$;
