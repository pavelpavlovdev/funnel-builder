"use client"

import { useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFunnelStore } from "@/lib/store/funnel-store"
import type {
  AdCampaign,
  AdChannel,
  AdCreative,
  AdObjective,
  AdPlacement,
  BiddingStrategy,
  UTMParameters,
} from "@/lib/types"
import { toast } from "sonner"
import { AdCreativePreview } from "./AdCreativePreview"
import { ForecastPanel } from "./ForecastPanel"
import { AudienceSizeGauge } from "./AudienceSizeGauge"
import { StockImagePicker } from "./StockImagePicker"
import { PlacementsPicker } from "./PlacementsPicker"
import { generateAdCopy } from "@/lib/ad-copy-ai"
import { forecastCampaign, buildUtmUrl } from "@/lib/ad-forecast"
import {
  ThumbsUp,
  Search as SearchIcon,
  Music2,
  Wand2,
  ImageIcon,
  Plus,
  Trash2,
  Copy as CopyIcon,
  Sparkles,
  Calendar,
  X,
} from "lucide-react"
import { nanoid } from "nanoid"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: AdCampaign
  onCreated?: (id: string) => void
}

const CHANNELS: { id: AdChannel; label: string; sub: string; icon: React.ComponentType<{ className?: string }>; tint: string }[] = [
  { id: "meta", label: "Meta", sub: "Facebook & Instagram", icon: ThumbsUp, tint: "text-blue-600" },
  { id: "google", label: "Google", sub: "Search · Display · YouTube", icon: SearchIcon, tint: "text-emerald-600" },
  { id: "tiktok", label: "TikTok", sub: "In-Feed · TopView", icon: Music2, tint: "text-pink-600" },
]

const OBJECTIVES: { id: AdObjective; label: string; description: string }[] = [
  { id: "leads", label: "Leads", description: "Capture emails / sign-ups" },
  { id: "sales", label: "Sales", description: "Drive purchases" },
  { id: "traffic", label: "Traffic", description: "Send people to your funnel" },
  { id: "awareness", label: "Awareness", description: "Maximize impressions" },
  { id: "engagement", label: "Engagement", description: "Likes, shares, comments" },
  { id: "app_installs", label: "App installs", description: "Drive mobile installs" },
]

const BIDDING_STRATEGIES: { id: BiddingStrategy; label: string; description: string }[] = [
  { id: "lowest_cost", label: "Lowest cost (auto)", description: "Maximize results within budget. Best for new campaigns." },
  { id: "cost_cap", label: "Cost cap", description: "Hit a target CPA. Algorithm respects ceiling but optimizes within it." },
  { id: "bid_cap", label: "Bid cap", description: "Hard ceiling on bid. Lower volume, predictable CPA." },
  { id: "manual_cpc", label: "Manual CPC", description: "You set the max bid per click. For experienced advertisers." },
]

function blankCreative(): AdCreative {
  return { id: nanoid(), name: "Variant A", headline: "", body: "", cta: "Learn More" }
}

const DEFAULT_PLACEMENTS: Record<AdChannel, AdPlacement[]> = {
  meta: ["feed", "stories", "reels"],
  google: ["search"],
  tiktok: ["in_feed"],
}

export function CampaignDialog({ open, onOpenChange, initial, onCreated }: Props) {
  const { funnels, createCampaign, updateCampaign } = useFunnelStore()
  const isEdit = !!initial

  const [tab, setTab] = useState("setup")
  const [stockOpen, setStockOpen] = useState(false)
  const [stockTargetIdx, setStockTargetIdx] = useState<number>(0)

  const [name, setName] = useState(initial?.name ?? "")
  const [channel, setChannel] = useState<AdChannel>(initial?.channel ?? "meta")
  const [objective, setObjective] = useState<AdObjective>(initial?.objective ?? "leads")
  const [funnelId, setFunnelId] = useState(initial?.funnelId ?? funnels[0]?.id ?? "")
  const [dailyBudget, setDailyBudget] = useState(initial?.dailyBudget ?? 50)
  const [bidding, setBidding] = useState<{ strategy: BiddingStrategy; cap: number }>({
    strategy: initial?.bidding?.strategy ?? "lowest_cost",
    cap: initial?.bidding?.cap ?? 0,
  })

  const [countries, setCountries] = useState((initial?.audience.countries ?? ["US"]).join(", "))
  const [ageMin, setAgeMin] = useState(initial?.audience.ageMin ?? 25)
  const [ageMax, setAgeMax] = useState(initial?.audience.ageMax ?? 55)
  const [interests, setInterests] = useState((initial?.audience.interests ?? []).join(", "))
  const [lookalikePct, setLookalikePct] = useState(initial?.audience.lookalikePct ?? 0)

  const [placements, setPlacements] = useState<AdPlacement[]>(
    initial?.placements ?? DEFAULT_PLACEMENTS[initial?.channel ?? "meta"]
  )

  const [startDate, setStartDate] = useState((initial?.startDate ?? new Date().toISOString()).slice(0, 10))
  const [endDate, setEndDate] = useState((initial?.endDate ?? "").slice(0, 10))

  const [creatives, setCreatives] = useState<AdCreative[]>(
    initial?.creatives && initial.creatives.length > 0 ? initial.creatives.map((c) => ({ ...c })) : [blankCreative()]
  )

  const [utm, setUtm] = useState<UTMParameters>({
    source: initial?.utm?.source ?? channel,
    medium: initial?.utm?.medium ?? "cpc",
    campaign: initial?.utm?.campaign ?? "",
    content: initial?.utm?.content ?? "",
    term: initial?.utm?.term ?? "",
  })

  const funnel = funnels.find((f) => f.id === funnelId)

  const audience = useMemo(
    () => ({
      countries: countries.split(",").map((s) => s.trim()).filter(Boolean),
      ageMin: Math.max(13, ageMin),
      ageMax: Math.min(99, ageMax),
      genders: ["all" as const],
      interests: interests.split(",").map((s) => s.trim()).filter(Boolean),
      lookalikePct: lookalikePct > 0 ? lookalikePct : undefined,
    }),
    [countries, ageMin, ageMax, interests, lookalikePct]
  )

  const forecast = useMemo(
    () => forecastCampaign({ channel, objective, dailyBudget, audience, funnel }),
    [channel, objective, dailyBudget, audience, funnel]
  )

  const utmUrl = useMemo(
    () => buildUtmUrl(funnel?.domain, funnelId, utm),
    [funnel?.domain, funnelId, utm]
  )

  // Track changes for AI suggestions
  const handleAiGenerate = () => {
    const variants = generateAdCopy(
      {
        funnelName: funnel?.name ?? "Funnel",
        objective,
        channel,
        interests: audience.interests,
        ageRange: [ageMin, ageMax],
      },
      3
    )
    setCreatives((prev) => [...prev, ...variants])
    toast.success("Generated 3 AI variants", {
      description: "Edit them, mix and match — or pick a winner.",
    })
  }

  const updateCreativeAt = (i: number, patch: Partial<AdCreative>) => {
    setCreatives((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))
  }

  const handleSave = () => {
    if (!name.trim() || !funnelId) {
      toast.error("Campaign name and funnel are required")
      setTab("setup")
      return
    }
    if (creatives.length === 0 || !creatives[0].headline.trim()) {
      toast.error("Add at least one creative with a headline")
      setTab("creatives")
      return
    }

    const payload = {
      name: name.trim(),
      channel,
      objective,
      status: (initial?.status ?? "draft") as AdCampaign["status"],
      funnelId,
      dailyBudget: Math.max(1, dailyBudget),
      startDate: new Date(startDate || new Date()).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      audience,
      creatives: creatives.map((c) => ({
        ...c,
        headline: c.headline.trim(),
        body: c.body.trim(),
        cta: c.cta.trim() || "Learn More",
      })),
      placements,
      bidding: {
        strategy: bidding.strategy,
        cap: bidding.strategy === "lowest_cost" ? undefined : bidding.cap || undefined,
      },
      utm: {
        source: utm.source?.trim() || channel,
        medium: utm.medium?.trim() || "cpc",
        campaign: utm.campaign?.trim() || undefined,
        content: utm.content?.trim() || undefined,
        term: utm.term?.trim() || undefined,
      },
      conversionEvent: (objective === "sales" ? "sale" : "optin") as "optin" | "sale",
    }

    if (isEdit && initial) {
      updateCampaign(initial.id, payload)
      toast.success("Campaign updated")
    } else {
      const created = createCampaign(payload)
      toast.success("Campaign created as draft", { description: "Activate it from the campaign list." })
      onCreated?.(created.id)
    }
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-5xl max-h-[92vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit campaign" : "Create new campaign"}</DialogTitle>
            <DialogDescription>
              All edits update the live forecast on the right.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
            {/* Form */}
            <div className="lg:col-span-2">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="setup">Setup</TabsTrigger>
                  <TabsTrigger value="audience">Audience</TabsTrigger>
                  <TabsTrigger value="budget">Budget & Schedule</TabsTrigger>
                  <TabsTrigger value="creatives">
                    Creatives
                    <Badge variant="secondary" className="ml-1.5 text-[10px] py-0 px-1 h-4">
                      {creatives.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                {/* SETUP */}
                <TabsContent value="setup" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Campaign name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Lead Magnet Q2 — Cold US" />
                  </div>

                  <div className="space-y-2">
                    <Label>Channel</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {CHANNELS.map((c) => {
                        const Icon = c.icon
                        const active = channel === c.id
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setChannel(c.id)
                              setPlacements(DEFAULT_PLACEMENTS[c.id])
                              setUtm((u) => ({ ...u, source: c.id }))
                            }}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${c.tint}`} />
                            <p className="text-sm font-semibold mt-2">{c.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{c.sub}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Objective</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {OBJECTIVES.map((o) => {
                        const active = objective === o.id
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => setObjective(o.id)}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                            }`}
                          >
                            <p className="text-sm font-semibold">{o.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{o.description}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Send traffic to funnel</Label>
                    <Select value={funnelId} onValueChange={setFunnelId}>
                      <SelectTrigger><SelectValue placeholder="Pick a funnel" /></SelectTrigger>
                      <SelectContent>
                        {funnels.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* AUDIENCE */}
                <TabsContent value="audience" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Countries (ISO codes, comma-separated)</Label>
                    <Input
                      value={countries}
                      onChange={(e) => setCountries(e.target.value)}
                      placeholder="US, CA, UK, DE, FR"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Age min</Label>
                      <Input type="number" min={13} max={99} value={ageMin} onChange={(e) => setAgeMin(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Age max</Label>
                      <Input type="number" min={13} max={99} value={ageMax} onChange={(e) => setAgeMax(Number(e.target.value))} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Interests (comma-separated)</Label>
                    <Textarea
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      placeholder="Online business, Digital marketing, E-commerce"
                      rows={2}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      3–8 related interests usually outperform single-interest targeting.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Lookalike audience similarity</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={1}
                        value={lookalikePct}
                        onChange={(e) => setLookalikePct(Number(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <span className="text-sm font-mono w-16 text-right">
                        {lookalikePct === 0 ? "Off" : `${lookalikePct}%`}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      0% = off · 1% = most similar (highest match) · 10% = broadest lookalike
                    </p>
                  </div>
                </TabsContent>

                {/* BUDGET */}
                <TabsContent value="budget" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Daily budget (USD)</Label>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold">$</span>
                      <Input
                        type="number"
                        min={1}
                        value={dailyBudget}
                        onChange={(e) => setDailyBudget(Number(e.target.value))}
                        className="text-2xl font-bold h-14 w-32"
                      />
                      <span className="text-sm text-muted-foreground">/ day</span>
                      <span className="text-sm text-muted-foreground ml-auto">
                        Weekly: <span className="font-semibold text-foreground">${(dailyBudget * 7).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Bidding strategy</Label>
                    <Select
                      value={bidding.strategy}
                      onValueChange={(v) => setBidding({ ...bidding, strategy: v as BiddingStrategy })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BIDDING_STRATEGIES.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            <div>
                              <p className="font-semibold">{b.label}</p>
                              <p className="text-[11px] text-muted-foreground">{b.description}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {bidding.strategy !== "lowest_cost" && (
                      <div className="flex items-center gap-2 mt-2">
                        <Label className="text-xs">
                          {bidding.strategy === "manual_cpc" ? "Max bid per click ($)" : "Cost cap ($)"}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={bidding.cap || ""}
                          onChange={(e) => setBidding({ ...bidding, cap: Number(e.target.value) })}
                          className="w-28 h-8"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Schedule</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Start</span>
                        <div className="relative">
                          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">End (optional)</span>
                        <div className="relative">
                          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Placements</Label>
                    <PlacementsPicker channel={channel} selected={placements} onChange={setPlacements} />
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <Label className="flex items-center gap-2">
                      Tracking URL (UTM parameters)
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="utm_source"
                        value={utm.source ?? ""}
                        onChange={(e) => setUtm((u) => ({ ...u, source: e.target.value }))}
                      />
                      <Input
                        placeholder="utm_medium"
                        value={utm.medium ?? ""}
                        onChange={(e) => setUtm((u) => ({ ...u, medium: e.target.value }))}
                      />
                      <Input
                        placeholder="utm_campaign"
                        value={utm.campaign ?? ""}
                        onChange={(e) => setUtm((u) => ({ ...u, campaign: e.target.value }))}
                      />
                      <Input
                        placeholder="utm_content"
                        value={utm.content ?? ""}
                        onChange={(e) => setUtm((u) => ({ ...u, content: e.target.value }))}
                      />
                    </div>
                    <div className="bg-muted/40 rounded-md p-2 mt-2 flex items-center gap-2">
                      <p className="text-[11px] text-muted-foreground font-mono truncate flex-1" title={utmUrl}>
                        {utmUrl}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 shrink-0"
                        onClick={() => {
                          navigator.clipboard.writeText(utmUrl)
                          toast.success("Tracking URL copied")
                        }}
                      >
                        <CopyIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* CREATIVES */}
                <TabsContent value="creatives" className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Multiple creatives auto-rotate based on weighted random. Performance is tracked per variant.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAiGenerate}
                        className="gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI Generate
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setCreatives((prev) => [...prev, blankCreative()])}
                        className="gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add blank
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {creatives.map((c, i) => (
                      <CreativeRow
                        key={c.id}
                        index={i}
                        creative={c}
                        channel={channel}
                        onChange={(patch) => updateCreativeAt(i, patch)}
                        onRemove={() => {
                          if (creatives.length === 1) {
                            toast.error("At least one creative is required")
                            return
                          }
                          setCreatives((prev) => prev.filter((_, idx) => idx !== i))
                        }}
                        onPickStock={() => {
                          setStockTargetIdx(i)
                          setStockOpen(true)
                        }}
                        onAiRegenerate={() => {
                          const [v] = generateAdCopy(
                            {
                              funnelName: funnel?.name ?? "Funnel",
                              objective,
                              channel,
                              interests: audience.interests,
                              ageRange: [ageMin, ageMax],
                            },
                            1
                          )
                          updateCreativeAt(i, { headline: v.headline, body: v.body, cta: v.cta })
                          toast.success("Creative refreshed with AI")
                        }}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Forecast sidebar */}
            <div className="space-y-3">
              <AudienceSizeGauge size={forecast.audienceSize} />
              <ForecastPanel forecast={forecast} />
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                  Live preview ({channel})
                </p>
                <div className="flex justify-center">
                  <AdCreativePreview
                    channel={channel}
                    creative={creatives[0] ?? blankCreative()}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-1.5" /> Cancel
            </Button>
            <Button onClick={handleSave}>{isEdit ? "Save changes" : "Create campaign"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StockImagePicker
        open={stockOpen}
        onOpenChange={setStockOpen}
        onPick={(url) => updateCreativeAt(stockTargetIdx, { imageUrl: url })}
      />
    </>
  )
}

function CreativeRow({
  index,
  creative,
  channel,
  onChange,
  onRemove,
  onPickStock,
  onAiRegenerate,
}: {
  index: number
  creative: AdCreative
  channel: AdChannel
  onChange: (patch: Partial<AdCreative>) => void
  onRemove: () => void
  onPickStock: () => void
  onAiRegenerate: () => void
}) {
  return (
    <div className="rounded-xl border border-border/60 p-3 bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-5">
            #{index + 1}
          </Badge>
          <Input
            value={creative.name ?? ""}
            placeholder={`Variant ${String.fromCharCode(65 + index)}`}
            onChange={(e) => onChange({ name: e.target.value })}
            className="h-7 text-xs font-semibold w-48 border-transparent shadow-none focus-visible:border-input"
          />
          {creative.stats && creative.stats.impressions > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              CTR {((creative.stats.clicks / creative.stats.impressions) * 100).toFixed(2)}%
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs gap-1"
            onClick={onAiRegenerate}
            title="Regenerate with AI"
          >
            <Wand2 className="w-3 h-3" /> AI
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Input
            value={creative.headline}
            onChange={(e) => onChange({ headline: e.target.value })}
            placeholder="Headline"
            maxLength={80}
            className="font-semibold"
          />
          <Textarea
            value={creative.body}
            onChange={(e) => onChange({ body: e.target.value })}
            placeholder="Body / description"
            rows={3}
            maxLength={250}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={creative.cta}
              onChange={(e) => onChange({ cta: e.target.value })}
              placeholder="CTA"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onPickStock}
              className="gap-1.5"
            >
              <ImageIcon className="w-3.5 h-3.5" /> Image library
            </Button>
          </div>
          <Input
            value={creative.imageUrl ?? ""}
            onChange={(e) => onChange({ imageUrl: e.target.value })}
            placeholder="Image URL (or pick from library)"
            className="text-xs"
          />
        </div>

        <div className="bg-muted/40 rounded-lg p-3 flex items-center justify-center min-h-[200px]">
          <AdCreativePreview channel={channel} creative={creative} size="sm" />
        </div>
      </div>
    </div>
  )
}
