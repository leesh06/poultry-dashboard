'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ChartTooltip } from '@/components/ui/ChartTooltip'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
  Download,
  TrendingUp,
  Calendar,
  RefreshCw,
} from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/utils/number'
import { PRICE_LABELS, PRICE_COLORS } from '@/types/price'
import type { ChickenPrice, PriceAverage } from '@/types/price'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const DEMO_PRICES: ChickenPrice[] = [
  { date: '2026-03-07', dayOfWeek: '토', broilerLarge: 2690, broilerMedium: 2790, broilerSmall: 2890, chick: 900, breedingHen: 580 },
  { date: '2026-03-09', dayOfWeek: '월', broilerLarge: 2790, broilerMedium: 2890, broilerSmall: 2990, chick: 900, breedingHen: 580 },
  { date: '2026-03-11', dayOfWeek: '수', broilerLarge: 2750, broilerMedium: 2850, broilerSmall: 2950, chick: 910, breedingHen: 585 },
  { date: '2026-03-13', dayOfWeek: '금', broilerLarge: 2830, broilerMedium: 2930, broilerSmall: 3030, chick: 905, breedingHen: 590 },
  { date: '2026-03-15', dayOfWeek: '일', broilerLarge: 2780, broilerMedium: 2880, broilerSmall: 2980, chick: 915, breedingHen: 585 },
  { date: '2026-03-17', dayOfWeek: '화', broilerLarge: 2810, broilerMedium: 2910, broilerSmall: 3010, chick: 910, breedingHen: 590 },
  { date: '2026-03-18', dayOfWeek: '수', broilerLarge: 2800, broilerMedium: 2900, broilerSmall: 3000, chick: 905, breedingHen: 595 },
]

export default function PricePage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])
  const [prices, setPrices] = useState<ChickenPrice[]>(DEMO_PRICES)
  const [average, setAverage] = useState<PriceAverage | null>(null)
  const [crawling, setCrawling] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isDemo, setIsDemo] = useState(true)
  const [message, setMessage] = useState('')

  const handleCrawl = async () => {
    setCrawling(true)
    setMessage('')
    try {
      const res = await fetch('/api/crawl/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        const sortedPrices = [...data.data.prices].sort((a: ChickenPrice, b: ChickenPrice) => a.date.localeCompare(b.date))
        setPrices(sortedPrices)
        setAverage(data.data.average)
        setIsDemo(false)
        setMessage(data.message || '시세 데이터를 가져왔습니다')
      } else {
        setMessage(data.error || '시세를 가져오지 못했습니다')
      }
    } catch {
      setMessage('네트워크 오류가 발생했습니다')
    } finally {
      setCrawling(false)
    }
  }

  const chartData = prices.map(p => ({
    ...p,
    date: p.date.slice(5).replace('-', '/'),
  }))

  const PRICE_KEYS = ['broilerLarge', 'broilerMedium', 'broilerSmall', 'chick', 'breedingHen'] as const

  return (
    <>
      <Header
        title="시세 조회"
        subtitle="대한양계협회 생계시세"
      />

      <PageContainer className="space-y-4 pb-4">
        {/* ─── Date Range & Crawl ─── */}
        <Card className="animate-fade-in-up stagger-1">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--muted)' }}>
                  <Calendar size={12} />
                  시작일
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{
                    background: 'var(--surface-alt)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border-color)',
                  }}
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--muted)' }}>
                  <Calendar size={12} />
                  종료일
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{
                    background: 'var(--surface-alt)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border-color)',
                  }}
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              loading={crawling}
              icon={<Download size={16} />}
              onClick={handleCrawl}
              className="w-full"
            >
              {crawling ? '시세 가져오는 중...' : '시세 가져오기'}
            </Button>

            {message && (
              <p
                className="text-xs text-center animate-fade-in"
                style={{ color: message.includes('오류') || message.includes('못') ? 'var(--danger)' : 'var(--success)' }}
              >
                {message}
              </p>
            )}
          </div>
        </Card>

        {/* ─── Price Chart ─── */}
        <Card className="animate-fade-in-up stagger-2" padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                시세 추이
              </h3>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {isDemo ? '데모 데이터' : `${prices.length}일간 시세`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRICE_KEYS.map(key => (
                <div key={key} className="flex items-center gap-1 text-[10px]">
                  <div className="h-2 w-2 rounded-full" style={{ background: PRICE_COLORS[key] }} />
                  <span style={{ color: 'var(--muted)' }}>{PRICE_LABELS[key]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v)} />} />
                {PRICE_KEYS.map(key => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={PRICE_LABELS[key]}
                    stroke={PRICE_COLORS[key]}
                    strokeWidth={2}
                    dot={{ r: 2, fill: PRICE_COLORS[key], strokeWidth: 0 }}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ─── Average Summary ─── */}
        {average && (
          <Card className="animate-fade-in" padding="md">
            <h3 className="mb-2 text-xs font-semibold" style={{ color: 'var(--muted)' }}>
              기간 평균
            </h3>
            <div className="grid grid-cols-5 gap-2 text-center">
              {PRICE_KEYS.map(key => (
                <div key={key}>
                  <div className="h-1 rounded-full mb-2" style={{ background: PRICE_COLORS[key] }} />
                  <p className="text-[10px]" style={{ color: 'var(--muted)' }}>
                    {PRICE_LABELS[key]}
                  </p>
                  <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
                    {formatNumber(average[key])}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ─── Price Table (scrollable on mobile) ─── */}
        <Card className="animate-fade-in-up stagger-3 overflow-hidden" padding="sm">
          <h3
            className="mb-3 px-2 text-sm font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            시세 상세
          </h3>

          {/* Mobile: Card view */}
          <div className="sm:hidden space-y-2">
            {prices.map((price, i) => (
              <div
                key={i}
                className="rounded-xl p-3"
                style={{ background: 'var(--surface-alt)' }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                    {price.date} ({price.dayOfWeek})
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {(['broilerLarge', 'broilerMedium', 'broilerSmall'] as const).map(key => (
                    <div key={key}>
                      <p className="text-[10px]" style={{ color: 'var(--muted)' }}>
                        {PRICE_LABELS[key]}
                      </p>
                      <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
                        {formatNumber(price[key])}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                  {(['chick', 'breedingHen'] as const).map(key => (
                    <div key={key}>
                      <p className="text-[10px]" style={{ color: 'var(--muted)' }}>
                        {PRICE_LABELS[key]}
                      </p>
                      <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
                        {formatNumber(price[key])}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table view */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th className="px-3 py-2 text-left text-xs font-medium" style={{ color: 'var(--muted)' }}>일자</th>
                  <th className="px-3 py-2 text-left text-xs font-medium" style={{ color: 'var(--muted)' }}>요일</th>
                  {PRICE_KEYS.map(key => (
                    <th key={key} className="px-3 py-2 text-right text-xs font-medium" style={{ color: PRICE_COLORS[key] }}>
                      {PRICE_LABELS[key]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prices.map((price, i) => (
                  <tr
                    key={i}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid color-mix(in srgb, var(--border-color) 50%, transparent)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--surface-alt)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <td className="px-3 py-2.5 tabular-nums" style={{ color: 'var(--foreground)' }}>{price.date}</td>
                    <td className="px-3 py-2.5" style={{ color: 'var(--muted)' }}>{price.dayOfWeek}</td>
                    {PRICE_KEYS.map(key => (
                      <td key={key} className="px-3 py-2.5 text-right font-medium tabular-nums" style={{ color: 'var(--foreground)' }}>
                        {formatNumber(price[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </PageContainer>
    </>
  )
}
