import { useEffect, useMemo } from "react"
import { useFunnelStore, type DashboardSnapshot } from "@/lib/store/funnel-store"
import type { Funnel, AnalyticsEvent } from "@/lib/types"

export interface DashboardTotals {
  visitors: number
  optins: number
  sales: number
  revenue: number
  avgConversionRate: number
}

export interface DashboardChange {
  visitors: number | null
  optins: number | null
  sales: number | null
  revenue: number | null
}

export function computeTotals(funnels: Funnel[]): DashboardTotals {
  const base = funnels.reduce(
    (acc, f) => ({
      visitors: acc.visitors + f.stats.visitors,
      optins: acc.optins + f.stats.optins,
      sales: acc.sales + f.stats.sales,
      revenue: acc.revenue + f.stats.revenue,
    }),
    { visitors: 0, optins: 0, sales: 0, revenue: 0 }
  )
  const withTraffic = funnels.filter((f) => f.stats.visitors > 0)
  const avg = withTraffic.length
    ? withTraffic.reduce((acc, f) => acc + f.stats.conversionRate, 0) / withTraffic.length
    : 0
  return { ...base, avgConversionRate: Math.round(avg * 10) / 10 }
}

function pctChange(current: number, prev: number): number | null {
  if (prev <= 0) return current > 0 ? 100 : null
  return Math.round(((current - prev) / prev) * 1000) / 10
}

export function computeChange(totals: DashboardTotals, snapshot: DashboardSnapshot | null): DashboardChange {
  if (!snapshot) return { visitors: null, optins: null, sales: null, revenue: null }
  return {
    visitors: pctChange(totals.visitors, snapshot.visitors),
    optins: pctChange(totals.optins, snapshot.optins),
    sales: pctChange(totals.sales, snapshot.sales),
    revenue: pctChange(totals.revenue, snapshot.revenue),
  }
}

export function useDashboardStats() {
  const funnels = useFunnelStore((s) => s.funnels)
  const snapshot = useFunnelStore((s) => s.dashboardSnapshot)
  const hasHydrated = useFunnelStore((s) => s._hasHydrated)
  const refreshDashboardSnapshot = useFunnelStore((s) => s.refreshDashboardSnapshot)

  useEffect(() => {
    if (hasHydrated) refreshDashboardSnapshot()
  }, [hasHydrated, refreshDashboardSnapshot])

  const totals = useMemo(() => computeTotals(funnels), [funnels])
  const change = useMemo(() => computeChange(totals, snapshot), [totals, snapshot])

  return { totals, change, snapshot, hasHydrated }
}

export function formatChange(pct: number | null): { label: string; trend: "up" | "down" | "flat" } | null {
  if (pct === null || Number.isNaN(pct)) return null
  if (pct === 0) return { label: "0.0%", trend: "flat" }
  const trend: "up" | "down" = pct > 0 ? "up" : "down"
  const sign = pct > 0 ? "+" : ""
  return { label: `${sign}${pct.toFixed(1)}%`, trend }
}

export interface DailyBucket {
  date: string
  label: string
  visitors: number
  optins: number
  sales: number
  revenue: number
}

function dayKey(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

const SHORT_DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function bucketEventsByDay(events: AnalyticsEvent[], days: number, funnelId?: string): DailyBucket[] {
  const buckets = new Map<string, DailyBucket>()
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setUTCDate(today.getUTCDate() - i)
    const key = dayKey(d)
    const label = days <= 7
      ? SHORT_DAY[d.getUTCDay()]
      : `${d.getUTCMonth() + 1}/${d.getUTCDate()}`
    buckets.set(key, { date: key, label, visitors: 0, optins: 0, sales: 0, revenue: 0 })
  }

  for (const ev of events) {
    if (funnelId && ev.funnelId !== funnelId) continue
    const t = new Date(ev.timestamp)
    const key = dayKey(t)
    const bucket = buckets.get(key)
    if (!bucket) continue
    if (ev.type === "visit") bucket.visitors += 1
    else if (ev.type === "optin") bucket.optins += 1
    else if (ev.type === "sale") {
      bucket.sales += 1
      bucket.revenue += ev.amount ?? 0
    }
  }

  return Array.from(buckets.values())
}
