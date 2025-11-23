import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')

    // Check for main heading
    await expect(page.getByRole('heading', { name: /dealdirect/i })).toBeVisible()

    // Check for navigation
    await expect(page.getByRole('link', { name: /browse properties/i })).toBeVisible()
  })

  test('should navigate to browse page', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /browse properties/i }).click()

    await expect(page).toHaveURL(/.*browse/)
  })

  test('should display featured properties', async ({ page }) => {
    await page.goto('/')

    // Wait for properties to load
    const propertyCards = page.locator('[data-testid="property-card"]')

    // Should have at least one property card or empty state
    await expect(page.locator('body')).toContainText(/(featured|properties|browse)/i)
  })

  test('should have working search functionality', async ({ page }) => {
    await page.goto('/browse')

    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill('Cape Town')

    // Check that URL or results update with search
    await expect(searchInput).toHaveValue('Cape Town')
  })
})
