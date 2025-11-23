# 🚀 DEPLOYMENT GUIDE

## ✅ Step 1: Local Setup (DONE!)

Your `.env.local` file now has:
```bash
CRON_SECRET=584469c934c4dbb5d78914b38636f48abd91eb881820810679d0d30178e5f114
```

This allows you to test the cron job locally:
```bash
curl http://localhost:3000/api/cron/check-overdue-remittances \
  -H "Authorization: Bearer 584469c934c4dbb5d78914b38636f48abd91eb881820810679d0d30178e5f114"
```

---

## 🌐 Step 2: Add to Vercel

### Option A: Via Vercel Dashboard (Easiest)

1. **Go to your Vercel project**:
   - https://vercel.com/dashboard
   - Select your project (listings)

2. **Navigate to Settings**:
   - Click "Settings" tab
   - Click "Environment Variables" in sidebar

3. **Add CRON_SECRET**:
   - Click "Add New"
   - Key: `CRON_SECRET`
   - Value: `584469c934c4dbb5d78914b38636f48abd91eb881820810679d0d30178e5f114`
   - Environments: Select all (Production, Preview, Development)
   - Click "Save"

4. **Redeploy** (if already deployed):
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Add environment variable
vercel env add CRON_SECRET
# When prompted, paste: 584469c934c4dbb5d78914b38636f48abd91eb881820810679d0d30178e5f114
# Select all environments

# Deploy
vercel --prod
```

---

## 📅 Step 3: Verify Cron Job is Running

After deployment, check that the cron is scheduled:

1. **Go to Vercel Dashboard**:
   - Your project → Deployments → Click latest deployment
   - Look for "Cron Jobs" section
   - Should show: `/api/cron/check-overdue-remittances` scheduled daily at 9:00 AM

2. **Test manually** (from Vercel deployment):
   ```bash
   curl https://your-domain.vercel.app/api/cron/check-overdue-remittances \
     -H "Authorization: Bearer 584469c934c4dbb5d78914b38636f48abd91eb881820810679d0d30178e5f114"
   ```

   Should return:
   ```json
   {
     "success": true,
     "processedTransactions": 0
   }
   ```

3. **Check logs**:
   - Vercel Dashboard → Logs
   - Filter by function: `check-overdue-remittances`
   - Should see daily executions

---

## 🔐 Security Note

**IMPORTANT**: The `CRON_SECRET` is a security measure to prevent unauthorized access to your cron endpoint.

- ✅ Only Vercel's cron system knows this secret
- ✅ Without it, no one can trigger the endpoint
- ✅ Keep it secret (don't commit to git - already in `.gitignore`)

---

## 🧪 Test Before Going Live

### Test 1: Run Locally

```bash
# Start your dev server
npm run dev

# In another terminal, trigger the cron
curl http://localhost:3000/api/cron/check-overdue-remittances \
  -H "Authorization: Bearer 584469c934c4dbb5d78914b38636f48abd91eb881820810679d0d30178e5f114"
```

### Test 2: Create Overdue Transaction

To test the enforcement logic:

1. Go to Supabase Dashboard → SQL Editor
2. Run this to create a test overdue transaction:
   ```sql
   -- Create a test transaction that's 61 days overdue
   UPDATE transactions
   SET
     deal_closed_at = NOW() - INTERVAL '61 days',
     fee_collected = true,
     fee_remitted = false,
     remittance_due_date = (NOW() - INTERVAL '31 days')::DATE
   WHERE id = 'YOUR-TEST-TRANSACTION-ID';
   ```

3. Run the cron job:
   ```bash
   curl http://localhost:3000/api/cron/check-overdue-remittances \
     -H "Authorization: Bearer 584469c934c4dbb5d78914b38636f48abd91eb881820810679d0d30178e5f114"
   ```

4. Check the response - should show:
   ```json
   {
     "success": true,
     "processedTransactions": 1,
     "details": [{
       "action": "suspended",
       "days_overdue": 61,
       "new_status": "suspended"
     }]
   }
   ```

5. Verify in Supabase:
   ```sql
   SELECT suspended_for_non_payment, remittance_status
   FROM lawyers
   WHERE id = 'YOUR-LAWYER-ID';
   ```
   Should show `suspended_for_non_payment = true`

---

## 📧 Optional: Add Email Notifications

To send actual reminder emails, integrate with your email service:

### Using Resend (Already configured in .env.local)

1. **Install Resend**:
   ```bash
   npm install resend
   ```

2. **Update the cron job** (`app/api/cron/check-overdue-remittances/route.ts`):

   Find line ~50 where it says:
   ```typescript
   // TODO: Implement email sending via your email service
   console.log(`Would send ${action} email...`)
   ```

   Replace with:
   ```typescript
   import { Resend } from 'resend'

   const resend = new Resend(process.env.RESEND_API_KEY)

   await resend.emails.send({
     from: process.env.FROM_EMAIL || 'noreply@proplinka.com',
     to: profile.email,
     subject: `Platform Fee Remittance ${action === 'suspended' ? 'URGENT' : 'Reminder'} - ${daysOverdue} days overdue`,
     html: `
       <h2>Platform Fee Remittance ${action === 'suspended' ? 'Account Suspended' : 'Reminder'}</h2>
       <p>Dear ${profile.full_name},</p>
       ${action === 'suspended' ? `
         <p style="color: red; font-weight: bold;">Your account has been suspended due to non-payment.</p>
       ` : `
         <p>You have an overdue platform fee remittance (${daysOverdue} days past due).</p>
       `}
       <p>Please log in to your dashboard to review and remit outstanding fees.</p>
       <p><a href="https://proplinka.com/lawyer-deals">View Dashboard</a></p>
     `
   })
   ```

3. **Make sure Resend API key is valid** in `.env.local`

---

## 🎯 Deployment Checklist

Before deploying:
- [x] CRON_SECRET added to `.env.local`
- [ ] CRON_SECRET added to Vercel environment variables
- [ ] Code committed to git
- [ ] Deployed to Vercel
- [ ] Cron job appears in Vercel dashboard
- [ ] Test endpoint manually
- [ ] Check logs for first execution
- [ ] (Optional) Email integration tested

---

## 🚀 Deploy Now!

Everything is ready. Run:

```bash
# Commit changes
git add .
git commit -m "Add automated remittance enforcement cron job"
git push origin main

# Deploy to Vercel
vercel --prod
```

Then add the `CRON_SECRET` to Vercel dashboard as described above.

---

## 📊 Monitoring

After deployment, monitor:

1. **Vercel Logs**:
   - Check daily at 9:00 AM UTC for cron executions
   - Look for "processedTransactions" count

2. **Supabase Dashboard**:
   - Check `lawyers` table for `remittance_status` changes
   - Check `audit_logs` table for fee_collected/fee_remitted actions

3. **Lawyer Feedback**:
   - Monitor support requests about remittance deadlines
   - Verify lawyers receive commission clearly

---

**Questions?** Check `IMPLEMENTATION_COMPLETE.md` for full documentation.

**Generated**: November 24, 2025
