// ============================================================================
// SEO UTILITIES
// ============================================================================
// Helpers for generating SEO-friendly meta tags and Open Graph data
// Usage: generateMetadata() in page components
// ============================================================================

import type { Metadata } from 'next'

interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  author?: string
  noIndex?: boolean
}

const SITE_NAME = 'PropLinka'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://proplinka.com'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

/**
 * Generate comprehensive metadata for Next.js pages
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = DEFAULT_IMAGE,
    url,
    type = 'website',
    publishedTime,
    author,
    noIndex = false,
  } = config

  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
  const canonicalUrl = url ? `${SITE_URL}${url}` : undefined

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: canonicalUrl ? {
      canonical: canonicalUrl,
    } : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type,
      publishedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@proplinka',
      site: '@proplinka',
    },
  }
}

/**
 * Generate property-specific metadata
 */
export function generatePropertyMetadata(property: {
  title: string
  description: string | null
  price: number
  city: string
  province: string | null
  images: Array<{ url: string }> | null
}): Metadata {
  const image = property.images?.[0]?.url || DEFAULT_IMAGE
  const location = property.province
    ? `${property.city}, ${property.province}`
    : property.city

  return generateMetadata({
    title: property.title,
    description: property.description || `${property.title} in ${location}. View property details and contact the seller directly.`,
    keywords: [
      'property for sale',
      property.city,
      property.province || '',
      'commission-free',
      'real estate',
      'proplinka',
    ].filter(Boolean),
    image,
    url: `/properties/${property.title.toLowerCase().replace(/\s+/g, '-')}`,
    type: 'article',
  })
}

/**
 * Generate structured data (JSON-LD) for SEO
 */
export function generatePropertyStructuredData(property: {
  id: string
  title: string
  description: string | null
  price: number
  address_line1: string
  city: string
  province: string | null
  postal_code: string | null
  images: Array<{ url: string }> | null
  bedrooms: number | null
  bathrooms: number | null
  square_meters: number | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SingleFamilyResidence',
    name: property.title,
    description: property.description || '',
    url: `${SITE_URL}/properties/${property.id}`,
    image: property.images?.map(img => img.url) || [],
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address_line1,
      addressLocality: property.city,
      addressRegion: property.province || '',
      postalCode: property.postal_code || '',
      addressCountry: 'ZA', // Assuming South Africa
    },
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'ZAR',
      availability: 'https://schema.org/InStock',
    },
    numberOfRooms: property.bedrooms || undefined,
    numberOfBathroomsTotal: property.bathrooms || undefined,
    floorSize: property.square_meters ? {
      '@type': 'QuantitativeValue',
      value: property.square_meters,
      unitCode: 'MTK', // Square meters
    } : undefined,
  }
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  }
}

/**
 * Generate organization structured data
 */
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Commission-free real estate platform connecting buyers and sellers directly',
    sameAs: [
      'https://twitter.com/proplinka',
      'https://facebook.com/proplinka',
      'https://linkedin.com/company/proplinka',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@proplinka.com',
    },
  }
}
