import { NextRequest, NextResponse } from 'next/server'
import { getProductionRecords, addProductionRecords, summarizeDaily } from '@/lib/google-sheets/production'
import { ProductionFormData } from '@/types/production'
import { ApiResponse, } from '@/types/api'
import { DailyProductionSummary } from '@/types/production'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined

    const records = await getProductionRecords(startDate, endDate)
    const summaries = summarizeDaily(records)

    return NextResponse.json<ApiResponse<DailyProductionSummary[]>>({
      success: true,
      data: summaries,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ProductionFormData = await request.json()

    if (!body.date || !body.session || !body.buildings) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '필수 항목이 누락되었습니다' },
        { status: 400 }
      )
    }

    await addProductionRecords(body)

    return NextResponse.json<ApiResponse>({
      success: true,
      message: '생산 기록이 저장되었습니다',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 })
  }
}
