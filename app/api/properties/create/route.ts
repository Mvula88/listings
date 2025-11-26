import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createProperty } from '@/lib/actions/properties'

// Next.js API route handler
export async function POST(request: Request) {
  try {
    // Check content type and parse accordingly
    const contentType = request.headers.get('content-type') || ''
    let body: any

    if (contentType.includes('application/json')) {
      body = await request.json()
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      // Handle FormData
      const formData = await request.formData()

      // Helper to safely parse numbers
      const parseNumber = (value: FormDataEntryValue | null, defaultValue: number = 0): number => {
        if (value === null || value === '') return defaultValue
        const num = Number(value)
        return isNaN(num) ? defaultValue : num
      }

      body = {
        title: formData.get('title'),
        description: formData.get('description'),
        property_type: formData.get('property_type'),
        price: parseNumber(formData.get('price'), 0),
        bedrooms: parseNumber(formData.get('bedrooms'), 0) || null,
        bathrooms: parseNumber(formData.get('bathrooms'), 0) || null,
        square_meters: parseNumber(formData.get('square_meters'), 0) || null,
        address_line1: formData.get('address_line1'),
        city: formData.get('city'),
        province: formData.get('province') || null,
        country_id: formData.get('country_id') as string,
      }
    } else {
      body = await request.json()
    }

    // Log the body for debugging
    console.log('Property creation body:', JSON.stringify(body, null, 2))

    // Call the testable business logic
    const result = await createProperty(body)

    if (!result.success) {
      console.error('Property creation failed:', result.error)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error?.includes('Authentication') ? 401 :
                 result.error?.includes('sellers only') ? 403 : 400 }
      )
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/browse')
    revalidatePath('/properties')

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error: any) {
    console.error('API route error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
