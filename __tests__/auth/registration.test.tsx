import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegistrationForm } from '@/components/auth/registration-form'

// Mock Next.js navigation
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
const mockSignUp = jest.fn()
const mockInsert = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
    from: jest.fn(() => ({
      insert: mockInsert,
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    })),
  }),
}))

describe('User Registration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Buyer Registration', () => {
    it('should register a new buyer successfully', async () => {
      // Mock successful registration
      mockSignUp.mockResolvedValue({
        data: {
          user: { id: 'test-user-id', email: 'john@example.com' },
          session: { access_token: 'test-token' },
        },
        error: null,
      })

      mockInsert.mockResolvedValue({ data: {}, error: null })

      render(<RegistrationForm userType="buyer" />)

      const user = userEvent.setup()

      // Fill in the form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/password/i), 'SecurePass123!')
      await user.type(screen.getByLabelText(/phone number/i), '+27123456789')

      // Submit form
      await user.click(screen.getByRole('button', { name: /register/i }))

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'SecurePass123!',
          options: {
            data: {
              full_name: 'John Doe',
              user_type: 'buyer',
            },
          },
        })
      })
    })

    it('should show validation errors for invalid email', async () => {
      render(<RegistrationForm userType="buyer" />)

      const user = userEvent.setup()

      // Fill all fields with valid data except email
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')

      // Blur the email field to trigger validation
      await user.click(screen.getByLabelText(/password/i))

      await waitFor(() => {
        expect(screen.getByText(/valid email is required/i)).toBeInTheDocument()
      })

      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('should show validation errors for short password', async () => {
      render(<RegistrationForm userType="buyer" />)

      const user = userEvent.setup()

      // Fill all fields with valid data except password
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/password/i), '123')
      await user.type(screen.getByLabelText(/phone number/i), '+27123456789')
      await user.click(screen.getByRole('button', { name: /register/i }))

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })

      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('should handle registration errors gracefully', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' },
      })

      render(<RegistrationForm userType="buyer" />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
      await user.type(screen.getByLabelText(/password/i), 'SecurePass123!')
      await user.type(screen.getByLabelText(/phone number/i), '+27123456789')

      await user.click(screen.getByRole('button', { name: /register/i }))

      await waitFor(() => {
        expect(screen.getByText(/email already registered/i)).toBeInTheDocument()
      })
    })
  })

  describe('Seller Registration', () => {
    it('should register a new seller successfully', async () => {
      mockSignUp.mockResolvedValue({
        data: {
          user: { id: 'test-seller-id', email: 'seller@example.com' },
          session: { access_token: 'test-token' },
        },
        error: null,
      })

      mockInsert.mockResolvedValue({ data: {}, error: null })

      render(<RegistrationForm userType="seller" />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/full name/i), 'Jane Seller')
      await user.type(screen.getByLabelText(/email/i), 'seller@example.com')
      await user.type(screen.getByLabelText(/password/i), 'SecurePass123!')
      await user.type(screen.getByLabelText(/phone number/i), '+27987654321')

      await user.click(screen.getByRole('button', { name: /register/i }))

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'seller@example.com',
          password: 'SecurePass123!',
          options: {
            data: {
              full_name: 'Jane Seller',
              user_type: 'seller',
            },
          },
        })
      })
    })
  })

  describe('Form Validation', () => {
    it('should require all mandatory fields', async () => {
      render(<RegistrationForm userType="buyer" />)

      const user = userEvent.setup()

      // Try to submit empty form
      await user.click(screen.getByRole('button', { name: /register/i }))

      await waitFor(() => {
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText(/valid email is required/i)).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })

      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('should validate phone number format', async () => {
      render(<RegistrationForm userType="buyer" />)

      const user = userEvent.setup()

      // Fill all fields with valid data except phone
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/password/i), 'ValidPass123!')
      await user.type(screen.getByLabelText(/phone number/i), '123')
      await user.click(screen.getByRole('button', { name: /register/i }))

      await waitFor(() => {
        expect(screen.getByText(/valid phone number is required/i)).toBeInTheDocument()
      })
    })

    it('should validate password strength', async () => {
      render(<RegistrationForm userType="buyer" />)

      const user = userEvent.setup()

      // Fill all fields with valid data except password
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/password/i), 'weak')
      await user.type(screen.getByLabelText(/phone number/i), '+27123456789')
      await user.click(screen.getByRole('button', { name: /register/i }))

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state during registration', async () => {
      mockSignUp.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: {}, error: null }), 1000))
      )

      render(<RegistrationForm userType="buyer" />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/password/i), 'SecurePass123!')
      await user.type(screen.getByLabelText(/phone number/i), '+27123456789')

      await user.click(screen.getByRole('button', { name: /register/i }))

      expect(screen.getByText(/creating account/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()
    })
  })
})
