"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, DollarSign, MousePointerClick, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { useDashboardStats, formatChange } from "@/lib/analytics"

const TILE_STYLES = {
  visitors: { label: "Total Visitors", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  optins: { label: "Total Optins", icon: MousePointerClick, color: "text-purple-500", bg: "bg-purple-50" },
  sales: { label: "Total Sales", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
  revenue: { label: "Total Revenue", icon: DollarSign, color: "text-amber-500", bg: "bg-amber-50" },
} as const

type Metric = keyof typeof TILE_STYLES

function formatValue(metric: Metric, value: number) {
  if (metric === "revenue") return `$${value.toLocaleString()}`
  return value.toLocaleString()
}

export function DashboardStats() {
  const { totals, change, hasHydrated } = useDashboardStats()

  const tiles: { metric: Metric; value: number; pct: number | null }[] = [
    { metric: "visitors", value: totals.visitors, pct: change.visitors },
    { metric: "optins", value: totals.optins, pct: change.optins },
    { metric: "sales", value: totals.sales, pct: change.sales },
    { metric: "revenue", value: totals.revenue, pct: change.revenue },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map(({ metric, value, pct }) => {
        const cfg = TILE_STYLES[metric]
        const Icon = cfg.icon
        const change = formatChange(pct)
        const TrendIcon = !change ? null : change.trend === "up" ? ArrowUpRight : change.trend === "down" ? ArrowDownRight : Minus
        const trendColor =
          !change ? "text-muted-foreground" :
          change.trend === "up" ? "text-emerald-600" :
          change.trend === "down" ? "text-red-500" : "text-muted-foreground"
        return (
          <Card key={metric} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <span className={`flex items-center text-xs font-semibold ${trendColor}`}>
                  {TrendIcon && <TrendIcon className="w-3 h-3" />}
                  {change ? change.label : "—"}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">
                  {hasHydrated ? formatValue(metric, value) : "—"}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">{cfg.label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
