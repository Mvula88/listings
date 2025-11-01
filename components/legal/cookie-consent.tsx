'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Cookie, Settings } from 'lucide-react'
import Link from 'next/link'

const COOKIE_CONSENT_KEY = 'dealdirect_cookie_consent'

export type CookiePreferences = {
  necessary: boolean // Always true
  analytics: boolean
  marketing: boolean
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    }
    savePreferences(allAccepted)
  }

  const acceptNecessaryOnly = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    savePreferences(necessaryOnly)
  }

  const saveCustomPreferences = () => {
    savePreferences(preferences)
  }

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs))
    setShowBanner(false)
    setShowSettings(false)

    // You can add analytics initialization here based on preferences
    if (prefs.analytics) {
      // Initialize analytics (e.g., Google Analytics)
      console.log('Analytics enabled')
    }

    if (prefs.marketing) {
      // Initialize marketing cookies
      console.log('Marketing cookies enabled')
    }
  }

  if (!showBanner) {
    return null
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <Card className="mx-auto max-w-4xl border-2 shadow-2xl">
        <div className="p-6">
          {!showSettings ? (
            // Simple Banner
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-shrink-0">
                <Cookie className="h-10 w-10 text-primary" />
              </div>

              <div className="flex-1 space-y-2">
                <h2 className="text-lg font-semibold">Cookie Notice</h2>
                <p className="text-sm text-muted-foreground">
                  We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
                  By clicking "Accept All", you consent to our use of cookies.{' '}
                  <Link href="/privacy" className="underline hover:text-primary">
                    Read our Privacy Policy
                  </Link>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                  className="w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
                <Button
                  variant="outline"
                  onClick={acceptNecessaryOnly}
                  className="w-full sm:w-auto"
                >
                  Necessary Only
                </Button>
                <Button
                  onClick={acceptAll}
                  className="w-full sm:w-auto"
                >
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            // Settings Panel
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cookie className="h-8 w-8 text-primary" />
                  <h2 className="text-xl font-semibold">Cookie Preferences</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Choose which types of cookies you want to accept. You can change these settings at any time.
              </p>

              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Necessary Cookies</h3>
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                        Always Active
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Required for basic website functionality like authentication, security, and navigation.
                      These cannot be disabled.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="h-5 w-5"
                    />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold">Analytics Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Help us understand how visitors interact with our website by collecting and reporting
                      information anonymously. This includes page views, time on site, and navigation patterns.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        analytics: e.target.checked
                      }))}
                      className="h-5 w-5 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold">Marketing Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Track your activity across websites to deliver relevant advertisements.
                      These help us show you properties and services that match your interests.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        marketing: e.target.checked
                      }))}
                      className="h-5 w-5 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={acceptNecessaryOnly}
                  className="flex-1"
                >
                  Reject All
                </Button>
                <Button
                  onClick={saveCustomPreferences}
                  className="flex-1"
                >
                  Save Preferences
                </Button>
                <Button
                  onClick={acceptAll}
                  className="flex-1"
                >
                  Accept All
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                For more information, please read our{' '}
                <Link href="/privacy" className="underline hover:text-primary">
                  Privacy Policy
                </Link>
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

// Helper function to check if analytics is enabled
export function isAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false

  const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
  if (!consent) return false

  try {
    const preferences: CookiePreferences = JSON.parse(consent)
    return preferences.analytics
  } catch {
    return false
  }
}

// Helper function to check if marketing is enabled
export function isMarketingEnabled(): boolean {
  if (typeof window === 'undefined') return false

  const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
  if (!consent) return false

  try {
    const preferences: CookiePreferences = JSON.parse(consent)
    return preferences.marketing
  } catch {
    return false
  }
}
