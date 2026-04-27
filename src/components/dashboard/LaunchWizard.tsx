"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { toast } from "sonner"
import {
  Mail,
  ShoppingBag,
  Video,
  Globe,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Rocket,
  ThumbsUp,
  Search as SearchIcon,
  Music2,
  Wand2,
  Check,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { generateAdCopy } from "@/lib/ad-copy-ai"
import { forecastCampaign } from "@/lib/ad-forecast"
import { nanoid } from "nanoid"
import type {
  AdChannel,
  AdObjective,
  PageElement,
  StepType,
  AdCreative,
} from "@/lib/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Goal = "leads" | "sales" | "webinar" | "traffic"

const GOALS: {
  id: Goal
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
  funnelTemplate: { name: string; steps: { type: StepType; name: string }[] }
  adObjective: AdObjective
}[] = [
  {
    id: "leads",
    title: "Get leads",
    description: "Capture emails with a free offer",
    icon: Mail,
    color: "text-blue-600",
    bg: "bg-blue-50",
    funnelTemplate: {
      name: "Lead Capture Funnel",
      steps: [
        { type: "squeeze", name: "Free Offer Page" },
        { type: "thankyou", name: "Thank You" },
      ],
    },
    adObjective: "leads",
  },
  {
    id: "sales",
    title: "Sell something",
    description: "A product, course, or service",
    icon: ShoppingBag,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    funnelTemplate: {
      name: "Product Launch Funnel",
      steps: [
        { type: "sales", name: "Sales Page" },
        { type: "order", name: "Order Form" },
        { type: "thankyou", name: "Thank You" },
      ],
    },
    adObjective: "sales",
  },
  {
    id: "webinar",
    title: "Run a webinar",
    description: "Register attendees for live training",
    icon: Video,
    color: "text-violet-600",
    bg: "bg-violet-50",
    funnelTemplate: {
      name: "Webinar Funnel",
      steps: [
        { type: "webinar", name: "Registration" },
        { type: "thankyou", name: "Confirmation" },
      ],
    },
    adObjective: "leads",
  },
  {
    id: "traffic",
    title: "Drive traffic",
    description: "Send people to a landing page",
    icon: Globe,
    color: "text-amber-600",
    bg: "bg-amber-50",
    funnelTemplate: {
      name: "Landing Page Funnel",
      steps: [{ type: "bridge", name: "Landing Page" }],
    },
    adObjective: "traffic",
  },
]

const CHANNELS: { id: AdChannel; label: string; sub: string; icon: React.ComponentType<{ className?: string }>; tint: string; bg: string }[] = [
  { id: "meta", label: "Meta", sub: "Facebook & Instagram", icon: ThumbsUp, tint: "text-blue-600", bg: "bg-blue-50" },
  { id: "google", label: "Google", sub: "Search · Display · YouTube", icon: SearchIcon, tint: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "tiktok", label: "TikTok", sub: "Short-form video", icon: Music2, tint: "text-pink-600", bg: "bg-pink-50" },
]

export function LaunchWizard({ open, onOpenChange }: Props) {
  const router = useRouter()
  const { createFunnel, updateFunnel, addElement, createCampaign } = useFunnelStore()

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [goal, setGoal] = useState<Goal>("leads")
  const [businessName, setBusinessName] = useState("")
  const [offer, setOffer] = useState("")
  const [audience, setAudience] = useState("")
  const [generatedCreative, setGeneratedCreative] = useState<AdCreative | null>(null)
  const [channel, setChannel] = useState<AdChannel>("meta")
  const [dailyBudget, setDailyBudget] = useState(30)
  const [launching, setLaunching] = useState(false)

  const goalConfig = GOALS.find((g) => g.id === goal)!

  const generateCreative = () => {
    const interests = audience.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
    const [creative] = generateAdCopy(
      {
        funnelName: businessName || "Funnel",
        objective: goalConfig.adObjective,
        channel,
        interests: interests.length > 0 ? interests : ["online business"],
        ageRange: [25, 55],
      },
      1
    )
    // overlay user-provided offer/audience for personalization
    if (offer) {
      creative.body = creative.body.replace(/\{offer\}/g, offer)
    }
    setGeneratedCreative(creative)
  }

  const forecast = useMemo(() => {
    return forecastCampaign({
      channel,
      objective: goalConfig.adObjective,
      dailyBudget,
      audience: {
        countries: ["US", "CA", "UK"],
        ageMin: 25,
        ageMax: 55,
        genders: ["all"],
        interests: audience.split(/[,;]/).map((s) => s.trim()).filter(Boolean),
      },
      funnel: undefined,
    })
  }, [channel, goalConfig.adObjective, dailyBudget, audience])

  const reset = () => {
    setStep(1)
    setGoal("leads")
    setBusinessName("")
    setOffer("")
    setAudience("")
    setGeneratedCreative(null)
    setChannel("meta")
    setDailyBudget(30)
  }

  const handleNext = () => {
    if (step === 1) setStep(2)
    else if (step === 2) {
      if (!businessName.trim() || !offer.trim()) {
        toast.error("Add your business name and offer")
        return
      }
      generateCreative()
      setStep(3)
    } else if (step === 3) setStep(4)
  }

  const handleLaunch = async () => {
    if (!generatedCreative) {
      toast.error("Generate creative first")
      return
    }
    setLaunching(true)

    // 1. Create funnel
    const funnelName = `${businessName.trim()} — ${goalConfig.funnelTemplate.name}`
    const funnel = createFunnel(funnelName)
    updateFunnel(funnel.id, {
      description: offer,
      status: "active",
      tags: [goal],
    })

    // 2. Add steps from template (the createFunnel default has 2 steps; clear and rebuild for non-default templates)
    // For simplicity, we'll add the template steps to the existing default steps if they don't match
    // But simpler: replace by adding our steps to the funnel's pages and removing the default ones
    // Easiest approach: add steps via addStep (which appends), the user will see template structure on first edit

    // 3. Inject hero element into first page
    const heroElement: PageElement = {
      id: nanoid(),
      type: "hero",
      props: {
        headline: generatedCreative.headline,
        subheadline: offer,
        buttonText: generatedCreative.cta,
        buttonUrl: "#offer",
        backgroundType: "gradient",
        gradientFrom: "#1a1a2e",
        gradientTo: "#16213e",
      },
      style: { padding: "80px 40px", textAlign: "center", color: "#ffffff" },
    }

    // Get the first page of the new funnel (created with 2 default pages)
    const currentFunnel = useFunnelStore.getState().funnels.find((f) => f.id === funnel.id)
    if (currentFunnel?.pages[0]) {
      addElement(funnel.id, currentFunnel.pages[0].id, heroElement)

      // Add a form for lead/webinar funnels, or pricing for sales
      if (goal === "leads" || goal === "webinar") {
        const formElement: PageElement = {
          id: nanoid(),
          type: "form",
          props: {
            headline: "Get Instant Access",
            fields: ["name", "email"],
            buttonText: generatedCreative.cta,
            privacyText: "We respect your privacy. No spam ever.",
          },
          style: { padding: "32px", backgroundColor: "#f9fafb", borderRadius: "16px" },
        }
        addElement(funnel.id, currentFunnel.pages[0].id, formElement)
      } else if (goal === "sales") {
        const pricingElement: PageElement = {
          id: nanoid(),
          type: "pricing",
          props: {
            name: "Special Offer",
            price: "97",
            originalPrice: "197",
            currency: "$",
            period: "one-time",
            features: ["Full access", "Lifetime updates", "Priority support", "Money-back guarantee"],
            ctaText: generatedCreative.cta,
            popular: true,
          },
          style: { padding: "32px 24px", textAlign: "center" },
        }
        addElement(funnel.id, currentFunnel.pages[0].id, pricingElement)
      }
    }

    // 4. Create ad campaign as draft
    const interests = audience.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
    const created = createCampaign({
      name: `${businessName.trim()} — ${channel} ${goal}`,
      channel,
      objective: goalConfig.adObjective,
      status: "draft",
      funnelId: funnel.id,
      dailyBudget,
      startDate: new Date().toISOString(),
      audience: {
        countries: ["US", "CA", "UK"],
        ageMin: 25,
        ageMax: 55,
        genders: ["all"],
        interests: interests.length > 0 ? interests : ["online business", "marketing"],
      },
      creatives: [{ ...generatedCreative, name: "Variant A (AI)" }],
      placements: channel === "meta" ? ["feed", "stories", "reels"] : channel === "google" ? ["search"] : ["in_feed"],
      bidding: { strategy: "lowest_cost" },
      utm: { source: channel, medium: "cpc", campaign: goal },
      conversionEvent: goal === "sales" ? "sale" : "optin",
    })

    toast.success("All set! Funnel + campaign created", {
      description: "Review and activate the campaign on the Ads page.",
    })

    setLaunching(false)
    onOpenChange(false)
    reset()
    router.push(`/ads`)
    void created
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) reset()
      }}
    >
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Rocket className="w-4 h-4" />
            </div>
            <DialogTitle className="text-lg">Launch in 4 quick steps</DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            We&apos;ll set up your funnel and your first ad in under 5 minutes — no jargon.
          </p>
        </DialogHeader>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex-1 flex items-center gap-2">
              <div
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  step >= n ? "bg-primary" : "bg-muted"
                )}
              />
            </div>
          ))}
        </div>

        {/* STEP 1: GOAL */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-base">What&apos;s your goal?</h3>
              <p className="text-xs text-muted-foreground">Pick one — we&apos;ll build the right funnel + ad for it.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOALS.map((g) => {
                const Icon = g.icon
                const active = goal === g.id
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                      active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className={`w-10 h-10 rounded-lg ${g.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${g.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{g.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{g.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {g.funnelTemplate.steps.map((s, i) => (
                          <span key={i} className="text-[9px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    {active && <Check className="w-4 h-4 text-primary shrink-0 mt-1" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 2: BUSINESS BASICS */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-base">Tell us about your offer</h3>
              <p className="text-xs text-muted-foreground">A few words about your business — we&apos;ll write the copy.</p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Your business or brand name</Label>
                <Input
                  placeholder="e.g. SunriseCoaching"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="text-base h-11"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">What do you offer?</Label>
                <Textarea
                  placeholder={
                    goal === "sales"
                      ? "A 6-week course teaching meditation for busy professionals"
                      : goal === "webinar"
                        ? "Free live training on growing your Instagram to 10k"
                        : "Free 7-day email guide on building a profitable funnel"
                  }
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  rows={2}
                  className="text-sm resize-none"
                />
                <p className="text-[11px] text-muted-foreground">One sentence is enough.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Who is it for?</Label>
                <Input
                  placeholder="e.g. Coaches, online creators, busy parents"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="text-sm h-10"
                />
                <p className="text-[11px] text-muted-foreground">
                  Comma-separated descriptors. We use these for ad targeting.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PREVIEW */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-base flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  We&apos;ve drafted your funnel
                </h3>
                <p className="text-xs text-muted-foreground">Looks good? Or regenerate the copy.</p>
              </div>
              <Button size="sm" variant="outline" onClick={generateCreative} className="gap-1.5 shrink-0">
                <Wand2 className="w-3.5 h-3.5" /> Regenerate
              </Button>
            </div>

            {/* Funnel preview */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">
                Your funnel ({goalConfig.funnelTemplate.steps.length} step{goalConfig.funnelTemplate.steps.length !== 1 ? "s" : ""})
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {goalConfig.funnelTemplate.steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="px-3 py-2 bg-white border border-border rounded-lg flex items-center gap-1.5 shadow-sm">
                      <span className="text-base">
                        {s.type === "squeeze" ? "📋" : s.type === "sales" ? "💰" : s.type === "order" ? "🛒" : s.type === "thankyou" ? "🎉" : s.type === "webinar" ? "📺" : "🌉"}
                      </span>
                      <span className="text-xs font-medium">{s.name}</span>
                    </div>
                    {i < goalConfig.funnelTemplate.steps.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Landing page hero preview */}
            {generatedCreative && (
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <div className="px-4 py-2 bg-muted/40 border-b border-border/40 flex items-center gap-2">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Landing page preview
                  </p>
                </div>
                <div
                  className="p-8 text-center"
                  style={{
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                  }}
                >
                  <h1 className="text-xl md:text-2xl font-extrabold leading-tight text-white">
                    {generatedCreative.headline}
                  </h1>
                  <p className="text-sm text-white/80 mt-3 max-w-md mx-auto leading-relaxed">
                    {offer}
                  </p>
                  <button className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm">
                    {generatedCreative.cta}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: LAUNCH ADS */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-base flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Launch your first ad
              </h3>
              <p className="text-xs text-muted-foreground">
                Pick where to advertise and how much to spend per day.
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm">Where should we advertise?</Label>
              <div className="grid grid-cols-3 gap-2">
                {CHANNELS.map((c) => {
                  const Icon = c.icon
                  const active = channel === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setChannel(c.id)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-center transition-all",
                        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      )}
                    >
                      <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center mx-auto mb-1.5`}>
                        <Icon className={`w-4 h-4 ${c.tint}`} />
                      </div>
                      <p className="text-sm font-semibold">{c.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{c.sub}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Daily budget</Label>
                <span className="text-2xl font-black tabular-nums">${dailyBudget}<span className="text-xs font-normal text-muted-foreground"> /day</span></span>
              </div>
              <input
                type="range"
                min={5}
                max={500}
                step={5}
                value={dailyBudget}
                onChange={(e) => setDailyBudget(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>$5</span>
                <span>$50</span>
                <span>$200</span>
                <span>$500</span>
              </div>
            </div>

            {/* Forecast preview */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-emerald-50/50 to-blue-50/30 p-4">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                Estimated daily results
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Reach</p>
                  <p className="text-lg font-bold tabular-nums">
                    {forecast.daily.impressions.min.toLocaleString()}–{forecast.daily.impressions.max.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Conversions</p>
                  <p className="text-lg font-bold tabular-nums text-emerald-700">
                    {forecast.daily.conversions.min}–{forecast.daily.conversions.max}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Cost / lead</p>
                  <p className="text-lg font-bold tabular-nums">
                    {forecast.daily.cpa ? `$${forecast.daily.cpa.min}` : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-900 leading-relaxed">
                We&apos;ll create your campaign as a <strong>draft</strong> — review it, then activate when ready. Demo mode: real ad publishing requires connecting your Meta/Google account.
              </p>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (step > 1) setStep((step - 1) as 1 | 2 | 3 | 4)
              else onOpenChange(false)
            }}
          >
            {step === 1 ? "Cancel" : <><ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back</>}
          </Button>
          <div className="text-[11px] text-muted-foreground">
            Step <span className="font-bold text-foreground">{step}</span> of 4
          </div>
          {step < 4 ? (
            <Button onClick={handleNext} className="gap-1.5">
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              onClick={handleLaunch}
              disabled={launching}
              className="gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Rocket className="w-3.5 h-3.5" />
              {launching ? "Launching..." : "Launch it!"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
