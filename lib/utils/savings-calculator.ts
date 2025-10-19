// Savings Calculator Utility
// Calculates how much users save using DealDirect vs traditional agents

export interface SavingsCalculation {
  propertyPrice: number
  traditionalAgentFee: number
  platformFee: number
  estimatedLawyerFee: number
  totalDealDirectCost: number
  totalSavings: number
  savingsPercentage: number
  buyerAgentFee: number
  sellerAgentFee: number
  currency: string
  currencySymbol: string
}

// Agent commission rates by country
const AGENT_COMMISSION_RATES = {
  ZA: { // South Africa
    buyer: 0.03,  // 3% buyer's agent
    seller: 0.03, // 3% seller's agent
    total: 0.06   // 6% total
  },
  NA: { // Namibia
    buyer: 0.025, // 2.5% buyer's agent
    seller: 0.025, // 2.5% seller's agent
    total: 0.05   // 5% total
  }
}

// Tiered platform fees based on property value
// Fee is collected by lawyer and included in closing costs
export const PLATFORM_FEE_TIERS = [
  { max: 500000, fee: 3000, label: 'Under R500K' },
  { max: 1000000, fee: 6000, label: 'R500K - R1M' },
  { max: 2000000, fee: 10000, label: 'R1M - R2M' },
  { max: 5000000, fee: 15000, label: 'R2M - R5M' },
  { max: Infinity, fee: 25000, label: 'R5M+' },
]

// Estimated lawyer conveyancing fees by property value
// These are typical ranges - actual fees vary by lawyer
export const ESTIMATED_LAWYER_FEES = [
  { max: 500000, fee: 15000 },
  { max: 1000000, fee: 18000 },
  { max: 2000000, fee: 22000 },
  { max: 5000000, fee: 30000 },
  { max: Infinity, fee: 40000 },
]

// Calculate platform fee based on property value
export function getPlatformFee(propertyPrice: number): number {
  const tier = PLATFORM_FEE_TIERS.find(t => propertyPrice <= t.max)
  return tier?.fee || PLATFORM_FEE_TIERS[PLATFORM_FEE_TIERS.length - 1].fee
}

// Get estimated lawyer conveyancing fee
export function getEstimatedLawyerFee(propertyPrice: number): number {
  const tier = ESTIMATED_LAWYER_FEES.find(t => propertyPrice <= t.max)
  return tier?.fee || ESTIMATED_LAWYER_FEES[ESTIMATED_LAWYER_FEES.length - 1].fee
}

// Get fee tier label for display
export function getFeeTierLabel(propertyPrice: number): string {
  const tier = PLATFORM_FEE_TIERS.find(t => propertyPrice <= t.max)
  return tier?.label || PLATFORM_FEE_TIERS[PLATFORM_FEE_TIERS.length - 1].label
}

export function calculateSavings(
  propertyPrice: number,
  countryCode: string = 'ZA',
  currency: string = 'ZAR'
): SavingsCalculation {
  const rates = AGENT_COMMISSION_RATES[countryCode as keyof typeof AGENT_COMMISSION_RATES] || AGENT_COMMISSION_RATES.ZA
  const currencySymbol = currency === 'NAD' ? 'N$' : 'R'

  // Calculate traditional agent fees
  const buyerAgentFee = Math.round(propertyPrice * rates.buyer)
  const sellerAgentFee = Math.round(propertyPrice * rates.seller)
  const traditionalAgentFee = buyerAgentFee + sellerAgentFee

  // Get tiered platform fee and estimated lawyer fee
  const platformFee = getPlatformFee(propertyPrice)
  const estimatedLawyerFee = getEstimatedLawyerFee(propertyPrice)
  const totalDealDirectCost = platformFee + estimatedLawyerFee

  // Calculate savings
  const totalSavings = traditionalAgentFee - totalDealDirectCost
  const savingsPercentage = (totalSavings / traditionalAgentFee) * 100

  return {
    propertyPrice,
    traditionalAgentFee,
    platformFee,
    estimatedLawyerFee,
    totalDealDirectCost,
    totalSavings,
    savingsPercentage,
    buyerAgentFee,
    sellerAgentFee,
    currency,
    currencySymbol
  }
}

export function formatSavingsDisplay(savings: SavingsCalculation) {
  const format = (amount: number) =>
    new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  return {
    propertyPrice: `${savings.currencySymbol}${format(savings.propertyPrice)}`,
    traditionalAgentFee: `${savings.currencySymbol}${format(savings.traditionalAgentFee)}`,
    platformFee: `${savings.currencySymbol}${format(savings.platformFee)}`,
    estimatedLawyerFee: `${savings.currencySymbol}${format(savings.estimatedLawyerFee)}`,
    totalDealDirectCost: `${savings.currencySymbol}${format(savings.totalDealDirectCost)}`,
    totalSavings: `${savings.currencySymbol}${format(savings.totalSavings)}`,
    savingsPercentage: `${savings.savingsPercentage.toFixed(0)}%`,
    buyerAgentFee: `${savings.currencySymbol}${format(savings.buyerAgentFee)}`,
    sellerAgentFee: `${savings.currencySymbol}${format(savings.sellerAgentFee)}`
  }
}