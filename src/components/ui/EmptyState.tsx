import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: 'color-mix(in srgb, var(--muted) 10%, transparent)',
          color: 'var(--muted)',
        }}
      >
        {icon || <Inbox size={24} />}
      </div>
      <div>
        <p className="font-medium" style={{ color: 'var(--foreground)' }}>
          {title}
        </p>
        {description && (
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
