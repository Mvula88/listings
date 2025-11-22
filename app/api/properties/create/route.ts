import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createProperty } from '@/lib/actions/properties'

// Next.js API route handler
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Call the testable business logic
    const result = await createProperty(body)

    if (!result.success) {
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
