import type { Metadata, Viewport } from "next"
import { Noto_Serif_KR } from "next/font/google"
import "./globals.css"
import { BottomNav } from "@/components/layout/BottomNav"

const notoSerif = Noto_Serif_KR({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "농장 대시보드 | 종계 생산 관리",
  description: "종계 농장 생산량, 시세, 입식현황을 한눈에 관리하는 대시보드",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🥚</text></svg>" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "농장대시보드",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#121210" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={notoSerif.variable}>
      <body className="antialiased min-h-screen">
        <main className="pb-safe">
          {children}
        </main>
        <BottomNav />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                })
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
