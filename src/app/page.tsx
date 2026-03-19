'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { ChartTooltip } from '@/components/ui/ChartTooltip'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  AlertTriangle,
  Activity,
} from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/utils/number'
import { PRICE_COLORS } from '@/types/price'
import { STAT_COLORS } from '@/types/statistics'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'

/* ─── 데모 데이터 (API 미연결시 표시) ─── */
const DEMO_PRICES = [
  { date: '03/04', broilerLarge: 2650, broilerMedium: 2750, broilerSmall: 2850, chick: 890, breedingHen: 590 },
  { date: '03/05', broilerLarge: 2690, broilerMedium: 2790, broilerSmall: 2890, chick: 900, breedingHen: 590 },
  { date: '03/06', broilerLarge: 2720, broilerMedium: 2820, broilerSmall: 2920, chick: 895, breedingHen: 595 },
  { date: '03/07', broilerLarge: 2690, broilerMedium: 2790, broilerSmall: 2890, chick: 900, breedingHen: 590 },
  { date: '03/08', broilerLarge: 2750, broilerMedium: 2850, broilerSmall: 2950, chick: 905, breedingHen: 600 },
  { date: '03/09', broilerLarge: 2790, broilerMedium: 2890, broilerSmall: 2990, chick: 900, breedingHen: 600 },
  { date: '03/10', broilerLarge: 2780, broilerMedium: 2880, broilerSmall: 2980, chick: 910, breedingHen: 605 },
  { date: '03/11', broilerLarge: 2750, broilerMedium: 2850, broilerSmall: 2950, chick: 910, breedingHen: 605 },
  { date: '03/12', broilerLarge: 2800, broilerMedium: 2900, broilerSmall: 3000, chick: 905, breedingHen: 610 },
  { date: '03/13', broilerLarge: 2830, broilerMedium: 2930, broilerSmall: 3030, chick: 905, breedingHen: 610 },
  { date: '03/14', broilerLarge: 2810, broilerMedium: 2910, broilerSmall: 3010, chick: 910, breedingHen: 615 },
  { date: '03/15', broilerLarge: 2780, broilerMedium: 2880, broilerSmall: 2980, chick: 915, breedingHen: 610 },
  { date: '03/16', broilerLarge: 2810, broilerMedium: 2910, broilerSmall: 3010, chick: 910, breedingHen: 615 },
  { date: '03/17', broilerLarge: 2820, broilerMedium: 2920, broilerSmall: 3020, chick: 912, breedingHen: 618 },
  { date: '03/18', broilerLarge: 2800, broilerMedium: 2900, broilerSmall: 3000, chick: 905, breedingHen: 615 },
]

const DEMO_STATISTICS = [
  { month: '1월', '2026': 575, '2025': 424, '2024': 515, '2023': 501, '2022': 495 },
  { month: '2월', '2026': null, '2025': 394, '2024': 502, '2023': 608, '2022': 517 },
  { month: '3월', '2026': null, '2025': 593, '2024': 629, '2023': 602, '2022': 618 },
  { month: '4월', '2026': null, '2025': 480, '2024': 552, '2023': 518, '2022': 540 },
  { month: '5월', '2026': null, '2025': 510, '2024': 588, '2023': 545, '2022': 562 },
  { month: '6월', '2026': null, '2025': 445, '2024': 498, '2023': 490, '2022': 505 },
  { month: '7월', '2026': null, '2025': 520, '2024': 540, '2023': 530, '2022': 548 },
  { month: '8월', '2026': null, '2025': 490, '2024': 510, '2023': 505, '2022': 520 },
  { month: '9월', '2026': null, '2025': 560, '2024': 580, '2023': 545, '2022': 555 },
  { month: '10월', '2026': null, '2025': 530, '2024': 565, '2023': 538, '2022': 542 },
  { month: '11월', '2026': null, '2025': 485, '2024': 520, '2023': 510, '2022': 528 },
  { month: '12월', '2026': null, '2025': 460, '2024': 495, '2023': 488, '2022': 510 },
]

const STAT_YEARS_DEFAULT = ['2026', '2025', '2024', '2023', '2022']

type PriceKey = 'broilerLarge' | 'broilerMedium' | 'broilerSmall' | 'chick' | 'breedingHen'

interface PriceItem {
  date: string
  broilerLarge: number
  broilerMedium: number
  broilerSmall: number
  chick: number
  breedingHen: number
}

interface DashboardData {
  prices: PriceItem[]
  latestPrice: PriceItem | null
  prevPrice: PriceItem | null
  statistics: typeof DEMO_STATISTICS
  statYears: string[]
  isDemo: boolean
}

const PRICE_UNITS: Record<PriceKey, string> = {
  broilerLarge: '원/kg',
  broilerMedium: '원/kg',
  broilerSmall: '원/kg',
  chick: '원/수',
  breedingHen: '원/kg',
}

const HERO_ITEMS: { key: PriceKey; label: string }[] = [
  { key: 'broilerLarge', label: '육계(대)' },
  { key: 'broilerMedium', label: '육계(중)' },
  { key: 'broilerSmall', label: '육계(소)' },
]

const SUB_ITEMS: { key: PriceKey; label: string }[] = [
  { key: 'chick', label: '병아리' },
  { key: 'breedingHen', label: '종계노계' },
]

function getDiff(current: number, prev: number) {
  const diff = current - prev
  if (diff > 0) return { value: diff, direction: 'up' as const }
  if (diff < 0) return { value: Math.abs(diff), direction: 'down' as const }
  return { value: 0, direction: 'flat' as const }
}

function DiffBadge({ current, prev, size = 'md' }: { current: number; prev: number; size?: 'md' | 'lg' }) {
  const { value, direction } = getDiff(current, prev)
  const color = direction === 'up'
    ? 'var(--danger)'
    : direction === 'down'
      ? '#4A90D9'
      : 'var(--muted)'

  const isLg = size === 'lg'
  const iconSize = isLg ? 14 : 12
  const textClass = isLg
    ? 'text-sm font-bold'
    : 'text-xs font-semibold'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 ${textClass} tabular-nums`}
      style={{
        color,
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
      }}
    >
      {direction === 'up' && <TrendingUp size={iconSize} />}
      {direction === 'down' && <TrendingDown size={iconSize} />}
      {direction === 'flat' && <Minus size={iconSize} />}
      {value > 0 ? formatNumber(value) : '보합'}
    </span>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    prices: DEMO_PRICES,
    latestPrice: DEMO_PRICES[DEMO_PRICES.length - 1],
    prevPrice: DEMO_PRICES[DEMO_PRICES.length - 2],
    statistics: DEMO_STATISTICS,
    statYears: STAT_YEARS_DEFAULT,
    isDemo: true,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [priceRes, statRes] = await Promise.allSettled([
          fetch('/api/price'),
          fetch('/api/statistics'),
        ])

        let isDemo = true
        const updates: Partial<DashboardData> = {}

        if (priceRes.status === 'fulfilled' && priceRes.value.ok) {
          const priceData = await priceRes.value.json()
          if (priceData.success && priceData.data?.length > 0) {
            isDemo = false
            const sorted = priceData.data.slice(0, 15)
            updates.prices = sorted.map((p: PriceItem & { date: string }) => ({
              date: p.date.slice(5).replace('-', '/'),
              broilerLarge: p.broilerLarge,
              broilerMedium: p.broilerMedium,
              broilerSmall: p.broilerSmall,
              chick: p.chick,
              breedingHen: p.breedingHen,
            })).reverse()
            updates.latestPrice = {
              date: sorted[0].date.slice(5).replace('-', '/'),
              broilerLarge: sorted[0].broilerLarge,
              broilerMedium: sorted[0].broilerMedium,
              broilerSmall: sorted[0].broilerSmall,
              chick: sorted[0].chick,
              breedingHen: sorted[0].breedingHen,
            }
            if (sorted.length > 1) {
              updates.prevPrice = {
                date: sorted[1].date.slice(5).replace('-', '/'),
                broilerLarge: sorted[1].broilerLarge,
                broilerMedium: sorted[1].broilerMedium,
                broilerSmall: sorted[1].broilerSmall,
                chick: sorted[1].chick,
                breedingHen: sorted[1].breedingHen,
              }
            }
          }
        }

        if (statRes.status === 'fulfilled' && statRes.value.ok) {
          const statData = await statRes.value.json()
          if (statData.success && statData.data?.length > 0) {
            isDemo = false
            const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
            const recentYears = statData.data.slice(0, 5)
            const yearKeys = recentYears.map((s: { year: number }) => String(s.year))
            updates.statYears = yearKeys
            updates.statistics = MONTH_LABELS.map((month, mi) => {
              const row: Record<string, string | number | null> = { month }
              for (const stat of recentYears) {
                row[String(stat.year)] = stat.months[mi]
              }
              return row
            }) as typeof DEMO_STATISTICS
          }
        }

        setData(prev => ({ ...prev, ...updates, isDemo }))
      } catch {
        // API 미연결 - 데모 데이터 유지
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  const { latestPrice, prevPrice } = data

  return (
    <>
      <Header
        title="오늘의 시세"
        subtitle={todayStr}
        action={
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wide uppercase"
            style={{
              background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
              color: 'var(--primary)',
            }}
          >
            <Activity size={11} />
            {data.isDemo && !loading ? '데모' : 'LIVE'}
          </div>
        }
      />

      <PageContainer className="space-y-4 pb-4">
        {/* Demo banner */}
        {data.isDemo && !loading && (
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs animate-fade-in"
            style={{
              background: 'color-mix(in srgb, var(--warning) 10%, transparent)',
              color: 'var(--warning)',
              border: '1px solid color-mix(in srgb, var(--warning) 20%, transparent)',
            }}
          >
            <AlertTriangle size={14} />
            <span>데모 데이터입니다. Google Sheets 연동 시 실제 시세가 표시됩니다.</span>
          </div>
        )}

        {/* ═══ 육계 시세 — 히어로 카드 ═══ */}
        <Card className="animate-fade-in-up stagger-1 !p-0 overflow-hidden" padding="sm">
          {/* 카드 헤더 띠 */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
            }}
          >
            <span className="text-sm font-bold tracking-wider text-white/90 uppercase">
              육계 생계시세
            </span>
            {latestPrice && (
              <span className="text-xs font-medium text-white/60">
                {latestPrice.date} 기준
              </span>
            )}
          </div>

          {/* 육계 3종 대형 표시 */}
          <div className="px-3 py-5 sm:px-5 sm:py-6">
            <div className="grid grid-cols-3 gap-2">
              {HERO_ITEMS.map(({ key, label }) => {
                const value = latestPrice?.[key] ?? 0
                const prev = prevPrice?.[key] ?? value
                return (
                  <div key={key} className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ background: PRICE_COLORS[key] }}
                      />
                      <span className="text-sm font-bold" style={{ color: 'var(--muted)' }}>
                        {label}
                      </span>
                    </div>
                    <p
                      className="text-2xl font-extrabold tabular-nums leading-none sm:text-3xl"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {formatNumber(value)}
                    </p>
                    <p className="text-xs mt-1 mb-2 font-medium" style={{ color: 'var(--muted)' }}>
                      원/kg
                    </p>
                    <DiffBadge current={value} prev={prev} />
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* ═══ 병아리 + 종계노계 카드 ═══ */}
        <div className="grid grid-cols-2 gap-3">
          {SUB_ITEMS.map(({ key, label }, i) => {
            const value = latestPrice?.[key] ?? 0
            const prev = prevPrice?.[key] ?? value
            return (
              <Card
                key={key}
                className={`animate-fade-in-up stagger-${i + 2}`}
                padding="lg"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: `color-mix(in srgb, ${PRICE_COLORS[key]} 14%, transparent)`,
                    }}
                  >
                    <div
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ background: PRICE_COLORS[key] }}
                    />
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--muted)' }}>
                    {label}
                  </span>
                </div>
                <p
                  className="text-3xl font-extrabold tabular-nums leading-none sm:text-4xl"
                  style={{ color: 'var(--foreground)' }}
                >
                  {formatNumber(value)}
                </p>
                <p className="text-xs mt-1 mb-3 font-medium" style={{ color: 'var(--muted)' }}>
                  {PRICE_UNITS[key]}
                </p>
                <DiffBadge current={value} prev={prev} size="lg" />
              </Card>
            )
          })}
        </div>

        {/* ═══ 육계 시세 추이 차트 ═══ */}
        <Card className="animate-fade-in-up stagger-3" padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                육계 시세 추이
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--muted)' }}>최근 15일 (원/kg)</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {HERO_ITEMS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-1 text-[10px]">
                  <div className="h-2 w-2 rounded-full" style={{ background: PRICE_COLORS[key] }} />
                  <span style={{ color: 'var(--muted)' }}>{label.replace('육계', '')}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.prices} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  {HERO_ITEMS.map(({ key }) => (
                    <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PRICE_COLORS[key]} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={PRICE_COLORS[key]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={['dataMin - 50', 'dataMax + 50']} />
                <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v)} />} />
                {HERO_ITEMS.map(({ key, label }) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={label}
                    stroke={PRICE_COLORS[key]}
                    strokeWidth={2}
                    fill={`url(#grad-${key})`}
                    dot={{ r: 2, fill: PRICE_COLORS[key], strokeWidth: 0 }}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ═══ 병아리 + 종계노계 시세 추이 차트 ═══ */}
        <Card className="animate-fade-in-up stagger-4" padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                병아리 · 종계노계 추이
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--muted)' }}>최근 15일</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUB_ITEMS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-1 text-[10px]">
                  <div className="h-2 w-2 rounded-full" style={{ background: PRICE_COLORS[key] }} />
                  <span style={{ color: 'var(--muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.prices} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={['dataMin - 20', 'dataMax + 20']} />
                <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v)} />} />
                {SUB_ITEMS.map(({ key, label }) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={label}
                    stroke={PRICE_COLORS[key]}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: PRICE_COLORS[key], strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ═══ 종계입식현황 차트 ═══ */}
        <Card className="animate-fade-in-up stagger-5" padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                종계입식현황
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--muted)' }}>최근 5년 비교 (천수)</p>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 size={14} style={{ color: 'var(--muted)' }} />
            </div>
          </div>
          <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1">
            {data.statYears.map((year, i) => (
              <div key={year} className="flex items-center gap-1 text-[10px]">
                <div className="h-2 w-2 rounded-full" style={{ background: STAT_COLORS[i] }} />
                <span style={{ color: 'var(--muted)' }}>{year}</span>
              </div>
            ))}
          </div>
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.statistics} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip formatter={(v) => formatNumber(v) + '천수'} />} />
                {data.statYears.map((year, i) => (
                  <Line
                    key={year}
                    type="monotone"
                    dataKey={year}
                    name={year + '년'}
                    stroke={STAT_COLORS[i]}
                    strokeWidth={year === data.statYears[0] ? 2.5 : 1.5}
                    dot={{ r: year === data.statYears[0] ? 3 : 2, fill: STAT_COLORS[i], strokeWidth: 0 }}
                    activeDot={{ r: 4 }}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </PageContainer>
    </>
  )
}
