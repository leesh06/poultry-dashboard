import { NextRequest, NextResponse } from 'next/server'
import { getPriceRecords } from '@/lib/google-sheets/price'
import { ApiResponse } from '@/types/api'
import { ChickenPrice } from '@/types/price'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined

    const prices = await getPriceRecords(startDate, endDate)

    return NextResponse.json<ApiResponse<ChickenPrice[]>>({
      success: true,
      data: prices,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 })
  }
}
