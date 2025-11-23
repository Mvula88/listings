import { test, expect } from '@playwright/test'

test.describe('Buyer Inquiry Flow', () => {
  test('buyer can submit inquiry on property', async ({ page }) => {
    // 1. Register as buyer (or login if already exists)
    await page.goto('/register')

    const uniqueEmail = `buyer-${Date.now()}@test.com`

    await page.fill('[name="full_name"]', 'Test Buyer')
    await page.fill('[name="email"]', uniqueEmail)
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.fill('[name="phone_number"]', '+27123456789')
    await page.selectOption('[name="user_type"]', 'buyer')

    await page.click('button[type="submit"]')

    // Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })

    // 2. Browse properties
    await page.goto('/properties')

    // 3. Click on first property
    await page.click('.property-card:first-child')

    // Wait for property details page
    await page.waitForSelector('h1')

    // 4. Click "Contact Seller" or "Send Inquiry" button
    await page.click('button:has-text("Contact Seller"), button:has-text("Send Inquiry")')

    // 5. Fill inquiry form
    await page.fill('[name="message"]', 'I am interested in viewing this property. Could we schedule a viewing for this weekend?')
    await page.fill('[name="phone_number"]', '+27123456789')
    await page.selectOption('[name="preferred_contact"]', 'email')

    // 6. Submit inquiry
    await page.click('button:has-text("Send Inquiry"), button:has-text("Submit")')

    // 7. Should show success message
    await expect(page.locator('text=Inquiry sent successfully')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=seller will contact you')).toBeVisible()

    // 8. Verify inquiry appears in buyer's dashboard
    await page.goto('/dashboard/inquiries')
    await expect(page.locator('text=I am interested in viewing')).toBeVisible()
  })

  test('inquiry validation prevents empty messages', async ({ page }) => {
    // Login as buyer
    await page.goto('/login')
    await page.fill('[name="email"]', 'buyer@test.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    // Go to property page
    await page.goto('/properties')
    await page.click('.property-card:first-child')

    // Open inquiry form
    await page.click('button:has-text("Contact Seller")')

    // Try to submit empty form
    await page.click('button:has-text("Send Inquiry")')

    // Should show validation error
    await expect(page.locator('text=Message is required')).toBeVisible()
    await expect(page.locator('text=Phone number is required')).toBeVisible()
  })

  test('inquiry validation validates phone number format', async ({ page }) => {
    // Login as buyer
    await page.goto('/login')
    await page.fill('[name="email"]', 'buyer@test.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    // Go to property page
    await page.goto('/properties')
    await page.click('.property-card:first-child')

    // Open inquiry form
    await page.click('button:has-text("Contact Seller")')

    // Fill with invalid phone
    await page.fill('[name="message"]', 'I am interested')
    await page.fill('[name="phone_number"]', '123') // Invalid

    await page.click('button:has-text("Send Inquiry")')

    // Should show validation error
    await expect(page.locator('text=valid phone number')).toBeVisible()
  })

  test('buyer can view inquiry history', async ({ page }) => {
    // Login as buyer
    await page.goto('/login')
    await page.fill('[name="email"]', 'buyer@test.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    // Go to inquiries page
    await page.goto('/dashboard/inquiries')

    // Should see list of inquiries
    await expect(page.locator('h1')).toContainText(/inquiries/i)
    await expect(page.locator('.inquiry-card')).toHaveCount(greaterThan(0))

    // Each inquiry should show property details
    const firstInquiry = page.locator('.inquiry-card:first-child')
    await expect(firstInquiry.locator('.property-title')).toBeVisible()
    await expect(firstInquiry.locator('.inquiry-date')).toBeVisible()
    await expect(firstInquiry.locator('.inquiry-status')).toBeVisible()
  })

  test('seller receives inquiry notification', async ({ page }) => {
    // This test would require email mocking or checking database
    // For now, we'll verify the inquiry was created

    // Login as buyer and submit inquiry
    await page.goto('/login')
    await page.fill('[name="email"]', 'buyer@test.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    await page.goto('/properties')
    await page.click('.property-card:first-child')

    // Get property owner ID or email from page
    const propertyOwner = await page.locator('[data-owner-email]').getAttribute('data-owner-email')

    await page.click('button:has-text("Contact Seller")')
    await page.fill('[name="message"]', 'Test inquiry message')
    await page.fill('[name="phone_number"]', '+27123456789')
    await page.click('button:has-text("Send Inquiry")')

    await expect(page.locator('text=Inquiry sent successfully')).toBeVisible()

    // Logout and login as seller
    await page.click('button:has-text("Logout")')
    await page.goto('/login')
    await page.fill('[name="email"]', propertyOwner!)
    await page.fill('[name="password"]', 'SellerPass123!')
    await page.click('button[type="submit"]')

    // Check seller's inquiries
    await page.goto('/dashboard/inquiries')

    // Should see the new inquiry
    await expect(page.locator('text=Test inquiry message')).toBeVisible()
    await expect(page.locator('.inquiry-badge:has-text("New")')).toBeVisible()
  })

  test('buyer cannot inquire on their own properties', async ({ page }) => {
    // Login as seller
    await page.goto('/login')
    await page.fill('[name="email"]', 'seller@test.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    // Create a property
    await page.goto('/properties/create')
    await page.fill('[name="title"]', 'My Own Property')
    // ... fill other fields
    await page.click('button[type="submit"]')

    // Go to the property page
    await page.goto('/properties')
    await page.click('text=My Own Property')

    // Should not see "Contact Seller" button
    await expect(page.locator('button:has-text("Contact Seller")')).not.toBeVisible()
    await expect(page.locator('text=This is your property')).toBeVisible()
  })

  test('buyer can add property to favorites before inquiring', async ({ page }) => {
    // Login as buyer
    await page.goto('/login')
    await page.fill('[name="email"]', 'buyer@test.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    // Browse properties
    await page.goto('/properties')
    await page.click('.property-card:first-child')

    // Add to favorites
    await page.click('button[aria-label="Add to favorites"]')

    await expect(page.locator('text=Added to favorites')).toBeVisible()

    // Verify favorite button state changed
    await expect(page.locator('button[aria-label="Remove from favorites"]')).toBeVisible()

    // Check favorites page
    await page.goto('/dashboard/favorites')
    await expect(page.locator('.property-card')).toHaveCount(greaterThan(0))
  })

  test('inquiry includes buyer contact preferences', async ({ page }) => {
    // Login as buyer
    await page.goto('/login')
    await page.fill('[name="email"]', 'buyer@test.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    await page.goto('/properties')
    await page.click('.property-card:first-child')

    await page.click('button:has-text("Contact Seller")')

    // Fill form with WhatsApp preference
    await page.fill('[name="message"]', 'Please contact me via WhatsApp')
    await page.fill('[name="phone_number"]', '+27123456789')
    await page.selectOption('[name="preferred_contact"]', 'whatsapp')

    await page.click('button:has-text("Send Inquiry")')

    await expect(page.locator('text=Inquiry sent successfully')).toBeVisible()

    // Verify in inquiry history
    await page.goto('/dashboard/inquiries')
    await expect(page.locator('text=WhatsApp')).toBeVisible()
  })

  test('rate limiting prevents spam inquiries', async ({ page }) => {
    // Login as buyer
    await page.goto('/login')
    await page.fill('[name="email"]', 'buyer@test.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    await page.goto('/properties')
    await page.click('.property-card:first-child')

    // Submit first inquiry
    await page.click('button:has-text("Contact Seller")')
    await page.fill('[name="message"]', 'First inquiry')
    await page.fill('[name="phone_number"]', '+27123456789')
    await page.click('button:has-text("Send Inquiry")')

    await expect(page.locator('text=Inquiry sent successfully')).toBeVisible()

    // Try to submit another inquiry immediately
    await page.click('button:has-text("Contact Seller")')
    await page.fill('[name="message"]', 'Second inquiry immediately')
    await page.fill('[name="phone_number"]', '+27123456789')
    await page.click('button:has-text("Send Inquiry")')

    // Should show rate limit error
    await expect(page.locator('text=already submitted.*recently')).toBeVisible()
  })
})

test.describe('Seller Inquiry Management', () => {
  test('seller can view all inquiries', async ({ page }) => {
    // Login as seller
    await page.goto('/login')
    await page.fill('[name="email"]', 'seller@test.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    // Go to inquiries
    await page.goto('/dashboard/inquiries')

    // Should see inquiry list
    await expect(page.locator('h1')).toContainText(/inquiries/i)
    await expect(page.locator('.inquiry-card')).toHaveCount(greaterThan(0))
  })

  test('seller can respond to inquiries', async ({ page }) => {
    // Login as seller
    await page.goto('/login')
    await page.fill('[name="email"]', 'seller@test.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    await page.goto('/dashboard/inquiries')

    // Click on first inquiry
    await page.click('.inquiry-card:first-child')

    // Click respond button
    await page.click('button:has-text("Respond")')

    // Fill response
    await page.fill('[name="response"]', 'Thank you for your interest. I can arrange a viewing this Saturday.')

    await page.click('button:has-text("Send Response")')

    await expect(page.locator('text=Response sent')).toBeVisible()
  })

  test('seller can mark inquiries as read', async ({ page }) => {
    // Login as seller
    await page.goto('/login')
    await page.fill('[name="email"]', 'seller@test.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    await page.goto('/dashboard/inquiries')

    // Count unread inquiries
    const unreadCount = await page.locator('.inquiry-badge:has-text("New")').count()

    // Click on first unread inquiry
    await page.click('.inquiry-card:has(.inquiry-badge:has-text("New")):first-child')

    // Should auto-mark as read
    await page.goto('/dashboard/inquiries')

    const newUnreadCount = await page.locator('.inquiry-badge:has-text("New")').count()
    expect(newUnreadCount).toBe(unreadCount - 1)
  })
})

function greaterThan(n: number) {
  return {
    asymmetricMatch: (actual: number) => actual > n,
    toString: () => `greater than ${n}`
  }
}
