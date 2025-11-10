/**
 * Admin Panel Middleware
 * Handles authentication, authorization, and security for admin routes
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/types/database'

export type AdminRole = 'super_admin' | 'admin' | 'moderator'
export type AdminPermission = string // TODO: Define specific admin permissions enum

interface AdminProfile {
  id: string
  role: AdminRole
  permissions: AdminPermission[]
  is_active: boolean
  last_login_at: string | null
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(request: NextRequest): Promise<{
  isAdmin: boolean
  admin: AdminProfile | null
  supabase: any
}> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    }
  )

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { isAdmin: false, admin: null, supabase }
  }

  // Check if user has admin profile
  const { data: adminProfile, error: adminError } = await supabase
    .from('admin_profiles')
    .select('id, role, permissions, is_active, last_login_at')
    .eq('id', user.id)
    .eq('is_active', true)
    .single()

  if (adminError || !adminProfile) {
    return { isAdmin: false, admin: null, supabase }
  }

  return {
    isAdmin: true,
    admin: adminProfile as AdminProfile,
    supabase,
  }
}

/**
 * Check if admin has specific permission
 */
export function hasPermission(
  admin: AdminProfile,
  permission: AdminPermission
): boolean {
  // Super admins have all permissions
  if (admin.role === 'super_admin') {
    return true
  }

  // Check if permission exists in admin's permissions
  return admin.permissions.includes(permission)
}

/**
 * Require admin authentication for a route
 */
export async function requireAdmin(request: NextRequest) {
  const { isAdmin: isAdminUser, admin, supabase } = await isAdmin(request)

  if (!isAdminUser || !admin) {
    // Redirect to login with return URL
    const url = new URL('/login', request.url)
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    url.searchParams.set('error', 'admin_access_required')
    return NextResponse.redirect(url)
  }

  // Update last activity
  await supabase
    .from('admin_profiles')
    .update({
      last_login_at: new Date().toISOString(),
      last_login_ip: request.ip || request.headers.get('x-forwarded-for'),
    })
    .eq('id', admin.id)

  return NextResponse.next()
}

/**
 * Require specific permission for a route
 */
export async function requirePermission(
  request: NextRequest,
  permission: AdminPermission
) {
  const { isAdmin: isAdminUser, admin } = await isAdmin(request)

  if (!isAdminUser || !admin) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    url.searchParams.set('error', 'admin_access_required')
    return NextResponse.redirect(url)
  }

  if (!hasPermission(admin, permission)) {
    const url = new URL('/admin', request.url)
    url.searchParams.set('error', 'insufficient_permissions')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

/**
 * Require super admin role
 */
export async function requireSuperAdmin(request: NextRequest) {
  const { isAdmin: isAdminUser, admin } = await isAdmin(request)

  if (!isAdminUser || !admin || admin.role !== 'super_admin') {
    const url = new URL('/admin', request.url)
    url.searchParams.set('error', 'super_admin_required')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

/**
 * Log admin action to audit trail
 */
export async function logAdminAction(
  supabase: any,
  adminId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  oldValues: any = null,
  newValues: any = null,
  metadata: any = {}
) {
  const { error } = await supabase.from('audit_logs').insert({
    admin_id: adminId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    old_values: oldValues,
    new_values: newValues,
    metadata,
  })

  if (error) {
    console.error('Failed to log admin action:', error)
  }
}

/**
 * Create admin notification
 */
export async function createAdminNotification(
  supabase: any,
  title: string,
  message: string,
  type: 'alert' | 'warning' | 'info' | 'success' = 'info',
  priority: 'low' | 'normal' | 'high' | 'critical' = 'normal',
  actionUrl?: string
) {
  const { error } = await supabase.from('admin_notifications').insert({
    title,
    message,
    type,
    priority,
    action_url: actionUrl,
  })

  if (error) {
    console.error('Failed to create admin notification:', error)
  }
}

/**
 * Rate limiting for admin actions (enhanced security)
 */
const adminActionCounts = new Map<string, { count: number; resetAt: number }>()

export function checkAdminRateLimit(
  adminId: string,
  action: string,
  maxActions: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const key = `${adminId}:${action}`
  const now = Date.now()
  const record = adminActionCounts.get(key)

  if (!record || now > record.resetAt) {
    adminActionCounts.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= maxActions) {
    return false
  }

  record.count++
  return true
}
