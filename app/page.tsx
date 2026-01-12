'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useFireDrill, Person } from '@/lib/hooks/useFireDrill'
import { useAdmin } from '@/lib/hooks/useAdmin'
import { PersonCard } from '@/components/PersonCard'
import { ProgressBar } from '@/components/ProgressBar'

type Tab = 'staff' | 'students'

export default function FireDrillPage() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('staff')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)

  const supabase = createClient()
  const { people, loading, error, toggleCheckIn, toggleOutToday, resetAll, getStats, getClasses, refresh } = useFireDrill()
  const { isAdmin, loading: adminLoading } = useAdmin(user?.email)

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        // Check if user is staff (shefaschool.org domain)
        if (session.user.email.endsWith('@shefaschool.org')) {
          setUser({ email: session.user.email })
        } else {
          // Sign out non-staff users
          await supabase.auth.signOut()
          setUser(null)
        }
      }
      setAuthLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user?.email?.endsWith('@shefaschool.org')) {
        setUser({ email: session.user.email })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // Sign in with Google
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
        queryParams: {
          hd: 'shefaschool.org',
        },
      },
    })
  }

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // Filter and search
  const filteredPeople = useMemo(() => {
    return people.filter(person => {
      // Filter by tab (person type)
      if (activeTab === 'staff' && person.person_type !== 'staff') return false
      if (activeTab === 'students' && person.person_type !== 'student') return false

      // Filter by class (students only)
      if (selectedClass !== 'all' && person.class_name !== selectedClass) return false

      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const fullName = `${person.first_name} ${person.last_name}`.toLowerCase()
        const reverseName = `${person.last_name} ${person.first_name}`.toLowerCase()
        if (!fullName.includes(query) && !reverseName.includes(query)) return false
      }

      return true
    })
  }, [people, activeTab, selectedClass, searchQuery])

  // Stats
  const stats = useMemo(() => getStats(), [getStats])
  const classes = useMemo(() => getClasses(), [getClasses])

  // Handle reset
  const handleReset = async () => {
    if (!user?.email) return
    setResetting(true)
    await resetAll(user.email)
    setResetting(false)
    setShowResetConfirm(false)
  }

  // Staff and student counts for tabs
  const staffPeople = people.filter(p => p.person_type === 'staff')
  const studentPeople = people.filter(p => p.person_type === 'student')

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="text-6xl mb-4">🔥</div>
          <h1 className="text-2xl font-bold text-white mb-2">Fire Drill Check-In</h1>
          <p className="text-white/60 mb-6">Sign in with your Shefa School account to access the fire drill check-in system.</p>
          <button
            onClick={signIn}
            className="w-full py-3 px-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
          <p className="text-xs text-white/40 mt-4">Staff accounts only (@shefaschool.org)</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔥</span>
              <div>
                <h1 className="text-lg font-bold text-white">Fire Drill</h1>
                <p className="text-xs text-white/50 hidden sm:block">Emergency Check-In</p>
              </div>
            </div>

            {/* Search - Hidden on mobile, shown in panel */}
            <div className="hidden md:flex flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* User & Actions */}
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-colors hidden sm:block"
                >
                  Reset All
                </button>
              )}
              <button
                onClick={refresh}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={signOut}
                  className="text-white/60 hover:text-white text-sm hidden sm:block"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden px-4 py-2 bg-gray-900/50">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
        />
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden flex border-b border-white/10 bg-gray-900/50">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === 'staff'
              ? 'text-white border-b-2 border-orange-500 bg-white/5'
              : 'text-white/50'
          }`}
        >
          Staff
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/10">
            {stats.staffCheckedIn + stats.staffOut}/{stats.totalStaff}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === 'students'
              ? 'text-white border-b-2 border-orange-500 bg-white/5'
              : 'text-white/50'
          }`}
        >
          Students
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/10">
            {stats.studentsCheckedIn + stats.studentsOut}/{stats.totalStudents}
          </span>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={refresh} className="px-4 py-2 bg-white/10 rounded-xl text-white">
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop: Dual Panel */}
            <div className="hidden md:flex h-full">
              {/* Staff Panel */}
              <div className="w-1/2 border-r border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">
                      Staff
                      <span className="ml-2 text-sm text-white/50">
                        ({stats.staffCheckedIn + stats.staffOut}/{stats.totalStaff})
                      </span>
                    </h2>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                        ✓ {stats.staffCheckedIn}
                      </span>
                      <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
                        ✗ {stats.staffOut}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  <AnimatePresence mode="popLayout">
                    {staffPeople
                      .filter(p => {
                        if (!searchQuery) return true
                        const query = searchQuery.toLowerCase()
                        return `${p.first_name} ${p.last_name}`.toLowerCase().includes(query) ||
                               `${p.last_name} ${p.first_name}`.toLowerCase().includes(query)
                      })
                      .map(person => (
                        <PersonCard
                          key={`staff-${person.person_id}`}
                          person={person}
                          onCheckIn={() => toggleCheckIn(person, user.email)}
                          onOutToday={() => toggleOutToday(person)}
                        />
                      ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Students Panel */}
              <div className="w-1/2 flex flex-col">
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-white">
                      Students
                      <span className="ml-2 text-sm text-white/50">
                        ({stats.studentsCheckedIn + stats.studentsOut}/{stats.totalStudents})
                      </span>
                    </h2>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                        ✓ {stats.studentsCheckedIn}
                      </span>
                      <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
                        ✗ {stats.studentsOut}
                      </span>
                    </div>
                  </div>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm"
                  >
                    <option value="all">All Classes</option>
                    {classes.filter(c => c !== 'Staff').map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  <AnimatePresence mode="popLayout">
                    {studentPeople
                      .filter(p => {
                        if (selectedClass !== 'all' && p.class_name !== selectedClass) return false
                        if (!searchQuery) return true
                        const query = searchQuery.toLowerCase()
                        return `${p.first_name} ${p.last_name}`.toLowerCase().includes(query) ||
                               `${p.last_name} ${p.first_name}`.toLowerCase().includes(query)
                      })
                      .map(person => (
                        <PersonCard
                          key={`student-${person.person_id}`}
                          person={person}
                          onCheckIn={() => toggleCheckIn(person, user.email)}
                          onOutToday={() => toggleOutToday(person)}
                        />
                      ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Mobile: Single List */}
            <div className="md:hidden flex-1 overflow-y-auto">
              {/* Class Filter for Students */}
              {activeTab === 'students' && (
                <div className="p-3 bg-gray-900/50">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm"
                  >
                    <option value="all">All Classes</option>
                    {classes.filter(c => c !== 'Staff').map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="p-3 space-y-2">
                <AnimatePresence mode="popLayout">
                  {filteredPeople.map(person => (
                    <PersonCard
                      key={`${person.person_type}-${person.person_id}`}
                      person={person}
                      onCheckIn={() => toggleCheckIn(person, user.email)}
                      onOutToday={() => toggleOutToday(person)}
                    />
                  ))}
                </AnimatePresence>
                {filteredPeople.length === 0 && (
                  <div className="text-center py-8 text-white/50">
                    No results found
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Progress Bar - Fixed at bottom */}
      <ProgressBar stats={stats} />

      {/* Mobile Admin Button */}
      {isAdmin && (
        <button
          onClick={() => setShowResetConfirm(true)}
          className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-red-500 rounded-full shadow-lg flex items-center justify-center text-white z-40"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-2">Reset All Check-Ins?</h3>
                <p className="text-white/60 mb-6">
                  This will clear all check-in and out-today statuses. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50"
                  >
                    {resetting ? 'Resetting...' : 'Reset All'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

