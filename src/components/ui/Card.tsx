type CardVariant = 'base' | 'elevated' | 'inset'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: CardVariant
}

const PADDING = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
}

const VARIANT_CLASS: Record<CardVariant, string> = {
  base: 'card-base',
  elevated: 'card-elevated',
  inset: 'card-inset',
}

export function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  variant = 'base',
}: CardProps) {
  return (
    <div
      className={`${VARIANT_CLASS[variant]} ${PADDING[padding]} ${hover ? 'cursor-pointer hover:-translate-y-0.5 transition-transform duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  icon?: React.ReactNode
  title: string
  value?: string | React.ReactNode
  subtitle?: string
  color?: string
}

export function CardHeader({ icon, title, value, subtitle, color }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2.5">
        {icon && (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: 'var(--surface-alt)',
              color: color || 'var(--primary)',
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <p className="text-label">
            {title}
          </p>
          {subtitle && (
            <p className="text-[10px]" style={{ color: 'var(--muted)', opacity: 0.7 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {value && (
        <div className="text-right">
          {typeof value === 'string' ? (
            <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
              {value}
            </p>
          ) : (
            value
          )}
        </div>
      )}
    </div>
  )
}
