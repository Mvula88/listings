import { createProperty } from '@/lib/actions/properties'

// Mock Supabase
const mockGetUser = jest.fn()
const mockInsert = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()
const mockUpload = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: jest.fn(() => ({
      insert: mockInsert,
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    })),
    storage: {
      from: jest.fn(() => ({
        upload: mockUpload,
      })),
    },
  })),
}))

describe('Property Creation API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createProperty', () => {
    const validPropertyData = {
      title: 'Beautiful 3BR Home',
      description: 'Spacious family home with garden',
      property_type: 'house' as const,
      price: 1500000,
      currency: 'ZAR' as const,
      bedrooms: 3,
      bathrooms: 2,
      area: 200,
      address: '123 Main St',
      city: 'Cape Town',
      province: 'Western Cape',
      country_id: 1,
      listing_type: 'sale' as const,
      location: 'Cape Town, Western Cape',
    }

    it('should create property with valid data', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: 'test-user-id', email: 'seller@example.com' },
        },
        error: null,
      })

      mockSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-user-id', user_type: 'seller' },
            error: null,
          }),
        }),
      })

      mockInsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'test-property-id',
              title: validPropertyData.title,
              status: 'pending',
            },
            error: null,
          }),
        }),
      })

      const result = await createProperty(validPropertyData)

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('id')
      expect(result.data?.title).toBe('Beautiful 3BR Home')
      expect(mockInsert).toHaveBeenCalled()
    })

    it('should reject property with missing required fields', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: 'test-user-id' },
        },
        error: null,
      })

      const incompleteData = {
        title: 'Incomplete Property',
        description: 'Missing fields',
      }

      const result = await createProperty(incompleteData as any)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('should reject property with negative price', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: 'test-user-id' },
        },
        error: null,
      })

      mockSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-user-id', user_type: 'seller' },
            error: null,
          }),
        }),
      })

      const invalidData = {
        ...validPropertyData,
        price: -1000,
      }

      const result = await createProperty(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should reject property with invalid bedrooms count', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: 'test-user-id' },
        },
        error: null,
      })

      mockSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-user-id', user_type: 'seller' },
            error: null,
          }),
        }),
      })

      const invalidData = {
        ...validPropertyData,
        bedrooms: -1,
      }

      const result = await createProperty(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should require authentication', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const result = await createProperty(validPropertyData)

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/authentication required/i)
      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('should only allow sellers to create properties', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: 'test-buyer-id' },
        },
        error: null,
      })

      mockSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-buyer-id', user_type: 'buyer' },
            error: null,
          }),
        }),
      })

      const result = await createProperty(validPropertyData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Only sellers can create property listings')
    })

    it('should set property status to pending by default', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: 'test-user-id' },
        },
        error: null,
      })

      mockSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-user-id', user_type: 'seller' },
            error: null,
          }),
        }),
      })

      mockInsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-property-id', status: 'pending' },
            error: null,
          }),
        }),
      })

      const result = await createProperty(validPropertyData)

      expect(result.success).toBe(true)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending',
        })
      )
    })

    it('should handle database errors gracefully', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: 'test-user-id' },
        },
        error: null,
      })

      mockSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-user-id', user_type: 'seller' },
            error: null,
          }),
        }),
      })

      mockInsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' },
          }),
        }),
      })

      const result = await createProperty(validPropertyData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to create property listing')
    })

    it('should validate property type', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })

      mockSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-user-id', user_type: 'seller' },
            error: null,
          }),
        }),
      })

      const invalidData = {
        ...validPropertyData,
        property_type: 'invalid_type',
      }

      const result = await createProperty(invalidData as any)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should validate listing type', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })

      mockSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-user-id', user_type: 'seller' },
            error: null,
          }),
        }),
      })

      const invalidData = {
        title: 'Test Property',
        description: 'Test description for property',
        property_type: 'house',
        listing_type: 'invalid_type',
        price: 1000000,
        currency: 'ZAR',
        bedrooms: 3,
        bathrooms: 2,
        area: 200,
        address: '123 Test St',
        city: 'Cape Town',
        province: 'Western Cape',
        country_id: 1,
        location: 'Cape Town, Western Cape',
      }

      const result = await createProperty(invalidData as any)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should validate currency', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })

      mockSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-user-id', user_type: 'seller' },
            error: null,
          }),
        }),
      })

      const invalidData = {
        title: 'Test Property',
        description: 'Test description for property',
        property_type: 'house',
        listing_type: 'sale',
        price: 1000000,
        currency: 'USD', // Invalid currency
        bedrooms: 3,
        bathrooms: 2,
        area: 200,
        address: '123 Test St',
        city: 'Cape Town',
        province: 'Western Cape',
        country_id: 1,
        location: 'Cape Town, Western Cape',
      }

      const result = await createProperty(invalidData as any)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
