/**
 * Monitoring utilities for error tracking
 * Wraps Sentry for consistent error reporting
 */

import * as Sentry from '@sentry/nextjs'

export const monitor = {
  captureException: (error: Error, context?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      // Client-side
      Sentry.captureException(error, {
        contexts: {
          custom: context || {},
        },
      })
    } else {
      // Server-side
      Sentry.captureException(error, {
        contexts: {
          custom: context || {},
        },
      })
    }
  },
  
  captureMessage: (message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      Sentry.captureMessage(message, {
        level: level as Sentry.SeverityLevel,
        contexts: {
          custom: context || {},
        },
      })
    } else {
      Sentry.captureMessage(message, {
        level: level as Sentry.SeverityLevel,
        contexts: {
          custom: context || {},
        },
      })
    }
  },
}
