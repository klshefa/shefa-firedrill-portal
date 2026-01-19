import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getCookieDomain } from '@/lib/utils/cookieDomain'
import { logAuditEvent, getClientIP } from '@/lib/audit-events'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const ipAddress = getClientIP(request)

  if (code) {
    const cookieStore = await cookies()
    const cookieDomain = getCookieDomain()
    
    const supabase = createServerClient(
      'https://rkfwphowryckqkozscfi.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrZndwaG93cnlja3Frb3pzY2ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Mzg2MTEsImV4cCI6MjA3MzAxNDYxMX0.BRxY8LGo1iVhO-9j6eVc_vQ4UcXWa8uweOsY_DDuhq4',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({
                name,
                value,
                ...options,
                domain: cookieDomain,
                secure: true,
                sameSite: 'lax',
                path: '/',
              })
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      // Log failed login attempt
      await logAuditEvent(supabase, {
        event_type: 'login',
        event_category: 'auth',
        portal: 'firedrill',
        action: 'failure',
        user_email: null,
        ip_address: ipAddress,
        user_agent: request.headers.get('user-agent'),
        source_url: request.url,
        metadata: {
          login_method: 'google_oauth',
          failure_reason: 'oauth_exchange_failed',
          error_message: error.message,
        },
      })
      return NextResponse.redirect(`${origin}/?error=auth_callback_error`)
    }

    // Get user info after successful exchange
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user?.email) {
      // Check domain restriction
      if (!user.email.endsWith('@shefaschool.org')) {
        await supabase.auth.signOut()
        
        await logAuditEvent(supabase, {
          event_type: 'login',
          event_category: 'auth',
          portal: 'firedrill',
          action: 'access_denied',
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.full_name || null,
          ip_address: ipAddress,
          user_agent: request.headers.get('user-agent'),
          source_url: request.url,
          target_url: `${origin}/?error=unauthorized_domain`,
          metadata: {
            login_method: 'google_oauth',
            failure_reason: 'domain_restriction',
            error_message: 'Email domain not allowed',
          },
        })
        
        return NextResponse.redirect(`${origin}/?error=unauthorized_domain`)
      }

      // Check if user has access to Fire Drill Portal
      const { data: accessData } = await supabase
        .from('firedrill_admins')
        .select('*')
        .eq('email', user.email.toLowerCase())
        .maybeSingle()

      if (!accessData) {
        // User not in firedrill_admins table - access denied
        await logAuditEvent(supabase, {
          event_type: 'login',
          event_category: 'auth',
          portal: 'firedrill',
          action: 'access_denied',
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.full_name || null,
          ip_address: ipAddress,
          user_agent: request.headers.get('user-agent'),
          source_url: request.url,
          target_url: `${origin}/?error=no_access`,
          metadata: {
            login_method: 'google_oauth',
            failure_reason: 'no_access',
            error_message: 'User not in firedrill_admins table',
          },
        })
        
        return NextResponse.redirect(`${origin}/?error=no_access`)
      }

      // Log successful login
      await logAuditEvent(supabase, {
        event_type: 'login',
        event_category: 'auth',
        portal: 'firedrill',
        action: 'success',
        user_id: user.id,
        user_email: user.email,
        user_name: user.user_metadata?.full_name || null,
        ip_address: ipAddress,
        user_agent: request.headers.get('user-agent'),
        source_url: request.url,
        target_url: `${origin}${next}`,
        metadata: {
          login_method: 'google_oauth',
          access_granted: true,
        },
      })
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_callback_error`)
}
