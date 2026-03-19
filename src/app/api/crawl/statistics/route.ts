import { NextResponse } from 'next/server'
import { crawlStatistics } from '@/lib/crawlers/statistics-crawler'
import { saveStatisticsRecords } from '@/lib/google-sheets/statistics'
import { ApiResponse } from '@/types/api'
import { MonthlyStatistics } from '@/types/statistics'

export async function POST() {
  try {
    const result = await crawlStatistics()

    if (result.statistics.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '크롤링된 데이터가 없습니다',
      }, { status: 404 })
    }

    const stats: MonthlyStatistics[] = result.statistics.map((s) => ({
      year: s.year,
      months: s.months,
      total: s.total,
    }))

    // Google Sheets 저장 시도 (실패해도 크롤링 데이터는 반환)
    let saveMessage = ''
    try {
      await saveStatisticsRecords(stats)
      saveMessage = `${stats.length}개 연도의 입식현황을 저장했습니다`
    } catch {
      saveMessage = `${stats.length}개 연도의 입식현황을 가져왔습니다 (Google Sheets 미연동)`
    }

    return NextResponse.json<ApiResponse<{ stats: MonthlyStatistics[]; count: number; latestYear: number }>>({
      success: true,
      data: {
        stats,
        count: stats.length,
        latestYear: stats[0]?.year || 0,
      },
      message: saveMessage,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '크롤링 중 오류 발생'
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 })
  }
}
