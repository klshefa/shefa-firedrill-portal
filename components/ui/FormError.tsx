'use client'

import { XCircleIcon } from '@heroicons/react/24/outline'
import { ErrorMessage } from './ErrorMessage'

interface FormErrorProps {
  // Field-level error
  field?: string
  errors?: Record<string, string | string[]>
  
  // Form-level error
  message?: string
  title?: string
}

export function FormError({ field, errors, message, title }: FormErrorProps) {
  // Field-level error
  if (field && errors && errors[field]) {
    const errorMessage = Array.isArray(errors[field])
      ? errors[field][0]
      : errors[field]
    
    return (
      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
        <XCircleIcon className="w-4 h-4 flex-shrink-0" />
        <span>{errorMessage}</span>
      </p>
    )
  }

  // Form-level error
  if (message) {
    return (
      <ErrorMessage
        title={title}
        message={message}
        variant="full"
      />
    )
  }

  return null
}
