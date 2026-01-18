/**
 * Monitoring utilities for error tracking
 * Simple console-based logging (Sentry not configured for this portal)
 */

export const monitor = {
  captureException: (error: Error, context?: Record<string, any>) => {
    // Log to console in development, could be extended to send to monitoring service
    if (process.env.NODE_ENV === 'development') {
      console.error('[Monitor] Exception:', error, context)
    } else {
      // In production, you could send to a logging service
      console.error('[Monitor] Exception:', error.message, context)
    }
  },
  
  captureMessage: (message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) => {
    // Log to console
    const logMethod = level === 'error' ? console.error : level === 'warning' ? console.warn : console.info
    logMethod(`[Monitor] ${level.toUpperCase()}:`, message, context)
  },
}
