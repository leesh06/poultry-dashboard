import { getSheets, SPREADSHEET_ID, SHEET_NAMES } from './client'
import { ChickenPrice } from '@/types/price'

const RANGE = `${SHEET_NAMES.price}!A:F`

export async function getPriceRecords(startDate?: string, endDate?: string): Promise<ChickenPrice[]> {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  })

  const rows = res.data.values || []
  if (rows.length <= 1) return []

  let records: ChickenPrice[] = rows.slice(1).map((row) => ({
    date: row[0] || '',
    dayOfWeek: '',
    broilerLarge: parseInt(row[1] || '0', 10),
    broilerMedium: parseInt(row[2] || '0', 10),
    broilerSmall: parseInt(row[3] || '0', 10),
    chick: parseInt(row[4] || '0', 10),
    breedingHen: parseInt(row[5] || '0', 10),
  }))

  if (startDate) records = records.filter((r) => r.date >= startDate)
  if (endDate) records = records.filter((r) => r.date <= endDate)

  return records.sort((a, b) => b.date.localeCompare(a.date))
}

export async function savePriceRecords(prices: ChickenPrice[]): Promise<void> {
  const sheets = getSheets()

  // 기존 데이터 가져오기
  const existing = await getPriceRecords()
  const existingDates = new Set(existing.map((p) => p.date))

  // 새로운 데이터만 필터링
  const newPrices = prices.filter((p) => !existingDates.has(p.date))

  if (newPrices.length === 0) return

  const rows = newPrices.map((p) => [
    p.date,
    String(p.broilerLarge),
    String(p.broilerMedium),
    String(p.broilerSmall),
    String(p.chick),
    String(p.breedingHen),
  ])

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  })
}
