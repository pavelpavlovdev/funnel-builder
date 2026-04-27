"use client"

import { useFunnelStore } from "@/lib/store/funnel-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { TrendingUp, Users, DollarSign, MousePointerClick, Eye, ArrowUpRight } from "lucide-react"

const MOCK_CHART_DATA = [
  { day: "Mon", visitors: 420, optins: 98, sales: 12 },
  { day: "Tue", visitors: 380, optins: 87, sales: 9 },
  { day: "Wed", visitors: 520, optins: 142, sales: 18 },
  { day: "Thu", visitors: 640, optins: 178, sales: 22 },
  { day: "Fri", visitors: 590, optins: 165, sales: 19 },
  { day: "Sat", visitors: 310, optins: 72, sales: 8 },
  { day: "Sun", visitors: 280, optins: 61, sales: 6 },
]

function MiniBarChart({ data, key, color }: { data: typeof MOCK_CHART_DATA; key: string; color: string }) {
  const values = data.map((d) => d[key as keyof typeof d] as number)
  const max = Math.max(...values)
  return (
    <div className="flex items-end gap-1 h-12">
      {values.map((val, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${(val / max) * 100}%`,
            backgroundColor: color,
            opacity: 0.7 + (val / max) * 0.3,
          }}
        />
      ))}
    </div>
  )
}

export function AnalyticsDashboard() {
  const { funnels } = useFunnelStore()
  const [period, setPeriod] = useState("7d")
  const [selectedFunnel, setSelectedFunnel] = useState("all")

  const activeFunnels = funnels.filter((f) => f.status === "active")
  const totalVisitors = funnels.reduce((acc, f) => acc + f.stats.visitors, 0)
  const totalOptins = funnels.reduce((acc, f) => acc + f.stats.optins, 0)
  const totalSales = funnels.reduce((acc, f) => acc + f.stats.sales, 0)
  const totalRevenue = funnels.reduce((acc, f) => acc + f.stats.revenue, 0)
  const avgConversion = funnels.filter((f) => f.stats.visitors > 0).reduce((acc, f) => acc + f.stats.conversionRate, 0) / Math.max(activeFunnels.length, 1)

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
          { label: "Total Visitors", value: totalVisitors.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50", change: "+12.5%" },
          { label: "Total Opt-ins", value: totalOptins.toLocaleString(), icon: MousePointerClick, color: "text-purple-600", bg: "bg-purple-50", change: "+8.2%" },
          { label: "Total Sales", value: totalSales.toLocaleString(), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", change: "+23.1%" },
          { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50", change: "+15.4%" },
          { label: "Avg. Conv. Rate", value: `${avgConversion.toFixed(1)}%`, icon: Eye, color: "text-pink-600", bg: "bg-pink-50", change: "+2.1%" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" /> {stat.change}
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
            <CardTitle className="text-sm font-semibold">Traffic Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded bg-blue-500" /> Visitors</div>
              <div className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded bg-purple-500" /> Opt-ins</div>
              <div className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded bg-emerald-500" /> Sales</div>
            </div>
            <div className="space-y-3">
              {MOCK_CHART_DATA.map((d) => (
                <div key={d.day} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-8">{d.day}</span>
                  <div className="flex-1 flex gap-1 items-center">
                    <div className="h-2.5 rounded bg-blue-500" style={{ width: `${(d.visitors / 640) * 100}%`, minWidth: "4px" }} />
                  </div>
                  <div className="flex-1 flex gap-1 items-center">
                    <div className="h-2.5 rounded bg-purple-500" style={{ width: `${(d.optins / 178) * 100}%`, minWidth: "4px" }} />
                  </div>
                  <div className="flex-1 flex gap-1 items-center">
                    <div className="h-2.5 rounded bg-emerald-500" style={{ width: `${(d.sales / 22) * 100}%`, minWidth: "4px" }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{d.visitors}</span>
                </div>
              ))}
            </div>
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
