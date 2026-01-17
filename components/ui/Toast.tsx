'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

const toastConfig = {
  success: {
    icon: CheckCircleIcon,
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconColor: 'text-green-600',
    textColor: 'text-green-800',
  },
  error: {
    icon: XCircleIcon,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-600',
    textColor: 'text-red-800',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    textColor: 'text-yellow-800',
  },
  info: {
    icon: InformationCircleIcon,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-800',
  },
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const config = toastConfig[toast.type]
  const Icon = config.icon
  const duration = toast.duration ?? 5000

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.id, duration, onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.2 }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border min-w-[300px] max-w-[400px]
        ${config.bg} ${config.border}
      `}
      onMouseEnter={(e) => {
        // Pause auto-dismiss on hover
        e.currentTarget.style.animationPlayState = 'paused'
      }}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
      <p className={`text-sm font-medium flex-1 ${config.textColor}`}>
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className={`${config.textColor} opacity-60 hover:opacity-100 transition-opacity`}
        aria-label="Dismiss"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
