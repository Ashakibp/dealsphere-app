import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'secondary', size = 'md', dot = false, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors'
    
    const variants = {
      primary: 'bg-primary/10 text-primary border border-primary/20',
      secondary: 'bg-surface-glass text-text-secondary border border-border-light',
      success: 'bg-success/10 text-success border border-success/20',
      warning: 'bg-warning/10 text-warning border border-warning/20',
      danger: 'bg-danger/10 text-danger border border-danger/20',
      accent: 'bg-accent/10 text-accent border border-accent/20'
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-1 text-xs gap-1.5',
      lg: 'px-3 py-1.5 text-sm gap-2'
    }

    const dotColors = {
      primary: 'bg-primary',
      secondary: 'bg-text-muted',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
      accent: 'bg-accent'
    }

    return (
      <div
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {dot && (
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotColors[variant]
          )} />
        )}
        {children}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }