'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Star, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Award,
  Languages,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'

interface LawyerSelectionFormProps {
  lawyers: any[]
  transaction: any
  userRole: 'buyer' | 'seller'
}

export function LawyerSelectionForm({ lawyers, transaction, userRole }: LawyerSelectionFormProps) {
  const [selectedLawyer, setSelectedLawyer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase: any = createClient()

  async function handleConfirmSelection() {
    if (!selectedLawyer) return

    setLoading(true)
    try {
      // Update transaction with selected lawyer
      const updateData = userRole === 'buyer' 
        ? { lawyer_buyer_id: selectedLawyer }
        : { lawyer_seller_id: selectedLawyer }

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transaction.id)

      if (error) throw error

      // Create lawyer match record
      await supabase
        .from('lawyer_matches')
        .insert({
          transaction_id: transaction.id,
          user_id: userRole === 'buyer' ? transaction.buyer_id : transaction.seller_id,
          lawyer_id: selectedLawyer,
          user_type: userRole,
          status: 'selected',
          selected_at: new Date().toISOString()
        })

      // Check if both parties have selected lawyers
      const { data: updatedTransaction } = await supabase
        .from('transactions')
        .select('lawyer_buyer_id, lawyer_seller_id')
        .eq('id', transaction.id)
        .single()

      if (updatedTransaction?.lawyer_buyer_id && updatedTransaction?.lawyer_seller_id) {
        // Update transaction status
        await supabase
          .from('transactions')
          .update({ 
            status: 'lawyers_selected',
            lawyers_selected_at: new Date().toISOString()
          })
          .eq('id', transaction.id)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/transactions/${transaction.id}`)
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error('Error selecting lawyer:', error)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Conveyancer Selected Successfully!</h3>
          <p className="text-muted-foreground">
            They will contact you within 24 hours to begin the process.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Conveyancers</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedLawyer || ''} onValueChange={setSelectedLawyer}>
            <div className="space-y-4">
              {lawyers.map((lawyer) => {
                const fee = userRole === 'buyer' ? lawyer.flat_fee_buyer : lawyer.flat_fee_seller
                const initials = lawyer.profile?.full_name
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()

                return (
                  <Label
                    key={lawyer.id}
                    htmlFor={lawyer.id}
                    className="cursor-pointer"
                  >
                    <Card className={selectedLawyer === lawyer.id ? 'border-primary' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <RadioGroupItem value={lawyer.id} id={lawyer.id} />
                          
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={lawyer.profile?.avatar_url} />
                            <AvatarFallback>{initials || 'LW'}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{lawyer.firm_name}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{lawyer.city}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">
                                  {formatPrice(fee, 'ZAR')}
                                </p>
                                <p className="text-xs text-muted-foreground">Flat fee</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{lawyer.rating || 0}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Award className="h-4 w-4 text-muted-foreground" />
                                <span>{lawyer.transactions_completed} deals</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{lawyer.years_experience} years exp.</span>
                              </div>
                              
                              {lawyer.verified && (
                                <Badge variant="success" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            
                            {lawyer.languages && lawyer.languages.length > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <Languages className="h-4 w-4 text-muted-foreground" />
                                <div className="flex gap-1">
                                  {lawyer.languages.map((lang: string) => (
                                    <Badge key={lang} variant="secondary" className="text-xs">
                                      {lang}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {lawyer.bio && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {lawyer.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                )
              })}
            </div>
          </RadioGroup>
          
          {lawyers.length === 0 && (
            <Alert>
              <AlertDescription>
                No conveyancers available in your area. Please check back later.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {selectedLawyer && (
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={handleConfirmSelection}
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Conveyancer Selection
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}