# Admin Panel - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Run the Database Migration

```bash
# If using local Supabase
npx supabase db reset

# If deploying to production
npx supabase db push --linked
```

This creates:
- 7 new tables (admin_profiles, audit_logs, etc.)
- 3 new enums (admin_role, admin_permission, moderation_status)
- Multiple database functions
- Row-Level Security policies

### Step 2: Find Your User ID

Option A - Via Dashboard:
1. Login to your app
2. Go to `/dashboard`
3. Open browser console
4. Run: `console.log(document.cookie)`
5. Look for your user ID in the Supabase session

Option B - Via Database:
```sql
-- Find your user by email
SELECT id, email FROM profiles WHERE email = 'your-email@example.com';
```

### Step 3: Make Yourself a Super Admin

Run this SQL in Supabase SQL Editor (replace YOUR_USER_ID):

```sql
INSERT INTO admin_profiles (id, role, permissions, is_active)
VALUES (
  'YOUR_USER_ID_HERE',  -- Paste your user ID from Step 2
  'super_admin',
  ARRAY[]::admin_permission[],
  true
);
```

### Step 4: Access the Admin Panel

1. Navigate to: `http://localhost:3000/admin` (or your domain)
2. You should see the admin dashboard!

### Step 5: Update Platform Stats (Optional)

```sql
SELECT update_platform_stats();
```

---

## ✅ Verification Checklist

- [ ] Database migration completed without errors
- [ ] `admin_profiles` table exists and has your user
- [ ] Can access `/admin` without being redirected
- [ ] See the admin dashboard with metrics
- [ ] Sidebar shows all menu items
- [ ] Can navigate to `/admin/users`
- [ ] Can navigate to `/admin/properties`

---

## 👥 Creating Additional Admins

### Create a Full Admin (Most Permissions)

```sql
INSERT INTO admin_profiles (id, role, permissions, is_active)
VALUES (
  'ANOTHER_USER_ID',
  'admin',
  ARRAY[
    'users.view', 'users.edit', 'users.suspend',
    'properties.view', 'properties.edit', 'properties.approve', 'properties.feature',
    'lawyers.view', 'lawyers.edit', 'lawyers.verify',
    'transactions.view',
    'content.view', 'content.moderate',
    'analytics.view',
    'settings.view'
  ]::admin_permission[],
  true
);
```

### Create a Moderator (Limited Permissions)

```sql
INSERT INTO admin_profiles (id, role, permissions, is_active)
VALUES (
  'MODERATOR_USER_ID',
  'moderator',
  ARRAY[
    'properties.view', 'properties.approve',
    'content.view', 'content.moderate'
  ]::admin_permission[],
  true
);
```

---

## 🔐 Available Permissions

Copy the ones you need for each admin:

### User Management
- `'users.view'` - View user list
- `'users.edit'` - Edit user profiles
- `'users.suspend'` - Suspend/unsuspend users
- `'users.delete'` - Delete users
- `'users.impersonate'` - Login as another user (future)

### Property Management
- `'properties.view'` - View properties
- `'properties.edit'` - Edit property details
- `'properties.approve'` - Approve/reject properties
- `'properties.feature'` - Feature properties on homepage
- `'properties.delete'` - Delete properties

### Lawyer Management
- `'lawyers.view'` - View lawyer list
- `'lawyers.edit'` - Edit lawyer profiles
- `'lawyers.verify'` - Verify lawyers
- `'lawyers.approve'` - Approve lawyer applications
- `'lawyers.suspend'` - Suspend lawyers

### Transaction Management
- `'transactions.view'` - View transactions
- `'transactions.edit'` - Edit transaction details
- `'transactions.cancel'` - Cancel transactions
- `'transactions.refund'` - Issue refunds

### Content Moderation
- `'content.view'` - View flagged content
- `'content.moderate'` - Approve/reject content
- `'content.delete'` - Delete content

### Analytics & Reports
- `'analytics.view'` - View analytics dashboard
- `'analytics.export'` - Export reports

### Platform Settings
- `'settings.view'` - View platform settings
- `'settings.edit'` - Edit platform settings

### Audit & Compliance
- `'audit.view'` - View audit logs
- `'audit.export'` - Export audit logs

---

## 🎯 What You Can Do Now

### Manage Users
1. Go to `/admin/users`
2. Search for users
3. Filter by type (buyer, seller, lawyer)
4. Suspend/unsuspend users
5. Delete users

### Manage Properties
1. Go to `/admin/properties`
2. Review pending properties
3. Approve or reject with reasons
4. Feature properties
5. Delete spam listings

### Manage Lawyers
1. Go to `/admin/lawyers`
2. Review new lawyer applications
3. Verify legitimate lawyers
4. View lawyer ratings

### Monitor Platform
1. Dashboard shows key metrics
2. View recent activity
3. Get alerts for items needing attention
4. See growth trends

---

## 🐛 Troubleshooting

### Error: "admin_access_required"
**Problem:** You're redirected to login

**Fix:**
```sql
-- Check if you're in admin_profiles
SELECT * FROM admin_profiles WHERE id = 'YOUR_USER_ID';

-- If not found, add yourself:
INSERT INTO admin_profiles (id, role, permissions, is_active)
VALUES ('YOUR_USER_ID', 'super_admin', ARRAY[]::admin_permission[], true);
```

### Error: "insufficient_permissions"
**Problem:** You see dashboard but can't access certain pages

**Fix:**
```sql
-- Check your role and permissions
SELECT role, permissions FROM admin_profiles WHERE id = 'YOUR_USER_ID';

-- If you're not super_admin, you need specific permissions
-- Add them using the examples above
```

### Stats Showing 0
**Problem:** Dashboard metrics are all zero

**Fix:**
```sql
-- Manually trigger stats update
SELECT update_platform_stats();
```

### Tables Not Found
**Problem:** Error about missing tables

**Fix:**
```bash
# Re-run the migration
npx supabase db reset

# Or in production:
npx supabase db push --linked
```

---

## 📊 Understanding Roles

### Super Admin (`super_admin`)
- **Who:** You (platform owner)
- **Access:** Everything, no restrictions
- **Permissions:** Doesn't need explicit permissions
- **Limit:** Keep this to 1-2 people max

### Admin (`admin`)
- **Who:** Trusted team members, managers
- **Access:** Based on granted permissions
- **Permissions:** Must be explicitly granted
- **Typical:** Most administrative staff

### Moderator (`moderator`)
- **Who:** Content reviewers, support staff
- **Access:** Limited to content moderation
- **Permissions:** Usually just content/property review
- **Typical:** Part-time moderators, contractors

---

## 🔄 Next Steps

After setup, you can:

1. **Customize Permissions:** Edit the permissions array for admins
2. **Set Up Cron Jobs:** Automate `update_platform_stats()` to run hourly
3. **Configure Notifications:** Set up email alerts for admin actions
4. **Train Your Team:** Share the main documentation with other admins
5. **Monitor Audit Logs:** Regularly review who's doing what
6. **Build Remaining Features:** See roadmap in main documentation

---

## 📞 Need Help?

If you encounter issues:

1. Check the main documentation: `ADMIN_PANEL_DOCUMENTATION.md`
2. Review the code comments in:
   - `supabase/migrations/20251105142237_admin_panel_system.sql`
   - `lib/supabase/admin-middleware.ts`
   - `lib/admin/actions.ts`
3. Check Supabase logs for errors
4. Verify your user permissions in the database

---

## ✨ You're All Set!

Your admin panel is now ready to use. Navigate to `/admin` and start managing your platform like a pro!

**Key URLs:**
- Dashboard: `/admin`
- Users: `/admin/users`
- Properties: `/admin/properties`
- Lawyers: `/admin/lawyers`

**Remember:**
- With great power comes great responsibility
- Always provide reasons for moderation actions
- Keep audit logs for compliance
- Never share admin credentials

Happy administrating! 🎉
