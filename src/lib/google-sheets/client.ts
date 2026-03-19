import { google } from 'googleapis'

const SPREADSHEET_ID = process.env.SPREADSHEET_ID
if (!SPREADSHEET_ID) {
  console.warn('SPREADSHEET_ID 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.')
}

const SHEET_NAMES = {
  production: '생산기록',
  price: '시세기록',
  statistics: '종계입식현황',
  settings: '설정',
} as const

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!email || !key) {
    throw new Error('Google Service Account 환경변수가 설정되지 않았습니다')
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: key,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

let sheetsInstance: ReturnType<typeof google.sheets> | null = null

export function getSheets() {
  if (!sheetsInstance) {
    sheetsInstance = google.sheets({ version: 'v4', auth: getAuth() })
  }
  return sheetsInstance
}

export { SPREADSHEET_ID, SHEET_NAMES }
