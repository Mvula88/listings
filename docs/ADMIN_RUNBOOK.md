# PropLinka Admin Operations Runbook

## Table of Contents
1. [Quick Reference](#quick-reference)
2. [Daily Operations](#daily-operations)
3. [User Management](#user-management)
4. [Property Moderation](#property-moderation)
5. [Transaction Management](#transaction-management)
6. [Lawyer Management](#lawyer-management)
7. [Incident Response](#incident-response)
8. [Maintenance Procedures](#maintenance-procedures)

---

## Quick Reference

### Important URLs
| Environment | URL | Purpose |
|-------------|-----|---------|
| Production | https://proplinka.com | Live site |
| Staging | https://staging.proplinka.com | Testing |
| Admin Panel | https://proplinka.com/admin | Admin dashboard |
| Supabase | https://app.supabase.com | Database management |
| Vercel | https://vercel.com/dashboard | Deployment |
| Sentry | https://sentry.io | Error monitoring |
| Stripe | https://dashboard.stripe.com | Payments |

### Emergency Contacts
- Technical Lead: [Add contact]
- Database Admin: [Add contact]
- Support Email: support@proplinka.com

### Critical Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
```

---

## Daily Operations

### Morning Checklist
1. **Check Error Dashboard**
   - Login to Sentry: https://sentry.io
   - Review new errors from past 24 hours
   - Prioritize critical/high-severity issues

2. **Review Moderation Queue**
   - Go to `/admin/moderation`
   - Check pending properties count
   - Process flagged items first

3. **Check Payment Status**
   - Review Stripe dashboard for failed payments
   - Check for overdue remittances in `/admin/transactions`

4. **Monitor System Health**
   - Check Vercel deployment status
   - Review database connection metrics in Supabase

### Weekly Tasks
- Review and approve/reject pending lawyer registrations
- Generate reconciliation reports for lawyers
- Archive completed transactions older than 90 days
- Review and update featured listings

---

## User Management

### Suspending a User
1. Navigate to `/admin/users`
2. Search for the user by email or name
3. Click "Actions" > "Suspend User"
4. Add suspension reason (required for audit)
5. Confirm suspension

**Impact**: User cannot login, listings are hidden, active transactions continue.

### Reactivating a Suspended User
1. Navigate to `/admin/users?filter=suspended`
2. Find the user
3. Click "Actions" > "Reactivate"
4. Add reactivation notes

### Creating an Admin/Moderator
1. Navigate to `/admin/moderators/invite`
2. Enter email address
3. Select role (moderator/admin)
4. Send invitation
5. User receives email with setup link

### Revoking Admin Access
1. Navigate to `/admin/moderators`
2. Find the moderator
3. Click "Actions" > "Revoke Access"
4. Confirm (irreversible without re-invitation)

---

## Property Moderation

### Moderation Workflow
```
New Listing -> Pending Review -> [Approved/Rejected/Flagged]
                                      |
                                      v
                               [Published/Rejected Email Sent/Senior Review]
```

### Approving a Property
1. Review all images for quality and appropriateness
2. Verify title and description are accurate
3. Check price is realistic for the area
4. Confirm seller has complete profile
5. Click "Approve"

### Rejecting a Property
**Common Rejection Reasons:**
- Insufficient/poor quality images
- Misleading description
- Unrealistic pricing
- Duplicate listing
- Incomplete information
- Policy violation

**Process:**
1. Click "Reject"
2. Select or enter rejection reason
3. Add constructive notes for seller
4. Submit (email automatically sent)

### Flagging for Senior Review
Use when:
- Suspicious activity detected
- Potential fraud
- Legal concerns
- Pricing significantly above/below market

---

## Transaction Management

### Transaction Statuses
| Status | Description | Action Required |
|--------|-------------|-----------------|
| initiated | Transaction created | Monitor |
| in_progress | Lawyers assigned | Monitor |
| pending_payment | Awaiting fee payment | Follow up |
| completed | All done | Archive |
| cancelled | Cancelled by party | Review reason |

### Handling Stuck Transactions
1. Check transaction details in `/admin/transactions`
2. Identify blocking issue (missing lawyer, payment failed, etc.)
3. Contact relevant parties via email
4. Update transaction notes
5. If needed, manually update status with audit note

### Processing Refunds
1. Verify refund is valid per policy
2. Process in Stripe dashboard
3. Update transaction status
4. Log refund in admin notes
5. Notify user via email

---

## Lawyer Management

### Verifying a Lawyer
1. Check registration number against Law Society database
2. Verify firm details
3. Confirm fee structure is reasonable
4. Mark as "Verified" in profile

### Handling Non-Payment Suspensions
**Auto-suspension triggers after:**
- 30 days overdue on remittance
- 3+ missed remittance deadlines
- Total outstanding > R100,000

**Manual Suspension:**
1. Navigate to `/admin/lawyers`
2. Find lawyer profile
3. Click "Suspend for Non-Payment"
4. Enter outstanding amount
5. System sends notification email

**Lifting Suspension:**
1. Verify payment received
2. Navigate to lawyer profile
3. Click "Reinstate"
4. Update remittance records

### Generating Reconciliation Reports
1. Go to `/admin/lawyers/reconciliation`
2. Select reporting period
3. Generate report
4. Send to lawyer for verification
5. Mark as verified once confirmed

---

## Incident Response

### Severity Levels
| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| P1 - Critical | Site down, payments broken | 15 min | Immediate |
| P2 - High | Major feature broken | 1 hour | 2 hours |
| P3 - Medium | Minor feature issues | 4 hours | 24 hours |
| P4 - Low | Cosmetic issues | 24 hours | None |

### P1 - Site Down Procedure
1. **Verify** the issue (check status.vercel.com, Supabase status)
2. **Communicate** - Post status update
3. **Diagnose** - Check Sentry errors, Vercel logs
4. **Rollback** if recent deployment caused issue:
   ```bash
   # In Vercel dashboard, redeploy previous working deployment
   ```
5. **Fix** root cause
6. **Post-mortem** - Document what happened

### P2 - Payment System Issues
1. Check Stripe dashboard for system status
2. Verify webhook endpoint is responding
3. Check Sentry for payment-related errors
4. If Stripe issue: Enable maintenance mode for payments
5. Contact Stripe support if needed

### Database Issues
1. Check Supabase dashboard for health
2. Review connection pool usage
3. Check for slow queries in logs
4. If needed, scale up Supabase plan

### Enabling Maintenance Mode
Set environment variable:
```
MAINTENANCE_MODE=true
```
Redeploy to activate.

---

## Maintenance Procedures

### Deploying Updates
1. All changes go through PR review
2. Staging deployment happens automatically
3. Test on staging environment
4. Merge to main for production
5. Monitor Sentry for new errors post-deploy

### Database Migrations
1. Test migration on staging first
2. Backup production database
3. Run migration during low-traffic hours
4. Monitor for errors
5. Have rollback SQL ready

### Rotating API Keys
1. Generate new key in respective service
2. Update in Vercel environment variables
3. Trigger redeployment
4. Verify functionality
5. Revoke old key after 24 hours

### Monthly Maintenance
- Review and archive old audit logs
- Clean up expired moderator invitations
- Review and update pricing tiers if needed
- Audit admin access list
- Review error trends in Sentry
- Check database growth and plan capacity

---

## Appendix

### Useful SQL Queries

**Count pending moderations:**
```sql
SELECT COUNT(*) FROM properties
WHERE status = 'active'
AND (moderation_status IS NULL OR moderation_status = 'pending');
```

**Find overdue remittances:**
```sql
SELECT t.*, l.firm_name
FROM transactions t
JOIN lawyers l ON t.buyer_lawyer_id = l.id OR t.seller_lawyer_id = l.id
WHERE t.fee_collected = true
AND t.fee_remitted = false
AND t.remittance_due_date < NOW();
```

**Active transactions by status:**
```sql
SELECT status, COUNT(*)
FROM transactions
GROUP BY status
ORDER BY COUNT(*) DESC;
```

### Audit Log Reference
All admin actions are logged in `audit_logs` table:
- `user_id`: Who performed action
- `action`: What was done
- `entity_type`: What type (user, property, etc.)
- `entity_id`: Specific record
- `old_data`/`new_data`: Before/after JSON
- `created_at`: When

### Support Escalation Matrix
| Issue Type | First Response | Escalate To |
|------------|----------------|-------------|
| Account issues | Support | Admin |
| Payment issues | Support | Finance + Tech |
| Legal/compliance | Support | Legal + Admin |
| Technical bugs | Tech Support | Dev Team |
| Security concerns | Security | CTO immediately |
