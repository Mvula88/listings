# Test Suite Overview

## 📋 Current Status

The test files in this directory are **reference implementations** showing how to write comprehensive tests for the DealDirect platform. They demonstrate testing patterns and best practices but require some additional setup to run.

## 🎯 Test Files

### Unit Tests

1. **`__tests__/auth/registration.test.tsx`** - User registration testing
   - **Status:** Reference implementation
   - **Requires:** `components/auth/registration-form.tsx`
   - **Tests:** 12 test cases covering buyer/seller registration, validation, error handling

2. **`__tests__/properties/create.test.ts`** - Property creation API testing
   - **Status:** Reference implementation
   - **Requires:** Refactor of `app/api/properties/create/route.ts` to export testable function
   - **Tests:** 15 test cases covering validation, authorization, database operations

3. **`__tests__/inquiries/submit.test.ts`** - Inquiry submission testing
   - **Status:** Reference implementation
   - **Requires:** `lib/actions/inquiries.ts` server action
   - **Tests:** 14 test cases covering submission, validation, rate limiting

4. **`__tests__/components/Button.test.tsx`** - Example component test
   - **Status:** ✅ Working
   - **Purpose:** Demonstration of component testing setup

### E2E Tests (Playwright)

1. **`tests/e2e/property-listing.spec.ts`** - Property listing flow
   - **Status:** Ready to run
   - **Tests:** 10 scenarios covering end-to-end seller journey

2. **`tests/e2e/buyer-inquiry.spec.ts`** - Buyer inquiry flow
   - **Status:** Ready to run
   - **Tests:** 13 scenarios covering buyer interactions

3. **`tests/e2e/homepage.spec.ts`** - Homepage functionality
   - **Status:** ✅ Working
   - **Purpose:** Basic E2E setup demonstration

## 🚀 Running Tests

### Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- __tests__/components/Button.test.tsx
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug
```

## ⚙️ Setup Required

To run the reference unit tests, you'll need to:

1. **Create Missing Components:**
   ```
   components/auth/registration-form.tsx
   ```

2. **Create Missing Server Actions:**
   ```
   lib/actions/inquiries.ts
   ```

3. **Refactor API Routes:**
   - Extract business logic from route handlers into testable functions
   - Example: Move logic from `app/api/properties/create/route.ts` to `lib/actions/properties.ts`

## 📚 Test Writing Guidelines

### Unit Test Structure

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup mocks
    jest.clearAllMocks()
  })

  it('should do something specific', async () => {
    // Arrange
    const input = {...}

    // Act
    const result = await functionUnderTest(input)

    // Assert
    expect(result).toEqual(expected)
  })
})
```

### E2E Test Structure

```typescript
test.describe('User Flow', () => {
  test('user can complete action', async ({ page }) => {
    // Navigate
    await page.goto('/path')

    // Interact
    await page.fill('[name="field"]', 'value')
    await page.click('button[type="submit"]')

    // Assert
    await expect(page.locator('text=Success')).toBeVisible()
  })
})
```

## 🎯 Testing Best Practices

1. **Mock External Dependencies**
   - Supabase client
   - Next.js navigation
   - API calls
   - Email services

2. **Test User Behavior, Not Implementation**
   - Focus on what users do
   - Test outputs, not internal state
   - Use accessible selectors (roles, labels)

3. **Write Descriptive Test Names**
   - Describe the scenario
   - State the expected outcome
   - Example: "should show validation error when email is invalid"

4. **Keep Tests Independent**
   - Each test should work in isolation
   - Use `beforeEach` for setup
   - Don't rely on test execution order

5. **Test Edge Cases**
   - Empty inputs
   - Invalid data
   - Error conditions
   - Boundary values

## 📊 Coverage Goals

- **Branches:** 50%
- **Functions:** 50%
- **Lines:** 60%
- **Statements:** 60%

Priority coverage areas:
- ✅ User authentication
- ✅ Property creation
- ✅ Inquiry submission
- 🔄 Payment processing (future)
- 🔄 Transaction management (future)

## 🔧 Troubleshooting

### Common Issues

1. **"Cannot find module" errors**
   - Check if the component/file exists
   - Verify import paths match file structure
   - Ensure `@/` alias is configured in `jest.config.js`

2. **"Request is not defined" errors**
   - API route tests need additional mocking
   - Consider extracting business logic to separate functions

3. **Timeout errors in E2E tests**
   - Increase timeout in test
   - Check if development server is running
   - Verify selectors are correct

4. **Flaky tests**
   - Add proper `waitFor` conditions
   - Use Playwright's auto-waiting
   - Avoid hard-coded delays

## 🎓 Learning Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 📝 Next Steps

1. ✅ Jest and Playwright configured
2. ✅ Example tests created
3. ✅ Test scripts added to package.json
4. 🔄 Create missing components for tests
5. 🔄 Extract API business logic to testable functions
6. 🔄 Write additional tests for new features
7. 🔄 Achieve 60%+ coverage on critical paths

---

**Note:** The reference tests are intentionally comprehensive to show the testing strategy. You can implement them incrementally as you build out the platform features.
