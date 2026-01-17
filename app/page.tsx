'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useFireDrill, Person } from '@/lib/hooks/useFireDrill'
import { useAdmin } from '@/lib/hooks/useAdmin'
import { PersonCard } from '@/components/PersonCard'
import { ProgressBar } from '@/components/ProgressBar'
import { LoginScreen } from '@/components/LoginScreen'
import { BellAlertIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { LogoutButton } from '@/components/ui/LogoutButton'
import { Button } from '@/components/ui/Button'

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
  async function signIn() {
    const supabaseClient = createClient()
    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          hd: 'shefaschool.org',
          prompt: 'select_account',
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
      <LoginScreen
        IconComponent={BellAlertIcon}
        title="Fire Drill Check-In"
        subtitle="Sign in to continue"
        onSignIn={signIn}
        loading={true}
      />
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <LoginScreen
        IconComponent={BellAlertIcon}
        title="Fire Drill Check-In"
        subtitle="Sign in with your Shefa School account to access the fire drill check-in system"
        onSignIn={signIn}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-shefa-blue-500 to-shefa-blue-800 rounded-xl flex items-center justify-center shadow-sm">
                <BellAlertIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Fire Drill</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Emergency Check-In</p>
              </div>
            </div>

            {/* Center: Search - Expanded on larger screens */}
            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-shefa-blue-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
            </div>

            {/* Right: User Info + Actions */}
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowResetConfirm(true)}
                  className="hidden sm:block"
                >
                  Reset All
                </Button>
              )}
              <button
                onClick={refresh}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-700">{user.email}</p>
                </div>
                <LogoutButton onSignOut={signOut} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Overall Progress Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
        <div className="max-w-screen-xl mx-auto">
          {/* Progress Bar */}
          <div className="relative h-8 bg-slate-200 rounded-full overflow-hidden mb-2">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${stats.overallPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-slate-900 font-bold text-sm">
                {stats.overallPercent}% Accounted For
              </span>
            </div>
          </div>
          {/* Stats Row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-green-600">
                ✓ {stats.staffCheckedIn + stats.studentsCheckedIn} checked in
              </span>
              <span className="text-red-600">
                ✗ {stats.staffOut + stats.studentsOut} out
              </span>
              {(stats.staffVcAbsent + stats.studentsVcAbsent) > 0 && (
                <span className="text-amber-600 flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {stats.staffVcAbsent + stats.studentsVcAbsent} VC absent
                </span>
              )}
            </div>
            <span className="text-slate-600">
              {stats.staffCheckedIn + stats.studentsCheckedIn + stats.staffOut + stats.studentsOut} / {stats.totalStaff + stats.totalStudents} total
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3 bg-white border-b border-slate-200">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-shefa-blue-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
        />
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden flex border-b border-slate-200 bg-white">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex-1 py-3 text-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-shefa-blue-500 focus:ring-offset-2 ${
            activeTab === 'staff'
              ? 'text-slate-900 border-b-2 border-shefa-blue-500 bg-slate-50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Staff
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
            {stats.staffCheckedIn + stats.staffOut}/{stats.totalStaff}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`flex-1 py-3 text-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-shefa-blue-500 focus:ring-offset-2 ${
            activeTab === 'students'
              ? 'text-slate-900 border-b-2 border-shefa-blue-500 bg-slate-50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Students
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
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
              <p className="text-sm text-red-400 mb-4">{error}</p>
              <Button variant="secondary" onClick={refresh}>
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop: Dual Panel */}
            <div className="hidden md:flex h-full">
              {/* Staff Panel */}
              <div className="w-1/2 border-r border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-white">
                      Staff
                      <span className="ml-2 text-sm text-white/50">
                        ({stats.staffCheckedIn + stats.staffOut}/{stats.totalStaff})
                      </span>
                    </h2>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full font-medium">
                        ✓ {stats.staffCheckedIn}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full font-medium">
                        ✗ {stats.staffOut}
                      </span>
                      {stats.staffVcAbsent > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full font-medium flex items-center gap-1">
                          <ExclamationTriangleIcon className="w-3 h-3" />
                          {stats.staffVcAbsent}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Placeholder to match Students header height */}
                  <div className="h-[38px]"></div>
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
                    <h2 className="text-2xl font-bold text-white">
                      Students
                      <span className="ml-2 text-sm text-white/50">
                        ({stats.studentsCheckedIn + stats.studentsOut}/{stats.totalStudents})
                      </span>
                    </h2>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full font-medium">
                        ✓ {stats.studentsCheckedIn}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full font-medium">
                        ✗ {stats.studentsOut}
                      </span>
                      {stats.studentsVcAbsent > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full font-medium flex items-center gap-1">
                          <ExclamationTriangleIcon className="w-3 h-3" />
                          {stats.studentsVcAbsent}
                        </span>
                      )}
                    </div>
                  </div>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-shefa-blue-500 focus:border-transparent transition-all disabled:bg-white/5 disabled:text-white/50 disabled:cursor-not-allowed"
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
                        // If searching, ignore class filter for safety (global search)
                        if (searchQuery) {
                          const query = searchQuery.toLowerCase()
                          return `${p.first_name} ${p.last_name}`.toLowerCase().includes(query) ||
                                 `${p.last_name} ${p.first_name}`.toLowerCase().includes(query)
                        }
                        // Not searching - apply class filter
                        if (selectedClass !== 'all' && p.class_name !== selectedClass) return false
                        return true
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
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-shefa-blue-500 focus:border-transparent transition-all disabled:bg-white/5 disabled:text-white/50 disabled:cursor-not-allowed"
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
                  <div className="text-center py-8 text-sm text-white/50">
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
          className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-red-500 rounded-full shadow-lg flex items-center justify-center text-white z-40 hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
              className="bg-gray-800 rounded-xl p-6 max-w-sm w-full border border-white/20 shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <ExclamationTriangleIcon className="w-16 h-16 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Reset All Check-Ins?</h3>
                <p className="text-sm text-white/60 mb-6">
                  This will clear all check-in and out-today statuses. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={handleReset}
                    disabled={resetting}
                    className="flex-1"
                  >
                    {resetting ? 'Resetting...' : 'Reset All'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

