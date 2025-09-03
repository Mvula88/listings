// Savings Calculator Utility
// Calculates how much users save using DealDirect vs traditional agents

export interface SavingsCalculation {
  propertyPrice: number
  traditionalAgentFee: number
  dealDirectFee: number
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

// DealDirect flat fees
export const DEALDIRECT_FEES = {
  buyer: 1000,  // R1,000 or N$1,000
  seller: 1000, // R1,000 or N$1,000
  total: 2000   // R2,000 or N$2,000 total
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
  
  // DealDirect flat fee
  const dealDirectFee = DEALDIRECT_FEES.total
  
  // Calculate savings
  const totalSavings = traditionalAgentFee - dealDirectFee
  const savingsPercentage = (totalSavings / traditionalAgentFee) * 100
  
  return {
    propertyPrice,
    traditionalAgentFee,
    dealDirectFee,
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
    dealDirectFee: `${savings.currencySymbol}${format(savings.dealDirectFee)}`,
    totalSavings: `${savings.currencySymbol}${format(savings.totalSavings)}`,
    savingsPercentage: `${savings.savingsPercentage.toFixed(0)}%`,
    buyerAgentFee: `${savings.currencySymbol}${format(savings.buyerAgentFee)}`,
    sellerAgentFee: `${savings.currencySymbol}${format(savings.sellerAgentFee)}`
  }
}