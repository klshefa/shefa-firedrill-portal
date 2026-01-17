/**
 * Standard Logout Button Component for Shefa School Portals
 * 
 * Provides a consistent logout button across all portals:
 * - Icon always visible
 * - Text visible on sm+ breakpoints
 * - Standard styling (secondary button style)
 * - Consistent "Sign Out" text (capitalized)
 * 
 * Usage:
 * ```tsx
 * import { LogoutButton } from '@/components/ui/LogoutButton'
 * 
 * <LogoutButton onSignOut={handleSignOut} />
 * ```
 */

'use client'

import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

interface LogoutButtonProps {
  onSignOut: () => void | Promise<void>
  className?: string
  variant?: 'default' | 'minimal' | 'danger'
}

export function LogoutButton({ 
  onSignOut, 
  className = '',
  variant = 'default'
}: LogoutButtonProps) {
  const baseClasses = 'flex items-center gap-2 transition-colors'
  
  const variantClasses = {
    default: 'px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg',
    minimal: 'p-2 text-slate-400 hover:text-slate-600 rounded-lg',
    danger: 'px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg',
  }
  
  return (
    <button
      onClick={onSignOut}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      title="Sign out"
      aria-label="Sign out"
    >
      <ArrowRightOnRectangleIcon className="w-4 h-4" aria-hidden="true" />
      <span className="hidden sm:inline">Sign Out</span>
    </button>
  )
}
