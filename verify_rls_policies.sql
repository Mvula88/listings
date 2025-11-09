-- Verification Script: Check RLS Status and Policy Coverage
-- Run this AFTER applying the migration to verify all tables are protected

-- ============================================================================
-- 1. Check which tables still lack RLS
-- ============================================================================

SELECT
  tablename,
  'MISSING RLS!' as status
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false
ORDER BY tablename;

-- Expected: 0 rows

-- ============================================================================
-- 2. Complete RLS Coverage Report
-- ============================================================================

SELECT
  schemaname,
  tablename,
  CASE
    WHEN rowsecurity THEN '✅ Enabled'
    ELSE '❌ DISABLED'
  END as rls_status,
  COALESCE(
    (SELECT COUNT(*)
     FROM pg_policies
     WHERE schemaname = pt.schemaname
     AND tablename = pt.tablename),
    0
  ) as policy_count
FROM pg_tables pt
WHERE schemaname = 'public'
ORDER BY rowsecurity DESC, tablename;

-- ============================================================================
-- 3. Detailed Policy Breakdown by Table
-- ============================================================================

SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  CASE
    WHEN roles = '{public}' THEN 'Public'
    WHEN roles = '{authenticated}' THEN 'Authenticated Users'
    ELSE array_to_string(roles, ', ')
  END as applies_to
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- 4. Tables with RLS Enabled but NO Policies (Locked Down)
-- ============================================================================

SELECT
  tablename,
  '⚠️ RLS enabled but NO policies - Table is completely locked!' as warning
FROM pg_tables pt
WHERE schemaname = 'public'
AND rowsecurity = true
AND NOT EXISTS (
  SELECT 1 FROM pg_policies
  WHERE schemaname = pt.schemaname
  AND tablename = pt.tablename
)
ORDER BY tablename;

-- Expected: 0 rows

-- ============================================================================
-- 5. Storage Bucket Policies
-- ============================================================================

SELECT
  bucket_id,
  COUNT(*) as policy_count
FROM storage.objects
WHERE bucket_id = 'property-images'
GROUP BY bucket_id;

-- Check storage policies
SELECT
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%property%'
ORDER BY policyname;
