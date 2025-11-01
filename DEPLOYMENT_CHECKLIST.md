# 🚀 DealDirect - Deployment Checklist

**Status:** Ready to Deploy
**Platform:** Vercel + Supabase
**Estimated Time:** 2-3 hours
**Date:** November 1, 2025

---

## 📋 Pre-Deployment Preparation

### 1. Environment Variables Setup ⏱️ 10 minutes

Before deploying, gather all required API keys and credentials:

#### Required Services

1. **Supabase** (Database & Auth)
   - Create project at https://supabase.com
   - Get your project URL and keys from Settings → API
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`

2. **Resend** (Email Service)
   - Sign up at https://resend.com
   - Get API key from Settings → API Keys
   - ✅ `RESEND_API_KEY`

3. **Upstash Redis** (Rate Limiting)
   - Create database at https://upstash.com
   - Get REST URL and token
   - ✅ `UPSTASH_REDIS_REST_URL`
   - ✅ `UPSTASH_REDIS_REST_TOKEN`

4. **Sentry** (Error Monitoring)
   - Project created: `ortios-llc/listings`
   - Get DSN from Sentry dashboard
   - ✅ `NEXT_PUBLIC_SENTRY_DSN`
   - ✅ `SENTRY_AUTH_TOKEN` (for source maps)
   - ✅ `SENTRY_ORG=ortios-llc`
   - ✅ `SENTRY_PROJECT=listings`

#### Create `.env.production` File

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend Email
RESEND_API_KEY=re_your_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=ortios-llc
SENTRY_PROJECT=listings

# App URL (update after deployment)
NEXT_PUBLIC_APP_URL=https://dealdirect.vercel.app
```

---

## 🗄️ Database Setup

### 2. Run Supabase Migrations ⏱️ 15 minutes

Execute migrations in order in Supabase SQL Editor:

#### Migration 001: Initial Schema
```bash
# File: supabase/migrations/001_initial_schema.sql
# Creates: profiles, countries, cities, properties, property_images,
#          inquiries, transactions, lawyers, lawyer_transactions
```
- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Copy contents of `001_initial_schema.sql`
- [ ] Execute and verify success
- [ ] Check Tables: Should see 9 core tables

#### Migration 002: Row Level Security
```bash
# File: supabase/migrations/002_rls_policies.sql
# Creates: RLS policies for all tables
```
- [ ] Execute `002_rls_policies.sql`
- [ ] Verify RLS is enabled on all tables
- [ ] Test: Try accessing data without auth (should fail)

#### Migration 003: Lawyer Fee Collection Model
```bash
# File: supabase/migrations/003_lawyer_fee_collection_model.sql
# Updates: Transaction fee structure
```
- [ ] Execute `003_lawyer_fee_collection_model.sql`
- [ ] Verify new columns added to transactions table

#### Migration 004: Updated Pricing Tiers
```bash
# File: supabase/migrations/004_update_pricing_tiers.sql
# Updates: Platform fee calculation (R4.5K - R45K)
```
- [ ] Execute `004_update_pricing_tiers.sql`
- [ ] Verify fee tiers are correct

#### Migration 005: Feature Enhancements
```bash
# File: supabase/migrations/005_feature_enhancements.sql
# Creates: 14 new tables for analytics, reviews, referrals
# Creates: Database triggers for auto-aggregation
```
- [ ] Execute `005_feature_enhancements.sql`
- [ ] Verify all 14 new tables created:
  - property_views
  - lawyer_reviews
  - saved_searches
  - property_comparisons
  - referrals
  - property_verifications
  - notification_preferences
  - email_queue
  - audit_logs
  - user_sessions
  - property_statistics
  - platform_fees
  - lawyer_ratings_aggregate
  - transaction_fees

- [ ] Verify triggers are active:
  - update_lawyer_ratings_trigger
  - update_property_stats_trigger

#### Verify Database Setup
```sql
-- Run this query to verify all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should return 27 tables total
```

### 3. Configure Supabase Storage ⏱️ 5 minutes

#### Create Storage Bucket
- [ ] Navigate to Storage in Supabase Dashboard
- [ ] Click "New Bucket"
- [ ] Name: `property-images`
- [ ] Public: ✅ Enabled
- [ ] File size limit: 50MB
- [ ] Allowed MIME types: `image/jpeg, image/png, image/webp`

#### Set Upload Policies
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Allow public to view images
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Test Image Upload
- [ ] Create test account
- [ ] Try uploading image through UI
- [ ] Verify image appears in bucket
- [ ] Verify image loads via public URL

---

## 📧 Email Service Setup

### 4. Configure Resend ⏱️ 10 minutes

#### Verify API Key
- [ ] Test API key with curl:
```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<p>Test successful!</p>"
  }'
```

#### Send Test Email
- [ ] Deploy to Vercel first (see below)
- [ ] Use test inquiry form
- [ ] Verify email arrives in inbox
- [ ] Check email formatting

#### Domain Setup (Optional - Can be done later)
- [ ] Add custom domain in Resend dashboard
- [ ] Add DNS records to your domain
- [ ] Verify domain
- [ ] Update email templates to use `noreply@yourdomain.com`

---

## ☁️ Vercel Deployment

### 5. Deploy to Vercel ⏱️ 20 minutes

#### Initial Setup
- [ ] Commit all changes to Git:
```bash
git add .
git commit -m "Launch ready: Complete platform with analytics, reviews, and legal compliance"
git push origin main
```

- [ ] Go to https://vercel.com
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] Select the repository: `your-username/listings`

#### Configure Build Settings
- [ ] Framework Preset: **Next.js** (auto-detected)
- [ ] Root Directory: `./` (leave default)
- [ ] Build Command: `npm run build` (default)
- [ ] Output Directory: `.next` (default)
- [ ] Install Command: `npm install` (default)
- [ ] Node Version: **22.x** (select in settings)

#### Add Environment Variables
Click "Environment Variables" and add all variables from step 1:

**Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL = https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ...
```

**Resend:**
```
RESEND_API_KEY = re_...
```

**Upstash:**
```
UPSTASH_REDIS_REST_URL = https://...
UPSTASH_REDIS_REST_TOKEN = ...
```

**Sentry:**
```
NEXT_PUBLIC_SENTRY_DSN = https://...
SENTRY_AUTH_TOKEN = sntrys_...
SENTRY_ORG = ortios-llc
SENTRY_PROJECT = listings
```

**App URL:**
```
NEXT_PUBLIC_APP_URL = https://dealdirect.vercel.app
```

- [ ] Set all variables for **Production** environment
- [ ] Optionally set for Preview and Development

#### Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (3-5 minutes)
- [ ] Check build logs for errors
- [ ] Note your deployment URL (e.g., `dealdirect.vercel.app`)

#### Update App URL
- [ ] Copy your Vercel deployment URL
- [ ] Go back to Environment Variables
- [ ] Update `NEXT_PUBLIC_APP_URL` to your actual URL
- [ ] Redeploy (Deployments → ⋯ → Redeploy)

---

## ✅ Post-Deployment Testing

### 6. Critical Functionality Tests ⏱️ 30 minutes

#### Authentication Tests
- [ ] Navigate to `/signup`
- [ ] Create new account with email
- [ ] Verify email confirmation sent
- [ ] Log out
- [ ] Log in with credentials
- [ ] Test "Forgot Password" flow
- [ ] Verify session persists on refresh

#### Property Listing Tests
- [ ] Log in as user
- [ ] Navigate to "List Property"
- [ ] Fill out property form completely
- [ ] Upload 3-5 images
- [ ] Submit listing
- [ ] Verify images uploaded to Supabase Storage
- [ ] Verify images optimized (check file sizes)
- [ ] View property on browse page
- [ ] View property detail page
- [ ] Check PropertyViewTracker is firing (check Supabase `property_views` table)

#### Email Notification Tests
- [ ] Create second test account (buyer)
- [ ] Submit inquiry on property
- [ ] Verify seller receives inquiry email
- [ ] Verify buyer receives confirmation email
- [ ] Check email formatting on desktop
- [ ] Check email formatting on mobile

#### Analytics Tests
- [ ] View property detail page
- [ ] Stay on page for 30+ seconds
- [ ] Navigate away
- [ ] Check `property_views` table in Supabase
- [ ] Verify view recorded with duration
- [ ] Go to property analytics page `/properties/[id]/analytics`
- [ ] Verify charts and metrics display

#### Review System Tests
- [ ] Create completed transaction (manually in DB if needed)
- [ ] Navigate to `/transactions/[id]/review-lawyer`
- [ ] Submit lawyer review
- [ ] Verify review appears in `lawyer_reviews` table
- [ ] Verify lawyer aggregate ratings updated (trigger)
- [ ] View lawyer profile
- [ ] Verify review displays correctly

#### Search & Filter Tests
- [ ] Navigate to `/browse`
- [ ] Test search by location
- [ ] Test price range filter
- [ ] Test property type filter
- [ ] Test sorting (price, date, views)
- [ ] Verify results update correctly

#### Mobile Responsiveness Tests
- [ ] Open site on mobile device or DevTools mobile view
- [ ] Test navigation menu
- [ ] Test property cards layout
- [ ] Test property detail page
- [ ] Test forms (signup, listing, inquiry)
- [ ] Test image gallery swipe
- [ ] Verify all buttons are tappable
- [ ] Check text is readable without zooming

#### Security Tests
- [ ] Try accessing `/dashboard` without login → redirects to `/login`
- [ ] Try accessing another user's property edit page → 403 or redirect
- [ ] Try submitting inquiry without auth → prompts login
- [ ] Test rate limiting: Submit form 10+ times rapidly → should be rate limited
- [ ] Check HTTPS is enabled
- [ ] Verify Supabase RLS policies working (can't access other users' data)

#### Error Monitoring Tests
- [ ] Open Sentry dashboard
- [ ] Trigger an error (e.g., invalid form submission)
- [ ] Verify error appears in Sentry
- [ ] Check error details and stack trace
- [ ] Verify source maps working (can see actual source code)

#### Cookie Consent Tests
- [ ] Open site in incognito/private window
- [ ] Verify Cookie Consent banner appears
- [ ] Click "Customize"
- [ ] Toggle analytics off
- [ ] Save preferences
- [ ] Verify banner doesn't appear on refresh
- [ ] Clear localStorage
- [ ] Verify banner appears again

---

## 🎯 Launch Day Checklist

### 7. Final Pre-Launch Steps ⏱️ 30 minutes

#### Performance Checks
- [ ] Run Lighthouse audit (Performance, Accessibility, Best Practices, SEO)
  - Target scores: 90+ on all metrics
- [ ] Check page load times (should be < 2 seconds)
- [ ] Test on slow 3G connection
- [ ] Optimize images if scores are low

#### SEO Setup
- [ ] Verify all pages have proper `<title>` tags
- [ ] Verify all pages have meta descriptions
- [ ] Check Open Graph tags for social sharing
- [ ] Submit sitemap to Google Search Console (create if needed)
- [ ] Set up Google Analytics (optional)

#### Legal Compliance
- [ ] Review Privacy Policy for accuracy
- [ ] Review Terms of Service for accuracy
- [ ] Verify Cookie Consent banner working
- [ ] Ensure GDPR/POPIA compliance
- [ ] Add contact email addresses (privacy@, support@)

#### Monitoring Setup
- [ ] Configure Sentry alerts
- [ ] Set up Vercel deployment notifications
- [ ] Set up Uptime monitoring (e.g., UptimeRobot)
- [ ] Configure database backup schedule in Supabase

#### Documentation
- [ ] Update README.md with deployment info
- [ ] Document any environment-specific configurations
- [ ] Create internal runbook for common issues
- [ ] Prepare customer support FAQ

#### Communication
- [ ] Prepare launch announcement
- [ ] Draft social media posts
- [ ] Create email list for early users
- [ ] Prepare press release (optional)

---

## 🚀 Go Live!

### 8. Launch Sequence ⏱️ 1 hour

#### Soft Launch (Week 1: 10-20 users)
- [ ] **Day 1:** Invite 5 trusted friends/colleagues
  - Ask them to create accounts
  - Ask them to test core features
  - Collect feedback on bugs and UX

- [ ] **Day 2-3:** Monitor errors in Sentry
  - Fix critical bugs immediately
  - Log non-critical issues for later

- [ ] **Day 3-4:** Invite 5 property sellers
  - Help them list their first properties
  - Guide them through platform features
  - Get feedback on listing process

- [ ] **Day 5-7:** Invite 10 potential buyers
  - Encourage browsing and inquiries
  - Monitor inquiry email delivery
  - Track engagement metrics

#### Expansion (Week 2-3: 50-100 users)
- [ ] **Week 2:**
  - Recruit 3-5 lawyers to join network
  - Add 20-30 more property listings
  - Start social media presence (Facebook, Instagram)
  - Create first blog post or case study

- [ ] **Week 3:**
  - Partner with 1-2 real estate agents (for lead generation)
  - Launch referral program
  - Send first newsletter to users
  - Monitor first transactions closely

#### Scale (Month 2: 500+ users)
- [ ] Begin paid advertising (Facebook, Google Ads)
- [ ] Expand lawyer network (15-20 lawyers)
- [ ] Add premium features (Featured Listings)
- [ ] Release new features based on user feedback
- [ ] Aim for 10 completed transactions

---

## 📊 Success Metrics

### Key Performance Indicators (KPIs)

#### Technical Health
- [ ] **Uptime:** > 99% (monitor with Vercel analytics)
- [ ] **Page Load Time:** < 2 seconds (check Lighthouse)
- [ ] **Error Rate:** < 1% (monitor in Sentry)
- [ ] **Email Delivery:** > 95% (check Resend dashboard)

#### User Engagement
- [ ] **Daily Active Users (DAU):** Track in analytics
- [ ] **Properties Listed:** Track in database
- [ ] **Inquiries per Property:** Average > 2
- [ ] **Time on Site:** Average > 3 minutes
- [ ] **Return Visitor Rate:** > 30%

#### Business Metrics
- [ ] **New Listings per Week:** Target 10+ in month 1
- [ ] **Active Listings:** Target 50+ by end of month 1
- [ ] **Transactions Initiated:** Target 5+ in month 1
- [ ] **Completed Transactions:** Target 2+ in month 1
- [ ] **Platform Revenue:** Track fees collected

#### Quality Metrics
- [ ] **Average Lawyer Rating:** Target > 4.0 stars
- [ ] **User Satisfaction:** Survey score > 4.0
- [ ] **Net Promoter Score (NPS):** Target > 50
- [ ] **Support Response Time:** < 24 hours

---

## 🛠️ Troubleshooting Common Issues

### Build Failures
**Issue:** Vercel build fails
- Check build logs for specific errors
- Verify all environment variables are set
- Test build locally: `npm run build`
- Check Node version matches (v22.x)
- Clear Vercel build cache and redeploy

### Database Connection Issues
**Issue:** Can't connect to Supabase
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check Supabase project is not paused
- Verify RLS policies allow operation
- Check network/firewall settings

### Email Not Sending
**Issue:** Emails not arriving
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for delivery status
- Check spam folder
- Verify email template syntax
- Test with simple email first
- Check daily sending limits

### Image Upload Failures
**Issue:** Images not uploading
- Check Supabase Storage bucket exists
- Verify bucket is public
- Check upload policies are set
- Verify file size < 50MB
- Check file type is allowed (jpg, png, webp)
- Test upload in Supabase dashboard directly

### Rate Limiting Too Aggressive
**Issue:** Users getting rate limited
- Check Upstash Redis connection
- Adjust rate limit in `lib/security/rate-limit.ts`
- Verify IP detection is working
- Consider increasing limits for production

### Sentry Not Receiving Errors
**Issue:** No errors showing in Sentry
- Verify `NEXT_PUBLIC_SENTRY_DSN` is set
- Trigger test error manually
- Check Sentry project is active
- Verify source maps uploading (`SENTRY_AUTH_TOKEN`)
- Check browser console for Sentry init errors

---

## 📞 Support & Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- Resend: https://resend.com/docs
- Sentry: https://docs.sentry.io/platforms/javascript/guides/nextjs/

### Support Channels
- **Vercel Support:** support@vercel.com
- **Supabase Support:** https://supabase.com/support
- **Resend Support:** support@resend.com
- **Sentry Support:** support@sentry.io

### Internal Documentation
- `README.md` - Project overview
- `WORK_SESSION_SUMMARY.md` - Session 1 work
- `SESSION_2_SUMMARY.md` - Session 2 work
- `LAUNCH_READY_SUMMARY.md` - Launch strategy
- `PLATFORM_ENHANCEMENTS.md` - Future roadmap

---

## ✅ Deployment Complete Checklist

Before marking deployment as complete, verify:

- [ ] All 5 migrations executed successfully
- [ ] All environment variables set in Vercel
- [ ] Supabase Storage bucket created and configured
- [ ] Email service tested and working
- [ ] Production site accessible at URL
- [ ] Authentication working (signup, login, logout)
- [ ] Property listing working (create, view, search)
- [ ] Image upload working
- [ ] Email notifications arriving
- [ ] Analytics tracking views
- [ ] Cookie consent banner appearing
- [ ] Mobile responsive design working
- [ ] HTTPS enabled
- [ ] Sentry receiving errors
- [ ] No critical errors in Sentry
- [ ] Lighthouse scores > 90
- [ ] Legal pages accessible (Privacy, Terms)
- [ ] All tests passing

---

## 🎉 You're Live!

**Congratulations! Your platform is now deployed and ready for users.**

### Next Steps:
1. Monitor Sentry for first 24 hours
2. Check email delivery rates
3. Gather user feedback
4. Fix critical bugs immediately
5. Plan feature releases based on feedback

### Emergency Contacts:
- **Technical Issues:** Your email
- **Hosting (Vercel):** Vercel support
- **Database (Supabase):** Supabase support
- **Email Issues:** Resend support

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Production URL:** _______________
**Status:** 🟢 LIVE

**Good luck with your launch! 🚀**
