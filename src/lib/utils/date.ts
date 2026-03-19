import { format, parse, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns'
import { ko } from 'date-fns/locale'

export const DATE_FORMAT = 'yyyy-MM-dd'
export const DISPLAY_DATE_FORMAT = 'M월 d일'
export const DISPLAY_DATE_WITH_DAY = 'M월 d일 (EEE)'

export function formatDate(date: Date | string, fmt: string = DISPLAY_DATE_FORMAT): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, fmt, { locale: ko })
}

export function formatDateISO(date: Date): string {
  return format(date, DATE_FORMAT)
}

export function today(): string {
  return formatDateISO(new Date())
}

export function getDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date()
  const start = subDays(end, days)
  return {
    startDate: formatDateISO(start),
    endDate: formatDateISO(end),
  }
}

export function getMonthRange(monthsAgo: number = 0): { startDate: string; endDate: string } {
  const target = subMonths(new Date(), monthsAgo)
  return {
    startDate: formatDateISO(startOfMonth(target)),
    endDate: formatDateISO(endOfMonth(target)),
  }
}

export function getDayOfWeek(dateStr: string): string {
  return format(new Date(dateStr), 'EEE', { locale: ko })
}
