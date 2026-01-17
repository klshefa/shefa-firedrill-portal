'use client'

import { createPortal } from 'react-dom'
import { AnimatePresence } from 'framer-motion'
import { Toast, Toast as ToastType } from './Toast'

interface ToastContainerProps {
  toasts: ToastType[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  // Only render max 5 toasts at once
  const visibleToasts = toasts.slice(0, 5)

  if (typeof window === 'undefined') {
    return null
  }

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}
