'use client'

import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function SentryTestPage() {
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testClientError = () => {
    try {
      throw new Error('Test Client Error - This is a test error from the client side')
    } catch (error) {
      Sentry.captureException(error)
      addResult('✓ Client error captured and sent to Sentry')
      console.error('Test client error:', error)
    }
  }

  const testAsyncError = async () => {
    try {
      await new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Test Async Error - Simulating failed API call')), 100)
      )
    } catch (error) {
      Sentry.captureException(error)
      addResult('✓ Async error captured and sent to Sentry')
      console.error('Test async error:', error)
    }
  }

  const testUnhandledError = () => {
    addResult('⚠ Triggering unhandled error (will crash this page)')
    setTimeout(() => {
      throw new Error('Unhandled Error - This should be caught by the error boundary')
    }, 100)
  }

  const testCustomEvent = () => {
    Sentry.captureMessage('Custom Test Event - User triggered diagnostic', 'info')
    addResult('✓ Custom message sent to Sentry')
  }

  const testBreadcrumb = () => {
    Sentry.addBreadcrumb({
      category: 'test',
      message: 'User clicked test breadcrumb button',
      level: 'info',
    })
    addResult('✓ Breadcrumb added to Sentry context')
  }

  const testWithContext = () => {
    Sentry.withScope((scope) => {
      scope.setTag('test_type', 'diagnostic')
      scope.setUser({ id: 'test-user-123', email: 'test@example.com' })
      scope.setContext('test_context', {
        page: 'sentry-test',
        timestamp: new Date().toISOString(),
      })
      Sentry.captureException(new Error('Test Error with Context'))
    })
    addResult('✓ Error with custom context sent to Sentry')
  }

  const testNetworkError = async () => {
    try {
      const response = await fetch('/api/non-existent-endpoint')
      if (!response.ok) {
        throw new Error(`Network Error: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      Sentry.captureException(error)
      addResult('✓ Network error captured and sent to Sentry')
      console.error('Test network error:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sentry Error Tracking Test</h1>
        <p className="text-gray-600">
          Use the buttons below to test different types of errors and verify Sentry integration.
          Check your browser console and Sentry dashboard for captured errors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Button onClick={testClientError} variant="outline" className="h-auto py-4 flex-col items-start">
          <span className="font-semibold mb-1">Test Client Error</span>
          <span className="text-xs text-gray-500">Throws and catches a client-side error</span>
        </Button>

        <Button onClick={testAsyncError} variant="outline" className="h-auto py-4 flex-col items-start">
          <span className="font-semibold mb-1">Test Async Error</span>
          <span className="text-xs text-gray-500">Simulates a failed async operation</span>
        </Button>

        <Button onClick={testUnhandledError} variant="destructive" className="h-auto py-4 flex-col items-start">
          <span className="font-semibold mb-1">Test Unhandled Error</span>
          <span className="text-xs text-gray-500">⚠ Triggers error boundary (crashes page)</span>
        </Button>

        <Button onClick={testCustomEvent} variant="outline" className="h-auto py-4 flex-col items-start">
          <span className="font-semibold mb-1">Test Custom Event</span>
          <span className="text-xs text-gray-500">Sends a custom message to Sentry</span>
        </Button>

        <Button onClick={testBreadcrumb} variant="outline" className="h-auto py-4 flex-col items-start">
          <span className="font-semibold mb-1">Test Breadcrumb</span>
          <span className="text-xs text-gray-500">Adds a breadcrumb for context</span>
        </Button>

        <Button onClick={testWithContext} variant="outline" className="h-auto py-4 flex-col items-start">
          <span className="font-semibold mb-1">Test Error with Context</span>
          <span className="text-xs text-gray-500">Sends error with tags and user info</span>
        </Button>

        <Button onClick={testNetworkError} variant="outline" className="h-auto py-4 flex-col items-start">
          <span className="font-semibold mb-1">Test Network Error</span>
          <span className="text-xs text-gray-500">Simulates a failed API request</span>
        </Button>
      </div>

      {testResults.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h2 className="font-semibold mb-3">Test Results</h2>
          <div className="space-y-1 font-mono text-sm">
            {testResults.map((result, index) => (
              <div key={index} className="text-gray-700">
                {result}
              </div>
            ))}
          </div>
          <Button
            onClick={() => setTestResults([])}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Clear Results
          </Button>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Click the buttons above to test different error scenarios</li>
          <li>Check your browser console (F12) for error logs</li>
          <li>Log into your Sentry dashboard to see captured errors</li>
          <li>Verify that errors include proper context and breadcrumbs</li>
        </ol>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>Sentry DSN: {process.env.NEXT_PUBLIC_SENTRY_DSN ? '✓ Configured' : '✗ Not configured'}</p>
        <p>Environment: {process.env.NODE_ENV}</p>
      </div>
    </div>
  )
}
