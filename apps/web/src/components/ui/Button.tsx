import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    disabled,
    children,
    icon,
    iconPosition = 'left',
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-button font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-accent text-white hover:bg-accent/90 focus:ring-accent/20 shadow-sm hover:shadow-md',
      secondary: 'bg-surface border border-border-light text-text-primary hover:bg-surface-hover focus:ring-primary/20',
      ghost: 'text-text-secondary hover:bg-surface-hover hover:text-text-primary focus:ring-primary/20',
      danger: 'bg-danger text-white hover:bg-danger/90 focus:ring-danger/20 shadow-sm hover:shadow-md',
      success: 'bg-success text-white hover:bg-success/90 focus:ring-success/20 shadow-sm hover:shadow-md'
    }

    const sizes = {
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5'
    }

    const isDisabled = disabled || loading

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }