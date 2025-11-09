# 🚀 Admin Panel - Quick Start Guide for Ismael

## ✅ What's Already Done

- ✅ Database migration completed successfully
- ✅ All admin tables created
- ✅ Admin panel UI built and ready
- ✅ Your email: ismaelmvula@gmail.com

## 📝 Next Steps (5 minutes)

### Step 1: Start Your Development Server

```bash
npm run dev
```

The app should be running at: **http://localhost:3000**

### Step 2: Register Your Account

1. Open your browser to: **http://localhost:3000/register**
2. Register with:
   - **Email:** ismaelmvula@gmail.com
   - **Password:** (choose a secure password)
   - **Full Name:** Ismael Mvula
   - **Phone:** (your phone number)
   - **User Type:** Seller (or any type, doesn't matter for admin)
   - **Country:** Namibia or South Africa

3. Click **Register**

### Step 3: Get Your User ID

After registration, you need to find your user ID. You have 3 options:

#### Option A: Via Supabase Studio (Easiest)
1. Open **http://localhost:54323** in your browser
2. Go to **Table Editor** → **profiles**
3. Find your email: **ismaelmvula@gmail.com**
4. Copy the **id** value (it's a UUID like `123e4567-e89b-12d3-a456-426614174000`)

#### Option B: Via Docker Command
```bash
docker exec supabase_db_listings psql -U postgres -d postgres -c "SELECT id FROM profiles WHERE email = 'ismaelmvula@gmail.com';"
```

#### Option C: Via Browser Console
1. Login to your account
2. Open browser Developer Tools (F12)
3. Go to Console tab
4. Paste and run:
```javascript
fetch('http://localhost:54321/rest/v1/profiles?email=eq.ismaelmvula@gmail.com', {
  headers: {
    'apikey': 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
    'Authorization': 'Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
  }
}).then(r => r.json()).then(d => console.log('Your User ID:', d[0].id))
```

### Step 4: Make Yourself Super Admin

Once you have your user ID, run this in Supabase Studio (SQL Editor) or via Docker:

#### Via Supabase Studio:
1. Open **http://localhost:54323**
2. Go to **SQL Editor**
3. Paste this (replace `YOUR_USER_ID` with your actual ID):

```sql
INSERT INTO admin_profiles (id, role, permissions, is_active)
VALUES (
  'YOUR_USER_ID_HERE',  -- Replace this!
  'super_admin',
  ARRAY[]::admin_permission[],
  true
);
```

4. Click **Run**

#### Via Docker Command:
```bash
docker exec supabase_db_listings psql -U postgres -d postgres -c "INSERT INTO admin_profiles (id, role, permissions, is_active) VALUES ('YOUR_USER_ID_HERE', 'super_admin', ARRAY[]::admin_permission[], true);"
```

### Step 5: Access the Admin Panel! 🎉

1. Navigate to: **http://localhost:3000/admin**
2. You should see the admin dashboard!

---

## 🎯 What You'll See

### Admin Dashboard (`/admin`)
- Total users count
- Total properties
- Total transactions
- Conversion rate
- Recent activity
- Alerts for pending items

### User Management (`/admin/users`)
- View all users
- Search & filter
- Suspend/unsuspend users
- Delete users

### Property Management (`/admin/properties`)
- Review pending properties
- Approve/reject listings
- Feature properties
- Delete spam

### Lawyer Management (`/admin/lawyers`)
- Verify new lawyers
- View lawyer profiles
- Manage verifications

---

## 🔍 Troubleshooting

### "admin_access_required" Error

**Problem:** You're redirected to login when trying to access `/admin`

**Solution:**
1. Make sure you're logged in
2. Check that you ran the SQL to add yourself to `admin_profiles`
3. Verify with this query:
```sql
SELECT ap.*, p.email
FROM admin_profiles ap
JOIN profiles p ON ap.id = p.id
WHERE p.email = 'ismaelmvula@gmail.com';
```

If you see a row, you're set up correctly. If not, run the INSERT query again.

### Can't Find My User ID

**Solution:** Open Supabase Studio at **http://localhost:54323**:
1. Go to **Authentication** → **Users**
2. Find your email in the list
3. Click on it to see the user ID
4. Copy the ID and use it in the INSERT query

### Stats Showing All Zeros

**Solution:** The database is fresh, so there's no data yet. Try:
1. Create a test property via the UI
2. Add some test users
3. Stats will populate automatically

Or manually refresh stats:
```sql
SELECT update_platform_stats();
```

---

## 🎨 What's Available Right Now

### ✅ Fully Functional
- Dashboard with live metrics
- User management (view, search, suspend, delete)
- Property management (approve, reject, feature, delete)
- Lawyer management (verify, view)
- Role-based permissions
- Audit logging
- Security & rate limiting

### 🚧 Ready to Build (Foundations in Place)
- Transaction monitoring
- Analytics charts
- Content moderation
- Audit log viewer
- Platform settings UI
- Email queue dashboard

---

## 📚 Need More Help?

Check these files:
- **ADMIN_PANEL_DOCUMENTATION.md** - Complete reference
- **ADMIN_SETUP_GUIDE.md** - Detailed setup guide

Or reach out if you have questions!

---

## 🎉 You're All Set!

Once you complete the steps above, you'll have full admin access to your platform. Enjoy managing your real estate marketplace! 🏠

**Admin URL:** http://localhost:3000/admin
**Supabase Studio:** http://localhost:54323
**Your Email:** ismaelmvula@gmail.com
