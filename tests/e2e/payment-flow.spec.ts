import { test, expect } from '@playwright/test'

test.describe('Payment Flow', () => {
  test.describe('Seller Property Listing Payment', () => {
    test('seller sees correct pricing tier based on property value', async ({ page }) => {
      // Login as seller
      await page.goto('/login')
      await page.fill('[name="email"]', 'seller@test.com')
      await page.fill('[name="password"]', 'TestPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/dashboard/)

      // Create a new property
      await page.goto('/properties/new')

      // Fill property details with price under R250,000
      await page.fill('[name="title"]', 'Budget Home Test')
      await page.fill('[name="price"]', '200000')
      await page.selectOption('[name="property_type"]', 'house')
      await page.fill('[name="bedrooms"]', '2')
      await page.fill('[name="bathrooms"]', '1')
      await page.fill('[name="city"]', 'Cape Town')
      await page.fill('[name="province"]', 'Western Cape')
      await page.fill('[name="description"]', 'A cozy budget home for testing payment tiers.')

      // Should show R4,500 pricing tier
      await expect(page.locator('text=R4,500')).toBeVisible()
      await expect(page.locator('text=Platform Fee')).toBeVisible()

      // Change price to R500,000 range
      await page.fill('[name="price"]', '400000')
      await page.waitForTimeout(500) // Wait for debounce

      // Should update to R7,500 tier
      await expect(page.locator('text=R7,500')).toBeVisible()

      // Change to R1M range
      await page.fill('[name="price"]', '800000')
      await page.waitForTimeout(500)

      // Should update to R15,000 tier
      await expect(page.locator('text=R15,000')).toBeVisible()
    })

    test('seller can proceed to Stripe checkout', async ({ page }) => {
      await page.goto('/login')
      await page.fill('[name="email"]', 'seller@test.com')
      await page.fill('[name="password"]', 'TestPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/dashboard/)

      await page.goto('/properties/new')

      // Fill minimum required fields
      await page.fill('[name="title"]', 'Test Property for Payment')
      await page.fill('[name="price"]', '500000')
      await page.selectOption('[name="property_type"]', 'apartment')
      await page.fill('[name="bedrooms"]', '2')
      await page.fill('[name="bathrooms"]', '1')
      await page.fill('[name="city"]', 'Johannesburg')
      await page.fill('[name="province"]', 'Gauteng')
      await page.fill('[name="description"]', 'Test property for payment flow testing.')

      // Submit property
      await page.click('button[type="submit"]')

      // Should redirect to payment page or show payment modal
      await expect(page.locator('text=Complete Payment').or(page.locator('text=Proceed to Payment'))).toBeVisible({ timeout: 10000 })

      // Click payment button
      await page.click('button:has-text("Complete Payment"), button:has-text("Proceed to Payment")')

      // Should redirect to Stripe checkout (external URL)
      // We can't fully test Stripe, but we can verify redirect happens
      await page.waitForURL(/checkout\.stripe\.com|localhost.*payment/, { timeout: 15000 })
    })

    test('payment success page shows correct confirmation', async ({ page }) => {
      // Simulate returning from successful Stripe payment
      // In real scenario, Stripe redirects with session_id
      await page.goto('/properties/test-property-id/payment-success?session_id=test_session')

      // Should show success message
      await expect(page.locator('text=Payment Successful').or(page.locator('text=Thank you'))).toBeVisible()
      await expect(page.locator('text=listing is now active').or(page.locator('text=property has been published'))).toBeVisible()

      // Should show next steps
      await expect(page.locator('text=View Property').or(page.locator('text=Dashboard'))).toBeVisible()
    })

    test('payment cancelled page handles user cancellation', async ({ page }) => {
      await page.goto('/properties/test-property-id/payment-cancelled')

      // Should show cancellation message
      await expect(page.locator('text=Payment Cancelled').or(page.locator('text=Payment was not completed'))).toBeVisible()

      // Should provide option to retry
      await expect(page.locator('text=Try Again').or(page.locator('text=Retry Payment'))).toBeVisible()
    })
  })

  test.describe('Featured Listing Payment', () => {
    test('seller can purchase featured listing upgrade', async ({ page }) => {
      await page.goto('/login')
      await page.fill('[name="email"]', 'seller@test.com')
      await page.fill('[name="password"]', 'TestPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/dashboard/)

      // Go to properties management
      await page.goto('/properties')

      // Click on a property
      await page.click('.property-card:first-child')

      // Look for featured upgrade option
      await page.click('button:has-text("Feature"), button:has-text("Promote")')

      // Should show featured listing pricing
      await expect(page.locator('text=R2,000')).toBeVisible()
      await expect(page.locator('text=30 days')).toBeVisible()

      // Verify benefits are displayed
      await expect(page.locator('text=Top of search results').or(page.locator('text=Featured badge'))).toBeVisible()
    })

    test('seller can use reward points for featured listing', async ({ page }) => {
      await page.goto('/login')
      await page.fill('[name="email"]', 'seller-with-points@test.com')
      await page.fill('[name="password"]', 'TestPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/dashboard/)

      // Go to rewards page
      await page.goto('/rewards')

      // Check if user has enough points
      const pointsElement = page.locator('[data-testid="reward-points"], .points-balance')
      await expect(pointsElement).toBeVisible()

      // Look for redeem option
      await page.click('button:has-text("Redeem"), button:has-text("Use Points")')

      // Should show redemption options
      await expect(page.locator('text=Free Featured Listing')).toBeVisible()
    })
  })

  test.describe('Transaction Fee Collection', () => {
    test('transaction shows correct fee breakdown', async ({ page }) => {
      await page.goto('/login')
      await page.fill('[name="email"]', 'seller@test.com')
      await page.fill('[name="password"]', 'TestPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/dashboard/)

      // Go to transactions
      await page.goto('/transactions')

      // Click on a transaction
      await page.click('.transaction-row:first-child, .transaction-card:first-child')

      // Should show fee breakdown
      await expect(page.locator('text=Platform Fee')).toBeVisible()
      await expect(page.locator('text=Lawyer Commission').or(page.locator('text=10%'))).toBeVisible()
    })
  })
})

test.describe('Stripe Webhook Handling', () => {
  test('webhook endpoint accepts POST requests', async ({ request }) => {
    // This tests the webhook endpoint exists and responds
    // Actual Stripe signature verification would fail without valid signature
    const response = await request.post('/api/payments/webhook', {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature'
      },
      data: {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_status: 'paid'
          }
        }
      }
    })

    // Should return 400 (invalid signature) not 404 (not found)
    expect([400, 401, 403]).toContain(response.status())
  })
})
