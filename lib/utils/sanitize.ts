// HTML Sanitization utility to prevent XSS attacks
// Uses DOMPurify for secure HTML sanitization

import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows safe HTML tags for blog content while removing dangerous scripts
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty) return ''

  // Configure DOMPurify to allow certain safe tags and attributes
  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
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
    ALLOWED_ATTR: [
      // Global attributes
      'id', 'class', 'style', 'title', 'lang', 'dir',
      // Links
      'href', 'target', 'rel',
      // Images
      'src', 'alt', 'width', 'height', 'loading',
      // Tables
      'colspan', 'rowspan', 'scope',
      // Time
      'datetime',
      // Data attributes (for styling)
      'data-*',
    ],
    // Security settings
    ALLOW_DATA_ATTR: true,
    ADD_ATTR: ['target'], // Allow target attribute for links
    ADD_TAGS: [], // No additional tags
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    // Force all links to open in new tab safely
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    WHOLE_DOCUMENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  })

  return clean
}

/**
 * Sanitize plain text - strips all HTML tags
 * Useful for user-generated content that shouldn't contain HTML
 */
export function sanitizeText(dirty: string): string {
  if (!dirty) return ''

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML allowed
    ALLOWED_ATTR: [],
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
