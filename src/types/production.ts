export type BuildingNumber = 1 | 2 | 3

export type Session = 'morning' | 'afternoon'

export const SESSION_LABELS: Record<Session, string> = {
  morning: '오전',
  afternoon: '오후',
}

export const BUILDING_LABELS: Record<BuildingNumber, string> = {
  1: '1동',
  2: '2동',
  3: '3동',
}

export interface ProductionRecord {
  date: string
  session: Session
  building: BuildingNumber
  count: number
  brokenCount: number
  memo: string
}

export interface DailyProductionSummary {
  date: string
  totalCount: number
  totalBroken: number
  brokenRate: number
  buildings: {
    building: BuildingNumber
    morning: { count: number; brokenCount: number }
    afternoon: { count: number; brokenCount: number }
  }[]
}

export interface ProductionFormData {
  date: string
  session: Session
  buildings: {
    building: BuildingNumber
    count: number
    brokenCount: number
  }[]
  memo: string
}
