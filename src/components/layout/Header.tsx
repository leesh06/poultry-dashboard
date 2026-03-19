interface HeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="px-4 pt-6 pb-4 sm:px-6 animate-fade-in">
      <div className="mx-auto max-w-screen-lg flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </header>
  )
}
