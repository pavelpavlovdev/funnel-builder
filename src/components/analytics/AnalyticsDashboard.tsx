"use client"

import { useFunnelStore } from "@/lib/store/funnel-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMemo, useState } from "react"
import { TrendingUp, Users, DollarSign, MousePointerClick, Eye, ArrowUpRight, ArrowDownRight, Minus, FlaskConical, Crown } from "lucide-react"
import { useDashboardStats, formatChange, bucketEventsByDay } from "@/lib/analytics"
import Link from "next/link"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts"

const PERIOD_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 }

export function AnalyticsDashboard() {
  const funnels = useFunnelStore((s) => s.funnels)
  const events = useFunnelStore((s) => s.events)
  const [period, setPeriod] = useState("7d")
  const [selectedFunnel, setSelectedFunnel] = useState("all")
  const { totals, change } = useDashboardStats()

  const chartData = useMemo(
    () => bucketEventsByDay(events, PERIOD_DAYS[period] ?? 7, selectedFunnel === "all" ? undefined : selectedFunnel),
    [events, period, selectedFunnel]
  )

  const hasAnyEvents = chartData.some((d) => d.visitors + d.optins + d.sales > 0)

  const totalVisitors = totals.visitors
  const totalOptins = totals.optins
  const totalSales = totals.sales
  const totalRevenue = totals.revenue
  const avgConversion = totals.avgConversionRate

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={period} onValueChange={(v: string) => setPeriod(v)}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedFunnel} onValueChange={(v: string) => setSelectedFunnel(v)}>
          <SelectTrigger className="w-48 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Funnels</SelectItem>
            {funnels.map((f) => (
              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Visitors", value: totalVisitors.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50", pct: change.visitors },
          { label: "Total Opt-ins", value: totalOptins.toLocaleString(), icon: MousePointerClick, color: "text-purple-600", bg: "bg-purple-50", pct: change.optins },
          { label: "Total Sales", value: totalSales.toLocaleString(), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", pct: change.sales },
          { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50", pct: change.revenue },
          { label: "Avg. Conv. Rate", value: `${avgConversion.toFixed(1)}%`, icon: Eye, color: "text-pink-600", bg: "bg-pink-50", pct: null },
        ].map((stat) => {
          const Icon = stat.icon
          const c = formatChange(stat.pct)
          const TrendIcon = !c ? null : c.trend === "up" ? ArrowUpRight : c.trend === "down" ? ArrowDownRight : Minus
          const trendColor = !c
            ? "text-muted-foreground"
            : c.trend === "up"
              ? "text-emerald-600"
              : c.trend === "down"
                ? "text-red-500"
                : "text-muted-foreground"
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <span className={`text-xs font-semibold flex items-center gap-0.5 ${trendColor}`}>
                    {TrendIcon && <TrendIcon className="w-3 h-3" />} {c ? c.label : "—"}
                  </span>
                </div>
                <p className="text-xl font-black text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Traffic Overview
              <span className="text-xs font-normal text-muted-foreground ml-2">
                last {PERIOD_DAYS[period] ?? 7} days
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasAnyEvents ? (
              <div className="h-64 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="grad-visitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="grad-optins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="grad-sales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} width={32} />
                    <ChartTooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        fontSize: 12,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12 }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#grad-visitors)"
                      name="Visitors"
                    />
                    <Area
                      type="monotone"
                      dataKey="optins"
                      stroke="#a855f7"
                      strokeWidth={2}
                      fill="url(#grad-optins)"
                      name="Opt-ins"
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#grad-sales)"
                      name="Sales"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                <p className="text-sm font-medium">No activity yet in this window</p>
                <p className="text-xs mt-1">Open a funnel preview to start generating events</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Funnels</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {funnels
                .filter((f) => f.stats.visitors > 0)
                .sort((a, b) => b.stats.visitors - a.stats.visitors)
                .slice(0, 5)
                .map((funnel, i) => (
                  <div key={funnel.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{funnel.name}</p>
                      <p className="text-xs text-muted-foreground">{funnel.stats.visitors.toLocaleString()} visitors</p>
                    </div>
                    <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
                      {funnel.stats.conversionRate}%
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* A/B tests section */}
      <ABTestsSection funnels={funnels} />

      {/* Funnel breakdown table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Funnel Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Funnel</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">Visitors</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">Opt-ins</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">Sales</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">Revenue</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {funnels.map((funnel) => (
                  <tr key={funnel.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-medium">{funnel.name}</td>
                    <td className="px-5 py-3 text-right">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          funnel.status === "active" ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                          funnel.status === "draft" ? "text-amber-700 bg-amber-50 border-amber-200" :
                          "text-gray-600 bg-gray-50"
                        }`}
                      >
                        {funnel.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs">{funnel.stats.visitors.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs">{funnel.stats.optins.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs">{funnel.stats.sales.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs">
                      {funnel.stats.revenue > 0 ? `$${funnel.stats.revenue.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {funnel.stats.conversionRate > 0 ? (
                        <span className="text-emerald-600 font-semibold text-xs">{funnel.stats.conversionRate}%</span>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ABTestsSection({ funnels }: { funnels: import("@/lib/types").Funnel[] }) {
  const tests = funnels.flatMap((f) =>
    f.steps
      .filter((s) => s.variants && s.variants.length > 1)
      .map((s) => ({ funnel: f, step: s, variants: s.variants! }))
  )

  if (tests.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-amber-500" /> A/B Split Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          <p>No split tests running.</p>
          <p className="text-xs mt-1">
            Open a funnel and click the flask icon on any step to start one.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-amber-500" /> A/B Split Tests
          <Badge variant="outline" className="ml-1 text-[10px] py-0 px-1.5 h-5 bg-amber-50 border-amber-200 text-amber-700">
            {tests.length} running
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5 pt-0">
        {tests.map(({ funnel, step, variants }) => {
          const totalVisits = variants.reduce((acc, v) => acc + v.stats.visitors, 0)
          const winner = pickAnalyticsWinner(variants)
          const sortedVariants = [...variants].sort((a, b) => b.stats.conversionRate - a.stats.conversionRate)
          return (
            <div key={`${funnel.id}-${step.id}`} className="border rounded-xl p-4 bg-muted/20">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Link href={`/funnels/${funnel.id}`} className="text-sm font-semibold hover:text-primary">
                    {funnel.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {step.name} · {totalVisits.toLocaleString()} total visits across {variants.length} variants
                  </p>
                </div>
                {winner && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1">
                    <Crown className="w-3 h-3" /> {winner.name} winning
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sortedVariants.map((v) => ({
                      name: v.name,
                      conversion: v.stats.conversionRate,
                      visitors: v.stats.visitors,
                      isWinner: winner?.id === v.id,
                    }))} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} width={32} unit="%" />
                      <ChartTooltip
                        formatter={(val, key) => {
                          const num = typeof val === "number" ? val : Number(val ?? 0)
                          return [
                            key === "conversion" ? `${num}%` : num.toLocaleString(),
                            key === "conversion" ? "Conv. rate" : "Visitors",
                          ] as [string, string]
                        }}
                        contentStyle={{
                          background: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 12,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        }}
                      />
                      <Bar dataKey="conversion" radius={[6, 6, 0, 0]}>
                        {sortedVariants.map((v) => (
                          <Cell key={v.id} fill={winner?.id === v.id ? "#f59e0b" : "#6366f1"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5">
                  {sortedVariants.map((v, i) => {
                    const isWinner = winner?.id === v.id
                    const lift =
                      winner && !isWinner && winner.stats.conversionRate > 0
                        ? ((v.stats.conversionRate - winner.stats.conversionRate) / winner.stats.conversionRate) * 100
                        : null
                    return (
                      <div key={v.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs ${isWinner ? "bg-amber-50" : "bg-muted/40"}`}>
                        <span className="w-4 text-muted-foreground font-bold">{i + 1}</span>
                        <span className={`flex-1 font-medium truncate ${isWinner ? "text-amber-800" : ""}`}>{v.name}</span>
                        <span className="font-mono tabular-nums">{v.stats.conversionRate}%</span>
                        {lift !== null && <span className="text-red-500 tabular-nums text-[10px]">{lift.toFixed(0)}%</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function pickAnalyticsWinner(variants: import("@/lib/types").StepVariant[]) {
  const eligible = variants.filter((v) => v.stats.visitors >= 5)
  if (eligible.length < 2) return null
  return eligible.reduce((best, v) => (v.stats.conversionRate > best.stats.conversionRate ? v : best))
}
