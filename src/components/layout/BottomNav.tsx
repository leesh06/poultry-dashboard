'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, BarChart3 } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: '대시보드', icon: Home },
  { href: '/price', label: '시세', icon: TrendingUp },
  { href: '/statistics', label: '입식현황', icon: BarChart3 },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className="mx-auto max-w-screen-lg"
        style={{
          background: 'var(--surface)',
          boxShadow: '0 -1px 0 var(--border-color), 0 -4px 12px rgba(0,0,0,0.04)',
        }}
      >
        <div
          className="grid grid-cols-3"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 py-2.5 transition-colors duration-200"
                style={{
                  color: isActive ? 'var(--primary)' : 'var(--muted)',
                }}
              >
                <div
                  className="relative flex h-9 w-10 items-center justify-center rounded-xl transition-all duration-200"
                  style={{
                    background: isActive ? 'var(--surface-cool)' : 'transparent',
                  }}
                >
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.4 : 1.8}
                  />
                </div>
                {/* Active dot indicator */}
                {isActive && (
                  <div
                    className="h-1 w-4 rounded-full animate-badge-pop"
                    style={{ background: 'var(--primary)' }}
                  />
                )}
                <span
                  className="text-xs font-medium tracking-tight transition-all duration-200"
                  style={{
                    opacity: isActive ? 1 : 0.65,
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: isActive ? '-0.01em' : '0',
                  }}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
