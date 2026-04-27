"use client"

import { useMemo, useState } from "react"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  Megaphone,
  Sparkles,
  TrendingUp,
  AlertOctagon,
  Play,
  Pause,
  Zap,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"
import { CampaignDialog } from "./CampaignDialog"
import { CampaignDetailSheet } from "./CampaignDetailSheet"
import { AdCreativePreview } from "./AdCreativePreview"
import { computeMetrics, generateInsights, simulateCampaignBurst } from "@/lib/ad-optimization"
import type { AdCampaign, AdStatus } from "@/lib/types"

const CHANNEL_TINT: Record<string, string> = {
  meta: "bg-blue-100 text-blue-700 border-blue-200",
  google: "bg-emerald-100 text-emerald-700 border-emerald-200",
  tiktok: "bg-pink-100 text-pink-700 border-pink-200",
}

const STATUS_TONES: Record<string, string> = {
  active: "bg-emerald-500",
  paused: "bg-gray-400",
  draft: "bg-amber-500",
  completed: "bg-blue-500",
}

export function AdsList() {
  const { campaigns, funnels, _hasHydrated } = useFunnelStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<AdStatus | "all">("all")

  const filtered = useMemo(
    () =>
      campaigns.filter((c) => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === "all" || c.status === statusFilter
        return matchSearch && matchStatus
      }),
    [campaigns, search, statusFilter]
  )

  const aggregateStats = useMemo(() => {
    const active = campaigns.filter((c) => c.status === "active")
    const totals = active.reduce(
      (acc, c) => ({
        spend: acc.spend + c.stats.spend,
        revenue: acc.revenue + c.stats.revenue,
        clicks: acc.clicks + c.stats.clicks,
        conversions: acc.conversions + c.stats.optins + c.stats.sales,
      }),
      { spend: 0, revenue: 0, clicks: 0, conversions: 0 }
    )
    const roas = totals.spend > 0 ? totals.revenue / totals.spend : null
    return { ...totals, activeCount: active.length, roas }
  }, [campaigns])

  const totalInsights = useMemo(() => {
    let count = 0
    let critical = 0
    for (const c of campaigns) {
      const funnel = funnels.find((f) => f.id === c.funnelId)
      const insights = generateInsights(c, funnel)
      count += insights.length
      critical += insights.filter((i) => i.severity === "critical").length
    }
    return { total: count, critical }
  }, [campaigns, funnels])

  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-5">
        {/* Demo banner */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-3">
          <Megaphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed flex-1">
            <strong className="font-semibold">Demo mode.</strong> To actually launch ads, you&apos;ll need to connect a Meta Business / Google Ads / TikTok Ads account via OAuth. The full editing, audience builder, optimization engine and analytics in this view are functional — they just store and simulate locally instead of pushing to the live ad network.
          </div>
        </div>

        {/* Aggregate KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Stat label="Active campaigns" value={aggregateStats.activeCount.toString()} icon={Megaphone} accent="text-indigo-500 bg-indigo-50" />
          <Stat label="Spend (active)" value={`$${aggregateStats.spend.toLocaleString()}`} icon={TrendingUp} accent="text-amber-500 bg-amber-50" />
          <Stat label="Revenue" value={`$${aggregateStats.revenue.toLocaleString()}`} icon={TrendingUp} accent="text-emerald-500 bg-emerald-50" />
          <Stat
            label="Blended ROAS"
            value={aggregateStats.roas !== null ? `${aggregateStats.roas.toFixed(2)}x` : "—"}
            icon={TrendingUp}
            accent="text-rose-500 bg-rose-50"
          />
          <Stat
            label="Open insights"
            value={totalInsights.total.toString()}
            sub={totalInsights.critical > 0 ? `${totalInsights.critical} critical` : "all healthy"}
            icon={Sparkles}
            accent="text-purple-500 bg-purple-50"
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="pl-9 h-9"
            />
          </div>

          <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/40">
            {(["all", "active", "paused", "draft"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                  statusFilter === s ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <Button size="sm" onClick={() => setCreateOpen(true)} className="ml-auto gap-1.5">
            <Plus className="w-4 h-4" /> New Campaign
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {filtered.length} campaign{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Campaign cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              funnelName={funnels.find((f) => f.id === campaign.funnelId)?.name ?? "—"}
              hasInsights={generateInsights(campaign, funnels.find((f) => f.id === campaign.funnelId)).length > 0}
              hasCritical={
                generateInsights(campaign, funnels.find((f) => f.id === campaign.funnelId))
                  .some((i) => i.severity === "critical")
              }
              onOpen={() => setDetailId(campaign.id)}
            />
          ))}

          {filtered.length === 0 && (
            <Card className="md:col-span-2 xl:col-span-3 border-dashed">
              <CardContent className="py-16 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
                  <Megaphone className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No campaigns match your filters</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {campaigns.length === 0
                    ? "Create your first campaign to start driving traffic."
                    : "Try clearing the search or status filter."}
                </p>
                <Button size="sm" variant="outline" className="mt-4" onClick={() => setCreateOpen(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Create campaign
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CampaignDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => setDetailId(id)}
      />
      <CampaignDetailSheet
        campaignId={detailId}
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
      />
    </>
  )
}

function Stat({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}) {
  const [color, bg] = accent.split(" ")
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <p className="text-lg font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function CampaignCard({
  campaign,
  funnelName,
  hasInsights,
  hasCritical,
  onOpen,
}: {
  campaign: AdCampaign
  funnelName: string
  hasInsights: boolean
  hasCritical: boolean
  onOpen: () => void
}) {
  const { funnels, setCampaignStatus, recordCampaignBurst, recordVisit, recordOptin, recordSale } = useFunnelStore()
  const [busy, setBusy] = useState(false)
  const m = computeMetrics(campaign)
  const funnel = funnels.find((f) => f.id === campaign.funnelId)

  // Performance tone for top accent ribbon
  const ribbon: string =
    campaign.status === "paused" || campaign.status === "draft"
      ? "from-gray-300 to-gray-200"
      : m.roas !== null && m.roas >= 2
        ? "from-emerald-400 to-teal-300"
        : m.roas !== null && m.roas < 1
          ? "from-rose-500 to-orange-400"
          : m.ctr >= 1
            ? "from-indigo-400 to-purple-400"
            : "from-amber-400 to-amber-300"

  const handleQuickAction = (e: React.MouseEvent, action: "toggle" | "simulate") => {
    e.stopPropagation()
    if (action === "toggle") {
      const next = campaign.status === "active" ? "paused" : "active"
      setCampaignStatus(campaign.id, next)
      toast.success(`Campaign ${next}`)
      return
    }
    if (action === "simulate") {
      setBusy(true)
      void runSimulation()
    }
  }

  const runSimulation = async () => {
    for (let i = 0; i < 5; i++) {
      const burst = simulateCampaignBurst(campaign, funnel)
      recordCampaignBurst(campaign.id, burst)
      for (let v = 0; v < burst.visits; v++) recordVisit(campaign.funnelId)
      for (let o = 0; o < burst.optins; o++) recordOptin(campaign.funnelId)
      for (let s = 0; s < burst.sales; s++) recordSale(campaign.funnelId, burst.revenue / Math.max(1, burst.sales))
      await new Promise((r) => setTimeout(r, 280))
    }
    setBusy(false)
    toast.success("Simulation complete")
  }

  return (
    <Card
      onClick={onOpen}
      className="group/card relative flex flex-col overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-200 pt-0"
    >
      {/* Performance ribbon */}
      <div className={`h-1 bg-gradient-to-r ${ribbon}`} />

      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_TONES[campaign.status]}`} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {campaign.status}
              </span>
              <span className="text-muted-foreground/50">·</span>
              <Badge
                variant="outline"
                className={`text-[10px] py-0 px-1.5 h-5 capitalize font-semibold ${CHANNEL_TINT[campaign.channel]}`}
              >
                {campaign.channel}
              </Badge>
              <span className="text-[10px] text-muted-foreground capitalize">
                · {campaign.objective.replace("_", " ")}
              </span>
            </div>
            <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover/card:text-primary transition-colors">
              {campaign.name}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <span className="text-muted-foreground/60">→</span>
              <span className="truncate">{funnelName}</span>
              {campaign.creatives.length > 1 && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-amber-600 font-medium">{campaign.creatives.length} creatives</span>
                </>
              )}
            </div>
          </div>
          {hasInsights && (
            <div
              title={hasCritical ? "Critical issue detected" : "Has optimization insights"}
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                hasCritical ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
              }`}
            >
              {hasCritical ? <AlertOctagon className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            </div>
          )}
        </div>
      </div>

      {/* Preview area — equal height across cards */}
      <div className="relative flex-1 px-4 pb-4 flex items-center justify-center bg-gradient-to-b from-muted/10 to-muted/30 min-h-[220px]">
        <div className="scale-95 origin-center">
          <AdCreativePreview channel={campaign.channel} creative={campaign.creatives[0]} size="sm" />
        </div>

        {campaign.creatives.length > 1 && (
          <Badge variant="outline" className="absolute top-2 right-3 text-[10px] py-0 px-1.5 h-5 bg-white shadow-sm">
            +{campaign.creatives.length - 1}
          </Badge>
        )}

        {/* Hover quick actions */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/85 backdrop-blur-sm opacity-0 group-hover/card:opacity-100 transition-opacity">
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Quick actions</p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={campaign.status === "active" ? "outline" : "default"}
                onClick={(e) => handleQuickAction(e, "toggle")}
                className="h-8 gap-1.5 shadow-sm"
              >
                {campaign.status === "active" ? (
                  <><Pause className="w-3.5 h-3.5" /> Pause</>
                ) : (
                  <><Play className="w-3.5 h-3.5" /> Activate</>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={(e) => handleQuickAction(e, "simulate")}
                className="h-8 gap-1.5 shadow-sm bg-white"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" /> {busy ? "Running..." : "Simulate"}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Click card → full details · {funnel ? <span className="inline-flex items-center gap-0.5 text-primary"><ExternalLink className="w-2.5 h-2.5" /> {funnel.name}</span> : ""}
            </p>
          </div>
        </div>
      </div>

      {/* KPI footer */}
      <div className="grid grid-cols-4 px-1 py-3 border-t border-border/40 bg-muted/20">
        <Kpi label="Spend" value={`$${Math.round(m.spend).toLocaleString()}`} />
        <Kpi
          label="CTR"
          value={`${m.ctr}%`}
          tone={m.ctr >= 2 ? "good" : m.ctr >= 0.9 ? "neutral" : m.impressions > 1000 ? "warn" : "neutral"}
        />
        <Kpi label="CPC" value={`$${m.cpc.toFixed(2)}`} />
        <Kpi
          label="ROAS"
          value={m.roas !== null ? `${m.roas}x` : "—"}
          tone={m.roas === null ? "neutral" : m.roas >= 2 ? "good" : m.roas < 1 ? "bad" : "neutral"}
        />
      </div>
    </Card>
  )
}

function Kpi({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: string
  tone?: "good" | "warn" | "bad" | "neutral"
}) {
  const valueColor = {
    good: "text-emerald-600",
    warn: "text-amber-600",
    bad: "text-rose-600",
    neutral: "text-foreground",
  }[tone]
  return (
    <div className="flex flex-col items-center text-center px-1">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground/80 font-semibold">{label}</p>
      <p className={`text-sm font-bold tabular-nums leading-tight mt-0.5 ${valueColor}`}>{value}</p>
    </div>
  )
}
