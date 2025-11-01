# DealDirect - Quick Setup Guide

## 🚀 Get Your Platform Running in 30 Minutes

This guide will help you set up DealDirect from scratch. Follow these steps carefully.

---

## Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Enter project details:
   - Name: `dealdirect`
   - Database Password: (save this securely!)
   - Region: Choose closest to Namibia/South Africa
4. Wait 2-3 minutes for project to initialize

### 1.2 Run Database Migrations

**Option A: Using Supabase Dashboard** (Easiest)

1. In Supabase dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy content from `supabase/migrations/001_initial_schema.sql`
4. Paste and click "Run"
5. Repeat for:
   - `002_rls_policies.sql`
   - `003_lawyer_fee_collection_model.sql`
   - `004_update_pricing_tiers.sql`
   - `005_feature_enhancements.sql`

**Option B: Using Supabase CLI** (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 1.3 Set Up Storage Bucket

1. In Supabase dashboard, go to "Storage"
2. Click "Create Bucket"
3. Name: `property-images`
4. Public bucket: Yes
5. Click "Create"

6. Set up storage policies:
   - Go to "Storage" → "Policies"
   - Add policy for `property-images`:
     - Name: "Public read access"
     - Operation: SELECT
     - Target roles: public
     - USING expression: `true`

   - Add policy for uploads:
     - Name: "Authenticated users can upload"
     - Operation: INSERT
     - Target roles: authenticated
     - WITH CHECK expression: `auth.role() = 'authenticated'`

### 1.4 Get API Keys

1. In Supabase dashboard, go to "Settings" → "API"
2. Copy these values:
   - Project URL
   - anon public key
   - service_role key (keep secret!)

---

## Step 2: Email Setup (Resend)

### 2.1 Create Resend Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email
3. Go to "API Keys"
4. Click "Create API Key"
5. Name: `dealdirect-production`
6. Copy the key (you'll only see it once!)

### 2.2 Add Domain (Production Only)

1. Go to "Domains" in Resend dashboard
2. Click "Add Domain"
3. Enter your domain (e.g., `dealdirect.com`)
4. Add DNS records as shown
5. Wait for verification

**For Development:** You can use the default sending domain initially

---

## Step 3: Rate Limiting Setup (Upstash)

### 3.1 Create Upstash Account

1. Go to [upstash.com](https://upstash.com) and sign up
2. Click "Create Database"
3. Select:
   - Name: `dealdirect-ratelimit`
   - Type: Redis
   - Region: Choose closest to your servers
   - Plan: Free (10K requests/day)
4. Click "Create"

### 3.2 Get Connection Details

1. In database details, click "REST API"
2. Copy:
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN

---

## Step 4: Error Monitoring (Sentry) - Optional

### 4.1 Create Sentry Project

1. Go to [sentry.io](https://sentry.io) and sign up
2. Create new project:
   - Platform: Next.js
   - Name: `dealdirect`
3. Copy the DSN (it looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)

### 4.2 Initialize Sentry

```bash
npx @sentry/wizard@latest -i nextjs
```

Follow the prompts and use your DSN when asked.

---

## Step 5: Environment Variables

### 5.1 Copy Template

```bash
cp .env.example .env.local
```

### 5.2 Fill in Values

Open `.env.local` and add your keys:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (REQUIRED for emails)
RESEND_API_KEY=re_your_key
FROM_EMAIL=noreply@dealdirect.com
SUPPORT_EMAIL=support@dealdirect.com

# Upstash (OPTIONAL - for rate limiting)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Sentry (OPTIONAL - for error monitoring)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 6: Install & Run

### 6.1 Install Dependencies

```bash
npm install
```

This will install:
- Next.js and React
- Supabase client
- Resend email client
- Sharp (image optimization)
- Upstash rate limiting
- Sentry monitoring
- All other dependencies

### 6.2 Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 7: Test Everything

### 7.1 Test User Registration

1. Go to `http://localhost:3000/register`
2. Create an account
3. Check Supabase Auth for the user
4. Check your email for welcome email

### 7.2 Test Image Upload

1. Login to your account
2. Go to "List Property"
3. Try uploading an image
4. Check Supabase Storage for the optimized image

### 7.3 Test Database

1. In Supabase dashboard, go to "Table Editor"
2. Verify these tables exist:
   - profiles
   - properties
   - property_images
   - lawyer_reviews
   - saved_searches
   - referrals
   - (and all others from migrations)

---

## Step 8: Production Deployment (Vercel)

### 8.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: DealDirect platform"
git remote add origin your-repo-url
git push -u origin main
```

### 8.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and login with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. Add Environment Variables:
   - Copy all variables from `.env.local`
   - Paste into Vercel's environment variables section
   - Mark sensitive ones as "Secret"

6. Click "Deploy"

7. Wait 2-3 minutes for deployment

8. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables to your production URL

### 8.3 Update Supabase Auth URLs

1. In Supabase dashboard, go to "Authentication" → "URL Configuration"
2. Add your Vercel URL:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

---

## Step 9: Post-Deployment Tasks

### 9.1 Test Production

- [ ] User registration works
- [ ] Email notifications arrive
- [ ] Image uploads work
- [ ] Property listings appear
- [ ] Search and filters work
- [ ] Transactions can be initiated

### 9.2 Set Up Monitoring

1. **Sentry:** Check error dashboard
2. **Vercel:** Monitor analytics
3. **Supabase:** Check database size and connections
4. **Resend:** Monitor email delivery rates

### 9.3 Configure Custom Domain (Optional)

1. In Vercel, go to project settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update all environment variables with new domain

---

## Common Issues & Solutions

### Issue: "Supabase connection error"
**Solution:** Check that API keys are correct in `.env.local` and Supabase project is active

### Issue: "Email not sending"
**Solution:**
- Verify RESEND_API_KEY is correct
- Check Resend dashboard for errors
- For production, make sure domain is verified

### Issue: "Image upload fails"
**Solution:**
- Check Supabase storage bucket exists and is public
- Verify storage policies allow uploads
- Check file size (max 10MB)

### Issue: "Rate limit not working"
**Solution:**
- Verify Upstash Redis credentials
- Check that UPSTASH_REDIS_REST_URL starts with `https://`
- Rate limiting is optional - app works without it

### Issue: "Build fails on Vercel"
**Solution:**
- Check all required environment variables are set
- Review build logs for specific errors
- Try building locally: `npm run build`

---

## Performance Optimization Checklist

After deployment, optimize your platform:

- [ ] Enable Vercel Edge caching
- [ ] Set up Cloudflare CDN (optional)
- [ ] Configure image optimization settings
- [ ] Set up database connection pooling
- [ ] Enable Supabase read replicas (paid plan)
- [ ] Implement lazy loading for images
- [ ] Set up analytics (Google Analytics)

---

## Security Checklist

Before going fully live:

- [ ] All environment variables set to production values
- [ ] Supabase RLS policies tested
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] HTTPS enforced (Vercel does this automatically)
- [ ] Regular security audits scheduled
- [ ] Backup strategy in place

---

## Need Help?

- **Documentation:** See `README.md` and `PLATFORM_ENHANCEMENTS.md`
- **Email:** support@dealdirect.com
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)

---

## Next Steps

After setup, focus on:

1. **Complete Phase 1 features** (see `PLATFORM_ENHANCEMENTS.md`)
2. **Add test properties** to populate the platform
3. **Onboard lawyers** to your network
4. **Launch marketing** to attract users
5. **Monitor metrics** and optimize conversion

**Congratulations! Your DealDirect platform is now live! 🎉**

---

Last Updated: 2025-11-01
