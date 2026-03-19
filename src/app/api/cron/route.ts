import { NextRequest, NextResponse } from 'next/server'
import { crawlPrices } from '@/lib/crawlers/price-crawler'
import { savePriceRecords } from '@/lib/google-sheets/price'
import { crawlStatistics } from '@/lib/crawlers/statistics-crawler'
import { saveStatisticsRecords } from '@/lib/google-sheets/statistics'
import { ChickenPrice } from '@/types/price'
import { MonthlyStatistics } from '@/types/statistics'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  // Vercel Cron 인증 확인
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }

  const results: string[] = []

  // 시세 크롤링 (최근 7일)
  try {
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const fmt = (d: Date) => d.toISOString().split('T')[0]
    const result = await crawlPrices(fmt(weekAgo), fmt(today))

    const prices: ChickenPrice[] = result.prices.map((p) => ({
      date: p.date,
      dayOfWeek: p.dayOfWeek,
      broilerLarge: p.broilerLarge,
      broilerMedium: p.broilerMedium,
      broilerSmall: p.broilerSmall,
      chick: p.chick,
      breedingHen: p.breedingHen,
    }))

    await savePriceRecords(prices)
    results.push(`시세 ${prices.length}건 저장`)
  } catch (error) {
    results.push(`시세 크롤링 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }

  // 입식현황 크롤링
  try {
    const result = await crawlStatistics()
    const stats: MonthlyStatistics[] = result.statistics.map((s) => ({
      year: s.year,
      months: s.months,
      total: s.total,
    }))

    await saveStatisticsRecords(stats)
    results.push(`입식현황 ${stats.length}개 연도 저장`)
  } catch (error) {
    results.push(`입식현황 크롤링 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    results,
  })
}
