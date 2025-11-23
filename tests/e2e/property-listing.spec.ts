import { test, expect } from '@playwright/test'

test.describe('Complete Property Listing Flow', () => {
  test('seller can list a property end-to-end', async ({ page }) => {
    // 1. Go to homepage
    await page.goto('/')
    await expect(page).toHaveTitle(/DealDirect/)

    // 2. Click "List Property" button
    await page.click('text=List Property')

    // 3. Should redirect to login if not authenticated
    await expect(page).toHaveURL(/.*login/)
    await expect(page.locator('h1')).toContainText(/sign in/i)

    // 4. Navigate to registration
    await page.click('text=Register')
    await expect(page).toHaveURL(/.*register/)

    // 5. Register as seller with unique email
    const uniqueEmail = `seller-${Date.now()}@test.com`

    await page.fill('[name="full_name"]', 'Test Seller')
    await page.fill('[name="email"]', uniqueEmail)
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.fill('[name="phone_number"]', '+27123456789')
    await page.selectOption('[name="user_type"]', 'seller')

    await page.click('button[type="submit"]')

    // 6. Should redirect to dashboard after registration
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    await expect(page.locator('h1')).toContainText(/dashboard/i)

    // 7. Navigate to create property
    await page.click('text=Add Property')
    await expect(page).toHaveURL(/.*properties\/create/)

    // 8. Fill property form
    await page.fill('[name="title"]', 'E2E Test Property')
    await page.fill('[name="description"]', 'This is a test property created by E2E tests. Beautiful home with garden.')

    await page.selectOption('[name="property_type"]', 'house')
    await page.selectOption('[name="listing_type"]', 'sale')

    await page.fill('[name="price"]', '1500000')
    await page.selectOption('[name="currency"]', 'ZAR')

    await page.fill('[name="bedrooms"]', '3')
    await page.fill('[name="bathrooms"]', '2')
    await page.fill('[name="area"]', '200')

    await page.fill('[name="address"]', '123 Test Street')
    await page.fill('[name="city"]', 'Cape Town')
    await page.fill('[name="province"]', 'Western Cape')
    await page.selectOption('[name="country_id"]', '1') // South Africa

    // Add features
    await page.fill('[name="features"]', 'Garden, Pool, Garage, Security')

    // 9. Submit form
    await page.click('button[type="submit"]')

    // 10. Should show success message
    await expect(page.locator('text=Property listed successfully')).toBeVisible({ timeout: 10000 })

    // 11. Should redirect to property page or dashboard
    await page.waitForURL(/.*properties\/.*|.*dashboard/, { timeout: 10000 })

    // 12. Verify property appears in dashboard
    await page.goto('/dashboard')
    await expect(page.locator('text=E2E Test Property')).toBeVisible()

    // 13. Verify property status is pending
    await expect(page.locator('text=Pending')).toBeVisible()
  })

  test('seller can edit property details', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[name="email"]', 'seller@test.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    // Go to dashboard
    await page.goto('/dashboard')

    // Click on first property
    await page.click('.property-card:first-child')

    // Click edit button
    await page.click('button:has-text("Edit")')

    // Update title
    await page.fill('[name="title"]', 'Updated Property Title')
    await page.fill('[name="price"]', '1750000')

    // Save changes
    await page.click('button:has-text("Save Changes")')

    // Verify success
    await expect(page.locator('text=Property updated successfully')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Updated Property Title')
  })

  test('property validation prevents invalid data', async ({ page }) => {
    // Login as seller
    await page.goto('/login')
    await page.fill('[name="email"]', 'seller@test.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    // Go to create property
    await page.goto('/properties/create')

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Should show validation errors
    await expect(page.locator('text=Title is required')).toBeVisible()
    await expect(page.locator('text=Description is required')).toBeVisible()
    await expect(page.locator('text=Price is required')).toBeVisible()

    // Try to submit with invalid price
    await page.fill('[name="title"]', 'Test Property')
    await page.fill('[name="description"]', 'Test description')
    await page.fill('[name="price"]', '-1000')

    await page.click('button[type="submit"]')

    await expect(page.locator('text=Price must be positive')).toBeVisible()
  })

  test('seller can upload property images', async ({ page }) => {
    // Login as seller
    await page.goto('/login')
    await page.fill('[name="email"]', 'seller@test.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    // Go to create property
    await page.goto('/properties/create')

    // Fill basic info
    await page.fill('[name="title"]', 'Property with Images')
    await page.fill('[name="description"]', 'Testing image upload')
    await page.selectOption('[name="property_type"]', 'house')
    await page.fill('[name="price"]', '1500000')
    await page.fill('[name="bedrooms"]', '3')
    await page.fill('[name="bathrooms"]', '2')
    await page.fill('[name="area"]', '200')
    await page.fill('[name="address"]', '123 Test St')
    await page.fill('[name="city"]', 'Cape Town')

    // Upload image (using test image)
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('./tests/fixtures/test-property.jpg')

    // Verify image preview appears
    await expect(page.locator('.image-preview')).toBeVisible()

    // Submit form
    await page.click('button[type="submit"]')

    // Verify success
    await expect(page.locator('text=Property listed successfully')).toBeVisible()
  })

  test('buyer cannot access seller-only features', async ({ page }) => {
    // Register as buyer
    await page.goto('/register')

    const uniqueEmail = `buyer-${Date.now()}@test.com`
    await page.fill('[name="full_name"]', 'Test Buyer')
    await page.fill('[name="email"]', uniqueEmail)
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.fill('[name="phone_number"]', '+27987654321')
    await page.selectOption('[name="user_type"]', 'buyer')

    await page.click('button[type="submit"]')

    // Try to access create property page
    await page.goto('/properties/create')

    // Should be redirected or show error
    await expect(page.locator('text=Sellers only')).toBeVisible()
  })
})

test.describe('Property Search and Discovery', () => {
  test('users can search for properties by location', async ({ page }) => {
    await page.goto('/')

    // Use search bar
    await page.fill('[placeholder*="Search"]', 'Cape Town')
    await page.click('button:has-text("Search")')

    // Should show results
    await expect(page.locator('.property-card')).toHaveCount(greaterThan(0))

    // Verify location filter is applied
    await expect(page.locator('text=Cape Town')).toBeVisible()
  })

  test('users can filter properties by price range', async ({ page }) => {
    await page.goto('/properties')

    // Open price filter
    await page.click('text=Price Range')

    // Set min and max price
    await page.fill('[name="min_price"]', '500000')
    await page.fill('[name="max_price"]', '2000000')

    await page.click('button:has-text("Apply")')

    // Verify filtered results
    const prices = await page.locator('.property-price').allTextContents()
    prices.forEach(priceText => {
      const price = parseInt(priceText.replace(/[^0-9]/g, ''))
      expect(price).toBeGreaterThanOrEqual(500000)
      expect(price).toBeLessThanOrEqual(2000000)
    })
  })

  test('users can filter by number of bedrooms', async ({ page }) => {
    await page.goto('/properties')

    // Select bedroom filter
    await page.click('text=Bedrooms')
    await page.click('text=3 Bedrooms')

    // Verify results
    const bedrooms = await page.locator('.property-bedrooms').allTextContents()
    bedrooms.forEach(bedroomText => {
      expect(bedroomText).toContain('3')
    })
  })
})

function greaterThan(n: number) {
  return {
    asymmetricMatch: (actual: number) => actual > n,
    toString: () => `greater than ${n}`
  }
}
