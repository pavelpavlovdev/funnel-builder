"use client"

import type { ForecastResult } from "@/lib/ad-forecast"
import { TrendingUp, MousePointerClick, Target, DollarSign, Eye } from "lucide-react"

interface Props {
  forecast: ForecastResult
  showWeekly?: boolean
}

export function ForecastPanel({ forecast, showWeekly = true }: Props) {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center gap-2">
        <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Daily forecast
        </p>
      </div>
      <p className="text-[10px] text-muted-foreground px-4 pt-2.5 leading-snug">
        Based on channel benchmarks · funnel conversion data
      </p>

      {/* 2x2 metric grid */}
      <div className="grid grid-cols-2 gap-px bg-border/30 mt-2 mx-3 mb-3 rounded-lg overflow-hidden">
        <Metric icon={Eye} label="Impressions" value={range(forecast.daily.impressions)} color="text-blue-500 bg-blue-50" />
        <Metric icon={MousePointerClick} label="Clicks" value={range(forecast.daily.clicks)} color="text-purple-500 bg-purple-50" />
        <Metric icon={Target} label="Conversions" value={range(forecast.daily.conversions)} color="text-emerald-500 bg-emerald-50" />
        <Metric
          icon={DollarSign}
          label="CPA"
          value={forecast.daily.cpa ? `$${fmt(forecast.daily.cpa.min)}–$${fmt(forecast.daily.cpa.max)}` : "—"}
          color="text-amber-500 bg-amber-50"
        />
      </div>

      {/* Weekly summary strip */}
      {showWeekly && (
        <div className="border-t border-border/40 bg-gradient-to-r from-indigo-50/40 via-purple-50/30 to-emerald-50/40 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Weekly outlook
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Cell label="Spend" value={`$${fmt(forecast.weekly.spend)}`} />
            <Cell label="Conversions" value={range(forecast.weekly.conversions)} />
            <Cell
              label={forecast.weekly.roas ? "ROAS" : "Revenue"}
              value={
                forecast.weekly.roas
                  ? `${forecast.weekly.roas.min}–${forecast.weekly.roas.max}x`
                  : forecast.weekly.revenue
                    ? `$${fmt(forecast.weekly.revenue.min)}–$${fmt(forecast.weekly.revenue.max)}`
                    : "—"
              }
              accent={forecast.weekly.roas ? "text-emerald-700" : undefined}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: string
}) {
  const [iconColor, bg] = color.split(" ")
  return (
    <div className="bg-card p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`w-5 h-5 rounded ${bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-3 h-3 ${iconColor}`} />
        </div>
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold truncate">
          {label}
        </p>
      </div>
      <p className="text-base font-bold tabular-nums leading-tight">{value}</p>
    </div>
  )
}

function Cell({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className={`text-sm font-bold tabular-nums leading-tight mt-0.5 truncate ${accent ?? "text-foreground"}`}>
        {value}
      </p>
    </div>
  )
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return n.toLocaleString()
}

function range(r: { min: number; max: number }): string {
  if (r.max === 0) return "—"
  return `${fmt(r.min)}–${fmt(r.max)}`
}
