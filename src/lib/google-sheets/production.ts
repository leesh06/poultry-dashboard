import { getSheets, SPREADSHEET_ID, SHEET_NAMES } from './client'
import { ProductionRecord, ProductionFormData, DailyProductionSummary, BuildingNumber, Session } from '@/types/production'
import { calcRate } from '@/lib/utils/number'

const RANGE = `${SHEET_NAMES.production}!A:F`

export async function getProductionRecords(startDate?: string, endDate?: string): Promise<ProductionRecord[]> {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  })

  const rows = res.data.values || []
  if (rows.length <= 1) return [] // 헤더만 있음

  let records: ProductionRecord[] = rows.slice(1).map((row) => ({
    date: row[0] || '',
    session: (row[1] || 'morning') as Session,
    building: parseInt(row[2] || '1', 10) as BuildingNumber,
    count: parseInt(row[3] || '0', 10),
    brokenCount: parseInt(row[4] || '0', 10),
    memo: row[5] || '',
  }))

  if (startDate) {
    records = records.filter((r) => r.date >= startDate)
  }
  if (endDate) {
    records = records.filter((r) => r.date <= endDate)
  }

  return records.sort((a, b) => b.date.localeCompare(a.date))
}

export async function addProductionRecords(formData: ProductionFormData): Promise<void> {
  const sheets = getSheets()
  const rows = formData.buildings.map((b) => [
    formData.date,
    formData.session,
    String(b.building),
    String(b.count),
    String(b.brokenCount),
    formData.memo,
  ])

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  })
}

export function summarizeDaily(records: ProductionRecord[]): DailyProductionSummary[] {
  const byDate = new Map<string, ProductionRecord[]>()
  for (const r of records) {
    const existing = byDate.get(r.date) || []
    existing.push(r)
    byDate.set(r.date, existing)
  }

  const summaries: DailyProductionSummary[] = []
  for (const [date, dateRecords] of byDate) {
    const totalCount = dateRecords.reduce((s, r) => s + r.count, 0)
    const totalBroken = dateRecords.reduce((s, r) => s + r.brokenCount, 0)

    const buildings = ([1, 2, 3] as BuildingNumber[]).map((building) => {
      const morningRec = dateRecords.find((r) => r.building === building && r.session === 'morning')
      const afternoonRec = dateRecords.find((r) => r.building === building && r.session === 'afternoon')
      return {
        building,
        morning: { count: morningRec?.count || 0, brokenCount: morningRec?.brokenCount || 0 },
        afternoon: { count: afternoonRec?.count || 0, brokenCount: afternoonRec?.brokenCount || 0 },
      }
    })

    summaries.push({
      date,
      totalCount,
      totalBroken,
      brokenRate: calcRate(totalBroken, totalCount + totalBroken),
      buildings,
    })
  }

  return summaries.sort((a, b) => b.date.localeCompare(a.date))
}
