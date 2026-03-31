interface HeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="px-5 pt-8 pb-5 sm:px-6 animate-fade-in">
      <div className="mx-auto max-w-screen-lg flex items-start justify-between">
        <div>
          <h1 className="text-display">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-label">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </header>
  )
}
