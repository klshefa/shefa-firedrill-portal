'use client'

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    
    const variantClasses = {
      primary: "bg-shefa-blue-500 hover:bg-shefa-blue-600 text-white focus:ring-shefa-blue-500",
      secondary: "bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-slate-400",
      success: "bg-shefa-green-400 hover:bg-shefa-green-500 text-white focus:ring-shefa-green-400",
      danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
      ghost: "text-slate-600 hover:bg-slate-100 focus:ring-slate-400",
    }
    
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    }
    
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
