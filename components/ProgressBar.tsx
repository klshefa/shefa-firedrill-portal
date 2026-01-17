'use client'

import { motion } from 'framer-motion'
import { DrillStats } from '@/lib/hooks/useFireDrill'

interface ProgressBarProps {
  stats: DrillStats
}

export function ProgressBar({ stats }: ProgressBarProps) {
  const totalPeople = stats.totalStaff + stats.totalStudents
  const totalAccountedFor = stats.staffCheckedIn + stats.staffOut + stats.studentsCheckedIn + stats.studentsOut
  
  return (
    <div className="bg-white border-t border-slate-200 p-3 md:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="relative h-6 bg-slate-200 rounded-full overflow-hidden mb-2">
          {/* Checked In (Green) */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-green-500"
            initial={{ width: 0 }}
            animate={{ 
              width: `${((stats.staffCheckedIn + stats.studentsCheckedIn) / totalPeople) * 100}%` 
            }}
            transition={{ duration: 0.5 }}
          />
          {/* Out Today (Red) - stacked after green */}
          <motion.div
            className="absolute inset-y-0 bg-red-500"
            initial={{ width: 0, left: 0 }}
            animate={{ 
              width: `${((stats.staffOut + stats.studentsOut) / totalPeople) * 100}%`,
              left: `${((stats.staffCheckedIn + stats.studentsCheckedIn) / totalPeople) * 100}%`
            }}
            transition={{ duration: 0.5 }}
          />
          {/* Percentage Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-slate-900 font-bold text-sm">
              {stats.overallPercent}% Accounted For
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-between text-xs md:text-sm">
          <div className="flex items-center gap-4">
            <span className="text-green-600">
              ✓ {stats.staffCheckedIn + stats.studentsCheckedIn} checked in
            </span>
            <span className="text-red-600">
              ✗ {stats.staffOut + stats.studentsOut} out
            </span>
          </div>
          <div className="text-slate-600">
            {totalAccountedFor} / {totalPeople} total
          </div>
        </div>
      </div>
    </div>
  )
}

