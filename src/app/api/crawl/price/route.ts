import { NextRequest, NextResponse } from 'next/server'
import { crawlPrices } from '@/lib/crawlers/price-crawler'
import { savePriceRecords } from '@/lib/google-sheets/price'
import { ChickenPrice } from '@/types/price'
import { ApiResponse } from '@/types/api'
import { PriceResponse } from '@/types/price'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startDate, endDate } = body

    if (!startDate || !endDate) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '시작일과 종료일을 입력해주세요' },
        { status: 400 }
      )
    }

    const result = await crawlPrices(startDate, endDate)

    const prices: ChickenPrice[] = result.prices.map((p) => ({
      date: p.date,
      dayOfWeek: p.dayOfWeek,
      broilerLarge: p.broilerLarge,
      broilerMedium: p.broilerMedium,
      broilerSmall: p.broilerSmall,
      chick: p.chick,
      breedingHen: p.breedingHen,
    }))

    // Google Sheets 저장 시도 (실패해도 크롤링 데이터는 반환)
    let saveMessage = ''
    try {
      await savePriceRecords(prices)
      saveMessage = `${prices.length}건의 시세 데이터를 저장했습니다`
    } catch {
      saveMessage = `${prices.length}건의 시세를 가져왔습니다 (Google Sheets 미연동)`
    }

    return NextResponse.json<ApiResponse<PriceResponse>>({
      success: true,
      data: {
        prices,
        average: result.average,
      },
      message: saveMessage,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '크롤링 중 오류 발생'
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 })
  }
}
