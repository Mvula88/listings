import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FadeIn } from '@/components/ui/fade-in'
import { getTransaction, getTransactionDocuments, buyerDocumentTypes, sellerDocumentTypes, documentTypeLabels, DocumentType } from '@/lib/actions/documents'
import { DocumentUpload } from '@/components/documents/document-upload'
import { DocumentList } from '@/components/documents/document-list'
import { formatPrice } from '@/lib/utils/format'
import {
  Building,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  Clock,
  ArrowLeft,
  Home,
  Ruler,
  Bath,
  BedDouble,
  AlertCircle,
} from 'lucide-react'

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getTransaction(id) as any

  if (result.error || !result.transaction) {
    notFound()
  }

  const transaction = result.transaction
  const userRole = result.userRole as 'buyer' | 'seller'

  const { documents } = await getTransactionDocuments(id)

  const property = transaction.property
  const otherParty = userRole === 'buyer' ? transaction.seller : transaction.buyer
  const primaryImage = property?.property_images?.sort((a: any, b: any) => a.order_index - b.order_index)[0]

  // Calculate document completion
  const requiredDocs = userRole === 'buyer' ? buyerDocumentTypes : sellerDocumentTypes
  const myUploadedDocs = documents.filter((d: any) => d.uploaded_by === user.id)
  const myDocTypes = new Set(myUploadedDocs.map((d: any) => d.document_type))
  const completedRequired = requiredDocs.filter(type => myDocTypes.has(type)).length
  const docProgress = Math.round((completedRequired / requiredDocs.length) * 100)

  const getStatusBadge = () => {
    switch (transaction.status) {
      case 'initiated':
        return <Badge className="bg-blue-500">Initiated</Badge>
      case 'lawyers_selected':
        return <Badge className="bg-purple-500">Lawyers Selected</Badge>
      case 'in_progress':
        return <Badge className="bg-orange-500">In Progress</Badge>
      case 'pending_payment':
        return <Badge className="bg-yellow-500">Pending Payment</Badge>
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>
      default:
        return <Badge variant="outline">{transaction.status}</Badge>
    }
  }

  const steps = [
    { key: 'initiated', label: 'Initiated', completed: true },
    { key: 'documents', label: 'Documents', completed: docProgress === 100 },
    { key: 'lawyers_selected', label: 'Lawyers', completed: ['lawyers_selected', 'in_progress', 'pending_payment', 'completed'].includes(transaction.status) },
    { key: 'in_progress', label: 'Processing', completed: ['in_progress', 'pending_payment', 'completed'].includes(transaction.status) },
    { key: 'completed', label: 'Completed', completed: transaction.status === 'completed' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center gap-4 mb-6">
          <Link href="/transactions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Transaction Details</h1>
            <p className="text-muted-foreground">
              Reference: #{transaction.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </FadeIn>

      {/* Progress Steps */}
      <FadeIn delay={0.1}>
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span className="text-xs mt-2 text-center">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 md:w-24 h-1 mx-2 ${
                        steps[index + 1].completed ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Info */}
          <FadeIn delay={0.15}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative w-full md:w-48 h-36 bg-muted rounded-lg overflow-hidden shrink-0">
                    {primaryImage?.url ? (
                      <Image
                        src={primaryImage.url}
                        alt={property?.title || 'Property'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <Link href={`/properties/${property?.id}`} className="text-lg font-semibold hover:text-primary">
                        {property?.title}
                      </Link>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {property?.address}, {property?.city}, {property?.province}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                        {property?.bedrooms} Beds
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4 text-muted-foreground" />
                        {property?.bathrooms} Baths
                      </span>
                      <span className="flex items-center gap-1">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        {property?.property_size}m²
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Agreed Price</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(transaction.agreed_price, property?.country?.currency_symbol)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Documents */}
          <FadeIn delay={0.2}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Documents
                    </CardTitle>
                    <CardDescription>
                      Upload and manage transaction documents
                    </CardDescription>
                  </div>
                  <DocumentUpload transactionId={transaction.id} userRole={userRole!} />
                </div>
              </CardHeader>
              <CardContent>
                {/* Document Checklist */}
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Your Required Documents</span>
                    <span className="text-sm text-muted-foreground">
                      {completedRequired}/{requiredDocs.length} uploaded
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${docProgress}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {requiredDocs.map((type) => (
                      <div
                        key={type}
                        className={`flex items-center gap-2 ${
                          myDocTypes.has(type) ? 'text-green-600' : 'text-muted-foreground'
                        }`}
                      >
                        {myDocTypes.has(type) ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        {documentTypeLabels[type as DocumentType]}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document List */}
                <DocumentList
                  documents={documents}
                  currentUserId={user.id}
                  userRole={userRole!}
                />
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Other Party */}
          <FadeIn delay={0.25}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {userRole === 'buyer' ? 'Seller' : 'Buyer'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {otherParty?.avatar_url ? (
                      <Image
                        src={otherParty.avatar_url}
                        alt={otherParty.full_name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{otherParty?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {userRole === 'buyer' ? 'Property Owner' : 'Buyer'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {otherParty?.email && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={`mailto:${otherParty.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        {otherParty.email}
                      </a>
                    </Button>
                  )}
                  {otherParty?.phone && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={`tel:${otherParty.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        {otherParty.phone}
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Transaction Info */}
          <FadeIn delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transaction Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Type</p>
                  <p className="font-medium capitalize">
                    {transaction.offer?.[0]?.payment_type?.replace('_', ' ') || 'Not specified'}
                  </p>
                </div>
                {transaction.offer?.[0]?.financing_status && (
                  <div>
                    <p className="text-sm text-muted-foreground">Financing Status</p>
                    <p className="font-medium capitalize">
                      {transaction.offer[0].financing_status.replace('_', ' ')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Started</p>
                  <p className="font-medium">
                    {new Date(transaction.created_at).toLocaleDateString('en-ZA', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {transaction.completed_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="font-medium text-green-600">
                      {new Date(transaction.completed_at).toLocaleDateString('en-ZA', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          {/* Actions */}
          {transaction.status === 'initiated' && (
            <FadeIn delay={0.35}>
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Next Step
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your required documents and select a lawyer to proceed with the transaction.
                  </p>
                  <Button className="w-full" asChild>
                    <Link href={`/transactions/${transaction.id}/select-lawyers`}>
                      Select Lawyer
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  )
}
