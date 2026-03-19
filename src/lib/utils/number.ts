export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value)
}

export function formatCurrency(value: number, unit: string = '원'): string {
  return `${formatNumber(value)}${unit}`
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function parseNumberString(str: string): number {
  if (!str || str.trim() === '' || str.trim() === '-') return 0
  return parseInt(str.replace(/,/g, '').trim(), 10) || 0
}

export function calcRate(part: number, total: number): number {
  if (total === 0) return 0
  return (part / total) * 100
}
