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
      {/* Frosted glass background */}
      <div
        className="mx-auto max-w-screen-lg border-t"
        style={{
          background: 'color-mix(in srgb, var(--surface) 80%, transparent)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderColor: 'color-mix(in srgb, var(--border-color) 60%, transparent)',
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
                className="flex flex-col items-center gap-0.5 py-2 transition-all duration-200"
                style={{
                  color: isActive ? 'var(--primary)' : 'var(--muted)',
                }}
              >
                <div
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300"
                  style={{
                    background: isActive
                      ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
                      : 'transparent',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>
                <span
                  className="text-xs font-medium tracking-tight transition-all duration-200"
                  style={{
                    opacity: isActive ? 1 : 0.7,
                    fontWeight: isActive ? 700 : 500,
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
