'use client'

import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
}

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1), 0 2px 8px color-mix(in srgb, var(--primary) 25%, transparent)',
  },
  secondary: {
    background: 'var(--surface-cool)',
    color: 'var(--primary)',
    border: '1px solid var(--border-color)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--foreground)',
    border: '1px solid var(--border-color)',
  },
  danger: {
    background: 'var(--danger)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.97]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${SIZE_CLASSES[size]}
        ${className}
      `}
      style={{
        ...VARIANT_STYLES[variant],
        // @ts-expect-error CSS custom property for focus ring
        '--tw-ring-color': 'var(--primary)',
        ...style,
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  )
}
