// Map currency symbols to ISO currency codes
const currencySymbolToCode: Record<string, string> = {
  'R': 'ZAR',
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  'N$': 'NAD',
  'P': 'BWP',
  'K': 'ZMW',
  'MT': 'MZN',
}

export function formatPrice(amount: number | null | undefined, currencyOrSymbol: string = 'ZAR'): string {
  // Handle null/undefined amount
  if (amount == null) {
    return 'Price not available'
  }

  // Convert symbol to ISO code if needed
  let currency = currencyOrSymbol
  if (currencySymbolToCode[currencyOrSymbol]) {
    currency = currencySymbolToCode[currencyOrSymbol]
  }

  // Validate it's a proper 3-letter ISO code
  if (currency.length !== 3) {
    // Fallback to manual formatting with the symbol
    const formatted = new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
    return `${currencyOrSymbol}${formatted}`
  }

  try {
    const formatter = new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return formatter.format(amount)
  } catch {
    // Fallback if currency code is invalid
    const formatted = new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
    return `${currencyOrSymbol}${formatted}`
  }
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-ZA', {
    dateStyle: 'medium',
  }).format(d)
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} ago`
  }
  if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  }
  return 'Just now'
}