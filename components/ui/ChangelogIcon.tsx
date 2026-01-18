'use client'

import { useState, useEffect } from 'react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import { ChangelogModal } from './ChangelogModal'

interface ChangelogIconProps {
  portalName: string
}

export function ChangelogIcon({ portalName }: ChangelogIconProps) {
  const [showModal, setShowModal] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Check for unread changes (last 7 days)
    async function checkUnread() {
      // This will be implemented in Step 5
      // For now, just set to 0
      setUnreadCount(0)
    }
    checkUnread()
  }, [])

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
        title="What's New"
        aria-label="View changelog"
      >
        <DocumentTextIcon className="w-5 h-5 text-slate-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
        )}
      </button>

      {showModal && (
        <ChangelogModal
          portalName={portalName}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
