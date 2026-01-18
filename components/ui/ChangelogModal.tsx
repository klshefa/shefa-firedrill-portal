'use client'

import { useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase/client'

interface ChangelogEntry {
  id: number
  change_date: string
  category: 'ui' | 'ux' | 'backend' | 'feature' | 'bug'
  title: string
  description: string | null
  commit_hash: string | null
}

interface ChangelogModalProps {
  portalName: string
  onClose: () => void
}

const CATEGORY_LABELS = {
  ui: 'UI',
  ux: 'UX',
  backend: 'Backend',
  feature: 'Feature',
  bug: 'Bug Fix',
}

const CATEGORY_COLORS = {
  ui: 'bg-purple-100 text-purple-700',
  ux: 'bg-blue-100 text-blue-700',
  backend: 'bg-slate-100 text-slate-700',
  feature: 'bg-green-100 text-green-700',
  bug: 'bg-red-100 text-red-700',
}

export function ChangelogModal({ portalName, onClose }: ChangelogModalProps) {
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    loadChangelogs()
  }, [portalName, selectedCategory])

  async function loadChangelogs() {
    setLoading(true)
    const supabase = createClient()
    
    let query = supabase
      .from('portal_changelogs')
      .select('id, change_date, category, title, description, commit_hash')
      .eq('portal_name', portalName)
      .eq('is_hidden', false)  // Only show non-hidden entries
      .order('change_date', { ascending: false })
      .order('id', { ascending: false })  // Secondary sort by ID for consistent ordering
      .limit(50)
    
    if (selectedCategory) {
      query = query.eq('category', selectedCategory)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error loading changelogs:', error)
    } else {
      setEntries(data || [])
    }
    
    setLoading(false)
  }

  // Group entries by date
  // Parse date string directly to avoid timezone issues (dates are stored as YYYY-MM-DD)
  const groupedEntries = entries.reduce((acc, entry) => {
    // Parse YYYY-MM-DD directly without timezone conversion
    const [year, month, day] = entry.change_date.split('-').map(Number)
    const date = new Date(year, month - 1, day).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(entry)
    return acc
  }, {} as Record<string, ChangelogEntry[]>)

  return (
    <Transition.Root show={true} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <SparklesIcon className="w-6 h-6 text-blue-500" />
                    <Dialog.Title as="h3" className="text-lg font-semibold text-slate-900">
                      What's New
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-500"
                    aria-label="Close"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Filters */}
                <div className="px-6 py-3 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-slate-600">Filter:</span>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === null
                          ? 'bg-shefa-blue-500 text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      All
                    </button>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          selectedCategory === key
                            ? 'bg-shefa-blue-500 text-white'
                            : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="mt-2 text-sm text-slate-500">Loading changelog...</p>
                    </div>
                  ) : Object.keys(groupedEntries).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500">No changes to display</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedEntries).map(([date, dateEntries]) => (
                        <div key={date}>
                          <h4 className="text-sm font-semibold text-slate-700 mb-3">{date}</h4>
                          <div className="space-y-3">
                            {dateEntries.map((entry) => (
                              <div
                                key={entry.id}
                                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${CATEGORY_COLORS[entry.category]}`}
                                  >
                                    {CATEGORY_LABELS[entry.category]}
                                  </span>
                                  <div className="flex-1">
                                    <h5 className="text-sm font-semibold text-slate-900">
                                      {entry.title}
                                    </h5>
                                    {entry.description && (
                                      <p className="mt-1 text-sm text-slate-600">
                                        {entry.description}
                                      </p>
                                    )}
                                    {entry.commit_hash && (
                                      <a
                                        href={`https://github.com/klshefa/shefa-${portalName}/commit/${entry.commit_hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800"
                                      >
                                        View commit →
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
