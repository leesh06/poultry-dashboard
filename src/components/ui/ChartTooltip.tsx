'use client'

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
  }>
  label?: string
  formatter?: (value: number) => string
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div
      className="rounded-xl px-3 py-2.5 text-xs shadow-lg"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-color)',
      }}
    >
      <p className="mb-1.5 font-medium" style={{ color: 'var(--foreground)' }}>
        {label}
      </p>
      <div className="flex flex-col gap-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: entry.color }}
            />
            <span style={{ color: 'var(--muted)' }}>{entry.name}</span>
            <span className="ml-auto font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>
              {formatter ? formatter(entry.value) : entry.value?.toLocaleString('ko-KR')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
