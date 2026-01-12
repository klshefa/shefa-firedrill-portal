'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface Person {
  person_id: number
  first_name: string
  last_name: string
  full_name: string
  person_type: 'student' | 'staff'
  class_name: string | null
  grade_level?: number | null
  checked_in: boolean
  out_today: boolean
  checked_in_at: string | null
  checked_in_by: string | null
  vc_absent: boolean  // From Veracross attendance - highlight yellow if true
}

export interface DrillStats {
  totalStaff: number
  staffCheckedIn: number
  staffOut: number
  staffVcAbsent: number
  totalStudents: number
  studentsCheckedIn: number
  studentsOut: number
  studentsVcAbsent: number
  overallPercent: number
}

export function useFireDrill() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch all people (staff + students) with their check-in status
  const fetchPeople = useCallback(async () => {
    try {
      // Fetch staff (excluding those with exclude_fire_drill = true)
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('person_id, full_name, first_name, last_name')
        .eq('is_active', true)
        .or('exclude_fire_drill.is.null,exclude_fire_drill.eq.false')
        .order('last_name')

      if (staffError) throw staffError

      // Fetch students
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('person_id, first_name, last_name, class, grade_level')
        .order('last_name')

      if (studentError) throw studentError

      // Fetch all check-in statuses
      const { data: statusData, error: statusError } = await supabase
        .from('firedrill_status')
        .select('*')

      if (statusError) throw statusError

      // Fetch today's attendance from Veracross
      const today = new Date().toISOString().split('T')[0]
      const { data: attendanceData } = await supabase
        .from('master_attendance')
        .select('person_id, attendance_category')
        .eq('attendance_date', today)

      // Create a map of statuses
      const statusMap = new Map(
        statusData?.map(s => [`${s.person_type}-${s.person_id}`, s]) || []
      )

      // Create a map of VC absences (attendance_category = 1 means absent)
      const absentMap = new Set(
        (attendanceData || [])
          .filter(a => a.attendance_category === 1)
          .map(a => a.person_id)
      )

      // Combine staff
      const staff: Person[] = (staffData || []).map(s => {
        const status = statusMap.get(`staff-${s.person_id}`)
        return {
          person_id: s.person_id,
          first_name: s.first_name || s.full_name?.split(', ')[1] || '',
          last_name: s.last_name || s.full_name?.split(', ')[0] || '',
          full_name: s.full_name || `${s.last_name}, ${s.first_name}`,
          person_type: 'staff' as const,
          class_name: 'Staff',
          vc_absent: absentMap.has(s.person_id),
          checked_in: status?.checked_in || false,
          out_today: status?.out_today || false,
          checked_in_at: status?.checked_in_at || null,
          checked_in_by: status?.checked_in_by || null,
        }
      })

      // Combine students
      const students: Person[] = (studentData || []).map(s => {
        const status = statusMap.get(`student-${s.person_id}`)
        return {
          person_id: s.person_id,
          first_name: s.first_name || '',
          last_name: s.last_name || '',
          full_name: `${s.last_name}, ${s.first_name}`,
          person_type: 'student' as const,
          class_name: s.class || null,
          grade_level: s.grade_level,
          vc_absent: absentMap.has(s.person_id),
          checked_in: status?.checked_in || false,
          out_today: status?.out_today || false,
          checked_in_at: status?.checked_in_at || null,
          checked_in_by: status?.checked_in_by || null,
        }
      })

      setPeople([...staff, ...students])
      setError(null)
    } catch (err) {
      console.error('Error fetching people:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Toggle check-in status
  const toggleCheckIn = async (person: Person, userEmail: string) => {
    const newCheckedIn = !person.checked_in
    
    // Optimistic update
    setPeople(prev => prev.map(p => 
      p.person_id === person.person_id && p.person_type === person.person_type
        ? { ...p, checked_in: newCheckedIn, out_today: newCheckedIn ? false : p.out_today, checked_in_at: newCheckedIn ? new Date().toISOString() : null, checked_in_by: newCheckedIn ? userEmail : null }
        : p
    ))

    const { error } = await supabase
      .from('firedrill_status')
      .upsert({
        person_id: person.person_id,
        person_type: person.person_type,
        checked_in: newCheckedIn,
        out_today: newCheckedIn ? false : person.out_today,
        checked_in_at: newCheckedIn ? new Date().toISOString() : null,
        checked_in_by: newCheckedIn ? userEmail : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'person_id,person_type'
      })

    if (error) {
      console.error('Error toggling check-in:', error)
      // Revert on error
      fetchPeople()
    }
  }

  // Toggle out today status
  const toggleOutToday = async (person: Person) => {
    const newOutToday = !person.out_today
    
    // Optimistic update
    setPeople(prev => prev.map(p => 
      p.person_id === person.person_id && p.person_type === person.person_type
        ? { ...p, out_today: newOutToday, checked_in: newOutToday ? false : p.checked_in }
        : p
    ))

    const { error } = await supabase
      .from('firedrill_status')
      .upsert({
        person_id: person.person_id,
        person_type: person.person_type,
        checked_in: newOutToday ? false : person.checked_in,
        out_today: newOutToday,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'person_id,person_type'
      })

    if (error) {
      console.error('Error toggling out today:', error)
      fetchPeople()
    }
  }

  // Reset all check-ins (admin only)
  const resetAll = async (userEmail: string) => {
    const { error } = await supabase
      .from('firedrill_status')
      .update({
        checked_in: false,
        out_today: false,
        checked_in_at: null,
        checked_in_by: null,
        updated_at: new Date().toISOString(),
      })
      .neq('id', 0)

    if (error) {
      console.error('Error resetting:', error)
      return false
    }

    // Log the reset
    await supabase.from('firedrill_history').insert({
      drill_date: new Date().toISOString().split('T')[0],
      reset_by: userEmail,
      notes: 'Manual reset',
    })

    await fetchPeople()
    return true
  }

  // Calculate stats
  const getStats = useCallback((): DrillStats => {
    const staff = people.filter(p => p.person_type === 'staff')
    const students = people.filter(p => p.person_type === 'student')

    const staffCheckedIn = staff.filter(p => p.checked_in).length
    const staffOut = staff.filter(p => p.out_today).length
    const staffVcAbsent = staff.filter(p => p.vc_absent && !p.checked_in && !p.out_today).length
    const studentsCheckedIn = students.filter(p => p.checked_in).length
    const studentsOut = students.filter(p => p.out_today).length
    const studentsVcAbsent = students.filter(p => p.vc_absent && !p.checked_in && !p.out_today).length

    const totalAccountedFor = staffCheckedIn + staffOut + studentsCheckedIn + studentsOut
    const totalPeople = staff.length + students.length
    const overallPercent = totalPeople > 0 ? Math.round((totalAccountedFor / totalPeople) * 100) : 0

    return {
      totalStaff: staff.length,
      staffCheckedIn,
      staffOut,
      staffVcAbsent,
      totalStudents: students.length,
      studentsCheckedIn,
      studentsOut,
      studentsVcAbsent,
      overallPercent,
    }
  }, [people])

  // Get unique classes for filter
  const getClasses = useCallback(() => {
    const classes = new Set<string>()
    people.forEach(p => {
      if (p.class_name) classes.add(p.class_name)
    })
    return Array.from(classes).sort()
  }, [people])

  // Subscribe to realtime updates
  useEffect(() => {
    fetchPeople()

    let channel: RealtimeChannel | null = null
    
    const setupRealtime = async () => {
      channel = supabase
        .channel('firedrill-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'firedrill_status' },
          () => {
            fetchPeople()
          }
        )
        .subscribe()
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchPeople, supabase])

  return {
    people,
    loading,
    error,
    toggleCheckIn,
    toggleOutToday,
    resetAll,
    getStats,
    getClasses,
    refresh: fetchPeople,
  }
}

