"use client"

import { useState, useEffect } from "react"
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
  ShoppingCart, GraduationCap, Laptop, MapPin, Camera, Briefcase,
  Mail, DollarSign, Video, Globe,
  Sparkles, Rocket, ThumbsUp, Search as SearchIcon, Music2,
  Check, ArrowLeft, ArrowRight, Users, LayoutTemplate,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { nanoid } from "nanoid"
import type { AdChannel, PageElement, GenerateFunnelResponse, StepType, FunnelPage, FunnelStep } from "@/lib/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Goal = "leads" | "sales" | "webinar" | "traffic"
type ThemeId = "dark_pro" | "light_clean" | "indigo_bold" | "emerald" | "sunset" | "minimal"

interface FunnelStructure {
  id: string
  label: string
  description: string
  pages: { type: StepType; name: string }[]
}

interface Theme {
  id: ThemeId
  label: string
  from: string
  to: string
  text: string
  textMuted: string
  dark: boolean
}

const BUSINESS_TYPES = [
  { id: "ecommerce",  label: "E-commerce",       icon: ShoppingCart,  color: "text-orange-600", bg: "bg-orange-50" },
  { id: "coaching",   label: "Coaching / Course", icon: GraduationCap, color: "text-violet-600", bg: "bg-violet-50" },
  { id: "saas",       label: "SaaS / App",        icon: Laptop,        color: "text-blue-600",   bg: "bg-blue-50"   },
  { id: "local",      label: "Local Business",    icon: MapPin,        color: "text-emerald-600",bg: "bg-emerald-50"},
  { id: "creator",    label: "Creator / Blog",    icon: Camera,        color: "text-pink-600",   bg: "bg-pink-50"   },
  { id: "agency",     label: "Agency",            icon: Briefcase,     color: "text-amber-600",  bg: "bg-amber-50"  },
]

const GOALS: { id: Goal; label: string; description: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }[] = [
  { id: "leads",   label: "Collect leads",  description: "Emails via a free offer",       icon: Mail,       color: "text-blue-600",   bg: "bg-blue-50"   },
  { id: "sales",   label: "Make sales",     description: "Product, course or service",    icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "webinar", label: "Fill a webinar", description: "Register live attendees",       icon: Video,      color: "text-violet-600", bg: "bg-violet-50" },
  { id: "traffic", label: "Drive traffic",  description: "Send people to a landing page", icon: Globe,      color: "text-amber-600",  bg: "bg-amber-50"  },
]

const FUNNEL_STRUCTURES: FunnelStructure[] = [
  {
    id: "simple",
    label: "Simple",
    description: "Just a landing page",
    pages: [{ type: "bridge", name: "Landing Page" }],
  },
  {
    id: "classic",
    label: "Classic",
    description: "Landing + Thank You",
    pages: [
      { type: "squeeze", name: "Landing Page" },
      { type: "thankyou", name: "Thank You" },
    ],
  },
  {
    id: "full",
    label: "Full",
    description: "Landing → Form → Thank You",
    pages: [
      { type: "squeeze", name: "Landing Page" },
      { type: "order",   name: "Order / Form" },
      { type: "thankyou", name: "Thank You" },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    description: "Sales page → Order → Upsell",
    pages: [
      { type: "sales",   name: "Sales Page" },
      { type: "order",   name: "Order Form" },
      { type: "upsell",  name: "Upsell" },
      { type: "thankyou", name: "Thank You" },
    ],
  },
]

const THEMES: Theme[] = [
  { id: "dark_pro",    label: "Dark Pro",     from: "#1a1a2e", to: "#16213e", text: "#ffffff", textMuted: "rgba(255,255,255,0.7)", dark: true  },
  { id: "indigo_bold", label: "Indigo Bold",  from: "#4f46e5", to: "#7c3aed", text: "#ffffff", textMuted: "rgba(255,255,255,0.75)", dark: true  },
  { id: "sunset",      label: "Sunset",       from: "#ea580c", to: "#be185d", text: "#ffffff", textMuted: "rgba(255,255,255,0.75)", dark: true  },
  { id: "emerald",     label: "Emerald",      from: "#059669", to: "#0891b2", text: "#ffffff", textMuted: "rgba(255,255,255,0.75)", dark: true  },
  { id: "light_clean", label: "Light Clean",  from: "#ffffff", to: "#f1f5f9", text: "#111827", textMuted: "#6b7280", dark: false },
  { id: "minimal",     label: "Minimal",      from: "#f8fafc", to: "#e2e8f0", text: "#1e293b", textMuted: "#64748b", dark: false },
]

const CHANNELS: { id: AdChannel; label: string; sub: string; icon: React.ComponentType<{ className?: string }>; tint: string; bg: string }[] = [
  { id: "meta",   label: "Meta",   sub: "Facebook & Instagram", icon: ThumbsUp,   tint: "text-blue-600",   bg: "bg-blue-50"   },
  { id: "google", label: "Google", sub: "Search & Display",     icon: SearchIcon, tint: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "tiktok", label: "TikTok", sub: "Short-form video",     icon: Music2,     tint: "text-pink-600",   bg: "bg-pink-50"   },
]

const AI_STEPS = [
  "Analyzing your business...",
  "Writing headlines...",
  "Generating ad copy...",
  "Defining your audience...",
  "Finalizing the funnel...",
]

const STEP_ICONS: Record<StepType, string> = {
  squeeze: "📋", sales: "💰", order: "🛒", upsell: "⬆️",
  downsell: "⬇️", thankyou: "🎉", webinar: "📺", bridge: "🌉", optin: "📧",
}

export function LaunchWizard({ open, onOpenChange }: Props) {
  const router = useRouter()
  const { createFunnel, updateFunnel, addElement, createCampaign } = useFunnelStore()

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)

  // Step 1
  const [businessType, setBusinessType] = useState("coaching")
  const [goal, setGoal] = useState<Goal>("leads")

  // Step 2
  const [structure, setStructure] = useState("classic")
  const [themeId, setThemeId] = useState<ThemeId>("dark_pro")

  // Step 3
  const [businessName, setBusinessName] = useState("")
  const [description, setDescription] = useState("")
  const [targetAudience, setTargetAudience] = useState("")

  // Step 4 (AI)
  const [aiStepIdx, setAiStepIdx] = useState(0)
  const [aiResult, setAiResult] = useState<GenerateFunnelResponse | null>(null)

  // Step 5
  const [channel, setChannel] = useState<AdChannel>("meta")
  const [dailyBudget, setDailyBudget] = useState(30)
  const [launching, setLaunching] = useState(false)

  const selectedTheme = THEMES.find((t) => t.id === themeId)!
  const selectedStructure = FUNNEL_STRUCTURES.find((s) => s.id === structure)!

  useEffect(() => {
    if (step !== 4) return
    setAiStepIdx(0)
    const interval = setInterval(() => {
      setAiStepIdx((i) => Math.min(i + 1, AI_STEPS.length - 1))
    }, 700)
    return () => clearInterval(interval)
  }, [step])

  const reset = () => {
    setStep(1)
    setBusinessType("coaching")
    setGoal("leads")
    setStructure("classic")
    setThemeId("dark_pro")
    setBusinessName("")
    setDescription("")
    setTargetAudience("")
    setAiResult(null)
    setAiStepIdx(0)
    setChannel("meta")
    setDailyBudget(30)
    setLaunching(false)
  }

  const handleGenerate = async () => {
    if (!businessName.trim() || !description.trim()) {
      toast.error("Please add your business name and offer")
      return
    }
    setStep(4)

    try {
      const res = await fetch("/api/generate-funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessType, businessName, description, targetAudience, goal }),
      })
      if (!res.ok) throw new Error("API error")
      const data = (await res.json()) as GenerateFunnelResponse
      setAiResult(data)
      setStep(5)
    } catch {
      toast.error("AI generation failed. Check GROQ_API_KEY in .env.local")
      setStep(3)
    }
  }

  const handleLaunch = async () => {
    if (!aiResult) return
    setLaunching(true)

    // Build pages and steps from the selected structure
    const pageIds = selectedStructure.pages.map(() => nanoid())
    const stepIds = selectedStructure.pages.map(() => nanoid())

    const builtPages: FunnelPage[] = selectedStructure.pages.map((p, i) => ({
      id: pageIds[i],
      name: p.name,
      stepType: p.type,
      elements: [],
      settings: {
        backgroundColor: selectedTheme.dark ? selectedTheme.from : "#ffffff",
        maxWidth: "960px",
        fontFamily: "Inter, sans-serif",
      },
    }))

    const builtSteps: FunnelStep[] = selectedStructure.pages.map((p, i) => ({
      id: stepIds[i],
      name: p.name,
      stepType: p.type,
      pageId: pageIds[i],
      position: { x: 100 + i * 300, y: 200 },
      nextStepId: i < stepIds.length - 1 ? stepIds[i + 1] : undefined,
    }))

    // Create funnel then immediately override with the correct structure
    const funnel = createFunnel(`${businessName} — Funnel`)
    updateFunnel(funnel.id, {
      description,
      status: "active",
      tags: [goal, businessType, structure],
      steps: builtSteps,
      pages: builtPages,
    })

    // Add AI-generated hero element to the first page
    const heroEl: PageElement = {
      id: nanoid(),
      type: "hero",
      props: {
        headline: aiResult.headline,
        subheadline: aiResult.subheadline,
        buttonText: aiResult.cta,
        buttonUrl: "#offer",
        backgroundType: "gradient",
        gradientFrom: selectedTheme.from,
        gradientTo: selectedTheme.to,
      },
      style: { padding: "80px 40px", textAlign: "center", color: selectedTheme.text },
    }
    addElement(funnel.id, pageIds[0], heroEl)

    // Add goal-specific element to the first page
    if (goal === "leads" || goal === "webinar") {
      const formEl: PageElement = {
        id: nanoid(),
        type: "form",
        props: {
          headline: "Get Instant Access",
          fields: ["name", "email"],
          buttonText: aiResult.cta,
          privacyText: "No spam. Unsubscribe anytime.",
        },
        style: { padding: "32px", backgroundColor: "#f9fafb", borderRadius: "16px" },
      }
      addElement(funnel.id, pageIds[0], formEl)
    } else if (goal === "sales") {
      const pricingEl: PageElement = {
        id: nanoid(),
        type: "pricing",
        props: {
          name: "Special Offer",
          price: "97",
          originalPrice: "197",
          currency: "$",
          period: "one-time",
          features: ["Full access", "Lifetime updates", "Priority support"],
          ctaText: aiResult.cta,
          popular: true,
        },
        style: { padding: "32px 24px", textAlign: "center" },
      }
      addElement(funnel.id, pageIds[0], pricingEl)
    }

    const interests = targetAudience
      ? targetAudience.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
      : aiResult.audienceKeywords

    createCampaign({
      name: `${businessName} — ${channel}`,
      channel,
      objective: goal === "sales" ? "sales" : goal === "leads" || goal === "webinar" ? "leads" : "traffic",
      status: "draft",
      funnelId: funnel.id,
      dailyBudget,
      startDate: new Date().toISOString(),
      audience: {
        countries: ["US", "CA", "GB"],
        ageMin: 22,
        ageMax: 55,
        genders: ["all"],
        interests,
      },
      creatives: [{
        id: nanoid(),
        name: "AI Variant A",
        headline: aiResult.adHeadline,
        body: aiResult.adBody,
        cta: aiResult.cta,
      }],
      placements: channel === "meta" ? ["feed", "stories", "reels"] : channel === "google" ? ["search"] : ["in_feed"],
      bidding: { strategy: "lowest_cost" },
      utm: { source: channel, medium: "cpc", campaign: goal },
      conversionEvent: goal === "sales" ? "sale" : "optin",
    })

    toast.success("Funnel and campaign are ready!", {
      description: "Your funnel is live — edit pages and activate the campaign when ready.",
    })

    setLaunching(false)
    onOpenChange(false)
    reset()
    router.push(`/funnels/${funnel.id}`)
  }

  const STEP_LABELS = ["Business & Goal", "Structure & Style", "Offer Details", "AI Generating", "Review & Launch"]

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Rocket className="w-4 h-4" />
            </div>
            <DialogTitle className="text-lg">Launch with AI</DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground">{STEP_LABELS[step - 1]} · Step {step} of 5</p>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={cn("h-1 flex-1 rounded-full transition-colors duration-300", step >= n ? "bg-primary" : "bg-muted")} />
          ))}
        </div>

        {/* ── STEP 1: Business type + Goal ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-base">Your business & goal</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Pick a business type and what you want to achieve.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Business type</Label>
              <div className="grid grid-cols-3 gap-2">
                {BUSINESS_TYPES.map((bt) => {
                  const Icon = bt.icon
                  const active = businessType === bt.id
                  return (
                    <button key={bt.id} type="button" onClick={() => setBusinessType(bt.id)}
                      className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all",
                        active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40")}>
                      <div className={`w-9 h-9 rounded-lg ${bt.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${bt.color}`} />
                      </div>
                      <span className="text-xs font-medium leading-tight">{bt.label}</span>
                      {active && <Check className="w-3 h-3 text-primary" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Goal</Label>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((g) => {
                  const Icon = g.icon
                  const active = goal === g.id
                  return (
                    <button key={g.id} type="button" onClick={() => setGoal(g.id)}
                      className={cn("flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                        active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40")}>
                      <div className={`w-8 h-8 rounded-lg ${g.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${g.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold">{g.label}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">{g.description}</p>
                      </div>
                      {active && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-auto" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <Button className="w-full gap-2" onClick={() => setStep(2)}>
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* ── STEP 2: Funnel structure + Page theme ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-base">Funnel structure & style</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Choose how many pages and what your landing page looks like.</p>
            </div>

            {/* Funnel structure */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <LayoutTemplate className="w-3.5 h-3.5" /> Funnel structure
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {FUNNEL_STRUCTURES.map((s) => {
                  const active = structure === s.id
                  return (
                    <button key={s.id} type="button" onClick={() => setStructure(s.id)}
                      className={cn("p-3 rounded-xl border-2 text-left transition-all",
                        active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40")}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold">{s.label}</p>
                        {active && <Check className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-2">{s.description}</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {s.pages.map((p, i) => (
                          <div key={i} className="flex items-center gap-0.5">
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                              <span>{STEP_ICONS[p.type]}</span> {p.name}
                            </span>
                            {i < s.pages.length - 1 && <span className="text-[10px] text-muted-foreground">→</span>}
                          </div>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Page theme */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Page theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map((t) => {
                  const active = themeId === t.id
                  return (
                    <button key={t.id} type="button" onClick={() => setThemeId(t.id)}
                      className={cn("rounded-xl border-2 overflow-hidden transition-all",
                        active ? "border-primary shadow-md" : "border-border hover:border-primary/40")}>
                      {/* Mini preview */}
                      <div className="h-14 flex flex-col items-center justify-center px-2"
                        style={{ background: `linear-gradient(135deg, ${t.from} 0%, ${t.to} 100%)` }}>
                        <div className="w-12 h-1.5 rounded-full mb-1.5" style={{ backgroundColor: t.text, opacity: 0.9 }} />
                        <div className="w-8 h-1 rounded-full" style={{ backgroundColor: t.textMuted }} />
                      </div>
                      <div className="px-2 py-1.5 flex items-center justify-between bg-background">
                        <span className="text-[10px] font-medium">{t.label}</span>
                        {active && <Check className="w-3 h-3 text-primary" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Button>
              <Button className="flex-1 gap-2" onClick={() => setStep(3)}>
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Offer details ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-base">Tell us about your offer</h3>
              <p className="text-xs text-muted-foreground mt-0.5">AI will write all the copy — just give it the basics.</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Business or brand name</Label>
                <Input
                  placeholder="e.g. FitLife Pro"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-10"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">What do you offer?</Label>
                <Textarea
                  placeholder={
                    goal === "sales"   ? "e.g. 8-week online fitness program with meal plans" :
                    goal === "webinar" ? "e.g. Free live training: How to grow to 10k followers in 30 days" :
                    goal === "leads"   ? "e.g. Free eBook: 7 steps to launching your first funnel" :
                                        "e.g. The fastest way to build a marketing funnel — no code needed"
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="text-sm resize-none"
                />
                <p className="text-[11px] text-muted-foreground">One sentence is enough.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  Target audience
                  <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                </Label>
                <Input
                  placeholder="e.g. busy moms, online coaches, gym owners"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="h-10 text-sm"
                />
                <p className="text-[11px] text-muted-foreground">Comma-separated. Used for ad targeting.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Button>
              <Button
                className="flex-1 gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                onClick={handleGenerate}
                disabled={!businessName.trim() || !description.trim()}
              >
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 4: AI loading ── */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-12 gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-base">AI is working...</p>
              <p className="text-sm text-muted-foreground min-h-[20px]">{AI_STEPS[aiStepIdx]}</p>
            </div>
            <div className="flex gap-1.5">
              {AI_STEPS.map((_, i) => (
                <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-colors", i <= aiStepIdx ? "bg-primary" : "bg-muted")} />
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 5: Review & Launch ── */}
        {step === 5 && aiResult && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-base flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                AI built your funnel
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Pick a platform, set your budget, and launch.</p>
            </div>

            {/* Funnel structure summary */}
            <div className="rounded-lg bg-muted/40 border border-border/50 px-3 py-2.5 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mr-1">Funnel:</span>
              {selectedStructure.pages.map((p, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-[11px] bg-background border border-border/60 px-1.5 py-0.5 rounded font-medium">
                    {STEP_ICONS[p.type]} {p.name}
                  </span>
                  {i < selectedStructure.pages.length - 1 && <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />}
                </div>
              ))}
            </div>

            {/* Landing page preview with selected theme */}
            <div className="rounded-xl overflow-hidden border border-border/60">
              <div className="px-6 py-7 text-center"
                style={{ background: `linear-gradient(135deg, ${selectedTheme.from} 0%, ${selectedTheme.to} 100%)` }}>
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: selectedTheme.textMuted }}>Landing page</p>
                <h2 className="text-lg font-extrabold leading-tight" style={{ color: selectedTheme.text }}>
                  {aiResult.headline}
                </h2>
                <p className="text-xs mt-2 max-w-xs mx-auto" style={{ color: selectedTheme.textMuted }}>
                  {aiResult.subheadline}
                </p>
                <div className="mt-4 inline-block px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold">
                  {aiResult.cta}
                </div>
              </div>
              <div className="px-4 py-3 bg-muted/30 border-t border-border/40">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Ad copy</p>
                <p className="text-xs font-semibold">{aiResult.adHeadline}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{aiResult.adBody}</p>
              </div>
            </div>

            {/* Channel */}
            <div className="space-y-2">
              <Label className="text-sm">Ad platform</Label>
              <div className="grid grid-cols-3 gap-2">
                {CHANNELS.map((c) => {
                  const Icon = c.icon
                  const active = channel === c.id
                  return (
                    <button key={c.id} type="button" onClick={() => setChannel(c.id)}
                      className={cn("p-3 rounded-xl border-2 text-center transition-all",
                        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
                      <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center mx-auto mb-1`}>
                        <Icon className={`w-4 h-4 ${c.tint}`} />
                      </div>
                      <p className="text-xs font-semibold">{c.label}</p>
                      <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{c.sub}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Daily budget</Label>
                <span className="text-xl font-black tabular-nums">${dailyBudget}<span className="text-xs font-normal text-muted-foreground"> /day</span></span>
              </div>
              <input type="range" min={5} max={200} step={5} value={dailyBudget}
                onChange={(e) => setDailyBudget(Number(e.target.value))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>$5</span><span>$50</span><span>$100</span><span>$200</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={() => setStep(3)} className="gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Button>
              <Button
                className="flex-1 gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                onClick={handleLaunch}
                disabled={launching}
              >
                <Rocket className="w-4 h-4" />
                {launching ? "Creating..." : "Launch my ad"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
