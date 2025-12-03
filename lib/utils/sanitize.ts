// HTML Sanitization utility to prevent XSS attacks
// Uses sanitize-html for secure HTML sanitization (SSR-safe)

import sanitizeHtml from 'sanitize-html'

// Configuration for sanitize-html
const sanitizeConfig: sanitizeHtml.IOptions = {
  allowedTags: [
    // Text formatting
    'p', 'br', 'hr', 'span', 'div',
    'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    'sub', 'sup', 'mark', 'small',
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Lists
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    // Links and media
    'a', 'img', 'figure', 'figcaption',
    // Tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    // Quotes and code
    'blockquote', 'q', 'cite', 'code', 'pre', 'kbd', 'samp',
    // Other semantic elements
    'article', 'section', 'aside', 'header', 'footer', 'nav', 'main',
    'address', 'time', 'abbr', 'details', 'summary',
  ],
  allowedAttributes: {
    '*': ['id', 'class', 'style', 'title', 'lang', 'dir'],
    'a': ['href', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height', 'loading'],
    'td': ['colspan', 'rowspan', 'scope'],
    'th': ['colspan', 'rowspan', 'scope'],
    'col': ['span'],
    'colgroup': ['span'],
    'time': ['datetime'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: true,
  enforceHtmlBoundary: true,
  transformTags: {
    'a': (tagName, attribs) => {
      // Add security attributes to links
      return {
        tagName: 'a',
        attribs: {
          ...attribs,
          rel: 'noopener noreferrer',
        },
      }
    },
  },
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows safe HTML tags for blog content while removing dangerous scripts
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty) return ''

  return sanitizeHtml(dirty, sanitizeConfig)
}

/**
 * Sanitize plain text - strips all HTML tags
 * Useful for user-generated content that shouldn't contain HTML
 */
export function sanitizeText(dirty: string): string {
  if (!dirty) return ''

  return sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {},
  })
}

/**
 * Sanitize URL to prevent javascript: and other malicious protocols
 */
export function sanitizeURL(url: string): string {
  if (!url) return ''

  // Allow only safe protocols
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:']

  try {
    const parsed = new URL(url, 'https://example.com')
    if (!safeProtocols.includes(parsed.protocol)) {
      return ''
    }
    return url
  } catch {
    // If URL parsing fails, return empty string
    return ''
  }
}

/**
 * Escape HTML entities for safe display
 * Use this when you want to display HTML as text
 */
export function escapeHTML(text: string): string {
  if (!text) return ''

  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }

  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char)
}
