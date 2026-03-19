import { MonthlyStatistics, FiveYearChartData } from '@/types/statistics'

export function toFiveYearChartData(stats: MonthlyStatistics[]): FiveYearChartData[] {
  const recentYears = stats.slice(0, 5)
  const months = Array.from({ length: 12 }, (_, i) => `${i + 1}월`)

  return months.map((month, monthIndex) => {
    const row: FiveYearChartData = { month }
    recentYears.forEach((yearData) => {
      row[String(yearData.year)] = yearData.months[monthIndex]
    })
    return row
  })
}

export function getChartYears(stats: MonthlyStatistics[], count: number = 5): string[] {
  return stats.slice(0, count).map((s) => String(s.year))
}
