'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAdmin(userEmail: string | null | undefined) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function checkAdmin() {
      if (!userEmail) {
        setIsAdmin(false)
        setIsSuperAdmin(false)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('firedrill_admins')
        .select('role')
        .eq('email', userEmail.toLowerCase())
        .single()

      if (error || !data) {
        setIsAdmin(false)
        setIsSuperAdmin(false)
      } else {
        setIsAdmin(true)
        setIsSuperAdmin(data.role === 'super_admin')
      }
      setLoading(false)
    }

    checkAdmin()
  }, [userEmail, supabase])

  return { isAdmin, isSuperAdmin, loading }
}

