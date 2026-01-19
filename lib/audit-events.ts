/**
 * Unified Audit Events Utility
 * 
 * Single function for logging all audit events across all portals.
 * Logs at data boundaries: OAuth callbacks, API routes, server actions.
 * 
 * Usage:
 *   import { logAuditEvent, getClientIP } from '@/lib/audit-events'
 * 
 *   await logAuditEvent(supabase, {
 *     event_type: 'login',
 *     event_category: 'auth',
 *     portal: 'firedrill',
 *     action: 'success',
 *     user_id: user.id,
 *     user_email: user.email,
 *     ip_address: getClientIP(request),
 *     metadata: { login_method: 'google_oauth', role_assigned: 'admin' }
 *   })
 */

import { SupabaseClient, createClient } from '@supabase/supabase-js'

export interface AuditEventParams {
  /** Event type: 'login', 'logout', 'data_change', 'access', 'api_call', 'system' */
  event_type: 'login' | 'logout' | 'data_change' | 'access' | 'api_call' | 'system'
  /** Event category: 'auth', 'data', 'access', 'system' */
  event_category: 'auth' | 'data' | 'access' | 'system'
  /** Portal name: 'enrollment', 'attendance', 'dismissal', etc. */
  portal: string
  /** Action: 'success', 'failure', 'create', 'update', 'delete', 'allowed', 'redirected', 'blocked' */
  action?: string
  /** User ID (null if not authenticated) */
  user_id?: string | null
  /** User email (null if not authenticated) */
  user_email?: string | null
  /** User name (optional) */
  user_name?: string | null
  /** IP address */
  ip_address?: string | null
  /** User agent */
  user_agent?: string | null
  /** Source URL (where action was initiated) */
  source_url?: string | null
  /** Target URL (where user was redirected or resource accessed) */
  target_url?: string | null
  /** Flexible metadata (event-specific data) */
  metadata?: Record<string, any>
}

/**
 * Creates a service role Supabase client for audit logging.
 * This bypasses RLS and ensures inserts always work.
 */
function createServiceRoleClient(): SupabaseClient | null {
  try {
    if (typeof process !== 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rkfwphowryckqkozscfi.supabase.co'
      return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
    }
  } catch (err) {
    console.error('[Audit Events] Failed to create service role client:', err)
  }
  return null
}

/**
 * Logs an audit event to the audit_events table.
 * 
 * This function is designed to never throw errors - if logging fails,
 * it will only log to console.error to prevent breaking the main flow.
 * 
 * It will try to use service_role key if available (server-side), otherwise
 * falls back to the provided client (which must be authenticated for RLS).
 * 
 * @param supabase - Supabase client instance (can be client or server)
 * @param params - Audit event parameters
 * @returns Promise that resolves when logging is complete (or failed silently)
 */
export async function logAuditEvent(
  supabase: SupabaseClient,
  params: AuditEventParams
): Promise<void> {
  try {
    // Try to use service role client first (server-side only, bypasses RLS)
    const serviceRoleClient = createServiceRoleClient()
    const clientToUse = serviceRoleClient || supabase

    const eventData = {
      event_type: params.event_type,
      event_category: params.event_category,
      portal: params.portal,
      action: params.action || null,
      user_id: params.user_id || null,
      user_email: params.user_email || null,
      user_name: params.user_name || null,
      ip_address: params.ip_address || null,
      user_agent: params.user_agent || 
        (typeof navigator !== 'undefined' ? navigator.userAgent : null),
      source_url: params.source_url || null,
      target_url: params.target_url || null,
      metadata: params.metadata || null,
    }

    const { data, error } = await clientToUse.from('audit_events').insert(eventData).select()

    if (error) {
      console.error('[Audit Events] Failed to log event:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        portal: params.portal,
        event_type: params.event_type,
        user_email: params.user_email,
        usingServiceRole: !!serviceRoleClient,
      })
    }
  } catch (err) {
    // Catch any unexpected errors and log them, but don't throw
    console.error('[Audit Events] Unexpected error logging event:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      portal: params.portal,
      event_type: params.event_type,
    })
  }
}

/**
 * Extracts client IP address from request headers.
 * 
 * Handles various proxy headers:
 * - x-forwarded-for (most common, may contain multiple IPs)
 * - x-real-ip (fallback)
 * 
 * @param request - Request object (Next.js Request or standard Request)
 * @returns IP address string or null if not available
 */
export function getClientIP(request: Request): string | null {
  try {
    // Check x-forwarded-for header (most common in production)
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
      // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
      // We want the original client IP (first one)
      return forwarded.split(',')[0].trim()
    }

    // Fallback to x-real-ip
    const realIP = request.headers.get('x-real-ip')
    if (realIP) {
      return realIP.trim()
    }

    // No IP available (client-side requests, localhost, etc.)
    return null
  } catch (err) {
    // If anything goes wrong, return null rather than throwing
    console.error('[Audit Events] Error extracting IP address:', err)
    return null
  }
}
