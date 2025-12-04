'use server'

import { createClient } from '@/lib/supabase/server'

export interface DocumentRequirement {
  id: string
  document_name: string
  document_key: string
  description: string | null
  help_text: string | null
  is_required: boolean
  accepted_file_types: string[]
  max_file_size_mb: number
  display_order: number
}

export interface CountryWithRequirements {
  id: string
  name: string
  code: string
  currency: string
  currency_symbol: string
  flag_emoji: string | null
  is_active: boolean
  requirements: DocumentRequirement[]
}

/**
 * Get active countries for lawyer onboarding
 */
export async function getActiveCountriesForOnboarding(): Promise<{
  countries: { id: string; name: string; code: string; flag_emoji: string | null }[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('countries')
      .select('id, name, code, flag_emoji')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching countries:', error)
      return { countries: [], error: error.message }
    }

    return { countries: data || [] }
  } catch (error) {
    console.error('Error in getActiveCountriesForOnboarding:', error)
    return { countries: [], error: 'Failed to fetch countries' }
  }
}

/**
 * Get document requirements for a specific country
 */
export async function getCountryDocumentRequirementsForOnboarding(countryId: string): Promise<{
  requirements: DocumentRequirement[]
  country?: { name: string; currency: string; currency_symbol: string }
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Get country info
    const { data: countryData, error: countryError } = await supabase
      .from('countries')
      .select('name, currency, currency_symbol')
      .eq('id', countryId)
      .single()

    if (countryError) {
      console.error('Error fetching country:', countryError)
      return { requirements: [], error: countryError.message }
    }

    // Get active document requirements
    const { data, error } = await (supabase as any)
      .from('country_lawyer_requirements')
      .select('id, document_name, document_key, description, help_text, is_required, accepted_file_types, max_file_size_mb, display_order')
      .eq('country_id', countryId)
      .eq('is_active', true)
      .order('display_order')

    if (error) {
      console.error('Error fetching requirements:', error)
      return { requirements: [], error: error.message }
    }

    return {
      requirements: data || [],
      country: countryData
    }
  } catch (error) {
    console.error('Error in getCountryDocumentRequirementsForOnboarding:', error)
    return { requirements: [], error: 'Failed to fetch document requirements' }
  }
}

/**
 * Submit lawyer onboarding with country-specific documents
 */
export async function submitLawyerOnboarding(data: {
  firmName: string
  registrationNumber: string
  countryId: string
  city: string
  yearsExperience: number | null
  flatFeeBuyer: number | null
  flatFeeSeller: number | null
  bio: string
  languages: string[]
  specializations: string[]
  paymentMethod: string
  documents: { requirementId: string; filePath: string }[]
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Create lawyer profile
    const { data: lawyer, error: lawyerError } = await (supabase as any)
      .from('lawyers')
      .insert({
        profile_id: user.id,
        firm_name: data.firmName,
        registration_number: data.registrationNumber,
        country_id: data.countryId || null,
        city: data.city,
        years_experience: data.yearsExperience,
        flat_fee_buyer: data.flatFeeBuyer,
        flat_fee_seller: data.flatFeeSeller,
        bio: data.bio,
        languages: data.languages,
        specializations: data.specializations,
        payment_method: data.paymentMethod,
        verified: false,
        available: true,
        verification_submitted_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (lawyerError) {
      console.error('Error creating lawyer:', lawyerError)
      return { success: false, error: lawyerError.message }
    }

    // Insert document records
    if (data.documents.length > 0) {
      const documentRecords = data.documents.map(doc => ({
        lawyer_id: lawyer.id,
        requirement_id: doc.requirementId,
        file_path: doc.filePath,
        status: 'pending'
      }))

      const { error: docError } = await (supabase as any)
        .from('lawyer_documents')
        .insert(documentRecords)

      if (docError) {
        console.error('Error creating document records:', docError)
        // Don't fail the whole submission for this
      }
    }

    // Update user profile type
    await supabase
      .from('profiles')
      .update({ user_type: 'lawyer' })
      .eq('id', user.id)

    return { success: true }
  } catch (error: any) {
    console.error('Error in submitLawyerOnboarding:', error)
    return { success: false, error: error.message || 'Failed to submit onboarding' }
  }
}
