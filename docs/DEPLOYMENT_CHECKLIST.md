# PropLinka Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Code Quality
- [ ] All tests pass (`npm run test:ci`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)

### Security
- [ ] No secrets committed to git
- [ ] Environment variables properly configured
- [ ] API keys rotated if compromised
- [ ] Rate limiting tested

### Database
- [ ] Migrations tested on staging
- [ ] Backup created before migration
- [ ] Rollback SQL prepared
- [ ] RLS policies verified

### Features
- [ ] New features tested on staging
- [ ] Edge cases handled
- [ ] Error messages user-friendly
- [ ] Mobile responsiveness verified

## Deployment Steps

### 1. Prepare
```bash
# Ensure on main branch with latest changes
git checkout main
git pull origin main

# Verify tests pass
npm run test:ci

# Verify build succeeds
npm run build
```

### 2. Environment Variables
Check all required env vars are set in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `RESEND_API_KEY`
- [ ] `UPSTASH_REDIS_REST_URL`
- [ ] `UPSTASH_REDIS_REST_TOKEN`
- [ ] `SENTRY_DSN`

### 3. Database Migrations (if any)
```bash
# Apply to staging first
supabase db push --db-url $STAGING_DB_URL

# Test staging thoroughly

# Apply to production
supabase db push --db-url $PRODUCTION_DB_URL
```

### 4. Deploy
Deployment happens automatically via GitHub Actions when merged to main.

For manual deploy:
```bash
vercel --prod
```

### 5. Post-Deployment Verification

#### Immediate (within 5 minutes)
- [ ] Homepage loads
- [ ] User can login
- [ ] Properties display correctly
- [ ] No console errors

#### Within 30 minutes
- [ ] Test user registration
- [ ] Test property creation
- [ ] Test inquiry submission
- [ ] Test payment flow (use test card)
- [ ] Check Sentry for new errors
- [ ] Check Stripe webhook is receiving events

#### Within 24 hours
- [ ] Monitor error rates in Sentry
- [ ] Review user feedback
- [ ] Check database performance
- [ ] Verify email delivery

## Rollback Procedure

### Quick Rollback (Vercel)
1. Go to Vercel Dashboard
2. Navigate to Deployments
3. Find last known good deployment
4. Click "..." > "Promote to Production"

### Database Rollback
1. Identify the issue
2. Run rollback SQL:
```sql
-- Example rollback
BEGIN;
-- Your rollback statements
COMMIT;
```

### Emergency Contacts
- Vercel Support: [Vercel Dashboard]
- Supabase Support: [Supabase Dashboard]
- Stripe Support: [Stripe Dashboard]

## Feature Flags

To disable features in emergency:
```
ENABLE_REFERRALS=false
ENABLE_PREMIUM_LISTINGS=false
MAINTENANCE_MODE=true
```

## Monitoring Links

- **Vercel**: https://vercel.com/[your-team]/proplinka
- **Sentry**: https://sentry.io/organizations/[org]/issues/
- **Supabase**: https://app.supabase.com/project/[project-id]
- **Stripe**: https://dashboard.stripe.com/test/webhooks
- **Upstash**: https://console.upstash.com

## Common Issues

### Deployment Failed
1. Check Vercel build logs
2. Verify environment variables
3. Check for dependency issues

### Database Connection Issues
1. Check Supabase status
2. Verify connection string
3. Check RLS policies

### Payment Webhook Failures
1. Verify webhook secret is correct
2. Check webhook endpoint URL
3. Review Stripe webhook logs

### Email Not Sending
1. Verify Resend API key
2. Check sender domain verification
3. Review Resend dashboard for errors

---

**Last Updated**: November 2024
**Next Review**: December 2024
