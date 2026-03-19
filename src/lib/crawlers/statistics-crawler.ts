import { parse as parseHTML } from 'node-html-parser'

// chicken.or.kr SSL 인증서 체인 이슈 대응
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export interface CrawledStatistics {
  year: number
  months: (number | null)[]  // 12개 (index 0 = 1월)
  total: number | null
}

export interface CrawledYearComparison {
  label: string
  values: (string | null)[]  // 12개월 + 합계 = 13개
}

async function getStatUrl(): Promise<string> {
  const year = new Date().getFullYear()
  for (const y of [year, year - 1]) {
    const url = `https://chicken.or.kr/ch_statistics/statUser_${y}.php?Ncode=st1`
    try {
      const res = await fetch(url, { method: 'HEAD' })
      if (res.ok) return url
    } catch { /* 다음 연도 시도 */ }
  }
  return `https://chicken.or.kr/ch_statistics/statUser_${year - 1}.php?Ncode=st1`
}

function parseStatNum(str: string): number | null {
  if (!str || str.trim() === '' || str.trim() === '-') return null
  const cleaned = str.replace(/,/g, '').trim()
  const num = parseInt(cleaned, 10)
  return isNaN(num) ? null : num
}

export async function crawlStatistics(): Promise<{
  comparison: CrawledYearComparison | null
  statistics: CrawledStatistics[]
}> {
  const statUrl = await getStatUrl()
  const response = await fetch(statUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })

  if (!response.ok) {
    throw new Error(`통계 크롤링 실패: HTTP ${response.status}`)
  }

  let html: string
  try {
    const buffer = await response.arrayBuffer()
    html = new TextDecoder('utf-8').decode(buffer)
    if (html.includes('�')) {
      html = new TextDecoder('euc-kr').decode(buffer)
    }
  } catch {
    html = await response.text()
  }

  const root = parseHTML(html)
  const table = root.querySelector('table.sub_priceTable')
  if (!table) {
    throw new Error('종계입식현황 테이블을 찾을 수 없습니다')
  }

  const tbody = table.querySelector('tbody')
  if (!tbody) {
    throw new Error('테이블 tbody를 찾을 수 없습니다')
  }

  const rows = tbody.querySelectorAll('tr')
  let comparison: CrawledYearComparison | null = null
  const statistics: CrawledStatistics[] = []

  for (const row of rows) {
    const th = row.querySelector('th')
    const cells = row.querySelectorAll('td')

    if (!th && cells.length < 13) continue // 빈 행이나 출처 행 무시

    const label = th ? th.text.trim() : ''

    if (label === '전년대비') {
      comparison = {
        label,
        values: Array.from(cells).map(c => {
          const t = c.text.trim()
          return t === '' || t === '-' ? null : t
        }),
      }
      continue
    }

    // 연도 행
    const year = parseInt(label, 10)
    if (isNaN(year)) continue

    const months: (number | null)[] = []
    let total: number | null = null

    const cellArray = Array.from(cells)
    for (let i = 0; i < 12 && i < cellArray.length; i++) {
      months.push(parseStatNum(cellArray[i].text))
    }
    // 부족한 월 채우기
    while (months.length < 12) months.push(null)

    if (cellArray.length >= 13) {
      total = parseStatNum(cellArray[12].text)
    }

    statistics.push({ year, months, total })
  }

  return { comparison, statistics }
}
