
# Admin Panel Quick Start Guide

## 🚀 Getting Started

Your admin panel is now fully functional! Follow these steps to access and use it.

---

## Step 1: Create Your First Admin User

You need to manually insert an admin profile into the database. Here's how:

### Option A: Using Supabase Studio (Easiest)

1. Open Supabase Studio: http://127.0.0.1:54323
2. Go to the **Table Editor**
3. Select the `profiles` table
4. Find your user record (the one you just registered with)
5. Copy the `id` (UUID)
6. Go to the `admin_profiles` table
7. Click **Insert** → **Insert row**
8. Fill in:
   - `id`: Paste your user UUID
   - `role`: Select `super_admin`
   - `permissions`: Leave empty (super admins have all permissions)
   - `is_active`: Check `true`
9. Click **Save**

### Option B: Using SQL

```sql
-- Replace 'YOUR_USER_ID' with your actual user ID from the profiles table
INSERT INTO admin_profiles (id, role, permissions, is_active)
VALUES (
  'YOUR_USER_ID',  -- Get this from profiles table
  'super_admin',
  ARRAY[]::admin_permission[],
  true
);
```

To find your user ID:
```sql
SELECT id, email, full_name FROM profiles WHERE email = 'your-email@example.com';
```

---

## Step 2: Access the Admin Panel

1. Make sure you're logged in to the platform
2. Navigate to: http://localhost:3000/admin
3. You should see the admin dashboard!

If you see a redirect or error:
- Check that your user ID is in the `admin_profiles` table
- Verify `is_active = true`
- Clear your browser cache/cookies and login again

---

## Step 3: Explore the Features

### 📊 Dashboard (`/admin`)
- View key platform metrics
- See pending items requiring attention
- Quick action cards
- Real-time statistics

### 👥 Users (`/admin/users`)
- View all registered users
- Suspend/unsuspend users
- Delete users
- Filter by type and status

### 🏠 Properties (`/admin/properties`)
- Approve/reject property listings
- Feature properties
- Moderate content
- Delete listings

### ⚖️ Lawyers (`/admin/lawyers`)
- Verify lawyer profiles
- View lawyer details
- Manage lawyer listings

### 💼 Transactions (`/admin/transactions`) ✨ NEW
- Monitor all transactions
- View transaction details
- Cancel transactions if needed
- Track transaction progress

### 📈 Analytics (`/admin/analytics`) ✨ NEW
- Interactive charts and graphs
- User growth trends
- Revenue tracking
- Property and transaction metrics
- Distribution pie charts

### 🚩 Moderation (`/admin/moderation`) ✨ NEW
- Review flagged content
- Approve or reject reports
- Add resolution notes
- Track moderation history

### 📋 Audit Logs (`/admin/audit`) ✨ NEW
- View all admin actions
- Filter by admin, action, or date
- See detailed change logs
- Export for compliance

### ⚙️ Settings (`/admin/settings`) ✨ NEW
- Toggle maintenance mode
- Enable/disable features
- Configure payment settings
- Set rate limits
- Update platform configuration

---

## Step 4: Update Platform Stats (Optional)

For accurate dashboard metrics, run this SQL command:

```sql
SELECT update_platform_stats();
```

Or click the **Refresh** button in the admin header.

**Recommended:** Set up a cron job to run this every hour in production.

---

## Admin Roles & Permissions

### Super Admin
- Full access to everything
- Can't be restricted by permissions
- Should be limited to 1-2 people

### Admin
- Specific permissions granted
- Can manage users, properties, lawyers
- Cannot manage other admins

### Moderator
- Limited to content moderation
- Cannot access sensitive data
- Good for content reviewers

---

## Creating Additional Admins

### Create a Regular Admin

```sql
INSERT INTO admin_profiles (id, role, permissions, is_active)
VALUES (
  'USER_ID_HERE',
  'admin',
  ARRAY[
    'users.view', 'users.suspend',
    'properties.view', 'properties.approve',
    'lawyers.view', 'lawyers.verify',
    'transactions.view',
    'analytics.view',
    'content.moderate',
    'audit.view'
  ]::admin_permission[],
  true
);
```

### Create a Moderator

```sql
INSERT INTO admin_profiles (id, role, permissions, is_active)
VALUES (
  'USER_ID_HERE',
  'moderator',
  ARRAY[
    'properties.view',
    'content.view',
    'content.moderate'
  ]::admin_permission[],
  true
);
```

---

## Available Permissions

### User Management
- `users.view` - View user list
- `users.edit` - Edit user profiles
- `users.suspend` - Suspend users
- `users.delete` - Delete users

### Property Management
- `properties.view` - View properties
- `properties.edit` - Edit properties
- `properties.approve` - Approve properties
- `properties.feature` - Feature properties
- `properties.delete` - Delete properties

### Lawyer Management
- `lawyers.view` - View lawyers
- `lawyers.edit` - Edit lawyer profiles
- `lawyers.verify` - Verify lawyers
- `lawyers.suspend` - Suspend lawyers

### Transaction Management
- `transactions.view` - View transactions
- `transactions.edit` - Edit transactions
- `transactions.cancel` - Cancel transactions

### Content Moderation
- `content.view` - View content flags
- `content.moderate` - Moderate content
- `content.delete` - Delete content

### Analytics
- `analytics.view` - View analytics
- `analytics.export` - Export reports

### Settings
- `settings.view` - View settings
- `settings.edit` - Edit settings

### Audit
- `audit.view` - View audit logs
- `audit.export` - Export audit logs

---

## Troubleshooting

### Can't Access Admin Panel
**Error:** Redirected to login or homepage

**Solution:**
1. Verify you're logged in
2. Check your user ID is in `admin_profiles` table
3. Ensure `is_active = true`
4. Clear browser cache/cookies

### Permission Denied
**Error:** Cannot perform certain actions

**Solution:**
1. Check your role (super_admin, admin, moderator)
2. Verify your permissions array
3. Super admins have all permissions automatically
4. Contact a super admin to grant permissions

### Stats Not Showing
**Error:** Dashboard shows zero or incorrect stats

**Solution:**
1. Run: `SELECT update_platform_stats();`
2. Click the refresh button in header
3. Wait a few seconds and reload

### Pages Not Loading
**Error:** Blank page or loading forever

**Solution:**
1. Check browser console for errors
2. Verify database migrations are applied
3. Check Supabase is running locally
4. Restart the dev server

---

## Quick Tips

### For Daily Use
1. Check dashboard for pending items
2. Review and approve properties promptly
3. Verify new lawyer applications
4. Monitor flagged content
5. Review audit logs weekly

### For Best Performance
1. Use filters to narrow down data
2. Set up regular stats updates (cron)
3. Archive old audit logs (1+ year)
4. Enable pagination for large datasets

### For Security
1. Use strong passwords
2. Limit super admin accounts
3. Review admin access logs regularly
4. Immediately revoke access for former employees
5. Always provide reasons for actions

---

## Next Steps

Now that your admin panel is set up:

1. ✅ Create your super admin account
2. ✅ Access the admin panel
3. ✅ Explore all features
4. ✅ Update platform settings
5. ✅ Configure feature flags
6. ✅ Add more admins if needed
7. ✅ Set up stats update cron job

---

## Need Help?

- Check the full documentation: `ADMIN_PANEL_DOCUMENTATION.md`
- Review the completion report: `ADMIN_PHASE_2_COMPLETE.md`
- Check the codebase comments
- Review Supabase logs for errors

---

## Summary

Your admin panel includes:

✅ **9 Full-Featured Pages**
- Dashboard with metrics
- User management
- Property moderation
- Lawyer verification
- Transaction monitoring
- Advanced analytics with charts
- Content moderation
- Complete audit trail
- Platform settings

✅ **Enterprise Features**
- Role-based access control
- Complete audit logging
- Real-time notifications
- Advanced filtering
- Responsive design
- Security-first approach

✅ **Production Ready**
- No compilation errors
- Optimized performance
- Mobile responsive
- Fully documented

**You're all set!** 🎉

Start managing your platform like a pro.
