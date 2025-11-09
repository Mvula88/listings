'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import * as Sentry from '@sentry/nextjs'

interface DiagnosticResult {
  category: string
  status: 'pass' | 'fail' | 'warning' | 'info'
  message: string
  details?: string
}

export default function DiagnosticsPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result])
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])

    // 1. Check Environment Variables
    addResult({
      category: 'Environment',
      status: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'pass' : 'fail',
      message: 'Supabase URL',
      details: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Missing NEXT_PUBLIC_SUPABASE_URL'
    })

    addResult({
      category: 'Environment',
      status: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'pass' : 'fail',
      message: 'Supabase Anon Key',
      details: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured' : 'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY'
    })

    addResult({
      category: 'Environment',
      status: process.env.NEXT_PUBLIC_SENTRY_DSN ? 'pass' : 'warning',
      message: 'Sentry DSN',
      details: process.env.NEXT_PUBLIC_SENTRY_DSN ? 'Configured' : 'Missing - Error tracking disabled'
    })

    addResult({
      category: 'Environment',
      status: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'pass' : 'warning',
      message: 'Stripe Publishable Key',
      details: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Configured' : 'Missing - Payments disabled'
    })

    // 2. Test Supabase Connection
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data, error } = await supabase.from('countries').select('count').limit(1)

      if (error) {
        addResult({
          category: 'Supabase',
          status: 'fail',
          message: 'Database Connection',
          details: `Error: ${error.message}`
        })
        Sentry.captureException(error)
      } else {
        addResult({
          category: 'Supabase',
          status: 'pass',
          message: 'Database Connection',
          details: 'Successfully connected to Supabase'
        })
      }
    } catch (error: any) {
      addResult({
        category: 'Supabase',
        status: 'fail',
        message: 'Database Connection',
        details: `Exception: ${error.message}`
      })
      Sentry.captureException(error)
    }

    // 3. Test Authentication
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        addResult({
          category: 'Authentication',
          status: 'warning',
          message: 'Session Check',
          details: `Error: ${error.message}`
        })
      } else {
        addResult({
          category: 'Authentication',
          status: session ? 'pass' : 'info',
          message: 'Session Check',
          details: session ? `Logged in as: ${session.user.email}` : 'Not logged in'
        })
      }
    } catch (error: any) {
      addResult({
        category: 'Authentication',
        status: 'fail',
        message: 'Session Check',
        details: `Exception: ${error.message}`
      })
      Sentry.captureException(error)
    }

    // 4. Test Properties Table
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data, error } = await supabase
        .from('properties')
        .select('id')
        .limit(1)

      if (error) {
        addResult({
          category: 'Database',
          status: 'fail',
          message: 'Properties Table',
          details: `Error: ${error.message}`
        })
        Sentry.captureException(error)
      } else {
        addResult({
          category: 'Database',
          status: 'pass',
          message: 'Properties Table',
          details: `Accessible - ${data?.length || 0} records found`
        })
      }
    } catch (error: any) {
      addResult({
        category: 'Database',
        status: 'fail',
        message: 'Properties Table',
        details: `Exception: ${error.message}`
      })
      Sentry.captureException(error)
    }

    // 5. Test Property Views Table (Analytics)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data, error }: any = await (supabase as any)
        .from('property_views')
        .select('id')
        .limit(1)

      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          addResult({
            category: 'Database',
            status: 'warning',
            message: 'Property Views Table',
            details: 'Table does not exist - Analytics disabled. Run migration 005_feature_enhancements.sql'
          })
        } else {
          addResult({
            category: 'Database',
            status: 'fail',
            message: 'Property Views Table',
            details: `Error: ${error.message}`
          })
          Sentry.captureException(error)
        }
      } else {
        addResult({
          category: 'Database',
          status: 'pass',
          message: 'Property Views Table',
          details: 'Analytics table ready'
        })
      }
    } catch (error: any) {
      addResult({
        category: 'Database',
        status: 'warning',
        message: 'Property Views Table',
        details: `Analytics may not be available: ${error.message}`
      })
    }

    // 6. Test Image Storage
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data, error } = await supabase
        .storage
        .from('property-images')
        .list('', { limit: 1 })

      if (error) {
        addResult({
          category: 'Storage',
          status: 'fail',
          message: 'Property Images Bucket',
          details: `Error: ${error.message}`
        })
        Sentry.captureException(error)
      } else {
        addResult({
          category: 'Storage',
          status: 'pass',
          message: 'Property Images Bucket',
          details: 'Storage bucket accessible'
        })
      }
    } catch (error: any) {
      addResult({
        category: 'Storage',
        status: 'fail',
        message: 'Property Images Bucket',
        details: `Exception: ${error.message}`
      })
      Sentry.captureException(error)
    }

    // 7. Test API Routes
    try {
      const response = await fetch('/api/properties/featured')
      if (response.ok) {
        addResult({
          category: 'API',
          status: 'pass',
          message: 'Properties API',
          details: 'Featured properties endpoint working'
        })
      } else {
        addResult({
          category: 'API',
          status: 'warning',
          message: 'Properties API',
          details: `HTTP ${response.status}: ${response.statusText}`
        })
      }
    } catch (error: any) {
      addResult({
        category: 'API',
        status: 'fail',
        message: 'Properties API',
        details: `Exception: ${error.message}`
      })
      Sentry.captureException(error)
    }

    // 8. Browser Capabilities
    addResult({
      category: 'Browser',
      status: 'info',
      message: 'Local Storage',
      details: typeof window !== 'undefined' && window.localStorage ? 'Available' : 'Not available'
    })

    addResult({
      category: 'Browser',
      status: 'info',
      message: 'Session Storage',
      details: typeof window !== 'undefined' && window.sessionStorage ? 'Available' : 'Not available'
    })

    addResult({
      category: 'Browser',
      status: 'info',
      message: 'User Agent',
      details: typeof window !== 'undefined' ? navigator.userAgent : 'N/A'
    })

    setIsRunning(false)
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass': return 'bg-green-50 border-green-200 text-green-800'
      case 'fail': return 'bg-red-50 border-red-200 text-red-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass': return '✓'
      case 'fail': return '✗'
      case 'warning': return '⚠'
      case 'info': return 'ℹ'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Diagnostics</h1>
        <p className="text-gray-600">
          Run comprehensive diagnostics to check your application's health and identify issues.
        </p>
      </div>

      <div className="mb-6">
        <Button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="w-full md:w-auto"
        >
          {isRunning ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          {['Environment', 'Supabase', 'Authentication', 'Database', 'Storage', 'API', 'Browser'].map(category => {
            const categoryResults = results.filter(r => r.category === category)
            if (categoryResults.length === 0) return null

            return (
              <div key={category} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 font-semibold">
                  {category}
                </div>
                <div className="divide-y">
                  {categoryResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 border-l-4 ${getStatusColor(result.status)}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getStatusIcon(result.status)}</span>
                        <div className="flex-1">
                          <div className="font-medium">{result.message}</div>
                          {result.details && (
                            <div className="text-sm mt-1 opacity-80 font-mono">
                              {result.details}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
          <h3 className="font-semibold mb-2">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {results.filter(r => r.status === 'pass').length}
              </div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {results.filter(r => r.status === 'fail').length}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {results.filter(r => r.status === 'warning').length}
              </div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {results.filter(r => r.status === 'info').length}
              </div>
              <div className="text-sm text-gray-600">Info</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
