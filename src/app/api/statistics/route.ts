import { NextResponse } from 'next/server'
import { getStatisticsRecords } from '@/lib/google-sheets/statistics'
import { ApiResponse } from '@/types/api'
import { MonthlyStatistics } from '@/types/statistics'

export async function GET() {
  try {
    const stats = await getStatisticsRecords()

    return NextResponse.json<ApiResponse<MonthlyStatistics[]>>({
      success: true,
      data: stats,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 })
  }
}
