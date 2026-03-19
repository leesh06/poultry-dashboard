'use client'

import { useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Save,
  Egg,
  Sun,
  Moon,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { formatNumber, formatPercent, calcRate } from '@/lib/utils/number'
import type { Session, BuildingNumber } from '@/types/production'
import { SESSION_LABELS, BUILDING_LABELS } from '@/types/production'

const BUILDINGS: BuildingNumber[] = [1, 2, 3]

interface BuildingInput {
  count: string
  brokenCount: string
}

const BUILDING_COLORS: Record<BuildingNumber, string> = {
  1: '#2d5a27',
  2: '#c4704b',
  3: '#4a7ec4',
}

export default function ProductionPage() {
  const [date, setDate] = useState(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })
  const [session, setSession] = useState<Session>('morning')
  const [buildings, setBuildings] = useState<Record<BuildingNumber, BuildingInput>>({
    1: { count: '', brokenCount: '' },
    2: { count: '', brokenCount: '' },
    3: { count: '', brokenCount: '' },
  })
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const updateBuilding = useCallback((building: BuildingNumber, field: keyof BuildingInput, value: string) => {
    setBuildings(prev => ({
      ...prev,
      [building]: { ...prev[building], [field]: value },
    }))
    setSaved(false)
  }, [])

  const totalCount = BUILDINGS.reduce((sum, b) => sum + (parseInt(buildings[b].count) || 0), 0)
  const totalBroken = BUILDINGS.reduce((sum, b) => sum + (parseInt(buildings[b].brokenCount) || 0), 0)
  const brokenRate = calcRate(totalBroken, totalCount + totalBroken)

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        date,
        session,
        buildings: BUILDINGS.map(b => ({
          building: b,
          count: parseInt(buildings[b].count) || 0,
          brokenCount: parseInt(buildings[b].brokenCount) || 0,
        })),
        memo,
      }

      const res = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        const errorData = await res.json().catch(() => ({ error: '저장에 실패했습니다' }))
        alert(errorData.error || '저장에 실패했습니다')
      }
    } catch {
      alert('저장에 실패했습니다. 네트워크를 확인해주세요.')
    } finally {
      setSaving(false)
    }
  }

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  return (
    <>
      <Header
        title="생산 기록"
        subtitle="일별 동별 생산량을 기록합니다"
      />

      <PageContainer className="space-y-4 pb-4">
        {/* ─── Date & Session Selector ─── */}
        <Card className="animate-fade-in-up stagger-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Date */}
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted)' }}>
                날짜
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-all"
                style={{
                  background: 'var(--surface-alt)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border-color)',
                }}
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{displayDate}</p>
            </div>

            {/* Session Toggle */}
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted)' }}>
                시간대
              </label>
              <div
                className="flex rounded-xl p-1"
                style={{ background: 'var(--surface-alt)' }}
              >
                {(['morning', 'afternoon'] as Session[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSession(s)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all duration-200"
                    style={{
                      background: session === s ? 'var(--surface)' : 'transparent',
                      color: session === s ? 'var(--foreground)' : 'var(--muted)',
                      boxShadow: session === s ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    {s === 'morning' ? <Sun size={14} /> : <Moon size={14} />}
                    {SESSION_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* ─── Building Input Cards ─── */}
        {BUILDINGS.map((building) => (
          <Card
            key={building}
            className={`animate-fade-in-up stagger-${building + 1}`}
          >
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ background: BUILDING_COLORS[building] }}
              >
                {building}
              </div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {BUILDING_LABELS[building]}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* 생산량 */}
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--muted)' }}>
                  <Egg size={12} />
                  생산량
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={buildings[building].count}
                    onChange={(e) => updateBuilding(building, 'count', e.target.value)}
                    className="w-full rounded-xl px-3 py-3 text-lg font-bold tabular-nums outline-none transition-all"
                    style={{
                      background: 'var(--surface-alt)',
                      color: 'var(--foreground)',
                      border: '2px solid transparent',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = BUILDING_COLORS[building]
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'transparent'
                    }}
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: 'var(--muted)' }}
                  >
                    개
                  </span>
                </div>
              </div>

              {/* 파란수 */}
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--accent)' }}>
                  <Egg size={12} />
                  파란
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={buildings[building].brokenCount}
                    onChange={(e) => updateBuilding(building, 'brokenCount', e.target.value)}
                    className="w-full rounded-xl px-3 py-3 text-lg font-bold tabular-nums outline-none transition-all"
                    style={{
                      background: 'color-mix(in srgb, var(--accent) 5%, var(--surface-alt))',
                      color: 'var(--foreground)',
                      border: '2px solid transparent',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'transparent'
                    }}
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: 'var(--muted)' }}
                  >
                    개
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* ─── Summary & Memo ─── */}
        <Card className="animate-fade-in-up stagger-5">
          {/* Summary row */}
          <div
            className="mb-3 flex items-center justify-between rounded-xl px-3 py-2.5"
            style={{ background: 'var(--surface-alt)' }}
          >
            <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>합계</span>
            <div className="flex items-center gap-4 text-sm font-bold tabular-nums">
              <span style={{ color: 'var(--primary)' }}>
                {formatNumber(totalCount)}개
              </span>
              <span style={{ color: 'var(--accent)' }}>
                파란 {formatNumber(totalBroken)}개
              </span>
              <span style={{ color: 'var(--muted)' }}>
                ({formatPercent(brokenRate)})
              </span>
            </div>
          </div>

          {/* Memo */}
          <textarea
            placeholder="메모 (선택사항)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all resize-none"
            style={{
              background: 'var(--surface-alt)',
              color: 'var(--foreground)',
              border: '1px solid var(--border-color)',
            }}
          />
        </Card>

        {/* ─── Save Button ─── */}
        <Button
          variant="primary"
          size="lg"
          loading={saving}
          icon={saved ? <Check size={18} /> : <Save size={18} />}
          onClick={handleSave}
          className="w-full animate-fade-in-up stagger-6"
          style={saved ? {
            background: 'var(--success)',
          } : undefined}
        >
          {saving ? '저장 중...' : saved ? '저장 완료!' : '기록 저장'}
        </Button>

        {/* ─── History Toggle ─── */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex w-full items-center justify-center gap-1 py-2 text-xs font-medium transition-colors"
          style={{ color: 'var(--muted)' }}
        >
          {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          최근 기록 {showHistory ? '숨기기' : '보기'}
        </button>

        {showHistory && (
          <Card className="animate-slide-up">
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Google Sheets 연동 후 최근 기록이 표시됩니다
              </p>
            </div>
          </Card>
        )}
      </PageContainer>
    </>
  )
}
