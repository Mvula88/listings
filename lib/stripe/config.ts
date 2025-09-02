export const PAYMENT_CONFIG = {
  SUCCESS_FEE: {
    buyer: 1000, // R1,000 or N$1,000
    seller: 1000,
    total: 2000
  },
  LAWYER_REFERRAL: {
    perClient: 750,
    billingCycle: 'monthly' as const
  },
  PREMIUM_LISTING: {
    basic: 0,
    premium: 299,
    featured: 499
  }
}