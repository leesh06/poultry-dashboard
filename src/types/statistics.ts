export interface MonthlyStatistics {
  year: number
  months: (number | null)[]  // 12개 값 (index 0 = 1월)
  total: number | null
}

export interface YearCompareRow {
  label: string  // '전년대비' 또는 연도
  values: (string | number | null)[]  // 12개월 + 합계
}

export interface FiveYearChartData {
  month: string
  [year: string]: number | string | null
}

export const STAT_COLORS = ['#669AFF', '#FF6766', '#FF9968', '#92ECAE', '#9A99FF']
