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
      className="rounded-2xl px-3.5 py-3 text-xs"
      style={{
        background: 'var(--foreground)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}
    >
      <p className="mb-1.5 font-medium" style={{ color: 'var(--background)', opacity: 0.7 }}>
        {label}
      </p>
      <div className="flex flex-col gap-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: entry.color }}
            />
            <span style={{ color: 'var(--background)', opacity: 0.7 }}>{entry.name}</span>
            <span className="ml-auto font-bold tabular-nums" style={{ color: 'var(--background)' }}>
              {formatter ? formatter(entry.value) : entry.value?.toLocaleString('ko-KR')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
