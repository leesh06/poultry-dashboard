# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

종계(계란) 농장 생산 관리 대시보드. 일별 동별 생산량 기록, chicken.or.kr 시세/입식현황 크롤링, Google Sheets를 DB로 사용.

## 명령어

- `npm run dev` — 개발 서버 (기본 포트 3000)
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint 실행

## 아키텍처

**Next.js 16 App Router** (`src/` 디렉토리) + Tailwind CSS 4 + TypeScript strict mode.

### 데이터 흐름

```
chicken.or.kr → crawlers (파싱) → API Routes → Google Sheets (저장)
                                       ↓
                                  클라이언트 페이지 (fetch → 차트/테이블)
```

- **크롤러** (`src/lib/crawlers/`): chicken.or.kr에서 시세·입식현황을 HTML 파싱(node-html-parser). 사이트가 연도별 URL을 사용하므로(`price_2025.php`) 크롤러가 자동으로 최신 연도 URL을 탐색.
- **Google Sheets 연동** (`src/lib/google-sheets/`): `googleapis` 패키지로 Service Account 인증. `client.ts`가 싱글톤 sheets 인스턴스를 관리. 시트명은 한글(`생산기록`, `시세기록`, `종계입식현황`, `설정`).
- **API Routes** (`src/app/api/`): 크롤링 API(`/api/crawl/*`)는 Google Sheets 저장 실패 시에도 크롤링 데이터를 반환하도록 설계됨.
- **프론트엔드**: 모든 페이지가 `'use client'`. 차트는 Recharts. Google Sheets 미연동 시 하드코딩된 데모 데이터를 표시.

### 주요 경로

| 라우트 | 설명 |
|--------|------|
| `/` | 대시보드 (요약 카드 + 차트 3개) |
| `/production` | 생산 기록 입력 (동별 오전/오후) |
| `/price` | 시세 조회 + 크롤링 |
| `/statistics` | 종계입식현황 + 5년 비교 차트 |

### Google Sheets 스키마

- **생산기록**: 날짜, 시간대(morning/afternoon), 동(1/2/3), 생산량, 파란수, 비고
- **시세기록**: 날짜, 육계대, 육계중, 육계소, 병아리, 종계노계
- **종계입식현황**: 연도, 월, 입식수수

## 환경변수

`.env.local.example` 참고. Google Sheets 연동 없이도 크롤링과 UI 확인은 가능.

## 코딩 컨벤션

- 들여쓰기 2칸 스페이스
- 함수 30줄 이하
- 매직 넘버 금지, 상수 사용
- 한국어 UI, 코드/변수명은 영어
- Tailwind CSS 4: `@import "tailwindcss"` + `@theme inline` 방식 (tailwind.config.js 없음)
- 디자인 테마: "Organic Modernism" — CSS 변수로 `--primary`(초록), `--accent`(테라코타) 등 정의, `prefers-color-scheme` 기반 다크모드

## 주의사항

- `next.config.ts`에서 `NODE_TLS_REJECT_UNAUTHORIZED=0` 설정됨 (chicken.or.kr SSL 인증서 체인 이슈)
- chicken.or.kr 페이지 인코딩은 UTF-8이나, 크롤러에 euc-kr 폴백 포함
- `SPREADSHEET_ID`를 소스코드에 하드코딩하지 말 것 — 반드시 환경변수 사용

## 현재 작업 상태

### 완료된 작업

- **프로젝트 초기 설정**: Next.js 16 + Tailwind CSS 4 + TypeScript 프로젝트 생성, 의존성 설치 완료
- **타입 정의** (`src/types/`): production, price, statistics, api 타입 4개 파일
- **유틸리티** (`src/lib/utils/`): date, number, chart-data 변환 함수 3개 파일
- **크롤러** (`src/lib/crawlers/`): chicken.or.kr 시세 크롤러 + 입식현황 크롤러 — 실제 크롤링 테스트 통과
- **Google Sheets 연동** (`src/lib/google-sheets/`): client(인증), production/price/statistics CRUD 4개 파일
- **API Routes** (`src/app/api/`): production(GET/POST), price(GET), statistics(GET), crawl/price(POST), crawl/statistics(POST) — 총 5개 엔드포인트
- **UI 컴포넌트**: BottomNav, Header, PageContainer, Card, Button, LoadingSpinner, EmptyState, ChartTooltip
- **페이지 4개**: 대시보드(/), 생산기록(/production), 시세조회(/price), 입식현황(/statistics)
- **디자인**: "Organic Modernism" 테마 적용, 모바일 우선 반응형, 다크모드, 글래스모피즘 카드, grain 텍스처
- **Google Sheets 생성**: 구글 드라이브에 "농장대시보드" 폴더 및 "농장생산관리" 스프레드시트 생성 완료
- **코드 리뷰 수정**: Spreadsheet ID 하드코딩 제거, URL 연도 동적 탐색, HTTP 상태 검증, 데이터 유실 방지, 저장 실패 피드백 추가
- **빌드 검증**: `npm run build` 통과

### 미완료 작업

- **Google Sheets 실제 연동**: `.env.local`에 서비스 계정 인증 정보 설정 필요 (Google Cloud Console에서 서비스 계정 생성 → Sheets API 활성화 → 키 발급 → 스프레드시트 공유)
- **대시보드 실시간 데이터**: 현재 대시보드(/) 페이지는 API fetch 실패 시 데모 데이터 표시. Google Sheets 연동 후 실제 데이터로 전환됨
- **생산기록 히스토리**: `/production` 페이지 하단 "최근 기록" 섹션 — Google Sheets 연동 후 데이터 표시
- **배포**: Vercel 등 배포 미진행
- **git 초기화**: 아직 git repository가 아님
