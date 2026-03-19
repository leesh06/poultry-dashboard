import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: number
  text?: string
}

export function LoadingSpinner({ size = 24, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2
        size={size}
        className="animate-spin"
        style={{ color: 'var(--primary)' }}
      />
      {text && (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {text}
        </p>
      )}
    </div>
  )
}
