'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardHeader } from '@/components/ui/Card'
import { ChartTooltip } from '@/components/ui/ChartTooltip'
import {
  Egg,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { formatNumber, formatCurrency, formatPercent } from '@/lib/utils/number'
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
  Area,
  AreaChart,
} from 'recharts'

/* ─── Demo data (API 미연결시 표시) ─── */
const DEMO_PRODUCTION = [
  { date: '03/12', total: 2850, broken: 45 },
  { date: '03/13', total: 2920, broken: 38 },
  { date: '03/14', total: 2780, broken: 52 },
  { date: '03/15', total: 2910, broken: 41 },
  { date: '03/16', total: 2860, broken: 47 },
  { date: '03/17', total: 2940, broken: 35 },
  { date: '03/18', total: 2890, broken: 43 },
]

const DEMO_PRICES = [
  { date: '03/07', broilerLarge: 2690, broilerMedium: 2790, broilerSmall: 2890, chick: 900 },
  { date: '03/09', broilerLarge: 2790, broilerMedium: 2890, broilerSmall: 2990, chick: 900 },
  { date: '03/11', broilerLarge: 2750, broilerMedium: 2850, broilerSmall: 2950, chick: 910 },
  { date: '03/13', broilerLarge: 2830, broilerMedium: 2930, broilerSmall: 3030, chick: 905 },
  { date: '03/15', broilerLarge: 2780, broilerMedium: 2880, broilerSmall: 2980, chick: 915 },
  { date: '03/17', broilerLarge: 2810, broilerMedium: 2910, broilerSmall: 3010, chick: 910 },
  { date: '03/18', broilerLarge: 2800, broilerMedium: 2900, broilerSmall: 3000, chick: 905 },
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

const STAT_YEARS = ['2026', '2025', '2024', '2023', '2022']

interface DashboardData {
  todayProduction: number
  todayBroken: number
  brokenRate: number
  productionTrend: typeof DEMO_PRODUCTION
  prices: typeof DEMO_PRICES
  latestPrice: typeof DEMO_PRICES[0] | null
  statistics: typeof DEMO_STATISTICS
  statYears: string[]
  isDemo: boolean
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    todayProduction: 2890,
    todayBroken: 43,
    brokenRate: 1.5,
    productionTrend: DEMO_PRODUCTION,
    prices: DEMO_PRICES,
    latestPrice: DEMO_PRICES[DEMO_PRICES.length - 1],
    statistics: DEMO_STATISTICS,
    statYears: STAT_YEARS,
    isDemo: true,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, priceRes, statRes] = await Promise.allSettled([
          fetch('/api/production'),
          fetch('/api/price'),
          fetch('/api/statistics'),
        ])

        let isDemo = true
        const updates: Partial<DashboardData> = {}

        // 생산 데이터 반영
        if (prodRes.status === 'fulfilled' && prodRes.value.ok) {
          const prodData = await prodRes.value.json()
          if (prodData.success && prodData.data?.length > 0) {
            isDemo = false
            const summaries = prodData.data.slice(0, 7)
            updates.productionTrend = summaries.map((s: { date: string; totalCount: number; totalBroken: number }) => ({
              date: s.date.slice(5).replace('-', '/'),
              total: s.totalCount,
              broken: s.totalBroken,
            })).reverse()
            const today = summaries[0]
            updates.todayProduction = today.totalCount
            updates.todayBroken = today.totalBroken
            updates.brokenRate = today.brokenRate
          }
        }

        // 시세 데이터 반영
        if (priceRes.status === 'fulfilled' && priceRes.value.ok) {
          const priceData = await priceRes.value.json()
          if (priceData.success && priceData.data?.length > 0) {
            isDemo = false
            const prices = priceData.data.slice(0, 15)
            updates.prices = prices.map((p: { date: string; broilerLarge: number; broilerMedium: number; broilerSmall: number; chick: number }) => ({
              date: p.date.slice(5).replace('-', '/'),
              broilerLarge: p.broilerLarge,
              broilerMedium: p.broilerMedium,
              broilerSmall: p.broilerSmall,
              chick: p.chick,
            })).reverse()
            updates.latestPrice = {
              date: prices[0].date.slice(5).replace('-', '/'),
              broilerLarge: prices[0].broilerLarge,
              broilerMedium: prices[0].broilerMedium,
              broilerSmall: prices[0].broilerSmall,
              chick: prices[0].chick,
            }
          }
        }

        // 입식현황 데이터 반영
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

  return (
    <>
      <Header
        title="농장 대시보드"
        subtitle={todayStr}
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
            <span>데모 데이터로 표시 중입니다. Google Sheets 연동 후 실제 데이터가 표시됩니다.</span>
          </div>
        )}

        {/* ─── Summary Cards ─── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* 오늘 생산량 */}
          <Card className="animate-fade-in-up stagger-1">
            <CardHeader
              icon={<Egg size={18} />}
              title="오늘 생산"
              color="var(--primary)"
            />
            <p
              className="mt-3 text-2xl font-bold tabular-nums animate-count-up"
              style={{ color: 'var(--foreground)' }}
            >
              {formatNumber(data.todayProduction)}
              <span className="ml-1 text-xs font-normal" style={{ color: 'var(--muted)' }}>개</span>
            </p>
          </Card>

          {/* 파란율 */}
          <Card className="animate-fade-in-up stagger-2">
            <CardHeader
              icon={<AlertTriangle size={18} />}
              title="파란율"
              color="var(--accent)"
            />
            <p className="mt-3 text-2xl font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
              {formatPercent(data.brokenRate)}
            </p>
            <p className="text-xs tabular-nums" style={{ color: 'var(--muted)' }}>
              {formatNumber(data.todayBroken)}개
            </p>
          </Card>

          {/* 육계시세 */}
          <Card className="animate-fade-in-up stagger-3">
            <CardHeader
              icon={<TrendingUp size={18} />}
              title="육계(대)"
              color={PRICE_COLORS.broilerLarge}
            />
            <p className="mt-3 text-2xl font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
              {data.latestPrice ? formatCurrency(data.latestPrice.broilerLarge) : '-'}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>/kg</p>
          </Card>

          {/* 병아리시세 */}
          <Card className="animate-fade-in-up stagger-4">
            <CardHeader
              icon={<TrendingDown size={18} />}
              title="병아리"
              color={PRICE_COLORS.chick}
            />
            <p className="mt-3 text-2xl font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
              {data.latestPrice ? formatCurrency(data.latestPrice.chick) : '-'}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>/수</p>
          </Card>
        </div>

        {/* ─── Production Trend Chart ─── */}
        <Card className="animate-fade-in-up stagger-3" padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                생산량 추이
              </h3>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>최근 7일</p>
            </div>
            <div
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-medium"
              style={{
                background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                color: 'var(--primary)',
              }}
            >
              <Egg size={10} />
              일별 총생산
            </div>
          </div>
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.productionTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={['dataMin - 100', 'dataMax + 100']}
                />
                <Tooltip
                  content={<ChartTooltip formatter={(v) => formatNumber(v) + '개'} />}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="생산량"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fill="url(#prodGradient)"
                  dot={{ r: 3, fill: 'var(--primary)', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ─── Price Trend Chart ─── */}
        <Card className="animate-fade-in-up stagger-4" padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                시세 추이
              </h3>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>생계시세 (원/kg)</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'broilerLarge', label: '대' },
                { key: 'broilerMedium', label: '중' },
                { key: 'broilerSmall', label: '소' },
              ].map(({ key, label }) => (
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
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={<ChartTooltip formatter={(v) => formatCurrency(v)} />}
                />
                {[
                  { key: 'broilerLarge', name: '육계(대)' },
                  { key: 'broilerMedium', name: '육계(중)' },
                  { key: 'broilerSmall', name: '육계(소)' },
                ].map(({ key, name }) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={name}
                    stroke={PRICE_COLORS[key]}
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: PRICE_COLORS[key], strokeWidth: 0 }}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ─── Statistics Chart ─── */}
        <Card className="animate-fade-in-up stagger-5" padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                종계입식현황
              </h3>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>최근 5년 비교 (천수)</p>
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
                <Tooltip
                  content={<ChartTooltip formatter={(v) => formatNumber(v) + '천수'} />}
                />
                {data.statYears.map((year, i) => (
                  <Line
                    key={year}
                    type="monotone"
                    dataKey={year}
                    name={year + '년'}
                    stroke={STAT_COLORS[i]}
                    strokeWidth={year === data.statYears[0] ? 2.5 : 1.5}
                    strokeDasharray={year === data.statYears[0] ? undefined : undefined}
                    dot={{ r: year === data.statYears[0] ? 3 : 2, fill: STAT_COLORS[i], strokeWidth: 0 }}
                    activeDot={{ r: 4 }}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ─── Quick price table ─── */}
        <Card className="animate-fade-in-up stagger-6" padding="lg">
          <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            최신 시세 요약
          </h3>
          <div className="space-y-2">
            {data.latestPrice && [
              { label: '육계(대)', value: data.latestPrice.broilerLarge, unit: '원/kg', color: PRICE_COLORS.broilerLarge },
              { label: '육계(중)', value: data.latestPrice.broilerMedium, unit: '원/kg', color: PRICE_COLORS.broilerMedium },
              { label: '육계(소)', value: data.latestPrice.broilerSmall, unit: '원/kg', color: PRICE_COLORS.broilerSmall },
              { label: '병아리', value: data.latestPrice.chick, unit: '원/수', color: PRICE_COLORS.chick },
            ].map(({ label, value, unit, color }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl px-3 py-2.5"
                style={{ background: 'var(--surface-alt)' }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: color }} />
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>{label}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
                    {formatNumber(value)}
                  </span>
                  <span className="ml-1 text-xs" style={{ color: 'var(--muted)' }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </PageContainer>
    </>
  )
}
