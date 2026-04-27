"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Star, Zap, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const TEMPLATES = [
  {
    id: "t1",
    name: "Lead Magnet Funnel",
    category: "lead_gen",
    description: "Capture leads with a free eBook, checklist, or video course",
    steps: ["Squeeze Page", "Thank You + Upsell"],
    tags: ["lead gen", "ebook", "free offer"],
    popular: true,
    conversionRate: "35-45%",
    gradient: "from-blue-500 to-indigo-600",
    emoji: "📧",
  },
  {
    id: "t2",
    name: "Product Launch Funnel",
    category: "sales",
    description: "Full launch sequence with order form and OTO upsell",
    steps: ["Sales Page", "Order Form", "Upsell", "Thank You"],
    tags: ["product", "launch", "upsell"],
    popular: true,
    conversionRate: "2-5%",
    gradient: "from-purple-500 to-pink-600",
    emoji: "🚀",
  },
  {
    id: "t3",
    name: "Webinar Registration",
    category: "webinar",
    description: "Register attendees for live or recorded webinar training",
    steps: ["Registration Page", "Confirmation"],
    tags: ["webinar", "live training"],
    popular: true,
    conversionRate: "20-35%",
    gradient: "from-violet-500 to-purple-600",
    emoji: "📺",
  },
  {
    id: "t4",
    name: "VSL Sales Funnel",
    category: "sales",
    description: "Video Sales Letter with order form for high-ticket offers",
    steps: ["VSL Page", "Order Form", "Thank You"],
    tags: ["vsl", "video", "high ticket"],
    popular: false,
    conversionRate: "3-8%",
    gradient: "from-red-500 to-orange-600",
    emoji: "🎬",
  },
  {
    id: "t5",
    name: "Free Trial Funnel",
    category: "service",
    description: "SaaS free trial signup with onboarding sequence",
    steps: ["Landing Page", "Sign Up", "Welcome"],
    tags: ["saas", "trial", "software"],
    popular: false,
    conversionRate: "15-25%",
    gradient: "from-cyan-500 to-blue-600",
    emoji: "⚡",
  },
  {
    id: "t6",
    name: "Book Funnel",
    category: "lead_gen",
    description: "Free + shipping book funnel with backend upsells",
    steps: ["Book Offer", "Order Form", "Upsell 1", "Upsell 2", "Thank You"],
    tags: ["book", "free + shipping", "upsell"],
    popular: false,
    conversionRate: "4-8%",
    gradient: "from-amber-500 to-yellow-600",
    emoji: "📚",
  },
  {
    id: "t7",
    name: "Coaching Application",
    category: "service",
    description: "Qualify leads for high-ticket coaching or consulting",
    steps: ["Application Page", "Thank You + Book Call"],
    tags: ["coaching", "consulting", "high ticket"],
    popular: true,
    conversionRate: "10-20%",
    gradient: "from-emerald-500 to-teal-600",
    emoji: "🎯",
  },
  {
    id: "t8",
    name: "Membership Funnel",
    category: "membership",
    description: "Sell access to a recurring membership or community",
    steps: ["Sales Page", "Order Form", "Welcome"],
    tags: ["membership", "recurring", "community"],
    popular: false,
    conversionRate: "2-6%",
    gradient: "from-pink-500 to-rose-600",
    emoji: "👥",
  },
  {
    id: "t9",
    name: "Event Funnel",
    category: "event",
    description: "Sell tickets or registrations for live events",
    steps: ["Event Page", "Registration", "Confirmation"],
    tags: ["event", "tickets", "live"],
    popular: false,
    conversionRate: "15-30%",
    gradient: "from-orange-500 to-red-600",
    emoji: "🎪",
  },
  {
    id: "t10",
    name: "Challenge Funnel",
    category: "lead_gen",
    description: "5-day or 30-day challenge to build engagement",
    steps: ["Challenge Page", "Sign Up", "Day 1 Content", "Upgrade Offer"],
    tags: ["challenge", "engagement", "community"],
    popular: true,
    conversionRate: "25-40%",
    gradient: "from-indigo-500 to-blue-600",
    emoji: "🏆",
  },
  {
    id: "t11",
    name: "Affiliate Bridge Page",
    category: "sales",
    description: "Pre-sell visitors before sending to affiliate offer",
    steps: ["Bridge Page", "External Offer"],
    tags: ["affiliate", "bridge", "presell"],
    popular: false,
    conversionRate: "20-40%",
    gradient: "from-teal-500 to-cyan-600",
    emoji: "🌉",
  },
  {
    id: "t12",
    name: "Tripwire Funnel",
    category: "sales",
    description: "$7-27 entry offer to build a buyers list",
    steps: ["Offer Page", "Order Form", "OTO", "Thank You"],
    tags: ["tripwire", "low ticket", "buyers list"],
    popular: false,
    conversionRate: "5-12%",
    gradient: "from-yellow-500 to-amber-600",
    emoji: "💡",
  },
]

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "lead_gen", label: "Lead Gen" },
  { id: "sales", label: "Sales" },
  { id: "webinar", label: "Webinar" },
  { id: "service", label: "Service" },
  { id: "membership", label: "Membership" },
  { id: "event", label: "Event" },
]

export function TemplatesGallery() {
  const router = useRouter()
  const { createFunnel } = useFunnelStore()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filtered = TEMPLATES.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.tags.some((tag) => tag.includes(search.toLowerCase()))
    const matchCategory = category === "all" || t.category === category
    return matchSearch && matchCategory
  })

  const handleUseTemplate = (template: typeof TEMPLATES[0]) => {
    setLoadingId(template.id)
    const funnel = createFunnel(`${template.name} (from template)`, template.id)
    toast.success("Funnel created from template!")
    router.push(`/funnels/${funnel.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Choose a Template</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Start with a proven funnel structure. All templates are fully customizable.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                  category === cat.id
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((template) => (
          <div
            key={template.id}
            className="group bg-card rounded-2xl border border-border/60 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
          >
            {/* Preview header */}
            <div className={`h-28 bg-gradient-to-br ${template.gradient} flex items-center justify-center relative`}>
              <span className="text-5xl">{template.emoji}</span>
              {template.popular && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 rounded-full px-2 py-0.5 text-xs font-semibold text-amber-600">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Popular
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                {template.steps.map((step, i) => (
                  <div key={i} className="h-4 bg-white/20 rounded text-[8px] px-1.5 text-white flex items-center">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm text-foreground">{template.name}</h3>
                <span className="text-xs text-emerald-600 font-medium shrink-0">{template.conversionRate}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{template.description}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {template.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] py-0 h-4">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button
                size="sm"
                className="w-full h-8 gap-1.5 group-hover:gap-2 transition-all"
                onClick={() => handleUseTemplate(template)}
                disabled={loadingId === template.id}
              >
                {loadingId === template.id ? (
                  <><Zap className="w-3.5 h-3.5 animate-pulse" /> Creating...</>
                ) : (
                  <><span>Use Template</span> <ArrowRight className="w-3 h-3" /></>
                )}
              </Button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <p>No templates found for &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  )
}
