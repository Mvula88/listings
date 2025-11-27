import { submitInquiry } from '@/lib/actions/inquiries'

// Mock Supabase
const mockGetUser = jest.fn()
const mockFrom = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}))

// Mock email sending
global.fetch = jest.fn()

// Mock environment variable
process.env.NEXT_PUBLIC_URL = 'http://localhost:3000'

// Helper function to create common mocks
function createSuccessMocks(options: {
  buyerId: string
  sellerId: string
  inquiryId: string
  propertyId: string
  propertyTitle?: string
  hasRecentInquiry?: boolean
  ownerEmail?: string
  ownerName?: string
}) {
  const {
    buyerId,
    sellerId,
    inquiryId,
    propertyId,
    propertyTitle = 'Test Property',
    hasRecentInquiry = false,
    ownerEmail = 'seller@example.com',
    ownerName = 'John Seller',
  } = options

  mockGetUser.mockResolvedValue({
    data: {
      user: { id: buyerId, email: 'buyer@example.com' },
    },
    error: null,
  })

  const mockInsert = jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: { id: inquiryId },
        error: null,
      }),
    }),
  })

  mockFrom.mockImplementation((table: string) => {
    if (table === 'properties') {
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: propertyId,
                title: propertyTitle,
                seller_id: sellerId,
              },
              error: null,
            }),
          }),
        }),
      }
    } else if (table === 'inquiries') {
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  data: hasRecentInquiry ? { id: 'recent-inquiry' } : null,
                  error: null,
                }),
              }),
            }),
          }),
        }),
        insert: mockInsert,
      }
    } else if (table === 'profiles') {
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: sellerId,
                email: ownerEmail,
                full_name: ownerName,
              },
              error: null,
            }),
          }),
        }),
      }
    }
  })

  return { mockInsert }
}

describe('Inquiry Submission', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  describe('submitInquiry', () => {
    const validInquiryData = {
      property_id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
      message: 'I am interested in viewing this property',
      phone_number: '+27123456789',
      preferred_contact: 'email' as const,
    }

    it('should submit inquiry successfully', async () => {
      const buyerId = '123e4567-e89b-12d3-a456-426614174000'
      const sellerId = '123e4567-e89b-12d3-a456-426614174001'
      const inquiryId = '123e4567-e89b-12d3-a456-426614174002'

      const { mockInsert } = createSuccessMocks({
        buyerId,
        sellerId,
        inquiryId,
        propertyId: validInquiryData.property_id,
      })

      const result = await submitInquiry(validInquiryData)

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('inquiry_id')
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          property_id: validInquiryData.property_id,
          buyer_id: buyerId,
          message: validInquiryData.message,
          phone_number: validInquiryData.phone_number,
          preferred_contact: 'email',
        })
      )
    })

    it('should send email notification to property owner', async () => {
      const buyerId = '123e4567-e89b-12d3-a456-426614174000'
      const sellerId = '123e4567-e89b-12d3-a456-426614174001'
      const inquiryId = '123e4567-e89b-12d3-a456-426614174002'

      createSuccessMocks({
        buyerId,
        sellerId,
        inquiryId,
        propertyId: validInquiryData.property_id,
        propertyTitle: 'Beautiful Home',
      })

      await submitInquiry(validInquiryData)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/email/inquiry-notification',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        }
      )

      // Verify body contains the expected data
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const body = JSON.parse(fetchCall[1].body)
      expect(body.propertyTitle).toBe('Beautiful Home')
    })

    it('should require authentication', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const result = await submitInquiry(validInquiryData)

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/authentication required/i)
    })

    it('should validate message is not empty', async () => {
      const buyerId = '123e4567-e89b-12d3-a456-426614174000'

      mockGetUser.mockResolvedValue({
        data: {
          user: { id: buyerId },
        },
        error: null,
      })

      const invalidData = {
        ...validInquiryData,
        message: '',
      }

      const result = await submitInquiry(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should validate phone number format', async () => {
      const buyerId = '123e4567-e89b-12d3-a456-426614174000'

      mockGetUser.mockResolvedValue({
        data: {
          user: { id: buyerId },
        },
        error: null,
      })

      const invalidData = {
        ...validInquiryData,
        phone_number: 'abc123', // Invalid phone - contains letters
      }

      const result = await submitInquiry(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should verify property exists', async () => {
      const buyerId = '123e4567-e89b-12d3-a456-426614174000'

      mockGetUser.mockResolvedValue({
        data: {
          user: { id: buyerId },
        },
        error: null,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'properties') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Property not found' },
                }),
              }),
            }),
          }
        }
      })

      const result = await submitInquiry(validInquiryData)

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/property not found/i)
    })

    it('should prevent sellers from inquiring on their own properties', async () => {
      const sellerId = '123e4567-e89b-12d3-a456-426614174001'

      mockGetUser.mockResolvedValue({
        data: {
          user: { id: sellerId }, // Same as seller_id
        },
        error: null,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'properties') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: validInquiryData.property_id,
                    title: 'Test Property',
                    seller_id: sellerId, // Same as current user
                  },
                  error: null,
                }),
              }),
            }),
          }
        }
      })

      const result = await submitInquiry(validInquiryData)

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/cannot inquire.*own property/i)
    })

    it('should handle database errors gracefully', async () => {
      const buyerId = '123e4567-e89b-12d3-a456-426614174000'
      const sellerId = '123e4567-e89b-12d3-a456-426614174001'

      mockGetUser.mockResolvedValue({
        data: {
          user: { id: buyerId },
        },
        error: null,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'properties') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: validInquiryData.property_id,
                    seller_id: sellerId,
                  },
                  error: null,
                }),
              }),
            }),
          }
        } else if (table === 'inquiries') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  gte: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({
                      data: null,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database error' },
                }),
              }),
            }),
          }
        }
      })

      const result = await submitInquiry(validInquiryData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should still succeed even if email fails', async () => {
      const buyerId = '123e4567-e89b-12d3-a456-426614174000'
      const sellerId = '123e4567-e89b-12d3-a456-426614174001'
      const inquiryId = '123e4567-e89b-12d3-a456-426614174002'

      createSuccessMocks({
        buyerId,
        sellerId,
        inquiryId,
        propertyId: validInquiryData.property_id,
      })

      // Mock email failure
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Email service down'))

      const result = await submitInquiry(validInquiryData)

      // Inquiry should still succeed
      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('inquiry_id')
    })

    it('should validate preferred contact method', async () => {
      const buyerId = '123e4567-e89b-12d3-a456-426614174000'

      mockGetUser.mockResolvedValue({
        data: {
          user: { id: buyerId },
        },
        error: null,
      })

      const invalidData = {
        ...validInquiryData,
        preferred_contact: 'invalid' as any,
      }

      const result = await submitInquiry(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('Inquiry Rate Limiting', () => {
    it('should prevent spam inquiries from same user', async () => {
      const buyerId = '123e4567-e89b-12d3-a456-426614174000'
      const sellerId = '123e4567-e89b-12d3-a456-426614174001'
      const propertyId = '550e8400-e29b-41d4-a716-446655440000'

      createSuccessMocks({
        buyerId,
        sellerId,
        inquiryId: '123e4567-e89b-12d3-a456-426614174002',
        propertyId,
        hasRecentInquiry: true,
      })

      const validInquiryData = {
        property_id: propertyId,
        message: 'I am interested in viewing this property',
        phone_number: '+27123456789',
        preferred_contact: 'email' as const,
      }

      const result = await submitInquiry(validInquiryData)

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/already submitted.*recently/i)
    })
  })
})
