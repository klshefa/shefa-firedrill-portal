'use client'

import { XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ErrorMessageProps {
  title?: string
  message: string
  variant?: 'full' | 'inline' | 'compact'
  dismissible?: boolean
  onDismiss?: () => void
}

export function ErrorMessage({
  title,
  message,
  variant = 'full',
  dismissible = false,
  onDismiss,
}: ErrorMessageProps) {
  if (variant === 'inline') {
    return (
      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
        <XCircleIcon className="w-4 h-4 flex-shrink-0" />
        <span>{message}</span>
      </p>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <XCircleIcon className="w-4 h-4 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{message}</p>
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-auto text-red-600 hover:text-red-800"
              aria-label="Dismiss error"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Full variant (default)
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <XCircleIcon className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-semibold text-red-800">{title}</h3>
          )}
          <p className={`text-sm text-red-700 ${title ? 'mt-1' : ''}`}>
            {message}
          </p>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 flex-shrink-0"
            aria-label="Dismiss error"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
