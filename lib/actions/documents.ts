'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { DocumentType } from '@/lib/types/documents'

export async function uploadDocument(
  transactionId: string,
  documentType: DocumentType,
  file: File,
  notes?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify user is part of this transaction
  const { data: transaction } = await supabase
    .from('transactions')
    .select('buyer_id, seller_id')
    .eq('id', transactionId)
    .single<{ buyer_id: string; seller_id: string }>()

  if (!transaction) {
    return { success: false, error: 'Transaction not found' }
  }

  const isBuyer = transaction.buyer_id === user.id
  const isSeller = transaction.seller_id === user.id

  if (!isBuyer && !isSeller) {
    return { success: false, error: 'Not authorized to upload documents to this transaction' }
  }

  const role = isBuyer ? 'buyer' : 'seller'

  // Upload file to storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${transactionId}/${user.id}/${documentType}_${Date.now()}.${fileExt}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('transaction-documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return { success: false, error: 'Failed to upload file' }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('transaction-documents')
    .getPublicUrl(fileName)

  // Create document record
  const { data: document, error: docError } = await (supabase as any)
    .from('transaction_documents')
    .insert({
      transaction_id: transactionId,
      document_type: documentType,
      document_name: file.name,
      file_url: publicUrl,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: user.id,
      uploaded_by_role: role,
      notes,
    })
    .select()
    .single()

  if (docError) {
    console.error('Document record error:', docError)
    // Try to delete the uploaded file
    await supabase.storage.from('transaction-documents').remove([fileName])
    return { success: false, error: 'Failed to save document record' }
  }

  revalidatePath(`/transactions/${transactionId}`)
  return { success: true, document }
}

export async function deleteDocument(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get document to verify ownership
  const { data: document } = await (supabase as any)
    .from('transaction_documents')
    .select('*, transaction:transactions(buyer_id, seller_id)')
    .eq('id', documentId)
    .single()

  if (!document) {
    return { success: false, error: 'Document not found' }
  }

  // Only the uploader can delete
  if (document.uploaded_by !== user.id) {
    return { success: false, error: 'Not authorized to delete this document' }
  }

  // Extract file path from URL and delete from storage
  try {
    const url = new URL(document.file_url)
    const pathParts = url.pathname.split('/transaction-documents/')
    if (pathParts.length > 1) {
      const filePath = decodeURIComponent(pathParts[1])
      await supabase.storage.from('transaction-documents').remove([filePath])
    }
  } catch (e) {
    console.error('Error deleting file from storage:', e)
  }

  // Delete document record
  const { error } = await (supabase as any)
    .from('transaction_documents')
    .delete()
    .eq('id', documentId)

  if (error) {
    return { success: false, error: 'Failed to delete document' }
  }

  revalidatePath(`/transactions/${document.transaction_id}`)
  return { success: true }
}

export async function getTransactionDocuments(transactionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { documents: [], error: 'Not authenticated' }
  }

  const { data: documents, error } = await (supabase as any)
    .from('transaction_documents')
    .select(`
      *,
      uploader:profiles!uploaded_by(id, full_name, avatar_url),
      verifier:profiles!verified_by(id, full_name)
    `)
    .eq('transaction_id', transactionId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    return { documents: [], error: 'Failed to fetch documents' }
  }

  return { documents: documents || [] }
}

export async function verifyDocument(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if user is admin or lawyer for this transaction
  const { data: document } = await (supabase as any)
    .from('transaction_documents')
    .select('transaction_id')
    .eq('id', documentId)
    .single()

  if (!document) {
    return { success: false, error: 'Document not found' }
  }

  const { data: transaction } = await supabase
    .from('transactions')
    .select('lawyer_buyer_id, lawyer_seller_id')
    .eq('id', document.transaction_id)
    .single<{ lawyer_buyer_id: string | null; lawyer_seller_id: string | null }>()

  // Check if user is admin
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  // Check if user is one of the lawyers
  const isLawyer = transaction?.lawyer_buyer_id === user.id ||
                   transaction?.lawyer_seller_id === user.id

  if (!adminProfile && !isLawyer) {
    return { success: false, error: 'Not authorized to verify documents' }
  }

  const { error } = await (supabase as any)
    .from('transaction_documents')
    .update({
      verified: true,
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq('id', documentId)

  if (error) {
    return { success: false, error: 'Failed to verify document' }
  }

  revalidatePath(`/transactions/${document.transaction_id}`)
  return { success: true }
}

export async function getMyTransactions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { transactions: [], error: 'Not authenticated' }
  }

  const { data: transactions, error } = await (supabase as any)
    .from('transactions')
    .select(`
      *,
      property:properties(
        id, title, city, province, price,
        property_images(url, order_index),
        country:countries(currency_symbol)
      ),
      buyer:profiles!buyer_id(id, full_name, email, avatar_url),
      seller:profiles!seller_id(id, full_name, email, avatar_url),
      offer:property_offers(id, offer_amount, payment_type)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
    return { transactions: [], error: 'Failed to fetch transactions' }
  }

  return { transactions: transactions || [] }
}

export async function getTransaction(transactionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { transaction: null, error: 'Not authenticated' }
  }

  const { data: transaction, error } = await (supabase as any)
    .from('transactions')
    .select(`
      *,
      property:properties(
        id, title, address, city, province, postal_code, price,
        bedrooms, bathrooms, property_size, erf_size,
        property_images(url, order_index),
        country:countries(currency_symbol)
      ),
      buyer:profiles!buyer_id(id, full_name, email, phone, avatar_url),
      seller:profiles!seller_id(id, full_name, email, phone, avatar_url),
      offer:property_offers(id, offer_amount, payment_type, financing_status, message)
    `)
    .eq('id', transactionId)
    .single()

  if (error) {
    console.error('Error fetching transaction:', error)
    return { transaction: null, error: 'Transaction not found' }
  }

  // Verify user has access
  if (transaction.buyer_id !== user.id && transaction.seller_id !== user.id) {
    return { transaction: null, error: 'Not authorized to view this transaction' }
  }

  return { transaction, userRole: transaction.buyer_id === user.id ? 'buyer' : 'seller' }
}

export async function createTransactionFromOffer(offerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get the offer details
  const { data: offer, error: offerError } = await (supabase as any)
    .from('property_offers')
    .select('*')
    .eq('id', offerId)
    .eq('status', 'accepted')
    .single()

  if (offerError || !offer) {
    return { success: false, error: 'Offer not found or not accepted' }
  }

  // Verify user is the seller
  if (offer.seller_id !== user.id) {
    return { success: false, error: 'Only the seller can initiate transactions' }
  }

  // Check if transaction already exists
  if (offer.transaction_id) {
    return { success: true, transactionId: offer.transaction_id }
  }

  // Create the transaction
  const { data: transaction, error: txError } = await (supabase as any)
    .from('transactions')
    .insert({
      property_id: offer.property_id,
      buyer_id: offer.buyer_id,
      seller_id: offer.seller_id,
      agreed_price: offer.counter_amount || offer.offer_amount,
      status: 'initiated',
    })
    .select()
    .single()

  if (txError) {
    console.error('Transaction creation error:', txError)
    return { success: false, error: 'Failed to create transaction' }
  }

  // Link transaction to offer
  await (supabase as any)
    .from('property_offers')
    .update({ transaction_id: transaction.id })
    .eq('id', offerId)

  revalidatePath('/transactions')
  revalidatePath('/offers')
  return { success: true, transactionId: transaction.id }
}
