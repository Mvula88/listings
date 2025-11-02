# Supabase Local Development Guide

## 🚨 IMPORTANT: READ DATABASE_WORKFLOW_RULES.md FIRST! 🚨

**Before making ANY database changes, read `DATABASE_WORKFLOW_RULES.md`**

This file contains the MANDATORY workflow for database changes. Following it ensures safety for millions of users.

---

## ✅ Setup Complete!

You now have a professional local development setup with:
- ✅ Docker installed and running
- ✅ Supabase CLI configured
- ✅ Local Supabase instance (PostgreSQL, Auth, Storage, etc.)
- ✅ Version-controlled migrations
- ✅ Safe testing environment before production

---

## 🚀 Daily Workflow

### 1. Start Local Supabase (Every Time You Code)
```bash
npx supabase start
```
This starts your local PostgreSQL database, API, and Studio.

### 2. View Your Local Database
Once started, you'll see URLs like:
- **Studio UI**: http://localhost:54323
- **API URL**: http://localhost:54321
- **DB URL**: postgresql://postgres:postgres@localhost:54322/postgres

Open the Studio URL in your browser to see your local database!

### 3. Stop Local Supabase (When Done Coding)
```bash
npx supabase stop
```

---

## 📝 Creating Database Changes (The Right Way)

### Step 1: Create a Migration
```bash
npx supabase migration new name_of_your_change
```
Example:
```bash
npx supabase migration new add_user_profiles_trigger
```

This creates a new file in `supabase/migrations/` with a timestamp.

### Step 2: Write Your SQL
Edit the new migration file in `supabase/migrations/` and add your SQL:
```sql
-- Example: Adding a new column
ALTER TABLE properties ADD COLUMN featured BOOLEAN DEFAULT false;

-- Example: Creating a trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email) VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 3: Test Locally
```bash
npx supabase db reset
```
This applies ALL migrations to your local database from scratch.

### Step 4: Test Your App Locally
```bash
npm run dev
```
Your app will connect to the local Supabase instance.
Test everything works!

### Step 5: Push to Production (ONLY After Testing!)
```bash
npx supabase db push
```
This applies your migrations to the remote Supabase project.

---

## 🔗 Linking to Your Production Project

### One-Time Setup
You need to link your local setup to your remote Supabase project:

```bash
npx supabase link --project-ref your-project-ref
```

To find your project ref:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings > General
4. Copy the "Reference ID"

You'll be prompted for your database password (from Supabase dashboard).

### Pull Existing Schema (First Time Only)
After linking, pull your current production schema:
```bash
npx supabase db pull
```
This creates migrations from your existing database.

---

## 🛠️ Common Commands

### Database Management
```bash
# Reset local database (applies all migrations)
npx supabase db reset

# Create a new migration
npx supabase migration new migration_name

# List all migrations
npx supabase migration list

# Push migrations to production
npx supabase db push

# Pull schema from production
npx supabase db pull
```

### Local Instance Management
```bash
# Start all services
npx supabase start

# Stop all services
npx supabase stop

# Restart services
npx supabase stop && npx supabase start

# View status
npx supabase status
```

### Seeding Data
```bash
# Add data to supabase/seed.sql, then:
npx supabase db reset
```

---

## 🔐 Environment Variables

### Local Development (.env.local)
```env
# Use these for local development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
```

### Production (.env.production or Vercel)
```env
# Use these for production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

**Important**: Run `npx supabase status` to see your local keys after starting.

---

## 📊 Accessing Local Studio

After `npx supabase start`, open: **http://localhost:54323**

Here you can:
- ✅ View/edit tables
- ✅ Run SQL queries
- ✅ Test RLS policies
- ✅ View logs
- ✅ Test authentication

---

## 🔄 Migration Best Practices

### DO ✅
- Create migrations for ALL database changes
- Test locally before pushing
- Write descriptive migration names
- Add comments in your SQL
- Keep migrations small and focused
- Commit migrations to Git

### DON'T ❌
- Don't edit production database directly
- Don't skip testing locally
- Don't edit old migrations (create new ones)
- Don't delete migrations that are in production
- Don't commit .env files

---

## 🆘 Troubleshooting

### "Port already in use"
```bash
npx supabase stop
# Wait 5 seconds
npx supabase start
```

### "Docker not found"
Make sure Docker Desktop is running.

### "Cannot connect to database"
```bash
npx supabase stop
npx supabase start
```

### "Migrations out of sync"
```bash
npx supabase db pull  # Pull latest from production
npx supabase db reset  # Reset local to match
```

---

## 📚 Next Steps

1. **Link to Production**: Run `npx supabase link`
2. **Pull Current Schema**: Run `npx supabase db pull`
3. **Create Your First Migration**: Run `npx supabase migration new test`
4. **Test Locally**: Run `npx supabase db reset`
5. **Push When Ready**: Run `npx supabase db push`

---

## 🎯 Your Current Migrations

You already have these migrations set up:
1. `001_initial_schema.sql` - Database structure
2. `002_rls_policies.sql` - Security policies
3. `003_lawyer_fee_collection_model.sql` - Lawyer features
4. `004_update_pricing_tiers.sql` - Pricing updates
5. `005_feature_enhancements.sql` - Latest features

---

## 💡 Pro Tips

1. **Always start local Supabase before coding**
2. **Test migrations locally first**
3. **Commit migrations to Git**
4. **Use meaningful migration names**
5. **Keep local and production in sync**
6. **Back up production before major changes**

---

## 🔗 Useful Links

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Migrations Guide](https://supabase.com/docs/guides/cli/managing-config)

---

**You're now set up for professional, safe database development! 🎉**
