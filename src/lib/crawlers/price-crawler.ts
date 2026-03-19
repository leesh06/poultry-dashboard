import { parse as parseHTML } from 'node-html-parser'

export interface CrawledPrice {
  date: string
  dayOfWeek: string
  broilerLarge: number
  broilerMedium: number
  broilerSmall: number
  chick: number
  breedingHen: number
}

export interface CrawledPriceResult {
  prices: CrawledPrice[]
  average: {
    broilerLarge: number
    broilerMedium: number
    broilerSmall: number
    chick: number
    breedingHen: number
  } | null
}

// chicken.or.kr은 연도별 페이지를 사용하며, 최신 연도 페이지가 없을 수 있음
async function getPriceUrl(): Promise<string> {
  const year = new Date().getFullYear()
  for (const y of [year, year - 1]) {
    const url = `https://chicken.or.kr/ch_price/price_${y}.php`
    try {
      const res = await fetch(url, { method: 'HEAD' })
      if (res.ok) return url
    } catch { /* 다음 연도 시도 */ }
  }
  return `https://chicken.or.kr/ch_price/price_${year - 1}.php`
}

function parseNum(str: string): number {
  if (!str || str.trim() === '' || str.trim() === '-') return 0
  return parseInt(str.replace(/,/g, '').trim(), 10) || 0
}

export async function crawlPrices(startDate: string, endDate: string): Promise<CrawledPriceResult> {
  const formData = new URLSearchParams()
  formData.append('sdate', startDate)
  formData.append('edate', endDate)

  const priceUrl = await getPriceUrl()
  const response = await fetch(priceUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0',
    },
    body: formData.toString(),
  })

  if (!response.ok) {
    throw new Error(`시세 크롤링 실패: HTTP ${response.status}`)
  }

  let html: string
  try {
    const buffer = await response.arrayBuffer()
    // 먼저 UTF-8 시도
    html = new TextDecoder('utf-8').decode(buffer)
    // 한글이 깨졌는지 확인 (깨지면 euc-kr 시도)
    if (html.includes('�')) {
      html = new TextDecoder('euc-kr').decode(buffer)
    }
  } catch {
    html = await response.text()
  }

  const root = parseHTML(html)
  const table = root.querySelector('table.sub_priceTable')
  if (!table) {
    throw new Error('시세 테이블을 찾을 수 없습니다')
  }

  const prices: CrawledPrice[] = []

  // tbody에서 데이터 행 추출
  const tbody = table.querySelector('tbody')
  if (tbody) {
    const rows = tbody.querySelectorAll('tr')
    for (const row of rows) {
      const cells = row.querySelectorAll('td')
      if (cells.length >= 7) {
        const dateText = cells[0].text.trim()
        // 날짜 형식 변환: MM/DD 또는 YYYY-MM-DD 등
        if (!dateText || dateText === '') continue

        prices.push({
          date: dateText,
          dayOfWeek: cells[1].text.trim(),
          broilerLarge: parseNum(cells[2].text),
          broilerMedium: parseNum(cells[3].text),
          broilerSmall: parseNum(cells[4].text),
          chick: parseNum(cells[5].text),
          breedingHen: parseNum(cells[6].text),
        })
      }
    }
  }

  // tfoot에서 평균값 추출
  let average: CrawledPriceResult['average'] = null
  const tfoot = table.querySelector('tfoot')
  if (tfoot) {
    const cells = tfoot.querySelectorAll('td')
    // 첫 번째 td는 "평균" (colspan=2), 그다음 5개가 값
    if (cells.length >= 6) {
      average = {
        broilerLarge: parseNum(cells[1].text),
        broilerMedium: parseNum(cells[2].text),
        broilerSmall: parseNum(cells[3].text),
        chick: parseNum(cells[4].text),
        breedingHen: parseNum(cells[5].text),
      }
    }
  }

  return { prices, average }
}
