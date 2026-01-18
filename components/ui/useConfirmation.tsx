'use client'

import { useState, useCallback } from 'react'

interface ConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

interface ConfirmationState extends ConfirmationOptions {
  open: boolean
  onConfirm: (() => void) | null
}

export function useConfirmation() {
  const [state, setState] = useState<ConfirmationState>({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  })

  const confirm = useCallback(
    (options: ConfirmationOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          open: true,
          title: options.title,
          message: options.message,
          confirmText: options.confirmText,
          cancelText: options.cancelText,
          variant: options.variant || 'danger',
          onConfirm: () => {
            setState((prev) => ({ ...prev, open: false, onConfirm: null }))
            resolve(true)
          },
        })
      })
    },
    []
  )

  const handleCancel = useCallback(() => {
    setState((prev) => ({ ...prev, open: false, onConfirm: null }))
  }, [])

  const handleConfirm = useCallback(() => {
    if (state.onConfirm) {
      state.onConfirm()
    }
  }, [state.onConfirm])

  return {
    confirm,
    state,
    handleCancel,
    handleConfirm,
  }
}
