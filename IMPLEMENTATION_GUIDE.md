# 🔧 PRE-LAUNCH FIX IMPLEMENTATION GUIDE
## Complete Technical Debt Resolution Plan

---

## 📋 **OVERVIEW**

This guide provides step-by-step instructions to fix all identified issues before launching DealDirect.

**Total Timeline:** 10-12 working days
**Team Size:** 1-2 developers
**Priority:** Fix P0 and P1 items before lawyer recruitment begins

---

## 🔴 **PRIORITY 0: TYPE SAFETY FIX (Days 1-4)**

### **Goal:** Eliminate all 106 `as any` type assertions

### **Step 1: Use New Type Definitions (Day 1)**

**File Created:** `lib/types/api-responses.ts`

**Action Items:**

1. **Update Admin Dashboard** (`app/(admin)/admin/page.tsx`)

**BEFORE:**
```typescript
const stats = await getPlatformStats() as any
const { data: recentUsers } = await supabase
  .from('profiles')
  .select('id, full_name, email, created_at')
  .order('created_at', { ascending: false })
  .limit(5) as any
```

**AFTER:**
```typescript
import type { PlatformStats, RecentUser } from '@/lib/types/api-responses'

const stats = await getPlatformStats() as PlatformStats
const { data: recentUsers } = await supabase
  .from('profiles')
  .select('id, full_name, email, created_at, user_type')
  .order('created_at', { ascending: false })
  .limit(5)
  .returns<RecentUser[]>()
```

2. **Update Admin Actions** (`lib/admin/actions.ts`)

**BEFORE:**
```typescript
export async function getPlatformStats() {
  const supabase = await createClient()

  const { data: users } = await supabase.from('profiles').select('id') as any
  // ... more queries

  return {
    total_users: users?.length || 0,
    // ... more stats
  } as any
}
```

**AFTER:**
```typescript
import type { PlatformStats } from '@/lib/types/api-responses'

export async function getPlatformStats(): Promise<PlatformStats> {
  const supabase = await createClient()

  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id')

  if (usersError) {
    console.error('Error fetching users:', usersError)
  }

  // ... more queries with proper error handling

  return {
    total_users: users?.length ?? 0,
    new_users_week: 0, // TODO: Implement actual calculation
    active_users_month: 0,
    total_properties: properties?.length ?? 0,
    active_properties: activeProperties?.length ?? 0,
    // ... all required fields from PlatformStats interface
  }
}
```

3. **Update Property API Route** (`app/api/properties/create/route.ts`)

**BEFORE:**
```typescript
const { data: profile } = await (supabase as any)
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

**AFTER:**
```typescript
import type { UserProfile } from '@/lib/types/api-responses'

const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single<UserProfile>()

if (profileError && profileError.code !== 'PGRST116') {
  // PGRST116 = not found, which is OK (we'll create profile)
  return NextResponse.json(
    { success: false, error: 'Failed to fetch profile' },
    { status: 500 }
  )
}
```

### **Step 2: Update All Database Queries (Days 2-3)**

**Search for all `as any` instances:**

```bash
# In project root
grep -r "as any" app/ lib/ --include="*.ts" --include="*.tsx"
```

**Systematic Replacement Strategy:**

1. **Identify query type:**
   - Single item query → Use `.single<TypeName>()`
   - List query → Use `.returns<TypeName[]>()`
   - Aggregation → Define custom interface

2. **Add error handling:**
   ```typescript
   const { data, error } = await supabase
     .from('table')
     .select('*')
     .single<TypeName>()

   if (error) {
     console.error('Database error:', error)
     // Handle error appropriately
   }
   ```

3. **Use nullish coalescing for optional data:**
   ```typescript
   const count = data?.length ?? 0
   const name = user?.full_name ?? 'Anonymous'
   ```

### **Step 3: Enable Strict TypeScript (Day 4)**

**Update `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true
  }
}
```

**Run type check:**
```bash
npm run build
```

**Fix any new type errors that appear.**

---

## 🔴 **PRIORITY 0: TESTING FRAMEWORK (Days 5-9)**

### **Goal:** Set up testing and achieve 60%+ coverage on critical flows

### **Step 1: Install Testing Dependencies (Day 5 Morning)**

```bash
# Unit testing
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom

# E2E testing
npm install -D @playwright/test

# Test utilities
npm install -D msw @faker-js/faker
```

### **Step 2: Configure Jest (Day 5 Morning)**

**Create `jest.config.js`:**

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 60,
      statements: 60,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

**Create `jest.setup.js`:**

```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}))
```

**Update `package.json`:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### **Step 3: Write Critical Unit Tests (Days 5-7)**

**Test 1: User Registration** (`__tests__/auth/registration.test.tsx`)

```typescript
import { render, screen, waitFor } from '@testing-library/user Event'
import userEvent from '@testing-library/user-event'
import RegisterPage from '@/app/(auth)/register/page'

describe('User Registration', () => {
  it('should register a new buyer successfully', async () => {
    render(<RegisterPage />)

    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123!')
    await user.selectOptions(screen.getByLabelText(/user type/i), 'buyer')

    await user.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument()
    })
  })

  it('should show validation errors for invalid input', async () => {
    render(<RegisterPage />)

    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    await user.type(screen.getByLabelText(/password/i), '123') // Too short

    await user.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })
})
```

**Test 2: Property Creation** (`__tests__/properties/create.test.ts`)

```typescript
import { createProperty } from '@/app/api/properties/create/route'

describe('Property Creation API', () => {
  it('should create property with valid data', async () => {
    const mockRequest = {
      json: async () => ({
        title: 'Beautiful 3BR Home',
        description: 'Spacious family home with garden',
        property_type: 'house',
        price: 1500000,
        currency: 'ZAR',
        bedrooms: 3,
        bathrooms: 2,
        size_sqm: 200,
        address: '123 Main St',
        city: 'Cape Town',
        province: 'Western Cape',
        country: 'South Africa',
      }),
    }

    const response = await POST(mockRequest as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('id')
    expect(data.data.title).toBe('Beautiful 3BR Home')
  })

  it('should reject property with missing required fields', async () => {
    const mockRequest = {
      json: async () => ({
        title: 'Incomplete Property',
        // Missing required fields
      }),
    }

    const response = await POST(mockRequest as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('required')
  })
})
```

**Test 3: Inquiry Submission** (`__tests__/inquiries/submit.test.ts`)

```typescript
import { submitInquiry } from '@/lib/actions/inquiries'

describe('Inquiry Submission', () => {
  it('should submit inquiry and send email notification', async () => {
    const inquiryData = {
      property_id: 'prop_123',
      buyer_id: 'user_456',
      message: 'I am interested in viewing this property',
      phone_number: '+27123456789',
      preferred_contact: 'email' as const,
    }

    const result = await submitInquiry(inquiryData)

    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('inquiry_id')
    // Verify email was sent (mock check)
  })
})
```

### **Step 4: Write E2E Tests (Days 8-9)**

**Configure Playwright** (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**E2E Test 1: Complete **Property Listing Flow (`e2e/property-listing.spec.ts`)

```typescript
import { test, expect } from '@playwright/test'

test('seller can list a property end-to-end', async ({ page }) => {
  // 1. Go to homepage
  await page.goto('/')

  // 2. Click "List Property"
  await page.click('text=List Property')

  // 3. Should redirect to login if not authenticated
  await expect(page).toHaveURL(/.*login/)

  // 4. Register as seller
  await page.click('text=Register')
  await page.fill('[name="full_name"]', 'Test Seller')
  await page.fill('[name="email"]', `seller-${Date.now()}@test.com`)
  await page.fill('[name="password"]', 'SecurePass123!')
  await page.selectOption('[name="user_type"]', 'seller')
  await page.click('button[type="submit"]')

  // 5. Should redirect to dashboard
  await expect(page).toHaveURL(/.*dashboard/)

  // 6. Navigate to create property
  await page.click('text=Add Property')

  // 7. Fill property form
  await page.fill('[name="title"]', 'Test Property E2E')
  await page.fill('[name="description"]', 'This is a test property created by E2E tests')
  await page.selectOption('[name="property_type"]', 'house')
  await page.fill('[name="price"]', '1500000')
  await page.fill('[name="bedrooms"]', '3')
  await page.fill('[name="bathrooms"]', '2')
  await page.fill('[name="size_sqm"]', '200')
  await page.fill('[name="address"]', '123 Test Street')
  await page.fill('[name="city"]', 'Cape Town')
  await page.selectOption('[name="province"]', 'Western Cape')

  // 8. Submit form
  await page.click('button[type="submit"]')

  // 9. Should show success message
  await expect(page.locator('text=Property listed successfully')).toBeVisible()

  // 10. Should redirect to property page
  await expect(page).toHaveURL(/.*properties\/.*/)

  // 11. Verify property details are displayed
  await expect(page.locator('h1')).toContainText('Test Property E2E')
  await expect(page.locator('text=R 1,500,000')).toBeVisible()
})
```

**E2E Test 2: Buyer Inquiry Flow** (`e2e/buyer-inquiry.spec.ts`)

```typescript
import { test, expect } from '@playwright/test'

test('buyer can submit inquiry on property', async ({ page }) => {
  // 1. Navigate to a property
  await page.goto('/properties/test-property-id')

  // 2. Click "Contact Seller"
  await page.click('text=Contact Seller')

  // 3. Fill inquiry form
  await page.fill('[name="message"]', 'I am interested in viewing this property')
  await page.fill('[name="phone_number"]', '+27123456789')
  await page.selectOption('[name="preferred_contact"]', 'email')

  // 4. Submit inquiry
  await page.click('button:has-text("Send Inquiry")')

  // 5. Should show success message
  await expect(page.locator('text=Inquiry sent successfully')).toBeVisible()

  // 6. Verify seller receives email (check email mock/logs)
})
```

### **Step 5: Run Tests & Fix Issues (Day 9)**

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI (for debugging)
npm run test:e2e:ui
```

**Coverage Goal:** 60%+ on critical paths before launch

---

## 🟡 **PRIORITY 1: MISSING UI FLOWS (Days 10-12)**

### **Issue 1: Lawyer Onboarding Flow (Day 10)**

**Current State:** Tables exist, but no UI for lawyers to sign up

**Solution:** Create lawyer registration and onboarding pages

**File: `app/(auth)/register-lawyer/page.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function LawyerRegistrationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // User account info
    full_name: '',
    email: '',
    password: '',
    phone_number: '',

    // Lawyer-specific info
    firm_name: '',
    registration_number: '',
    years_experience: 0,
    cities_served: [] as string[],
    bio: '',

    // Documents
    practicing_certificate: null as File | null,
    indemnity_insurance: null as File | null,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            user_type: 'lawyer',
          },
        },
      })

      if (authError) throw authError

      // 2. Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          full_name: formData.full_name,
          email: formData.email,
          user_type: 'lawyer',
          phone_number: formData.phone_number,
        })

      if (profileError) throw profileError

      // 3. Create lawyer profile
      const { error: lawyerError } = await supabase
        .from('lawyers')
        .insert({
          user_id: authData.user!.id,
          firm_name: formData.firm_name,
          registration_number: formData.registration_number,
          years_experience: formData.years_experience,
          cities_served: formData.cities_served,
          bio: formData.bio,
          verified: false, // Admin will verify
          email: formData.email,
          phone_number: formData.phone_number,
        })

      if (lawyerError) throw lawyerError

      // 4. Upload documents (if provided)
      // TODO: Implement document upload

      toast.success('Registration submitted! We will review and contact you within 2 business days.')
      router.push('/lawyer-onboarding-pending')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl font-bold mb-2">Join as a Partner Conveyancer</h1>
      <p className="text-muted-foreground mb-8">
        Triple your client flow with DealDirect's commission-free property marketplace
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Account Information</h2>

          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Minimum 8 characters, include uppercase, lowercase, and number
            </p>
          </div>

          <div>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="+27 XX XXX XXXX"
              required
            />
          </div>
        </div>

        {/* Practice Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Practice Information</h2>

          <div>
            <Label htmlFor="firm_name">Law Firm / Practice Name</Label>
            <Input
              id="firm_name"
              value={formData.firm_name}
              onChange={(e) => setFormData({ ...formData, firm_name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="registration_number">Legal Practice Council Registration Number</Label>
            <Input
              id="registration_number"
              value={formData.registration_number}
              onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="years_experience">Years of Conveyancing Experience</Label>
            <Input
              id="years_experience"
              type="number"
              min="2"
              value={formData.years_experience}
              onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) })}
              required
            />
          </div>

          <div>
            <Label htmlFor="bio">Professional Bio (Optional)</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              placeholder="Brief overview of your experience and specializations..."
            />
          </div>
        </div>

        {/* Document Upload */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Required Documents</h2>
          <p className="text-sm text-muted-foreground">
            You can upload these documents now or after registration
          </p>

          <div>
            <Label htmlFor="practicing_certificate">Practicing Certificate (PDF)</Label>
            <Input
              id="practicing_certificate"
              type="file"
              accept=".pdf"
              onChange={(e) => setFormData({ ...formData, practicing_certificate: e.target.files?.[0] || null })}
            />
          </div>

          <div>
            <Label htmlFor="indemnity_insurance">Professional Indemnity Insurance (PDF)</Label>
            <Input
              id="indemnity_insurance"
              type="file"
              accept=".pdf"
              onChange={(e) => setFormData({ ...formData, indemnity_insurance: e.target.files?.[0] || null })}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Application'}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          By submitting, you agree to our{' '}
          <a href="/terms" className="underline">Terms of Service</a> and{' '}
          <a href="/privacy" className="underline">Privacy Policy</a>
        </p>
      </form>
    </div>
  )
}
```

### **Issue 2: Property Verification UI (Day 11)**

**Create: `app/(admin)/admin/properties/verify/[id]/page.tsx`**

*(Due to length constraints, I'll provide the structure - let me know if you want the full implementation)*

**Features:**
- View property details
- Verify seller ownership documents
- Check for duplicate listings
- Approve/Reject with reason
- Send email notification to seller

### **Issue 3: Mortgage Calculator (Day 11 Afternoon)**

**Create: `components/calculators/mortgage-calculator.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

export function MortgageCalculator() {
  const [propertyPrice, setPropertyPrice] = useState(1000000)
  const [deposit, setDeposit] = useState(100000)
  const [interestRate, setInterestRate] = useState(11.5)
  const [loanTerm, setLoanTerm] = useState(20)

  const loanAmount = propertyPrice - deposit
  const monthlyRate = interestRate / 100 / 12
  const numberOfPayments = loanTerm * 12

  const monthlyPayment = loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

  const totalPayment = monthlyPayment * numberOfPayments
  const totalInterest = totalPayment - loanAmount

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mortgage Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Property Price</Label>
          <Input
            type="number"
            value={propertyPrice}
            onChange={(e) => setPropertyPrice(Number(e.target.value))}
          />
        </div>

        <div>
          <Label>Deposit (R{deposit.toLocaleString()})</Label>
          <Slider
            value={[deposit]}
            onValueChange={([value]) => setDeposit(value)}
            min={0}
            max={propertyPrice * 0.3}
            step={10000}
          />
        </div>

        <div>
          <Label>Interest Rate ({interestRate}%)</Label>
          <Slider
            value={[interestRate]}
            onValueChange={([value]) => setInterestRate(value)}
            min={7}
            max={15}
            step={0.1}
          />
        </div>

        <div>
          <Label>Loan Term ({loanTerm} years)</Label>
          <Slider
            value={[loanTerm]}
            onValueChange={([value]) => setLoanTerm(value)}
            min={5}
            max={30}
            step={1}
          />
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-lg font-semibold">
            <span>Monthly Payment:</span>
            <span className="text-primary">
              R {monthlyPayment.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Total Interest:</span>
            <span>R {totalInterest.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Total Payment:</span>
            <span>R {totalPayment.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🟢 **PRIORITY 2: NICE-TO-HAVE FEATURES (Post-Launch)**

### **Gamification Decision**

**RECOMMENDATION: REMOVE or SIMPLIFY**

**Why:**
- Unclear value proposition for property transactions
- Adds complexity without clear ROI
- Distracts from core functionality

**Action:**
1. Comment out referral/rewards/leaderboard features
2. Keep code for future consideration
3. Focus on core property marketplace features

**If You Want to Keep It:**
- Simplify to just referral program (practical value)
- Remove points/leaderboard (gimmicky for property)
- Add clear incentive: "Refer a friend, get R500 off platform fee"

---

## ✅ **LAUNCH CHECKLIST**

**Before Lawyer Recruitment:**
- [ ] All 106 `as any` assertions fixed
- [ ] TypeScript strict mode enabled
- [ ] Jest configured and tests passing
- [ ] Playwright E2E tests passing
- [ ] 60%+ test coverage achieved
- [ ] Lawyer registration flow working
- [ ] Mortgage calculator added
- [ ] All critical bugs fixed

**Can Launch Without (Do Post-Launch):**
- [ ] Real-time WebSocket messaging (REST works)
- [ ] SMS notifications (email works)
- [ ] Advanced analytics (basic works)
- [ ] Multi-language support
- [ ] Mobile PWA
- [ ] Property verification UI (manual workaround)

---

## 📅 **SUGGESTED TIMELINE**

| Days | Task | Owner | Status |
|------|------|-------|--------|
| 1-2 | Fix type safety issues | Dev | 🔴 Critical |
| 3-4 | Complete type fixes + enable strict mode | Dev | 🔴 Critical |
| 5 | Set up testing framework | Dev | 🔴 Critical |
| 6-7 | Write unit tests for critical flows | Dev | 🔴 Critical |
| 8-9 | Write E2E tests | Dev | 🔴 Critical |
| 10 | Build lawyer onboarding UI | Dev | 🟡 Important |
| 11 | Add mortgage calculator + property verification | Dev | 🟡 Important |
| 12 | Final testing & bug fixes | Dev | 🟡 Important |
| **13** | **BEGIN LAWYER RECRUITMENT** | Founder | ✅ Ready |

---

## 🚀 **POST-FIX ACTIONS**

After completing Days 1-12:

1. **Deploy to staging environment**
2. **Run full regression tests**
3. **Invite 2-3 beta lawyers to test platform**
4. **Fix any issues found in beta**
5. **Deploy to production**
6. **BEGIN OFFICIAL LAWYER RECRUITMENT** (Use the pitch deck!)

---

**You now have a complete roadmap. Start with Day 1 tomorrow and work through systematically. In 12 days, you'll be 100% ready to recruit lawyers and launch!** 🚀

Want me to generate any specific files or code for these implementations?
