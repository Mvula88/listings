# 🚨 CRITICAL DATABASE WORKFLOW RULES 🚨

## ⚠️ MANDATORY PROCESS - READ THIS FIRST ⚠️

**This application will serve MILLIONS of users. Database changes MUST follow this workflow WITHOUT EXCEPTION.**

---

## 📋 The ONLY Approved Database Workflow

### ❌ NEVER DO THIS:
- ❌ Never copy SQL and paste directly into Supabase Dashboard
- ❌ Never run SQL directly in production
- ❌ Never skip local testing
- ❌ Never push to remote before testing locally
- ❌ Never use database APIs or scripts to apply changes
- ❌ Never modify production database manually

### ✅ ALWAYS DO THIS:

#### Step 1: Create Migration File
```bash
npx supabase migration new descriptive_name_of_change
```
This creates a timestamped migration file in `supabase/migrations/`

#### Step 2: Write SQL in Migration File
- Edit the newly created migration file in `supabase/migrations/`
- Write your SQL changes (CREATE TABLE, ALTER TABLE, CREATE FUNCTION, etc.)
- Add comments explaining what the migration does

#### Step 3: Test Locally with Docker (MANDATORY!)
```bash
# Start local Supabase if not running
npx supabase start

# Apply ALL migrations to local database
npx supabase db reset

# Check output for ANY errors
# If errors exist, fix them and test again
# Repeat until NO ERRORS
```

**WAIT FOR THIS TO COMPLETE SUCCESSFULLY BEFORE PROCEEDING!**

#### Step 4: Test Your Application Locally
```bash
npm run dev
```
- Test the feature that uses the database change
- Verify everything works correctly
- Check for any runtime errors

#### Step 5: ONLY After Local Testing Succeeds - Push to Production
```bash
npx supabase db push --linked
```
- Review the migrations that will be applied
- Confirm by typing 'y'
- Verify the migration was applied successfully

#### Step 6: Verify Migration Status
```bash
npx supabase migration list --linked
```
- Confirm the migration appears in both Local and Remote columns

---

## 🔄 Summary - The Workflow Flow

```
1. CREATE migration file
   ↓
2. WRITE SQL in migration file
   ↓
3. TEST locally with Docker (npx supabase db reset)
   ↓
4. FIX any errors and repeat step 3 until SUCCESS
   ↓
5. TEST your app locally (npm run dev)
   ↓
6. PUSH to production (npx supabase db push)
   ↓
7. VERIFY success (npx supabase migration list)
```

---

## 🛑 CRITICAL REMINDERS

1. **ALWAYS test in Docker FIRST**
2. **NEVER skip local testing**
3. **NEVER push untested SQL to production**
4. **ALL database changes MUST be migrations**
5. **Production database serves MILLIONS - handle with care**

---

## 📝 Daily Commands Reference

### Starting Local Development
```bash
# Start local Supabase
npx supabase start

# View local database
# Open browser: http://localhost:54323
```

### Creating & Testing Changes
```bash
# Create new migration
npx supabase migration new my_change

# Edit file: supabase/migrations/TIMESTAMP_my_change.sql

# Test locally (applies ALL migrations)
npx supabase db reset

# Check if it worked - no errors should appear
```

### Pushing to Production
```bash
# ONLY after local testing succeeds!
npx supabase db push --linked

# Verify it worked
npx supabase migration list --linked
```

### Stopping Local Development
```bash
npx supabase stop
```

---

## 🚨 IF SOMETHING GOES WRONG

### If Local Testing Fails
1. DO NOT push to production
2. Fix the SQL error in the migration file
3. Run `npx supabase db reset` again
4. Repeat until it succeeds

### If You Need to Rollback a Migration
1. Create a NEW migration that reverses the changes
2. Test it locally
3. Push to production

### If Production Migration Fails
1. Check the error message
2. Create a fix migration
3. Test locally FIRST
4. Then push the fix

---

## ✅ This Workflow Ensures:
- ✅ No production downtime
- ✅ All changes are tested before deployment
- ✅ Migration history is tracked in Git
- ✅ Easy rollback if needed
- ✅ Safe database changes for millions of users

---

**REMEMBER: Test Local First, THEN Push to Production!**

**NO EXCEPTIONS. EVER.**
