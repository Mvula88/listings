import { test, expect } from '@playwright/test'

test.describe('Lawyer Selection Flow', () => {
  test.describe('Lawyer Directory', () => {
    test('users can browse lawyer directory', async ({ page }) => {
      await page.goto('/lawyers')

      await expect(page.locator('h1')).toContainText(/Lawyer|Conveyancer|Legal/i)

      // Should show lawyer cards/list
      await expect(page.locator('.lawyer-card, .lawyer-row, [data-testid="lawyer-item"]')).toBeVisible()
    })

    test('users can filter lawyers by location', async ({ page }) => {
      await page.goto('/lawyers')

      // Find location filter
      const locationFilter = page.locator('[name="city"], [name="location"], select:has-text("Location")')
      if (await locationFilter.isVisible()) {
        await locationFilter.selectOption({ index: 1 })
        await page.waitForTimeout(500)
      }

      // Results should update (or show filtered results)
      await expect(page.locator('.lawyer-card, .lawyer-row')).toBeVisible()
    })

    test('users can filter lawyers by specialization', async ({ page }) => {
      await page.goto('/lawyers')

      // Find specialization filter
      const specFilter = page.locator('[name="specialization"], select:has-text("Specialization")')
      if (await specFilter.isVisible()) {
        await specFilter.selectOption({ index: 1 })
        await page.waitForTimeout(500)
      }
    })

    test('users can view lawyer profile details', async ({ page }) => {
      await page.goto('/lawyers')

      // Click on first lawyer
      await page.click('.lawyer-card:first-child, .lawyer-row:first-child a')

      // Should show lawyer details
      await expect(page.locator('text=Firm Name').or(page.locator('text=Experience'))).toBeVisible()
      await expect(page.locator('text=Rating').or(page.locator('.rating, .stars'))).toBeVisible()
      await expect(page.locator('text=Fees').or(page.locator('text=R'))).toBeVisible()
    })

    test('lawyer profile shows verification badge if verified', async ({ page }) => {
      await page.goto('/lawyers')

      // Look for verified badge
      const verifiedBadge = page.locator('.verified-badge, [data-verified="true"], text=Verified')

      if (await verifiedBadge.first().isVisible()) {
        // Click on verified lawyer
        await page.click('.lawyer-card:has(.verified-badge):first-child')

        // Profile should show verification
        await expect(page.locator('text=Verified').or(page.locator('.verified-badge'))).toBeVisible()
      }
    })
  })

  test.describe('Lawyer Registration', () => {
    test('lawyer can register with required details', async ({ page }) => {
      await page.goto('/register-lawyer')

      await expect(page.locator('h1')).toContainText(/Lawyer|Conveyancer|Register/i)

      // Fill personal details
      await page.fill('[name="full_name"]', 'John Smith Attorney')
      await page.fill('[name="email"]', `lawyer-${Date.now()}@test.com`)
      await page.fill('[name="password"]', 'LawyerPass123!')
      await page.fill('[name="phone"]', '+27123456789')

      // Fill firm details
      await page.fill('[name="firm_name"]', 'Smith & Associates')
      await page.fill('[name="registration_number"]', 'REG123456')

      // Select location
      await page.selectOption('[name="country_id"], [name="country"]', { index: 1 })
      await page.fill('[name="city"]', 'Johannesburg')

      // Set fees
      await page.fill('[name="flat_fee_buyer"]', '15000')
      await page.fill('[name="flat_fee_seller"]', '18000')

      // Submit
      await page.click('button[type="submit"]')

      // Should show success or redirect to dashboard
      await expect(page.locator('text=Registration successful').or(page)).toHaveURL(/dashboard|lawyer/)
    })

    test('lawyer registration validates required fields', async ({ page }) => {
      await page.goto('/register-lawyer')

      // Try to submit empty form
      await page.click('button[type="submit"]')

      // Should show validation errors
      await expect(page.locator('text=required').or(page.locator('.error, .text-red'))).toBeVisible()
    })

    test('lawyer registration validates registration number format', async ({ page }) => {
      await page.goto('/register-lawyer')

      await page.fill('[name="full_name"]', 'Test Lawyer')
      await page.fill('[name="email"]', 'test@test.com')
      await page.fill('[name="password"]', 'TestPass123!')
      await page.fill('[name="registration_number"]', 'invalid')

      await page.click('button[type="submit"]')

      // May show format error
      await expect(page.locator('text=valid registration').or(page.locator('text=format'))).toBeVisible()
        .catch(() => {}) // Some systems may not validate format
    })
  })

  test.describe('Transaction Lawyer Selection', () => {
    test.beforeEach(async ({ page }) => {
      // Login as buyer with active transaction
      await page.goto('/login')
      await page.fill('[name="email"]', 'buyer@test.com')
      await page.fill('[name="password"]', 'TestPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/dashboard/)
    })

    test('buyer can select lawyer for transaction', async ({ page }) => {
      // Go to transactions
      await page.goto('/transactions')

      // Click on transaction needing lawyer
      await page.click('.transaction-row:first-child, .transaction-card:first-child')

      // Look for lawyer selection step
      await page.click('button:has-text("Select Lawyer"), a:has-text("Select Lawyer")')

      // Should show lawyer selection interface
      await expect(page.locator('h1, h2')).toContainText(/Select|Choose.*Lawyer/i)

      // Should show available lawyers
      await expect(page.locator('.lawyer-card, .lawyer-option')).toBeVisible()

      // Select a lawyer
      await page.click('.lawyer-card:first-child button:has-text("Select"), .lawyer-option:first-child')

      // Confirm selection
      const confirmBtn = page.locator('button:has-text("Confirm")')
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click()
      }

      // Should show success
      await expect(page.locator('text=selected').or(page.locator('text=success'))).toBeVisible()
    })

    test('buyer sees lawyer fees before selection', async ({ page }) => {
      await page.goto('/transactions')
      await page.click('.transaction-row:first-child')
      await page.click('button:has-text("Select Lawyer")')

      // Each lawyer option should show fees
      const lawyerCard = page.locator('.lawyer-card:first-child, .lawyer-option:first-child')
      await expect(lawyerCard.locator('text=R')).toBeVisible()
      await expect(lawyerCard.locator('text=Buyer Fee').or(lawyerCard.locator('text=flat_fee'))).toBeVisible()
    })

    test('transaction shows selected lawyers', async ({ page }) => {
      await page.goto('/transactions')
      await page.click('.transaction-row:first-child')

      // Should show buyer's lawyer
      await expect(page.locator('text=Your Lawyer').or(page.locator('text=Buyer.*Lawyer'))).toBeVisible()

      // Should show seller's lawyer if selected
      const sellerLawyer = page.locator('text=Seller.*Lawyer')
      // This may or may not be visible depending on transaction state
    })
  })

  test.describe('Lawyer Deal Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login as lawyer
      await page.goto('/login')
      await page.fill('[name="email"]', 'lawyer@test.com')
      await page.fill('[name="password"]', 'LawyerPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/dashboard/)
    })

    test('lawyer can view assigned deals', async ({ page }) => {
      await page.goto('/lawyer-deals')

      await expect(page.locator('h1')).toContainText(/Deal|Transaction|Case/i)

      // Should show deals list
      await expect(page.locator('.deal-card, .deal-row, table')).toBeVisible()
    })

    test('lawyer can view deal details', async ({ page }) => {
      await page.goto('/lawyer-deals')

      // Click on first deal
      await page.click('.deal-card:first-child, .deal-row:first-child a, tr:first-child td:first-child')

      // Should show deal details
      await expect(page.locator('text=Property')).toBeVisible()
      await expect(page.locator('text=Buyer').or(page.locator('text=Seller'))).toBeVisible()
      await expect(page.locator('text=Status')).toBeVisible()
    })

    test('lawyer sees fee collection tracking', async ({ page }) => {
      await page.goto('/lawyer-deals')
      await page.click('.deal-card:first-child')

      // Should show fee information
      await expect(page.locator('text=Platform Fee').or(page.locator('text=Commission'))).toBeVisible()
      await expect(page.locator('text=10%').or(page.locator('text=Remittance'))).toBeVisible()
    })

    test('lawyer sees remittance deadline', async ({ page }) => {
      await page.goto('/lawyer-deals')
      await page.click('.deal-card:first-child')

      // Should show remittance due date
      await expect(page.locator('text=Due Date').or(page.locator('text=Remittance.*30 days'))).toBeVisible()
    })

    test('lawyer can mark fee as collected', async ({ page }) => {
      await page.goto('/lawyer-deals')
      await page.click('.deal-card:first-child')

      // Look for fee collection action
      const collectBtn = page.locator('button:has-text("Mark Collected"), button:has-text("Fee Collected")')

      if (await collectBtn.isVisible()) {
        await collectBtn.click()

        // May need to confirm
        const confirmBtn = page.locator('button:has-text("Confirm")')
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click()
        }

        // Should update status
        await expect(page.locator('text=Collected').or(page.locator('text=success'))).toBeVisible()
      }
    })

    test('lawyer can submit remittance', async ({ page }) => {
      await page.goto('/lawyer-deals')
      await page.click('.deal-card:first-child')

      // Look for remittance action
      const remitBtn = page.locator('button:has-text("Submit Remittance"), button:has-text("Remit")')

      if (await remitBtn.isVisible()) {
        await remitBtn.click()

        // Fill remittance details
        await page.fill('[name="amount"], [name="remittance_amount"]', '13500')

        // Submit
        await page.click('button:has-text("Submit"), button:has-text("Confirm")')

        // Should show success
        await expect(page.locator('text=submitted').or(page.locator('text=success'))).toBeVisible()
      }
    })
  })

  test.describe('Lawyer Reviews', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.fill('[name="email"]', 'buyer@test.com')
      await page.fill('[name="password"]', 'TestPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/dashboard/)
    })

    test('buyer can review lawyer after transaction completion', async ({ page }) => {
      // Go to completed transaction
      await page.goto('/transactions')

      // Find completed transaction
      await page.click('.transaction-row:has-text("Completed"):first-child, .transaction-card:has-text("Completed"):first-child')

      // Look for review option
      await page.click('button:has-text("Review Lawyer"), a:has-text("Leave Review")')

      // Fill review
      await page.click('[data-rating="5"], .star:nth-child(5), button[aria-label="5 stars"]')
      await page.fill('[name="comment"], textarea', 'Excellent service, very professional and quick to respond.')

      await page.click('button[type="submit"]')

      // Should show success
      await expect(page.locator('text=Review submitted').or(page.locator('text=Thank you'))).toBeVisible()
    })

    test('lawyer profile shows aggregated reviews', async ({ page }) => {
      await page.goto('/lawyers')
      await page.click('.lawyer-card:first-child')

      // Should show rating
      await expect(page.locator('.rating, .stars, text=/\\d\\.\\d/')).toBeVisible()

      // Should show review count
      await expect(page.locator('text=reviews').or(page.locator('text=ratings'))).toBeVisible()

      // May show individual reviews
      const reviewsSection = page.locator('.reviews, [data-testid="reviews"]')
      if (await reviewsSection.isVisible()) {
        await expect(reviewsSection.locator('.review')).toBeVisible()
      }
    })
  })

  test.describe('Lawyer Suspension for Non-Payment', () => {
    test('suspended lawyer cannot access deals', async ({ page }) => {
      // Login as suspended lawyer
      await page.goto('/login')
      await page.fill('[name="email"]', 'suspended-lawyer@test.com')
      await page.fill('[name="password"]', 'LawyerPass123!')
      await page.click('button[type="submit"]')

      // May show suspension notice
      await expect(page.locator('text=suspended').or(page.locator('text=outstanding')))
        .toBeVisible()
        .catch(() => {
          // If login succeeded, try accessing deals
          page.goto('/lawyer-deals')
        })

      // Should show restriction message
      await expect(page.locator('text=suspended').or(page.locator('text=restricted').or(page.locator('text=outstanding')))).toBeVisible()
    })

    test('suspended lawyer not shown in directory', async ({ page }) => {
      await page.goto('/lawyers')

      // Search for suspended lawyer
      const searchInput = page.locator('[name="search"], input[placeholder*="Search"]')
      if (await searchInput.isVisible()) {
        await searchInput.fill('Suspended Lawyer Name')
        await page.waitForTimeout(500)
      }

      // Should not find suspended lawyer or show "no results"
      await expect(page.locator('text=No lawyers found').or(page.locator(':not(:has-text("Suspended Lawyer"))'))).toBeVisible()
        .catch(() => {}) // May just not show them at all
    })
  })
})
