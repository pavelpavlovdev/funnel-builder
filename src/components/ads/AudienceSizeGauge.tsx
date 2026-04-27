"use client"

import type { ForecastResult } from "@/lib/ad-forecast"
import { Users } from "lucide-react"

interface Props {
  size: ForecastResult["audienceSize"]
}

const TIER_INFO: Record<string, { label: string; color: string; bar: string; description: string }> = {
  narrow: {
    label: "Narrow",
    color: "text-amber-700",
    bar: "from-amber-400 to-amber-500",
    description: "Highly specific — strong intent but limited reach. Add 1–2 interests to widen.",
  },
  balanced: {
    label: "Balanced",
    color: "text-emerald-700",
    bar: "from-emerald-400 to-emerald-500",
    description: "Sweet spot — enough scale to optimize, narrow enough to stay relevant.",
  },
  broad: {
    label: "Broad",
    color: "text-blue-700",
    bar: "from-blue-400 to-blue-500",
    description: "Algorithm-led — relies on creative + landing to filter.",
  },
  very_broad: {
    label: "Very broad",
    color: "text-rose-700",
    bar: "from-rose-400 to-rose-500",
    description: "Massive scale, low precision. Good as a learning audience with strong creative testing.",
  },
}

export function AudienceSizeGauge({ size }: Props) {
  const info = TIER_INFO[size.tier]
  const tierIndex = ["narrow", "balanced", "broad", "very_broad"].indexOf(size.tier)
  const fillPct = ((tierIndex + 1) / 4) * 100

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Audience size
          </p>
        </div>
        <span className={`text-xs font-bold ${info.color}`}>{info.label}</span>
      </div>

      <p className="text-2xl font-black tabular-nums text-foreground leading-none">
        {formatRange(size.min, size.max)}
      </p>
      <p className="text-[11px] text-muted-foreground mt-0.5">people</p>

      {/* Gradient gauge bar */}
      <div className="relative h-2 rounded-full bg-muted overflow-hidden mt-3">
        <div
          className={`h-full bg-gradient-to-r ${info.bar} transition-all duration-500`}
          style={{ width: `${fillPct}%` }}
        />
        {/* Tier markers */}
        <div className="absolute inset-0 flex">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex-1 border-r border-white/40 last:border-r-0" />
          ))}
        </div>
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground/80 mt-1.5 font-semibold uppercase tracking-wider">
        <span className={size.tier === "narrow" ? info.color : ""}>Narrow</span>
        <span className={size.tier === "balanced" ? info.color : ""}>Balanced</span>
        <span className={size.tier === "broad" ? info.color : ""}>Broad</span>
        <span className={size.tier === "very_broad" ? info.color : ""}>Very broad</span>
      </div>

      <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">{info.description}</p>
    </div>
  )
}

function formatRange(min: number, max: number): string {
  return `${formatNum(min)}–${formatNum(max)}`
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}
