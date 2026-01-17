'use client'

import { motion } from 'framer-motion'
import { Person } from '@/lib/hooks/useFireDrill'

interface PersonCardProps {
  person: Person
  onCheckIn: () => void
  onOutToday: () => void
}

export function PersonCard({ person, onCheckIn, onOutToday }: PersonCardProps) {
  const getCardStyle = () => {
    if (person.out_today) {
      return 'bg-red-50 border-red-200 hover:bg-red-100'
    }
    if (person.checked_in) {
      return 'bg-green-50 border-green-200 hover:bg-green-100'
    }
    // Yellow highlight for VC absent (marked absent in Veracross)
    if (person.vc_absent) {
      return 'bg-amber-50 border-amber-200 hover:bg-amber-100'
    }
    return 'bg-white border-slate-200 hover:bg-slate-50'
  }

  const getStatusIcon = () => {
    if (person.out_today) return '✗'
    if (person.checked_in) return '✓'
    if (person.vc_absent) return '⚠' // Keep as character for status display
    return '○'
  }

  const getStatusColor = () => {
    if (person.out_today) return 'text-red-600'
    if (person.checked_in) return 'text-green-600'
    if (person.vc_absent) return 'text-amber-600'
    return 'text-slate-400'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-xl border p-3 cursor-pointer transition-all duration-200
        ${getCardStyle()}
        ${person.checked_in ? 'animate-check' : ''}
      `}
      onClick={onCheckIn}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Status Icon */}
          <span className={`text-2xl font-bold ${getStatusColor()}`}>
            {getStatusIcon()}
          </span>
          
          {/* Name and Class */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-900 truncate">
                {person.last_name}, {person.first_name}
              </p>
              {person.vc_absent && !person.checked_in && !person.out_today && (
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium border border-amber-200">
                  VC Absent
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 truncate">
              {person.class_name || 'No class'}
              {person.grade_level !== undefined && person.grade_level !== null && ` • Grade ${person.grade_level}`}
            </p>
          </div>
        </div>

        {/* Out Today Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOutToday()
          }}
          className={`
            px-2 py-1 rounded-lg text-xs font-medium transition-all
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
            ${person.out_today 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 border border-slate-200'
            }
          `}
        >
          {person.out_today ? 'OUT' : 'Out?'}
        </button>
      </div>
    </motion.div>
  )
}

