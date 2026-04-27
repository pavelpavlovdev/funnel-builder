"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AdCampaign } from "@/lib/types"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { computeMetrics, simulateCampaignBurst } from "@/lib/ad-optimization"
import { OptimizationInsights } from "./OptimizationInsights"
import { AdCreativePreview } from "./AdCreativePreview"
import { toast } from "sonner"
import {
  Play,
  Pause,
  Edit3,
  Trash2,
  Zap,
  TrendingUp,
  DollarSign,
  Users,
  MousePointerClick,
  Target,
  ExternalLink,
  MoreHorizontal,
  Copy,
  Calendar,
  ThumbsUp,
  Search as SearchIcon,
  Music2,
  X,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { CampaignDialog } from "./CampaignDialog"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
} from "recharts"

interface Props {
  campaignId: string | null
  onOpenChange: (open: boolean) => void
}

const STATUS_TONES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  paused: "bg-gray-100 text-gray-700 border-gray-200",
  draft: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
}

const CHANNEL_TINT: Record<string, string> = {
  meta: "bg-blue-100 text-blue-700 border-blue-200",
  google: "bg-emerald-100 text-emerald-700 border-emerald-200",
  tiktok: "bg-pink-100 text-pink-700 border-pink-200",
}

function ChannelIcon({ channel }: { channel: string }) {
  if (channel === "meta") return <ThumbsUp className="w-3 h-3" />
  if (channel === "google") return <SearchIcon className="w-3 h-3" />
  if (channel === "tiktok") return <Music2 className="w-3 h-3" />
  return null
}

function isInsideRadixPortal(target: EventTarget | null | undefined): boolean {
  if (!(target instanceof Element)) return false
  let el: Element | null = target
  while (el) {
    if (el.hasAttribute("data-radix-popper-content-wrapper")) return true
    if (el.hasAttribute("data-radix-portal")) return true
    if (el.hasAttribute("data-radix-select-content")) return true
    if (el.hasAttribute("data-radix-dropdown-menu-content")) return true
    if (el.hasAttribute("data-radix-popover-content")) return true
    const role = el.getAttribute("role")
    if (role === "listbox" || role === "menu" || role === "menuitem" ||
        role === "option" || role === "dialog" || role === "tooltip") {
      return true
    }
    if (el.tagName === "BODY" || el.tagName === "HTML") break
    el = el.parentElement
  }
  return false
}

export function CampaignDetailSheet({ campaignId, onOpenChange }: Props) {
  const { campaigns, funnels, setCampaignStatus, deleteCampaign, recordCampaignBurst, recordVisit, recordOptin, recordSale } = useFunnelStore()
  const [editOpen, setEditOpen] = useState(false)
  const [simulating, setSimulating] = useState(false)

  const campaign = campaigns.find((c) => c.id === campaignId) ?? null
  const funnel = campaign ? funnels.find((f) => f.id === campaign.funnelId) : undefined
  const metrics = campaign ? computeMetrics(campaign) : null

  const handleSimulate = async () => {
    if (!campaign) return
    setSimulating(true)
    const ticks = 6
    for (let i = 0; i < ticks; i++) {
      const burst = simulateCampaignBurst(campaign, funnel)
      recordCampaignBurst(campaign.id, burst)
      // attribute funnel-level events too
      for (let v = 0; v < burst.visits; v++) recordVisit(campaign.funnelId)
      for (let o = 0; o < burst.optins; o++) recordOptin(campaign.funnelId)
      for (let s = 0; s < burst.sales; s++) recordSale(campaign.funnelId, burst.revenue / Math.max(1, burst.sales))
      await new Promise((r) => setTimeout(r, 350))
    }
    setSimulating(false)
    toast.success("Simulation complete", {
      description: "Performance updated with realistic traffic burst.",
    })
  }

  const performanceTimeline = campaign
    ? buildPerformanceTimeline(campaign)
    : []

  return (
    <>
    <Sheet
      open={campaignId !== null}
      disablePointerDismissal={editOpen}
      onOpenChange={(open, details) => {
        // base-ui Sheet would close when user interacts with a Radix-portaled popup
        // (Select dropdown, DropdownMenu, etc.) inside the nested Edit dialog. Block it.
        if (!open && details) {
          if (editOpen) {
            details.cancel()
            return
          }
          if (details.reason === "outside-press" || details.reason === "focus-out") {
            const target = (details.event as Event | undefined)?.target
            if (isInsideRadixPortal(target)) {
              details.cancel()
              return
            }
          }
        }
        onOpenChange(open)
      }}
    >
      <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-3xl !max-w-3xl overflow-y-auto p-0">
        {!campaign ? (
          <div className="p-6 text-center text-muted-foreground">Campaign not found</div>
        ) : (
          <>
            {/* Status accent ribbon */}
            <div className={`h-1 ${
              campaign.status === "active"
                ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300"
                : campaign.status === "paused"
                  ? "bg-gradient-to-r from-gray-300 to-gray-200"
                  : campaign.status === "draft"
                    ? "bg-gradient-to-r from-amber-400 to-amber-300"
                    : "bg-gradient-to-r from-blue-400 to-blue-300"
            }`} />

            <SheetHeader className="border-b border-border/40 px-5 pt-5 pb-4 gap-3">
              {/* Top row: status pills + actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold uppercase tracking-wider ${STATUS_TONES[campaign.status]}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      campaign.status === "active" ? "bg-emerald-500 animate-pulse"
                        : campaign.status === "paused" ? "bg-gray-400"
                        : campaign.status === "draft" ? "bg-amber-500"
                        : "bg-blue-500"
                    }`} />
                    {campaign.status}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] py-0 px-1.5 h-5 capitalize gap-1 font-semibold ${CHANNEL_TINT[campaign.channel]}`}>
                    <ChannelIcon channel={campaign.channel} />
                    {campaign.channel}
                  </Badge>
                  <span className="text-xs text-muted-foreground capitalize">
                    · {campaign.objective.replace("_", " ")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant={campaign.status === "active" ? "outline" : "default"}
                    onClick={() => {
                      const next = campaign.status === "active" ? "paused" : "active"
                      setCampaignStatus(campaign.id, next)
                      toast.success(`Campaign ${next}`)
                    }}
                    className="gap-1.5 h-8"
                  >
                    {campaign.status === "active" ? (
                      <><Pause className="w-3.5 h-3.5" /> Pause</>
                    ) : (
                      <><Play className="w-3.5 h-3.5" /> Activate</>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} className="gap-1.5 h-8">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8" title="More actions">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => {
                          // Duplicate via createCampaign with same shape
                          const { createCampaign } = useFunnelStore.getState()
                          createCampaign({
                            ...campaign,
                            name: `${campaign.name} (Copy)`,
                            status: "draft",
                          })
                          toast.success("Campaign duplicated")
                        }}
                      >
                        <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const json = JSON.stringify(campaign, null, 2)
                          navigator.clipboard.writeText(json)
                          toast.success("Campaign JSON copied to clipboard")
                        }}
                      >
                        <Copy className="w-3.5 h-3.5 mr-2" /> Export as JSON
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          if (!confirm("Delete this campaign permanently?")) return
                          deleteCampaign(campaign.id)
                          toast.success("Campaign deleted")
                          onOpenChange(false)
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="w-px h-6 bg-border/60 mx-0.5" />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Close (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Title */}
              <SheetTitle className="text-xl font-bold leading-tight tracking-tight">
                {campaign.name}
              </SheetTitle>

              {/* Meta row: funnel + dates + budget */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                {funnel && (
                  <Link
                    href={`/funnels/${funnel.id}`}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    <ExternalLink className="w-3 h-3" /> {funnel.name}
                  </Link>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Day {Math.max(1, Math.round((Date.now() - new Date(campaign.startDate).getTime()) / 86_400_000))}
                  {campaign.endDate && ` of ${Math.round((new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / 86_400_000)}`}
                </span>
                <span className="inline-flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span className="font-semibold text-foreground">${campaign.dailyBudget}</span>
                  <span>/ day</span>
                </span>
                {campaign.creatives.length > 1 && (
                  <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                    🧪 {campaign.creatives.length} creatives rotating
                  </span>
                )}
                {campaign.placements && campaign.placements.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    {campaign.placements.length} placement{campaign.placements.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </SheetHeader>

            <div className="p-5 space-y-4">
              {/* KPI tiles */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                <Kpi icon={DollarSign} label="Spend" value={`$${metrics!.spend.toLocaleString()}`} color="text-amber-500 bg-amber-50" />
                <Kpi icon={Users} label="Impressions" value={metrics!.impressions.toLocaleString()} color="text-blue-500 bg-blue-50" />
                <Kpi icon={MousePointerClick} label="Clicks" value={metrics!.clicks.toLocaleString()} color="text-purple-500 bg-purple-50" />
                <Kpi icon={Target} label="CTR" value={`${metrics!.ctr}%`} color="text-rose-500 bg-rose-50" />
                <Kpi icon={DollarSign} label="CPC" value={`$${metrics!.cpc}`} color="text-cyan-500 bg-cyan-50" />
                <Kpi icon={TrendingUp} label="ROAS" value={metrics!.roas !== null ? `${metrics!.roas}x` : "—"} color="text-emerald-500 bg-emerald-50" />
              </div>

              {/* Run simulation */}
              <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Simulate live traffic</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Real ad publishing requires a Meta/Google API connection. In demo mode, this runs a realistic 2-second burst — adds spend, impressions, clicks, and funnel events using your channel&apos;s baseline CTR and the linked funnel&apos;s conversion rate.
                  </p>
                </div>
                <Button size="sm" onClick={handleSimulate} disabled={simulating} className="gap-1.5 shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                  {simulating ? "Running..." : "Run simulation"}
                </Button>
              </div>

              {/* Optimization insights */}
              <OptimizationInsights campaign={campaign} funnel={funnel} />

              {/* Performance over time */}
              {performanceTimeline.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Performance trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-56 -ml-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceTimeline} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                          <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} width={32} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} width={36} />
                          <ChartTooltip
                            contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                          />
                          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
                          <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#a855f7" strokeWidth={2} name="Clicks" dot={false} />
                          <Line yAxisId="left" type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} name="Conversions" dot={false} />
                          <Line yAxisId="right" type="monotone" dataKey="spend" stroke="#f59e0b" strokeWidth={2} name="Spend ($)" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Audience + Creative side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Audience</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <FieldRow label="Countries" value={campaign.audience.countries.join(", ") || "Worldwide"} />
                    <FieldRow label="Age" value={`${campaign.audience.ageMin}–${campaign.audience.ageMax}`} />
                    <FieldRow
                      label="Interests"
                      value={
                        <div className="flex flex-wrap gap-1">
                          {campaign.audience.interests.length === 0 && <span className="text-xs text-muted-foreground">— broad —</span>}
                          {campaign.audience.interests.map((i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] py-0 px-1.5">{i}</Badge>
                          ))}
                        </div>
                      }
                    />
                    {campaign.audience.lookalikePct && (
                      <FieldRow label="Lookalike" value={`${campaign.audience.lookalikePct}%`} />
                    )}
                    {campaign.audience.customAudiences && campaign.audience.customAudiences.length > 0 && (
                      <FieldRow
                        label="Custom audiences"
                        value={campaign.audience.customAudiences.map((a) => (
                          <Badge key={a} variant="outline" className="text-[10px] mr-1">{a}</Badge>
                        ))}
                      />
                    )}
                    <FieldRow label="Daily budget" value={`$${campaign.dailyBudget}/day`} />
                    <FieldRow label="Estimated reach" value={`${(campaign.dailyBudget * 320).toLocaleString()}–${(campaign.dailyBudget * 580).toLocaleString()} / day`} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      Creatives
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        · {campaign.creatives.length} variant{campaign.creatives.length !== 1 ? "s" : ""}
                      </span>
                    </CardTitle>
                    <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} className="h-7 text-xs">
                      <Edit3 className="w-3 h-3 mr-1" /> Edit
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {campaign.creatives.map((cr) => {
                      const ctr = cr.stats && cr.stats.impressions > 0
                        ? ((cr.stats.clicks / cr.stats.impressions) * 100).toFixed(2)
                        : null
                      return (
                        <div key={cr.id} className="rounded-lg border p-3 bg-muted/20">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold">{cr.name ?? "Variant"}</p>
                            {ctr !== null && (
                              <Badge variant="outline" className="text-[10px]">
                                CTR {ctr}%
                              </Badge>
                            )}
                          </div>
                          <div className="flex justify-center bg-white rounded p-2">
                            <AdCreativePreview channel={campaign.channel} creative={cr} size="sm" />
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
    {campaign && (
      <CampaignDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={campaign}
      />
    )}
    </>
  )
}

function Kpi({
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
    <div className="rounded-lg border border-border/60 p-2.5 bg-card">
      <div className={`w-7 h-7 rounded-md ${bg} flex items-center justify-center mb-1.5`}>
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      </div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold tabular-nums">{value}</p>
    </div>
  )
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-24 shrink-0 mt-0.5">
        {label}
      </span>
      <div className="flex-1 min-w-0">{value}</div>
    </div>
  )
}

function buildPerformanceTimeline(campaign: AdCampaign) {
  // Spread cumulative stats across days active (smooth growth approximation)
  const start = new Date(campaign.startDate).getTime()
  const days = Math.max(1, Math.min(14, Math.round((Date.now() - start) / (24 * 60 * 60 * 1000))))
  const data: { day: string; clicks: number; conversions: number; spend: number }[] = []
  const totalConv = campaign.stats.optins + campaign.stats.sales

  for (let i = 0; i < days; i++) {
    const d = new Date(start + i * 24 * 60 * 60 * 1000)
    const fraction = (i + 1) / days
    data.push({
      day: `${d.getMonth() + 1}/${d.getDate()}`,
      clicks: Math.round(campaign.stats.clicks * fraction),
      conversions: Math.round(totalConv * fraction),
      spend: Math.round(campaign.stats.spend * fraction),
    })
  }
  return data
}
