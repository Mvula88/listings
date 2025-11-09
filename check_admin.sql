-- Check current users and admin profiles
SELECT
    p.id,
    p.email,
    p.full_name,
    p.user_type,
    ap.role,
    ap.is_active,
    ap.permissions
FROM profiles p
LEFT JOIN admin_profiles ap ON p.id = ap.id
ORDER BY p.created_at DESC
LIMIT 5;
