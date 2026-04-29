"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts"
import type { BenchmarkStats } from "@/app/api/telemetry/stats/route"
import {
  Users,
  TrendingUp,
  BarChart3,
  Globe,
  Zap,
  FlaskConical,
  RefreshCw,
  Lock,
  Activity,
  MousePointerClick,
  DollarSign,
} from "lucide-react"

const CHANNEL_COLORS: Record<string, string> = {
  meta: "#3b82f6",
  google: "#10b981",
  tiktok: "#ec4899",
}

const ROAS_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#6366f1"]
const CONV_COLORS = ["#6b7280", "#f59e0b", "#10b981", "#6366f1", "#8b5cf6", "#ec4899"]

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub?: string
  accent: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${accent}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className="text-2xl font-black tabular-nums">{value}</p>
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{children}</h2>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
        <Activity className="w-9 h-9 text-gray-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-300 mb-2">Няма данни все още</h3>
      <p className="text-gray-500 text-sm max-w-sm">
        Отиди в Settings → Benchmark Program и включи telemetry. Данните ще се появят след първото изпращане.
      </p>
    </div>
  )
}

export default function AdminPage() {
  const params = useSearchParams()
  const secret = params.get("secret") ?? ""

  const [stats, setStats] = useState<BenchmarkStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/telemetry/stats?secret=${encodeURIComponent(secret)}`)
      if (res.status === 401) {
        setError("unauthorized")
        return
      }
      if (!res.ok) throw new Error("Server error")
      const data = (await res.json()) as BenchmarkStats
      setStats(data)
      setLastRefresh(new Date())
    } catch {
      setError("error")
    } finally {
      setLoading(false)
    }
  }, [secret])

  useEffect(() => {
    load()
  }, [load])

  if (error === "unauthorized") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center">
          <Lock className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-red-400">Unauthorized</h1>
        <p className="text-gray-500 text-sm">Add <code className="bg-white/10 px-1 rounded">?secret=your_secret</code> to the URL</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400">
        Failed to load stats
      </div>
    )
  }

  const isEmpty = stats.totalInstances === 0

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">FunnelPro Benchmark Admin</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Агрегирани анонимни данни от opt-in инстанции ·{" "}
            {stats.firstSeen
              ? `от ${new Date(stats.firstSeen).toLocaleDateString()}`
              : "няма данни"}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <p className="text-xs text-gray-600">
        Последно обновено: {lastRefresh.toLocaleTimeString()} ·{" "}
        {stats.totalPayloads} payload{stats.totalPayloads !== 1 ? "s" : ""} получени
      </p>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          {/* Overview KPIs */}
          <section>
            <SectionTitle>Overview</SectionTitle>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Активни инстанции"
                value={stats.totalInstances.toLocaleString()}
                sub="уникални installation IDs"
                accent="bg-indigo-600"
              />
              <StatCard
                icon={TrendingUp}
                label="Среден Conversion Rate"
                value={`${stats.avgConversionRate}%`}
                sub={`Медиана: ${stats.medianConversionRate}%`}
                accent="bg-emerald-600"
              />
              <StatCard
                icon={DollarSign}
                label="Среден ROAS"
                value={stats.avgROAS !== null ? `${stats.avgROAS}x` : "—"}
                sub="при активни кампании"
                accent="bg-amber-600"
              />
              <StatCard
                icon={Activity}
                label="Общо посетители"
                value={stats.totalVisitors.toLocaleString()}
                sub={`${stats.totalOptins.toLocaleString()} opt-ins · ${stats.totalSales.toLocaleString()} продажби`}
                accent="bg-rose-600"
              />
            </div>
          </section>

          {/* Feature adoption */}
          <section>
            <SectionTitle>Feature Adoption</SectionTitle>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Zap}
                label="Avg Funnels / Instance"
                value={stats.avgFunnelCount.toString()}
                accent="bg-blue-600"
              />
              <StatCard
                icon={MousePointerClick}
                label="Avg Campaigns / Instance"
                value={stats.avgCampaignCount.toString()}
                accent="bg-purple-600"
              />
              <StatCard
                icon={FlaskConical}
                label="A/B Test Adoption"
                value={`${stats.abTestAdoptionPct}%`}
                sub="инстанции с активни тестове"
                accent="bg-amber-500"
              />
              <StatCard
                icon={Users}
                label="Contacts Adoption"
                value={`${stats.contactAdoptionPct}%`}
                sub="инстанции с контакти"
                accent="bg-teal-600"
              />
            </div>
          </section>

          {/* Charts row 1 */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion rate distribution */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <SectionTitle>Conversion Rate Distribution</SectionTitle>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.conversionRateDistribution} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "#f9fafb" }}
                      itemStyle={{ color: "#d1d5db" }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Инстанции">
                      {stats.conversionRateDistribution.map((_, i) => (
                        <Cell key={i} fill={CONV_COLORS[i] ?? "#6366f1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ROAS distribution */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <SectionTitle>ROAS Distribution</SectionTitle>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.roasDistribution} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "#f9fafb" }}
                      itemStyle={{ color: "#d1d5db" }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Инстанции">
                      {stats.roasDistribution.map((_, i) => (
                        <Cell key={i} fill={ROAS_COLORS[i] ?? "#6366f1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Charts row 2 */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top elements */}
            <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-5">
              <SectionTitle>Най-използвани елементи</SectionTitle>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.topElements.slice(0, 8)}
                    layout="vertical"
                    margin={{ top: 0, right: 40, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="type"
                      tick={{ fill: "#d1d5db", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "#f9fafb" }}
                      formatter={(val) => [`${val} total · avg ${stats.topElements.find(e => e.total === val)?.avgPerInstance ?? "?"}/instance`, "Използвания"]}
                    />
                    <Bar dataKey="total" fill="#6366f1" radius={[0, 4, 4, 0]} name="Общо" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Channel distribution */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <SectionTitle>Ad Channels</SectionTitle>
              {stats.channelDistribution.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-gray-600 text-sm">
                  Няма данни
                </div>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.channelDistribution}
                        dataKey="instances"
                        nameKey="channel"
                        cx="50%"
                        cy="45%"
                        outerRadius={75}
                        label={({ name, percent }) =>
                          `${name} ${Math.round((percent ?? 0) * 100)}%`
                        }
                        labelLine={false}
                      >
                        {stats.channelDistribution.map((entry, i) => (
                          <Cell
                            key={entry.channel}
                            fill={CHANNEL_COLORS[entry.channel] ?? ["#8b5cf6", "#ec4899", "#14b8a6"][i % 3]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
                        formatter={(val) => [`${val} инстанции`, "Брой"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>

          {/* Step types + Timezones */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step types */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <SectionTitle>Funnel Step Types</SectionTitle>
              <div className="space-y-2">
                {stats.topStepTypes.map((s, i) => {
                  const max = stats.topStepTypes[0]?.total ?? 1
                  const pct = Math.round((s.total / max) * 100)
                  return (
                    <div key={s.type} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-20 capitalize truncate">{s.type}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-300 w-10 text-right">{s.total}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Timezones */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <SectionTitle>Geographic Distribution</SectionTitle>
              <div className="space-y-2">
                {stats.topTimezones.length === 0 ? (
                  <p className="text-gray-600 text-sm py-4">Няма данни</p>
                ) : (
                  stats.topTimezones.map((tz) => {
                    const max = stats.topTimezones[0]?.count ?? 1
                    const pct = Math.round((tz.count / max) * 100)
                    return (
                      <div key={tz.timezone} className="flex items-center gap-3">
                        <Globe className="w-3 h-3 text-gray-500 shrink-0" />
                        <span className="text-xs text-gray-400 flex-1 truncate">{tz.timezone}</span>
                        <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-teal-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-gray-300 w-6 text-right">{tz.count}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </section>

          {/* Benchmark report preview */}
          <section>
            <SectionTitle>Benchmark Report Preview</SectionTitle>
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold">FunnelPro Industry Benchmark Report</p>
                  <p className="text-xs text-gray-400">
                    Базиран на {stats.totalInstances} инстанции · {new Date().toLocaleDateString("bg-BG", { month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Среден Conversion Rate", value: `${stats.avgConversionRate}%`, note: "всички типове фунии" },
                  { label: "Медиана Conv. Rate", value: `${stats.medianConversionRate}%`, note: "50-ти персентил" },
                  { label: "Среден ROAS", value: stats.avgROAS !== null ? `${stats.avgROAS}x` : "—", note: "при активни кампании" },
                  { label: "A/B Test Adoption", value: `${stats.abTestAdoptionPct}%`, note: "от всички потребители" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-white/5 p-3 text-center">
                    <p className="text-xl font-black text-indigo-300">{item.value}</p>
                    <p className="text-xs font-semibold text-white mt-1">{item.label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{item.note}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-4">
                Това е примерен preview. В production — генерирай PDF / изпращай като email newsletter на агенции срещу $97/мес.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
