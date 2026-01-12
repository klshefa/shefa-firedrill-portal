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
      return 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30'
    }
    if (person.checked_in) {
      return 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30'
    }
    return 'bg-white/5 border-white/10 hover:bg-white/10'
  }

  const getStatusIcon = () => {
    if (person.out_today) return '✗'
    if (person.checked_in) return '✓'
    return '○'
  }

  const getStatusColor = () => {
    if (person.out_today) return 'text-red-400'
    if (person.checked_in) return 'text-green-400'
    return 'text-white/40'
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
            <p className="font-medium text-white truncate">
              {person.last_name}, {person.first_name}
            </p>
            <p className="text-xs text-white/50 truncate">
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
            ${person.out_today 
              ? 'bg-red-500 text-white' 
              : 'bg-white/10 text-white/50 hover:bg-red-500/20 hover:text-red-300'
            }
          `}
        >
          {person.out_today ? 'OUT' : 'Out?'}
        </button>
      </div>
    </motion.div>
  )
}

