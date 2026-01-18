'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BellAlertIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  LightBulbIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', label: 'Overview', icon: BellAlertIcon },
    { id: 'checkin', label: 'Check-In Process', icon: CheckCircleIcon },
    { id: 'tabs', label: 'Staff & Students', icon: UserGroupIcon },
    { id: 'filters', label: 'Search & Filter', icon: MagnifyingGlassIcon },
    { id: 'admin', label: 'Admin Features', icon: ShieldCheckIcon },
  ]

  const content: Record<string, JSX.Element> = {
    overview: (
      <div className="space-y-4">
        <p className="text-slate-600 text-sm">
          The <strong>Fire Drill Check-In Portal</strong> is used during fire drills to track who is present and accounted for. All staff and students are listed, and you can mark them as checked in or out for the day.
        </p>
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Key Features</h4>
          <ul className="text-sm text-slate-600 space-y-1 ml-4">
            <li>• <strong>Real-Time Updates</strong> – See check-ins as they happen from other users</li>
            <li>• <strong>Staff & Student Tabs</strong> – Separate views for staff and students</li>
            <li>• <strong>Check-In/Out</strong> – Mark people as checked in or out for the day</li>
            <li>• <strong>Statistics</strong> – View counts of total people and who's checked in</li>
            <li>• <strong>Veracross Integration</strong> – Highlights people marked absent in Veracross</li>
          </ul>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700 flex items-center gap-2">
          <LightBulbIcon className="w-4 h-4 flex-shrink-0" />
          <span>All changes are saved automatically and visible to all users in real-time.</span>
        </div>
      </div>
    ),
    checkin: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Checking Someone In</h4>
          <p className="text-slate-600 text-sm mb-2">
            To mark someone as checked in:
          </p>
          <ol className="text-sm text-slate-600 space-y-1 ml-4 list-decimal">
            <li>Find the person in the list (use search or filters if needed)</li>
            <li>Click the <strong>green checkmark button</strong> (✓) on their card</li>
            <li>The card will turn green and show "Checked In"</li>
            <li>All users will see this update immediately</li>
          </ol>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Marking Someone Out</h4>
          <p className="text-slate-600 text-sm mb-2">
            To mark someone as out for the day:
          </p>
          <ol className="text-sm text-slate-600 space-y-1 ml-4 list-decimal">
            <li>Find the person in the list</li>
            <li>Click the <strong>red X button</strong> (✗) on their card</li>
            <li>The card will show "Out Today"</li>
            <li>This indicates they are not expected to be present</li>
          </ol>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Status Indicators</h4>
          <ul className="text-sm text-slate-600 space-y-1 ml-4">
            <li>• <strong className="text-green-600">Green card</strong> – Checked in</li>
            <li>• <strong className="text-yellow-400">Yellow highlight</strong> – Marked absent in Veracross</li>
            <li>• <strong className="text-slate-400">Gray card</strong> – Not checked in</li>
            <li>• <strong>"Out Today"</strong> – Marked as out for the day</li>
          </ul>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-700">
          💡 You can toggle check-in status on and off. Click the checkmark again to uncheck someone if needed.
        </div>
      </div>
    ),
    tabs: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Staff Tab</h4>
          <p className="text-slate-600 text-sm mb-2">
            The <strong>Staff</strong> tab shows all active staff members (excluding those excluded from fire drills):
          </p>
          <ul className="text-sm text-slate-600 space-y-1 ml-4">
            <li>• All staff are listed alphabetically by last name</li>
            <li>• Shows check-in status for each staff member</li>
            <li>• Displays statistics at the top (total staff, checked in count)</li>
            <li>• Updates in real-time as staff check in</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Students Tab</h4>
          <p className="text-slate-600 text-sm mb-2">
            The <strong>Students</strong> tab shows all students:
          </p>
          <ul className="text-sm text-slate-600 space-y-1 ml-4">
            <li>• All students are listed alphabetically by last name</li>
            <li>• Shows class name and grade level</li>
            <li>• Can filter by class using the dropdown</li>
            <li>• Displays statistics at the top (total students, checked in count)</li>
            <li>• Highlights students marked absent in Veracross (yellow background)</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Progress Bar</h4>
          <p className="text-slate-600 text-sm">
            The progress bar at the top shows the percentage of people checked in. It updates automatically as check-ins occur.
          </p>
        </div>
      </div>
    ),
    filters: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Search</h4>
          <p className="text-slate-600 text-sm">
            Use the search box to quickly find a person by name. The search filters the list in real-time as you type, searching both first and last names.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Class Filter (Students Only)</h4>
          <p className="text-slate-600 text-sm mb-2">
            On the Students tab, use the class dropdown to filter students by their class:
          </p>
          <ul className="text-sm text-slate-600 space-y-1 ml-4">
            <li>• Select <strong>"All Classes"</strong> to see everyone</li>
            <li>• Select a specific class to see only those students</li>
            <li>• Useful for checking in students by classroom</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Refresh Button</h4>
          <p className="text-slate-600 text-sm">
            Click the <strong>refresh icon</strong> (circular arrows) to manually refresh the data. The portal also updates automatically in real-time, but you can force a refresh if needed.
          </p>
        </div>
      </div>
    ),
    admin: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Admin Access</h4>
          <p className="text-slate-600 text-sm">
            Only users with admin access (configured in the Sharks Portal) can see and use the <strong>Reset All</strong> button.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Reset All Button</h4>
          <p className="text-slate-600 text-sm mb-2">
            The <strong>Reset All</strong> button clears all check-in statuses:
          </p>
          <ul className="text-sm text-slate-600 space-y-1 ml-4">
            <li>• Removes all check-in marks</li>
            <li>• Clears all "Out Today" marks</li>
            <li>• Resets the progress bar to 0%</li>
            <li>• Use this at the end of a drill or to start fresh</li>
          </ul>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
          <XCircleIcon className="w-4 h-4 flex-shrink-0" />
          <span><strong>Warning:</strong> Reset All cannot be undone. All check-in data will be cleared.</span>
        </div>
      </div>
    ),
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-[800px] max-h-[calc(100vh-2rem)] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden pointer-events-auto"
            >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <BookOpenIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">User Guide</h2>
                  <p className="text-xs text-slate-500">Fire Drill Portal Help</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-48 bg-slate-50 border-r border-slate-200 p-2 overflow-y-auto">
                {sections.map((section) => {
                  const IconComponent = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        activeSection === section.id
                          ? 'bg-orange-500 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {section.label}
                    </button>
                  )
                })}
              </div>

              {/* Main content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      {(() => {
                        const section = sections.find(s => s.id === activeSection)
                        const IconComponent = section?.icon
                        return IconComponent ? <IconComponent className="w-5 h-5" /> : null
                      })()}
                      {sections.find(s => s.id === activeSection)?.label}
                    </h3>
                    {content[activeSection]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-500 text-center">
                Need more help? Contact your system administrator.
              </p>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        title="Help & User Guide"
      >
        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      <HelpModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
