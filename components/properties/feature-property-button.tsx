'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Zap, Check, Loader2, TrendingUp } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'

interface FeaturePropertyButtonProps {
  propertyId: string
  currentlyFeatured?: boolean
  featuredUntil?: string
}

export function FeaturePropertyButton({
  propertyId,
  currentlyFeatured = false,
  featuredUntil
}: FeaturePropertyButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const plans = [
    {
      id: 'featured_7',
      name: 'Featured',
      duration: '7 Days',
      price: 49,
      features: [
        'Highlighted in search results',
        'Featured badge',
        'Priority in listings',
        '3x more visibility'
      ],
      icon: Star,
      color: 'text-blue-600'
    },
    {
      id: 'featured_30',
      name: 'Featured',
      duration: '30 Days',
      price: 149,
      features: [
        'Highlighted in search results',
        'Featured badge',
        'Priority in listings',
        '3x more visibility'
      ],
      icon: Star,
      color: 'text-blue-600',
      popular: true
    },
    {
      id: 'premium_30',
      name: 'Premium',
      duration: '30 Days',
      price: 299,
      features: [
        'Everything in Featured',
        'Top placement guarantee',
        'Premium badge',
        'Featured on homepage',
        '10x more visibility'
      ],
      icon: Zap,
      color: 'text-yellow-600'
    }
  ]

  async function handleCheckout(planId: string) {
    setLoading(planId)
    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          plan: planId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {currentlyFeatured ? (
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
            Extend Featured
          </Button>
        ) : (
          <Button size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Feature This Property
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Feature Your Property</DialogTitle>
          <DialogDescription>
            Get more views and inquiries with featured placement
          </DialogDescription>
        </DialogHeader>

        {currentlyFeatured && featuredUntil && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-900">
              <strong>Currently featured until:</strong>{' '}
              {new Date(featuredUntil).toLocaleDateString()}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Extend your featured listing to continue getting premium visibility
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card
                key={plan.id}
                className={plan.popular ? 'border-primary border-2 relative' : ''}
              >
                {plan.popular && (
                  <Badge
                    className="absolute -top-2 left-1/2 -translate-x-1/2"
                    variant="default"
                  >
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-2 ${plan.color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.duration}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{formatPrice(plan.price, 'ZAR')}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <Check className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleCheckout(plan.id)}
                    disabled={loading !== null}
                  >
                    {loading === plan.id && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {currentlyFeatured ? 'Extend' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-primary" />
            Why Feature Your Property?
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6">
            <li>• Appear at the top of search results</li>
            <li>• Get highlighted with a special badge</li>
            <li>• Receive 3-10x more views and inquiries</li>
            <li>• Sell faster - featured properties sell 50% quicker</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
