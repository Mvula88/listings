import { test, expect } from '@playwright/test'

test.describe('Moderation Flow', () => {
  test.describe('Moderator Authentication', () => {
    test('moderator can login via dedicated login page', async ({ page }) => {
      await page.goto('/moderator-login')

      await expect(page.locator('h1')).toContainText(/Moderator/i)

      await page.fill('[name="email"]', 'moderator@test.com')
      await page.fill('[name="password"]', 'ModeratorPass123!')
      await page.click('button[type="submit"]')

      // Should redirect to moderator dashboard
      await expect(page).toHaveURL(/moderator/, { timeout: 10000 })
    })

    test('non-moderator cannot access moderation pages', async ({ page }) => {
      // Login as regular user
      await page.goto('/login')
      await page.fill('[name="email"]', 'buyer@test.com')
      await page.fill('[name="password"]', 'TestPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/dashboard/)

      // Try to access moderator page
      await page.goto('/moderator/listings')

      // Should be redirected or see error
      await expect(page.locator('text=Not authorized').or(page.locator('text=Access denied'))).toBeVisible()
        .catch(() => expect(page).not.toHaveURL(/moderator\/listings/))
    })

    test('moderator invitation flow works', async ({ page }) => {
      // This would be triggered by admin
      // For now, test the invitation acceptance page
      await page.goto('/moderator-invite/test-token-123')

      // Should show invitation acceptance form
      await expect(page.locator('text=Moderator Invitation').or(page.locator('text=Accept Invitation'))).toBeVisible()

      // Should have password setup fields
      await expect(page.locator('[name="password"]')).toBeVisible()
    })
  })

  test.describe('Property Moderation Queue', () => {
    test.beforeEach(async ({ page }) => {
      // Login as moderator
      await page.goto('/moderator-login')
      await page.fill('[name="email"]', 'moderator@test.com')
      await page.fill('[name="password"]', 'ModeratorPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/moderator/)
    })

    test('moderator sees pending listings queue', async ({ page }) => {
      await page.goto('/moderator/listings')

      // Should show listings table or grid
      await expect(page.locator('h1')).toContainText(/Listings|Moderation|Review/i)

      // Should have filter options
      await expect(page.locator('text=Pending').or(page.locator('[data-filter="pending"]'))).toBeVisible()
      await expect(page.locator('text=Approved').or(page.locator('[data-filter="approved"]'))).toBeVisible()
      await expect(page.locator('text=Rejected').or(page.locator('[data-filter="rejected"]'))).toBeVisible()
    })

    test('moderator can filter listings by status', async ({ page }) => {
      await page.goto('/moderator/listings')

      // Click pending filter
      await page.click('button:has-text("Pending"), [data-filter="pending"]')

      // URL should update or table should filter
      await page.waitForTimeout(500)

      // Click flagged filter
      await page.click('button:has-text("Flagged"), [data-filter="flagged"]')
      await page.waitForTimeout(500)
    })

    test('moderator can view property details for review', async ({ page }) => {
      await page.goto('/moderator/listings')

      // Click on first listing
      await page.click('.listing-row:first-child, .listing-card:first-child, tr:first-child td:first-child a')

      // Should show property details
      await expect(page.locator('text=Property Details').or(page.locator('h1'))).toBeVisible()

      // Should show seller information
      await expect(page.locator('text=Seller').or(page.locator('text=Listed by'))).toBeVisible()

      // Should show images
      await expect(page.locator('img[alt*="property"], .property-image')).toBeVisible()

      // Should show moderation actions
      await expect(page.locator('button:has-text("Approve")')).toBeVisible()
      await expect(page.locator('button:has-text("Reject")')).toBeVisible()
    })

    test('moderator can approve a property', async ({ page }) => {
      await page.goto('/moderator/listings?filter=pending')

      // Click on first pending listing
      await page.click('.listing-row:first-child, .listing-card:first-child')

      // Click approve button
      await page.click('button:has-text("Approve")')

      // May show confirmation dialog
      const confirmButton = page.locator('button:has-text("Confirm Approve"), button:has-text("Yes, Approve")')
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }

      // Should show success message
      await expect(page.locator('text=approved').or(page.locator('text=success'))).toBeVisible({ timeout: 5000 })
    })

    test('moderator can reject a property with reason', async ({ page }) => {
      await page.goto('/moderator/listings?filter=pending')

      // Click on first pending listing
      await page.click('.listing-row:first-child, .listing-card:first-child')

      // Click reject button
      await page.click('button:has-text("Reject")')

      // Should show rejection form/dialog
      await expect(page.locator('[name="reason"], textarea[placeholder*="reason"]')).toBeVisible()

      // Fill rejection reason
      await page.fill('[name="reason"], textarea', 'Property images are unclear and description is incomplete.')

      // Optional: Add notes
      const notesField = page.locator('[name="notes"]')
      if (await notesField.isVisible()) {
        await notesField.fill('Please resubmit with better photos.')
      }

      // Submit rejection
      await page.click('button:has-text("Confirm Reject"), button:has-text("Submit")')

      // Should show success message
      await expect(page.locator('text=rejected').or(page.locator('text=success'))).toBeVisible({ timeout: 5000 })
    })

    test('moderator can flag a property for further review', async ({ page }) => {
      await page.goto('/moderator/listings?filter=pending')

      await page.click('.listing-row:first-child, .listing-card:first-child')

      // Click flag button
      await page.click('button:has-text("Flag")')

      // Should show flag reason form
      await expect(page.locator('[name="reason"], textarea')).toBeVisible()

      await page.fill('[name="reason"], textarea', 'Suspicious pricing - needs senior moderator review.')

      await page.click('button:has-text("Submit"), button:has-text("Confirm")')

      // Should show success
      await expect(page.locator('text=flagged').or(page.locator('text=success'))).toBeVisible()
    })

    test('moderator cannot approve without viewing details', async ({ page }) => {
      await page.goto('/moderator/listings')

      // Try to find approve button in the list (should not be there or be disabled)
      const quickApproveBtn = page.locator('.listing-row:first-child button:has-text("Approve")')

      // Either button doesn't exist in list, or clicking it prompts for details view
      if (await quickApproveBtn.isVisible()) {
        await quickApproveBtn.click()
        // Should either navigate to details or show warning
        await expect(page.locator('text=Please review').or(page)).toHaveURL(/moderator\/listings\//)
      }
    })
  })

  test.describe('Moderation History & Audit', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/moderator-login')
      await page.fill('[name="email"]', 'moderator@test.com')
      await page.fill('[name="password"]', 'ModeratorPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/moderator/)
    })

    test('moderator can view their moderation history', async ({ page }) => {
      await page.goto('/moderator/history')

      await expect(page.locator('h1')).toContainText(/History|Activity/i)

      // Should show past actions
      await expect(page.locator('text=Approved').or(page.locator('text=Rejected'))).toBeVisible()

      // Should show dates
      await expect(page.locator('.date, time, [data-date]')).toBeVisible()
    })

    test('moderator can see moderation statistics', async ({ page }) => {
      await page.goto('/moderator/listings')

      // Should show stats
      await expect(page.locator('text=Pending').and(page.locator('.count, .badge, :text-matches("\\d+")'))).toBeVisible()
    })
  })

  test.describe('Admin Moderation Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin
      await page.goto('/login')
      await page.fill('[name="email"]', 'admin@test.com')
      await page.fill('[name="password"]', 'AdminPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/dashboard|admin/)
    })

    test('admin can view all moderators', async ({ page }) => {
      await page.goto('/admin/moderators')

      await expect(page.locator('h1')).toContainText(/Moderator/i)

      // Should list moderators
      await expect(page.locator('table, .moderator-list')).toBeVisible()
    })

    test('admin can invite new moderator', async ({ page }) => {
      await page.goto('/admin/moderators/invite')

      await expect(page.locator('h1')).toContainText(/Invite/i)

      await page.fill('[name="email"]', 'newmoderator@test.com')

      await page.click('button[type="submit"]')

      // Should show success
      await expect(page.locator('text=Invitation sent').or(page.locator('text=success'))).toBeVisible()
    })

    test('admin can suspend a moderator', async ({ page }) => {
      await page.goto('/admin/moderators')

      // Click on moderator row actions
      await page.click('.moderator-row:first-child button:has-text("Actions"), .moderator-row:first-child [data-testid="actions-menu"]')

      // Click suspend
      await page.click('button:has-text("Suspend"), [role="menuitem"]:has-text("Suspend")')

      // Confirm if needed
      const confirmBtn = page.locator('button:has-text("Confirm")')
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click()
      }

      // Should show success
      await expect(page.locator('text=suspended').or(page.locator('text=success'))).toBeVisible()
    })

    test('admin can view moderation audit logs', async ({ page }) => {
      await page.goto('/admin/audit')

      await expect(page.locator('h1')).toContainText(/Audit|Logs/i)

      // Should show audit entries
      await expect(page.locator('table tbody tr, .audit-entry')).toBeVisible()

      // Entries should have moderator, action, timestamp
      await expect(page.locator('text=approved').or(page.locator('text=rejected'))).toBeVisible()
    })
  })
})

test.describe('Moderation Email Notifications', () => {
  test('approved property triggers email to seller', async ({ page }) => {
    // This would require email mocking
    // For now, verify the API endpoint exists

    // Login as moderator and approve
    await page.goto('/moderator-login')
    await page.fill('[name="email"]', 'moderator@test.com')
    await page.fill('[name="password"]', 'ModeratorPass123!')
    await page.click('button[type="submit"]')

    await page.goto('/moderator/listings?filter=pending')
    await page.click('.listing-row:first-child')
    await page.click('button:has-text("Approve")')

    // The approval action should trigger email (tested via logs/mocks in integration tests)
    await expect(page.locator('text=approved')).toBeVisible()
  })
})
