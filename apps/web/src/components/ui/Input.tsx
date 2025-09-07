import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  error?: boolean
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {startIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-button border border-border-light bg-surface-glass px-3 py-2 text-sm',
              'placeholder:text-text-muted',
              'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-colors',
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              error && 'border-danger focus:border-danger focus:ring-danger/20',
              className
            )}
            ref={ref}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {endIcon}
            </div>
          )}
        </div>
        {helperText && (
          <p className={cn(
            'mt-1 text-xs',
            error ? 'text-danger' : 'text-text-muted'
          )}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }