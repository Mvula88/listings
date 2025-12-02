export type DocumentType =
  | 'fica_id'
  | 'fica_proof_of_address'
  | 'fica_proof_of_income'
  | 'pre_approval_letter'
  | 'offer_to_purchase'
  | 'deed_of_sale'
  | 'compliance_certificate'
  | 'rates_clearance'
  | 'levy_clearance'
  | 'electrical_certificate'
  | 'plumbing_certificate'
  | 'other'

export const documentTypeLabels: Record<DocumentType, string> = {
  fica_id: 'FICA - ID Document',
  fica_proof_of_address: 'FICA - Proof of Address',
  fica_proof_of_income: 'FICA - Proof of Income',
  pre_approval_letter: 'Pre-Approval Letter',
  offer_to_purchase: 'Offer to Purchase',
  deed_of_sale: 'Deed of Sale',
  compliance_certificate: 'Compliance Certificate',
  rates_clearance: 'Rates Clearance Certificate',
  levy_clearance: 'Levy Clearance Certificate',
  electrical_certificate: 'Electrical Certificate (CoC)',
  plumbing_certificate: 'Plumbing Certificate',
  other: 'Other Document',
}

// Document types required from buyer
export const buyerDocumentTypes: DocumentType[] = [
  'fica_id',
  'fica_proof_of_address',
  'fica_proof_of_income',
  'pre_approval_letter',
]

// Document types required from seller
export const sellerDocumentTypes: DocumentType[] = [
  'fica_id',
  'fica_proof_of_address',
  'compliance_certificate',
  'rates_clearance',
  'levy_clearance',
  'electrical_certificate',
  'plumbing_certificate',
]
