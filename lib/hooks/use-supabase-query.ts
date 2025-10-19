// ============================================================================
// SUPABASE QUERY HOOK
// ============================================================================
// Type-safe wrapper around Supabase queries with loading and error states
// Usage: const { data, loading, error } = useSupabaseQuery(...)
// ============================================================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

type SupabaseQuery<T> = (client: SupabaseClient<Database>) => Promise<T>

interface UseSupabaseQueryOptions {
  enabled?: boolean
  refetchOnMount?: boolean
}

interface UseSupabaseQueryResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useSupabaseQuery<T>(
  queryFn: SupabaseQuery<T>,
  options: UseSupabaseQueryOptions = {}
): UseSupabaseQueryResult<T> {
  const { enabled = true, refetchOnMount = true } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(enabled)
  const [error, setError] = useState<Error | null>(null)

  const executeQuery = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const result = await queryFn(supabase)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'))
    } finally {
      setLoading(false)
    }
  }, [queryFn, enabled])

  useEffect(() => {
    if (enabled && refetchOnMount) {
      executeQuery()
    }
  }, [executeQuery, enabled, refetchOnMount])

  return {
    data,
    loading,
    error,
    refetch: executeQuery,
  }
}
