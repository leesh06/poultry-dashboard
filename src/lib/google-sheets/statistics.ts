import { getSheets, SPREADSHEET_ID, SHEET_NAMES } from './client'
import { MonthlyStatistics } from '@/types/statistics'

const RANGE = `${SHEET_NAMES.statistics}!A:C`

export async function getStatisticsRecords(): Promise<MonthlyStatistics[]> {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID!,
    range: RANGE,
  })

  const rows = res.data.values || []
  if (rows.length <= 1) return []

  const byYear = new Map<number, (number | null)[]>()

  for (const row of rows.slice(1)) {
    const year = parseInt(row[0] || '0', 10)
    const month = parseInt(row[1] || '0', 10)
    const count = row[2] ? parseInt(row[2], 10) : null

    if (!year || !month) continue

    if (!byYear.has(year)) {
      byYear.set(year, new Array(12).fill(null))
    }
    const months = byYear.get(year)!
    months[month - 1] = count
  }

  return Array.from(byYear.entries())
    .map(([year, months]) => ({
      year,
      months,
      total: months.reduce<number | null>((sum, v) => {
        if (v === null) return sum
        return (sum || 0) + v
      }, null),
    }))
    .sort((a, b) => b.year - a.year)
}

export async function saveStatisticsRecords(stats: MonthlyStatistics[]): Promise<void> {
  if (stats.length === 0) return

  const sheets = getSheets()

  // 새 데이터 먼저 준비
  const rows: string[][] = []
  for (const stat of stats) {
    for (let m = 0; m < 12; m++) {
      if (stat.months[m] !== null) {
        rows.push([
          String(stat.year),
          String(m + 1),
          String(stat.months[m]),
        ])
      }
    }
  }

  if (rows.length > 0) {
    // 데이터가 유효할 때만 기존 데이터 클리어 후 저장
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID!,
      range: `${SHEET_NAMES.statistics}!A2:C`,
    })

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID!,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
    })
  }
}
