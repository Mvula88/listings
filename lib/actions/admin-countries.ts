'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Types
interface Country {
  id: string
  code: string
  name: string
  currency: string
  currency_symbol: string
  is_active: boolean
  phone_code: string | null
  flag_emoji: string | null
  date_format: string | null
  created_at: string
  updated_at: string | null
}

interface LawyerDocumentRequirement {
  id: string
  country_id: string
  document_name: string
  document_key: string
  description: string | null
  help_text: string | null
  is_required: boolean
  accepted_file_types: string[]
  max_file_size_mb: number
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string | null
}

// Check admin access
async function checkAdminAccess(): Promise<{ userId: string; role: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminProfile || !['super_admin', 'admin'].includes((adminProfile as any).role)) {
    return { error: 'Not authorized' }
  }

  return { userId: user.id, role: (adminProfile as any).role }
}

// ============================================================================
// COUNTRY MANAGEMENT
// ============================================================================

/**
 * Get all countries with their settings
 */
export async function getCountries() {
  const supabase = await createClient()

  const { data: countries, error } = await supabase
    .from('countries')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching countries:', error)
    return { countries: [], error: error.message }
  }

  return { countries: countries || [] }
}

/**
 * Get active countries only
 */
export async function getActiveCountries() {
  const supabase = await createClient()

  const { data: countries, error } = await supabase
    .from('countries')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching active countries:', error)
    return { countries: [], error: error.message }
  }

  return { countries: countries || [] }
}

/**
 * Get a single country with its document requirements
 */
export async function getCountryWithRequirements(countryId: string): Promise<{
  country: any | null
  requirements: any[]
  error?: string
}> {
  const supabase = await createClient()

  const [countryResult, requirementsResult] = await Promise.all([
    supabase
      .from('countries')
      .select('*')
      .eq('id', countryId)
      .single(),
    supabase
      .from('country_lawyer_requirements')
      .select('*')
      .eq('country_id', countryId)
      .order('display_order', { ascending: true })
  ])

  if (countryResult.error) {
    return { country: null, requirements: [], error: countryResult.error.message }
  }

  return {
    country: countryResult.data,
    requirements: requirementsResult.data || []
  }
}

/**
 * Update country settings
 */
export async function updateCountry(
  countryId: string,
  data: {
    name?: string
    currency?: string
    currency_symbol?: string
    is_active?: boolean
    phone_code?: string
    flag_emoji?: string
    date_format?: string
  }
) {
  const access = await checkAdminAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('countries')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', countryId)

  if (error) {
    console.error('Error updating country:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/countries')
  revalidatePath('/admin/countries/' + countryId)

  return { success: true }
}

/**
 * Toggle country active status
 */
export async function toggleCountryActive(countryId: string, isActive: boolean) {
  return updateCountry(countryId, { is_active: isActive })
}

/**
 * Create a new country
 */
export async function createCountry(data: {
  code: string
  name: string
  currency: string
  currency_symbol: string
  phone_code?: string
  flag_emoji?: string
  is_active?: boolean
}) {
  const access = await checkAdminAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  const supabase = await createClient()

  const { data: country, error } = await (supabase as any)
    .from('countries')
    .insert({
      code: data.code.toUpperCase(),
      name: data.name,
      currency: data.currency.toUpperCase(),
      currency_symbol: data.currency_symbol,
      phone_code: data.phone_code,
      flag_emoji: data.flag_emoji,
      is_active: data.is_active ?? false
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating country:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/countries')

  return { success: true, country }
}

// ============================================================================
// LAWYER DOCUMENT REQUIREMENTS
// ============================================================================

/**
 * Get document requirements for a country
 */
export async function getCountryDocumentRequirements(countryId: string) {
  const supabase = await createClient()

  const { data: requirements, error } = await (supabase as any)
    .from('country_lawyer_requirements')
    .select('*')
    .eq('country_id', countryId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching requirements:', error)
    return { requirements: [], error: error.message }
  }

  return { requirements: requirements || [] }
}

/**
 * Get active document requirements for a country (for lawyers)
 */
export async function getActiveDocumentRequirements(countryId: string) {
  const supabase = await createClient()

  const { data: requirements, error } = await (supabase as any)
    .from('country_lawyer_requirements')
    .select('*')
    .eq('country_id', countryId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching active requirements:', error)
    return { requirements: [], error: error.message }
  }

  return { requirements: requirements || [] }
}

/**
 * Add a document requirement to a country
 */
export async function addDocumentRequirement(
  countryId: string,
  data: {
    document_name: string
    document_key: string
    description?: string
    help_text?: string
    is_required?: boolean
    accepted_file_types?: string[]
    max_file_size_mb?: number
    display_order?: number
  }
) {
  const access = await checkAdminAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  const supabase = await createClient() as any

  // Get max display_order for this country
  const { data: maxOrder } = await supabase
    .from('country_lawyer_requirements')
    .select('display_order')
    .eq('country_id', countryId)
    .order('display_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (maxOrder?.display_order ?? 0) + 1

  const { data: requirement, error } = await supabase
    .from('country_lawyer_requirements')
    .insert({
      country_id: countryId,
      document_name: data.document_name,
      document_key: data.document_key.toLowerCase().replace(/\s+/g, '_'),
      description: data.description,
      help_text: data.help_text,
      is_required: data.is_required ?? true,
      accepted_file_types: data.accepted_file_types ?? ['application/pdf', 'image/jpeg', 'image/png'],
      max_file_size_mb: data.max_file_size_mb ?? 5,
      display_order: data.display_order ?? nextOrder,
      is_active: true
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding requirement:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/countries/' + countryId)

  return { success: true, requirement }
}

/**
 * Update a document requirement
 */
export async function updateDocumentRequirement(
  requirementId: string,
  data: {
    document_name?: string
    description?: string
    help_text?: string
    is_required?: boolean
    accepted_file_types?: string[]
    max_file_size_mb?: number
    display_order?: number
    is_active?: boolean
  }
) {
  const access = await checkAdminAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  const supabase = await createClient() as any

  // Get country_id for revalidation
  const { data: requirement } = await supabase
    .from('country_lawyer_requirements')
    .select('country_id')
    .eq('id', requirementId)
    .single()

  const { error } = await supabase
    .from('country_lawyer_requirements')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', requirementId)

  if (error) {
    console.error('Error updating requirement:', error)
    return { success: false, error: error.message }
  }

  if (requirement?.country_id) {
    revalidatePath('/admin/countries/' + requirement.country_id)
  }
  revalidatePath('/admin/countries')

  return { success: true }
}

/**
 * Delete a document requirement
 */
export async function deleteDocumentRequirement(requirementId: string) {
  const access = await checkAdminAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  const supabase = await createClient() as any

  // Get country_id for revalidation
  const { data: requirement } = await supabase
    .from('country_lawyer_requirements')
    .select('country_id')
    .eq('id', requirementId)
    .single()

  const { error } = await supabase
    .from('country_lawyer_requirements')
    .delete()
    .eq('id', requirementId)

  if (error) {
    console.error('Error deleting requirement:', error)
    return { success: false, error: error.message }
  }

  if (requirement?.country_id) {
    revalidatePath('/admin/countries/' + requirement.country_id)
  }
  revalidatePath('/admin/countries')

  return { success: true }
}

/**
 * Reorder document requirements
 */
export async function reorderDocumentRequirements(
  countryId: string,
  orderedIds: string[]
) {
  const access = await checkAdminAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  const supabase = await createClient() as any

  // Update each requirement with its new order
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('country_lawyer_requirements')
      .update({ display_order: index + 1, updated_at: new Date().toISOString() })
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const hasError = results.some(r => r.error)

  if (hasError) {
    return { success: false, error: 'Failed to reorder some requirements' }
  }

  revalidatePath('/admin/countries/' + countryId)

  return { success: true }
}
