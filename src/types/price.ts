export interface ChickenPrice {
  date: string
  dayOfWeek: string
  broilerLarge: number
  broilerMedium: number
  broilerSmall: number
  chick: number
  breedingHen: number
}

export interface PriceAverage {
  broilerLarge: number
  broilerMedium: number
  broilerSmall: number
  chick: number
  breedingHen: number
}

export interface PriceResponse {
  prices: ChickenPrice[]
  average: PriceAverage | null
}

export const PRICE_LABELS: Record<string, string> = {
  broilerLarge: '육계(대)',
  broilerMedium: '육계(중)',
  broilerSmall: '육계(소)',
  chick: '병아리',
  breedingHen: '종계노계',
}

export const PRICE_COLORS: Record<string, string> = {
  broilerLarge: '#669AFF',
  broilerMedium: '#FF6766',
  broilerSmall: '#FF9968',
  chick: '#92ECAE',
  breedingHen: '#9A99FF',
}
