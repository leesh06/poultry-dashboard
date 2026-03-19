'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ChartTooltip } from '@/components/ui/ChartTooltip'
import {
  Download,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'
import { formatNumber } from '@/lib/utils/number'
import { STAT_COLORS } from '@/types/statistics'
import type { FiveYearChartData } from '@/types/statistics'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const DEMO_DATA: FiveYearChartData[] = [
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

const DEMO_YEARS = ['2026', '2025', '2024', '2023', '2022']

interface YearlyTotal {
  year: string
  total: number
  prevTotal: number | null
  changeRate: number | null
}

function calcYearlyTotals(data: FiveYearChartData[], years: string[]): YearlyTotal[] {
  return years.map((year, i) => {
    const total = data.reduce((sum, row) => {
      const val = row[year]
      return sum + (typeof val === 'number' ? val : 0)
    }, 0)
    const prevYear = years[i + 1]
    let prevTotal: number | null = null
    let changeRate: number | null = null

    if (prevYear) {
      prevTotal = data.reduce((sum, row) => {
        const val = row[prevYear]
        return sum + (typeof val === 'number' ? val : 0)
      }, 0)
      if (prevTotal > 0) {
        changeRate = ((total - prevTotal) / prevTotal) * 100
      }
    }

    return { year, total, prevTotal, changeRate }
  })
}

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

export default function StatisticsPage() {
  const [chartData, setChartData] = useState<FiveYearChartData[]>(DEMO_DATA)
  const [years, setYears] = useState<string[]>(DEMO_YEARS)
  const [crawling, setCrawling] = useState(false)
  const [isDemo, setIsDemo] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/statistics')
        const result = await res.json()
        if (result.success && result.data?.length > 0) {
          const recentYears = result.data.slice(0, 5)
          const yearLabels = recentYears.map((s: { year: number }) => String(s.year))
          const converted: FiveYearChartData[] = MONTHS.map((month, mi) => {
            const row: FiveYearChartData = { month }
            recentYears.forEach((yearData: { year: number; months: (number | null)[] }) => {
              row[String(yearData.year)] = yearData.months[mi]
            })
            return row
          })
          setChartData(converted)
          setYears(yearLabels)
          setIsDemo(false)
        }
      } catch {
        // API 미연결 - 데모 데이터 유지
      }
    }
    loadData()
  }, [])

  const yearlyTotals = calcYearlyTotals(chartData, years)

  const handleCrawl = async () => {
    setCrawling(true)
    setMessage('')
    try {
      const res = await fetch('/api/crawl/statistics', { method: 'POST' })
      const result = await res.json()
      if (result.success && result.data) {
        setMessage(result.message || '데이터를 업데이트했습니다')
        // 크롤링 API가 직접 stats를 반환
        const statsArray = result.data.stats || result.data
        if (Array.isArray(statsArray) && statsArray.length > 0) {
          const recentYears = statsArray.slice(0, 5)
          const yearLabels = recentYears.map((s: { year: number }) => String(s.year))
          const converted: FiveYearChartData[] = MONTHS.map((month, mi) => {
            const row: FiveYearChartData = { month }
            recentYears.forEach((yearData: { year: number; months: (number | null)[] }) => {
              row[String(yearData.year)] = yearData.months[mi]
            })
            return row
          })
          setChartData(converted)
          setYears(yearLabels)
          setIsDemo(false)
        }
      } else {
        setMessage(result.error || '데이터를 가져오지 못했습니다')
      }
    } catch {
      setMessage('네트워크 오류가 발생했습니다')
    } finally {
      setCrawling(false)
    }
  }

  return (
    <>
      <Header
        title="종계입식현황"
        subtitle="대한양계협회 통계"
        action={
          <Button
            variant="secondary"
            size="sm"
            loading={crawling}
            icon={<Download size={14} />}
            onClick={handleCrawl}
          >
            업데이트
          </Button>
        }
      />

      <PageContainer className="space-y-4 pb-4">
        {message && (
          <div
            className="rounded-xl px-4 py-3 text-xs text-center animate-fade-in"
            style={{
              background: message.includes('오류') || message.includes('못')
                ? 'color-mix(in srgb, var(--danger) 10%, transparent)'
                : 'color-mix(in srgb, var(--success) 10%, transparent)',
              color: message.includes('오류') || message.includes('못')
                ? 'var(--danger)'
                : 'var(--success)',
            }}
          >
            {message}
          </div>
        )}

        {/* ─── Year Summary Cards ─── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 animate-fade-in-up stagger-1">
          {yearlyTotals.slice(0, 5).map(({ year, total, changeRate }, i) => (
            <Card key={year} padding="sm">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="h-2 w-2 rounded-full" style={{ background: STAT_COLORS[i] }} />
                <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                  {year}년
                </span>
              </div>
              <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
                {formatNumber(total)}
              </p>
              {changeRate !== null && (
                <div className="flex items-center gap-0.5 text-xs">
                  {changeRate > 0 ? (
                    <ArrowUpRight size={12} style={{ color: 'var(--success)' }} />
                  ) : changeRate < 0 ? (
                    <ArrowDownRight size={12} style={{ color: 'var(--danger)' }} />
                  ) : (
                    <Minus size={12} style={{ color: 'var(--muted)' }} />
                  )}
                  <span
                    className="tabular-nums"
                    style={{
                      color: changeRate > 0 ? 'var(--success)' : changeRate < 0 ? 'var(--danger)' : 'var(--muted)',
                    }}
                  >
                    {changeRate > 0 ? '+' : ''}{changeRate.toFixed(1)}%
                  </span>
                </div>
              )}
              <p className="text-[10px]" style={{ color: 'var(--muted)' }}>천수</p>
            </Card>
          ))}
        </div>

        {/* ─── 5 Year Chart ─── */}
        <Card className="animate-fade-in-up stagger-2" padding="lg">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} style={{ color: 'var(--primary)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                최근 5년간 종계입식변화
              </h3>
            </div>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
              단위: 천수 {isDemo && '(데모 데이터)'}
            </p>
          </div>

          <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
            {years.map((year, i) => (
              <div key={year} className="flex items-center gap-1.5 text-xs">
                <div
                  className="h-[3px] w-4 rounded-full"
                  style={{ background: STAT_COLORS[i] }}
                />
                <span style={{ color: 'var(--muted)' }}>{year}</span>
              </div>
            ))}
          </div>

          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: '천수',
                    position: 'insideTopLeft',
                    offset: 10,
                    style: { fontSize: 10, fill: 'var(--muted)' },
                  }}
                />
                <Tooltip
                  content={<ChartTooltip formatter={(v) => formatNumber(v) + '천수'} />}
                />
                {years.map((year, i) => (
                  <Line
                    key={year}
                    type="monotone"
                    dataKey={year}
                    name={year + '년'}
                    stroke={STAT_COLORS[i]}
                    strokeWidth={i === 0 ? 3 : 1.5}
                    dot={{
                      r: i === 0 ? 4 : 2.5,
                      fill: STAT_COLORS[i],
                      strokeWidth: i === 0 ? 2 : 0,
                      stroke: i === 0 ? '#fff' : undefined,
                    }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ─── Data Table (horizontally scrollable) ─── */}
        <Card className="animate-fade-in-up stagger-3 overflow-hidden" padding="sm">
          <h3
            className="mb-3 px-2 text-sm font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            연도별 상세
          </h3>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[640px] text-xs">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th
                    className="sticky left-0 z-10 px-2 py-2 text-left font-semibold"
                    style={{ background: 'var(--card-bg)', color: 'var(--muted)' }}
                  >
                    구분
                  </th>
                  {MONTHS.map(m => (
                    <th key={m} className="px-2 py-2 text-right font-medium" style={{ color: 'var(--muted)' }}>
                      {m}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-right font-semibold" style={{ color: 'var(--foreground)' }}>
                    합계
                  </th>
                </tr>
              </thead>
              <tbody>
                {years.map((year, yi) => {
                  const yearTotal = chartData.reduce((sum, row) => {
                    const val = row[year]
                    return sum + (typeof val === 'number' ? val : 0)
                  }, 0)

                  return (
                    <tr
                      key={year}
                      style={{
                        borderBottom: '1px solid color-mix(in srgb, var(--border-color) 50%, transparent)',
                      }}
                    >
                      <td
                        className="sticky left-0 z-10 px-2 py-2.5 font-semibold"
                        style={{
                          background: 'var(--card-bg)',
                          color: STAT_COLORS[yi],
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ background: STAT_COLORS[yi] }} />
                          {year}
                        </div>
                      </td>
                      {MONTHS.map((month, mi) => {
                        const val = chartData[mi]?.[year]
                        return (
                          <td
                            key={month}
                            className="px-2 py-2.5 text-right tabular-nums"
                            style={{
                              color: val != null ? 'var(--foreground)' : 'var(--muted)',
                              opacity: val != null ? 1 : 0.3,
                            }}
                          >
                            {val != null ? formatNumber(val as number) : '-'}
                          </td>
                        )
                      })}
                      <td
                        className="px-2 py-2.5 text-right font-bold tabular-nums"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {yearTotal > 0 ? formatNumber(yearTotal) : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-right text-[10px] px-2" style={{ color: 'var(--muted)' }}>
            자료: 대한양계협회
          </p>
        </Card>
      </PageContainer>
    </>
  )
}
