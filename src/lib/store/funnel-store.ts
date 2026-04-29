import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import type {
  Funnel,
  FunnelStep,
  FunnelPage,
  PageElement,
  StepType,
  StepVariant,
  FunnelStats,
  AnalyticsEvent,
  AdCampaign,
  AdStatus,
  AdCampaignStats,
  AdCreative,
  Contact,
  CustomDomain,
  UserProfile,
  TelemetrySettings,
} from "@/lib/types"

const MAX_EVENTS = 1000

const defaultPage = (stepType: StepType): FunnelPage => ({
  id: nanoid(),
  name: stepType === "optin" ? "Opt-in Page" : stepType === "sales" ? "Sales Page" : "Thank You Page",
  stepType,
  elements: [],
  settings: {
    backgroundColor: "#ffffff",
    maxWidth: "960px",
    fontFamily: "Inter, sans-serif",
  },
})

const defaultStep = (name: string, stepType: StepType, position: { x: number; y: number }, pageId: string): FunnelStep => ({
  id: nanoid(),
  name,
  stepType,
  pageId,
  position,
})

function createDefaultFunnel(name: string): Funnel {
  const page1 = defaultPage("optin")
  const page2 = defaultPage("thankyou")
  const step1 = defaultStep("Opt-in Page", "optin", { x: 100, y: 200 }, page1.id)
  const step2 = defaultStep("Thank You", "thankyou", { x: 400, y: 200 }, page2.id)
  step1.nextStepId = step2.id

  return {
    id: nanoid(),
    name,
    description: "",
    status: "draft",
    steps: [step1, step2],
    pages: [page1, page2],
    stats: { visitors: 0, optins: 0, sales: 0, revenue: 0, conversionRate: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
  }
}

const DEMO_FUNNELS: Funnel[] = [
  {
    id: "demo-1",
    name: "Lead Magnet Funnel",
    description: "Capture leads with a free eBook offer",
    status: "active",
    steps: [
      { id: "s1", name: "Squeeze Page", stepType: "squeeze", pageId: "p1", position: { x: 100, y: 200 }, nextStepId: "s2" },
      { id: "s2", name: "Thank You", stepType: "thankyou", pageId: "p2", position: { x: 400, y: 200 } },
    ],
    pages: [
      { id: "p1", name: "Squeeze Page", stepType: "squeeze", elements: [], settings: { backgroundColor: "#ffffff", maxWidth: "960px", fontFamily: "Inter" } },
      { id: "p2", name: "Thank You", stepType: "thankyou", elements: [], settings: { backgroundColor: "#ffffff", maxWidth: "960px", fontFamily: "Inter" } },
    ],
    stats: { visitors: 0, optins: 0, sales: 0, revenue: 0, conversionRate: 0 },
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-04-20T14:30:00Z",
    tags: ["lead-gen", "ebook"],
  },
  {
    id: "demo-2",
    name: "Product Launch Funnel",
    description: "Full launch sequence with upsell",
    status: "active",
    steps: [
      { id: "s3", name: "Sales Page", stepType: "sales", pageId: "p3", position: { x: 100, y: 200 }, nextStepId: "s4" },
      { id: "s4", name: "Order Form", stepType: "order", pageId: "p4", position: { x: 400, y: 200 }, nextStepId: "s5", upsellStepId: "s6" },
      { id: "s5", name: "Thank You", stepType: "thankyou", pageId: "p5", position: { x: 700, y: 200 } },
      { id: "s6", name: "Upsell", stepType: "upsell", pageId: "p6", position: { x: 400, y: 400 }, nextStepId: "s5" },
    ],
    pages: [
      { id: "p3", name: "Sales Page", stepType: "sales", elements: [], settings: { backgroundColor: "#0f0f0f", maxWidth: "960px", fontFamily: "Inter" } },
      { id: "p4", name: "Order Form", stepType: "order", elements: [], settings: { backgroundColor: "#ffffff", maxWidth: "960px", fontFamily: "Inter" } },
      { id: "p5", name: "Thank You", stepType: "thankyou", elements: [], settings: { backgroundColor: "#ffffff", maxWidth: "960px", fontFamily: "Inter" } },
      { id: "p6", name: "Upsell", stepType: "upsell", elements: [], settings: { backgroundColor: "#ffffff", maxWidth: "960px", fontFamily: "Inter" } },
    ],
    stats: { visitors: 0, optins: 0, sales: 0, revenue: 0, conversionRate: 0 },
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-04-25T09:00:00Z",
    tags: ["product", "launch", "upsell"],
  },
  {
    id: "demo-3",
    name: "Webinar Registration",
    description: "Register attendees for live training",
    status: "draft",
    steps: [
      { id: "s7", name: "Registration", stepType: "webinar", pageId: "p7", position: { x: 100, y: 200 }, nextStepId: "s8" },
      { id: "s8", name: "Confirmation", stepType: "thankyou", pageId: "p8", position: { x: 400, y: 200 } },
    ],
    pages: [
      { id: "p7", name: "Registration", stepType: "webinar", elements: [], settings: { backgroundColor: "#1a1a2e", maxWidth: "960px", fontFamily: "Inter" } },
      { id: "p8", name: "Confirmation", stepType: "thankyou", elements: [], settings: { backgroundColor: "#ffffff", maxWidth: "960px", fontFamily: "Inter" } },
    ],
    stats: { visitors: 0, optins: 0, sales: 0, revenue: 0, conversionRate: 0 },
    createdAt: "2026-04-10T10:00:00Z",
    updatedAt: "2026-04-27T08:00:00Z",
    tags: ["webinar", "live"],
  },
]

export interface DashboardSnapshot {
  capturedAt: string
  visitors: number
  optins: number
  sales: number
  revenue: number
}

interface FunnelStore {
  funnels: Funnel[]
  activeFunnelId: string | null
  activePageId: string | null
  dashboardSnapshot: DashboardSnapshot | null
  events: AnalyticsEvent[]
  campaigns: AdCampaign[]
  contacts: Contact[]
  customDomains: CustomDomain[]
  profile: UserProfile
  telemetry: TelemetrySettings
  _hasHydrated: boolean
  setHasHydrated: (v: boolean) => void

  createFunnel: (name: string, templateId?: string) => Funnel
  updateFunnel: (id: string, data: Partial<Funnel>) => void
  deleteFunnel: (id: string) => void
  duplicateFunnel: (id: string) => void
  setActiveFunnel: (id: string | null) => void
  setActivePage: (id: string | null) => void

  addStep: (funnelId: string, stepType: StepType, name: string) => void
  updateStep: (funnelId: string, stepId: string, data: Partial<FunnelStep>) => void
  deleteStep: (funnelId: string, stepId: string) => void
  connectSteps: (funnelId: string, fromId: string, toId: string, type?: "next" | "upsell" | "downsell") => void

  updatePage: (funnelId: string, pageId: string, data: Partial<FunnelPage>) => void
  addElement: (funnelId: string, pageId: string, element: PageElement) => void
  updateElement: (funnelId: string, pageId: string, elementId: string, data: Partial<PageElement>) => void
  deleteElement: (funnelId: string, pageId: string, elementId: string) => void
  reorderElements: (funnelId: string, pageId: string, elements: PageElement[]) => void

  recordVisit: (funnelId: string) => void
  recordOptin: (funnelId: string) => void
  recordSale: (funnelId: string, amount?: number) => void
  refreshDashboardSnapshot: (maxAgeDays?: number) => void

  createCampaign: (data: Omit<AdCampaign, "id" | "createdAt" | "updatedAt" | "stats">) => AdCampaign
  updateCampaign: (id: string, data: Partial<AdCampaign>) => void
  deleteCampaign: (id: string) => void
  setCampaignStatus: (id: string, status: AdStatus) => void
  recordCampaignBurst: (id: string, burst: { spend: number; impressions: number; clicks: number; optins: number; sales: number; revenue: number; creativeId?: string }) => void

  addContact: (data: Omit<Contact, "id" | "createdAt">) => void
  removeContact: (id: string) => void
  addDomain: (domain: string) => void
  removeDomain: (id: string) => void
  updateProfile: (data: Partial<UserProfile>) => void
  updateTelemetry: (data: Partial<TelemetrySettings>) => void

  enableSplitTest: (funnelId: string, stepId: string) => void
  disableSplitTest: (funnelId: string, stepId: string) => void
  addVariant: (funnelId: string, stepId: string) => string | null
  removeVariant: (funnelId: string, stepId: string, variantId: string) => void
  updateVariant: (funnelId: string, stepId: string, variantId: string, data: Partial<Pick<StepVariant, "name" | "weight">>) => void
  rebalanceVariantWeights: (funnelId: string, stepId: string) => void
  recordVariantVisit: (funnelId: string, stepId: string, variantId: string) => void
  recordVariantConversion: (funnelId: string, stepId: string, variantId: string, type: "optin" | "sale", amount?: number) => void
}

function emptyStats(): FunnelStats {
  return { visitors: 0, optins: 0, sales: 0, revenue: 0, conversionRate: 0 }
}

function emptyCampaignStats(): AdCampaignStats {
  return { spend: 0, impressions: 0, clicks: 0, optins: 0, sales: 0, revenue: 0 }
}

const DEMO_CAMPAIGNS: AdCampaign[] = [
  {
    id: "camp-1",
    name: "Lead Magnet — Cold Traffic (Meta)",
    channel: "meta",
    objective: "leads",
    status: "active",
    funnelId: "demo-1",
    dailyBudget: 50,
    startDate: "2026-04-15T00:00:00Z",
    audience: {
      countries: ["US", "CA", "UK"],
      ageMin: 28,
      ageMax: 55,
      genders: ["all"],
      interests: ["Online business", "Digital marketing", "Entrepreneurship"],
      lookalikePct: 2,
    },
    creatives: [
      {
        id: "cr-1a",
        name: "Variant A — Hook on revenue",
        headline: "Free eBook: 7 Funnel Hacks That 10x'd Our Revenue",
        body: "Steal the exact playbook our top clients use. Free download — no email gatekeeping nonsense.",
        cta: "Download Free",
        imageUrl: "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=800",
        stats: { spend: 250, impressions: 22_400, clicks: 720, optins: 118, sales: 0, revenue: 0 },
      },
      {
        id: "cr-1b",
        name: "Variant B — Curiosity hook",
        headline: "Why 92% of Funnels Leak Revenue (Fix Inside)",
        body: "After auditing 500+ funnels, we mapped the 7 places revenue silently disappears. Get the 18-page diagnostic.",
        cta: "Get the Free Audit",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
        stats: { spend: 162.5, impressions: 15_800, clicks: 460, optins: 66, sales: 0, revenue: 0 },
      },
    ],
    placements: ["feed", "stories", "reels"],
    bidding: { strategy: "lowest_cost" },
    utm: { source: "facebook", medium: "cpc", campaign: "lead_magnet_cold" },
    conversionEvent: "optin",
    stats: { spend: 412.5, impressions: 38_200, clicks: 1_180, optins: 184, sales: 0, revenue: 0 },
    createdAt: "2026-04-15T10:00:00Z",
    updatedAt: "2026-04-26T14:30:00Z",
    notes: "Cold audience test — Variant A leading on CPL",
  },
  {
    id: "camp-2",
    name: "Course Launch — Retargeting (Meta)",
    channel: "meta",
    objective: "sales",
    status: "active",
    funnelId: "demo-2",
    dailyBudget: 120,
    startDate: "2026-04-10T00:00:00Z",
    audience: {
      countries: ["US"],
      ageMin: 25,
      ageMax: 60,
      genders: ["all"],
      interests: ["Personal development"],
      customAudiences: ["Site visitors 30d", "Cart abandoners 14d"],
    },
    creatives: [
      {
        id: "cr-2a",
        name: "Urgency — closing soon",
        headline: "You're $97 away from your best year yet.",
        body: "Lock in your seat at the lowest price we'll ever offer. Doors close Friday.",
        cta: "Enroll Now",
        imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
        stats: { spend: 1_840, impressions: 91_500, clicks: 3_870, optins: 0, sales: 312, revenue: 30_264 },
      },
    ],
    placements: ["feed", "marketplace"],
    bidding: { strategy: "cost_cap", cap: 25 },
    utm: { source: "facebook", medium: "cpc", campaign: "launch_retarget", content: "urgency_v1" },
    conversionEvent: "sale",
    stats: { spend: 1_840, impressions: 91_500, clicks: 3_870, optins: 0, sales: 312, revenue: 30_264 },
    createdAt: "2026-04-10T10:00:00Z",
    updatedAt: "2026-04-27T09:00:00Z",
    notes: "Retargeting — scaling phase",
  },
  {
    id: "camp-3",
    name: "Brand Search (Google)",
    channel: "google",
    objective: "traffic",
    status: "paused",
    funnelId: "demo-2",
    dailyBudget: 30,
    startDate: "2026-03-20T00:00:00Z",
    audience: {
      countries: ["US", "CA"],
      ageMin: 18,
      ageMax: 65,
      genders: ["all"],
      interests: ["funnelpro", "marketing software"],
    },
    creatives: [
      {
        id: "cr-3a",
        headline: "FunnelPro — Build Funnels That Convert",
        body: "Drag-drop builder · A/B testing · Real analytics. Try free for 14 days.",
        cta: "Start Free Trial",
        stats: { spend: 187, impressions: 12_400, clicks: 920, optins: 0, sales: 18, revenue: 1_746 },
      },
    ],
    placements: ["search"],
    bidding: { strategy: "manual_cpc", cap: 2.5 },
    utm: { source: "google", medium: "cpc", campaign: "brand_search" },
    conversionEvent: "sale",
    stats: { spend: 187, impressions: 12_400, clicks: 920, optins: 0, sales: 18, revenue: 1_746 },
    createdAt: "2026-03-20T10:00:00Z",
    updatedAt: "2026-04-22T11:00:00Z",
    notes: "Paused for budget reallocation",
  },
]

function recomputeConversion(stats: { visitors: number; optins: number; sales: number; revenue: number; conversionRate: number }) {
  if (stats.visitors <= 0) return { ...stats, conversionRate: 0 }
  const conversions = stats.optins + stats.sales
  const rate = (conversions / stats.visitors) * 100
  return { ...stats, conversionRate: Math.round(rate * 10) / 10 }
}

function appendEvent(events: AnalyticsEvent[], data: Omit<AnalyticsEvent, "id" | "timestamp">): AnalyticsEvent[] {
  const next: AnalyticsEvent = {
    id: nanoid(),
    timestamp: new Date().toISOString(),
    ...data,
  }
  const combined = [next, ...events]
  return combined.length > MAX_EVENTS ? combined.slice(0, MAX_EVENTS) : combined
}

function clonePage(source: FunnelPage, name: string): FunnelPage {
  return {
    id: nanoid(),
    name,
    stepType: source.stepType,
    elements: source.elements.map((el) => ({
      ...el,
      id: nanoid(),
      props: { ...el.props },
      style: { ...el.style },
    })),
    settings: { ...source.settings },
  }
}

export const useFunnelStore = create<FunnelStore>()(
  persist(
    (set, get) => ({
      funnels: DEMO_FUNNELS,
      activeFunnelId: null,
      activePageId: null,
      dashboardSnapshot: null,
      events: [],
      campaigns: DEMO_CAMPAIGNS,
      contacts: [],
      customDomains: [],
      profile: { firstName: "Pavel", lastName: "D.", email: "pavlovdevelop@gmail.com" },
      telemetry: { enabled: false, instanceId: nanoid(), lastSentAt: null },
      _hasHydrated: false,
      setHasHydrated: (v: boolean) => set({ _hasHydrated: v }),

      createFunnel: (name, templateId) => {
        const funnel = createDefaultFunnel(name)
        if (templateId) funnel.templateId = templateId
        set((s) => ({ funnels: [funnel, ...s.funnels] }))
        return funnel
      },

      updateFunnel: (id, data) =>
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === id ? { ...f, ...data, updatedAt: new Date().toISOString() } : f
          ),
        })),

      deleteFunnel: (id) =>
        set((s) => ({ funnels: s.funnels.filter((f) => f.id !== id) })),

      duplicateFunnel: (id) => {
        const original = get().funnels.find((f) => f.id === id)
        if (!original) return
        const copy: Funnel = {
          ...original,
          id: nanoid(),
          name: `${original.name} (Copy)`,
          status: "draft",
          stats: { visitors: 0, optins: 0, sales: 0, revenue: 0, conversionRate: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((s) => ({ funnels: [copy, ...s.funnels] }))
      },

      setActiveFunnel: (id) => set({ activeFunnelId: id }),
      setActivePage: (id) => set({ activePageId: id }),

      addStep: (funnelId, stepType, name) => {
        const page = defaultPage(stepType)
        const step = defaultStep(name, stepType, { x: 100 + Math.random() * 400, y: 100 + Math.random() * 300 }, page.id)
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? { ...f, steps: [...f.steps, step], pages: [...f.pages, page], updatedAt: new Date().toISOString() }
              : f
          ),
        }))
      },

      updateStep: (funnelId, stepId, data) =>
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? { ...f, steps: f.steps.map((st) => (st.id === stepId ? { ...st, ...data } : st)), updatedAt: new Date().toISOString() }
              : f
          ),
        })),

      deleteStep: (funnelId, stepId) =>
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? {
                  ...f,
                  steps: f.steps.filter((st) => st.id !== stepId),
                  pages: f.pages.filter((p) => {
                    const step = f.steps.find((st) => st.id === stepId)
                    return step ? p.id !== step.pageId : true
                  }),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        })),

      connectSteps: (funnelId, fromId, toId, type = "next") =>
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? {
                  ...f,
                  steps: f.steps.map((st) => {
                    if (st.id !== fromId) return st
                    if (type === "upsell") return { ...st, upsellStepId: toId }
                    if (type === "downsell") return { ...st, downsellStepId: toId }
                    return { ...st, nextStepId: toId }
                  }),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        })),

      updatePage: (funnelId, pageId, data) =>
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? { ...f, pages: f.pages.map((p) => (p.id === pageId ? { ...p, ...data } : p)), updatedAt: new Date().toISOString() }
              : f
          ),
        })),

      addElement: (funnelId, pageId, element) =>
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? {
                  ...f,
                  pages: f.pages.map((p) =>
                    p.id === pageId ? { ...p, elements: [...p.elements, element] } : p
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        })),

      updateElement: (funnelId, pageId, elementId, data) =>
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? {
                  ...f,
                  pages: f.pages.map((p) =>
                    p.id === pageId
                      ? { ...p, elements: p.elements.map((el) => (el.id === elementId ? { ...el, ...data } : el)) }
                      : p
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        })),

      deleteElement: (funnelId, pageId, elementId) =>
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? {
                  ...f,
                  pages: f.pages.map((p) =>
                    p.id === pageId ? { ...p, elements: p.elements.filter((el) => el.id !== elementId) } : p
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        })),

      reorderElements: (funnelId, pageId, elements) =>
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? { ...f, pages: f.pages.map((p) => (p.id === pageId ? { ...p, elements } : p)), updatedAt: new Date().toISOString() }
              : f
          ),
        })),

      recordVisit: (funnelId) =>
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? { ...f, stats: recomputeConversion({ ...f.stats, visitors: f.stats.visitors + 1 }) }
              : f
          ),
          events: appendEvent(s.events, { type: "visit", funnelId }),
        })),

      recordOptin: (funnelId) =>
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? { ...f, stats: recomputeConversion({ ...f.stats, optins: f.stats.optins + 1 }) }
              : f
          ),
          events: appendEvent(s.events, { type: "optin", funnelId }),
        })),

      recordSale: (funnelId, amount = 0) =>
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? {
                  ...f,
                  stats: recomputeConversion({
                    ...f.stats,
                    sales: f.stats.sales + 1,
                    revenue: f.stats.revenue + amount,
                  }),
                }
              : f
          ),
          events: appendEvent(s.events, { type: "sale", funnelId, amount }),
        })),

      refreshDashboardSnapshot: (maxAgeDays = 7) => {
        const { funnels, dashboardSnapshot } = get()
        const now = Date.now()
        const ageMs = dashboardSnapshot ? now - new Date(dashboardSnapshot.capturedAt).getTime() : Infinity
        if (dashboardSnapshot && ageMs < maxAgeDays * 24 * 60 * 60 * 1000) return

        const totals = funnels.reduce(
          (acc, f) => ({
            visitors: acc.visitors + f.stats.visitors,
            optins: acc.optins + f.stats.optins,
            sales: acc.sales + f.stats.sales,
            revenue: acc.revenue + f.stats.revenue,
          }),
          { visitors: 0, optins: 0, sales: 0, revenue: 0 }
        )
        set({ dashboardSnapshot: { capturedAt: new Date().toISOString(), ...totals } })
      },

      createCampaign: (data) => {
        const now = new Date().toISOString()
        const campaign: AdCampaign = {
          ...data,
          id: nanoid(),
          stats: emptyCampaignStats(),
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ campaigns: [campaign, ...s.campaigns] }))
        return campaign
      },

      updateCampaign: (id, data) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
          ),
        })),

      deleteCampaign: (id) =>
        set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) })),

      setCampaignStatus: (id, status) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c
          ),
        })),

      recordCampaignBurst: (id, burst) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === id
              ? {
                  ...c,
                  stats: {
                    spend: c.stats.spend + burst.spend,
                    impressions: c.stats.impressions + burst.impressions,
                    clicks: c.stats.clicks + burst.clicks,
                    optins: c.stats.optins + burst.optins,
                    sales: c.stats.sales + burst.sales,
                    revenue: c.stats.revenue + burst.revenue,
                  },
                  creatives: c.creatives.map((cr) =>
                    burst.creativeId && cr.id === burst.creativeId
                      ? {
                          ...cr,
                          stats: {
                            spend: (cr.stats?.spend ?? 0) + burst.spend,
                            impressions: (cr.stats?.impressions ?? 0) + burst.impressions,
                            clicks: (cr.stats?.clicks ?? 0) + burst.clicks,
                            optins: (cr.stats?.optins ?? 0) + burst.optins,
                            sales: (cr.stats?.sales ?? 0) + burst.sales,
                            revenue: (cr.stats?.revenue ?? 0) + burst.revenue,
                          },
                        }
                      : cr
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        })),

      addContact: (data) => {
        const contact: Contact = { ...data, id: nanoid(), createdAt: new Date().toISOString() }
        set((s) => ({ contacts: [contact, ...s.contacts] }))
      },

      removeContact: (id) => set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),

      addDomain: (domain) => {
        const d: CustomDomain = { id: nanoid(), domain, verified: false, funnelIds: [], addedAt: new Date().toISOString() }
        set((s) => ({ customDomains: [d, ...s.customDomains] }))
      },

      removeDomain: (id) => set((s) => ({ customDomains: s.customDomains.filter((d) => d.id !== id) })),

      updateProfile: (data) => set((s) => ({ profile: { ...s.profile, ...data } })),

      updateTelemetry: (data) => set((s) => ({ telemetry: { ...s.telemetry, ...data } })),

      enableSplitTest: (funnelId, stepId) => {
        const funnel = get().funnels.find((f) => f.id === funnelId)
        const step = funnel?.steps.find((s) => s.id === stepId)
        if (!funnel || !step || step.variants) return
        const originalPage = funnel.pages.find((p) => p.id === step.pageId)
        if (!originalPage) return
        const variantB = clonePage(originalPage, `${originalPage.name} – Variant B`)
        const variants: StepVariant[] = [
          { id: nanoid(), name: "Variant A (Original)", pageId: step.pageId, weight: 50, stats: emptyStats() },
          { id: nanoid(), name: "Variant B", pageId: variantB.id, weight: 50, stats: emptyStats() },
        ]
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? {
                  ...f,
                  pages: [...f.pages, variantB],
                  steps: f.steps.map((st) => (st.id === stepId ? { ...st, variants } : st)),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        }))
      },

      disableSplitTest: (funnelId, stepId) => {
        set((s) => ({
          funnels: s.funnels.map((f) => {
            if (f.id !== funnelId) return f
            const step = f.steps.find((st) => st.id === stepId)
            if (!step?.variants) return f
            const keepPageIds = new Set([step.pageId])
            const remainingVariantPages = step.variants.map((v) => v.pageId).filter((pid) => pid !== step.pageId)
            return {
              ...f,
              pages: f.pages.filter((p) => !remainingVariantPages.includes(p.id) || keepPageIds.has(p.id)),
              steps: f.steps.map((st) => (st.id === stepId ? { ...st, variants: undefined } : st)),
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
      },

      addVariant: (funnelId, stepId) => {
        const funnel = get().funnels.find((f) => f.id === funnelId)
        const step = funnel?.steps.find((s) => s.id === stepId)
        if (!funnel || !step) return null
        const variants = step.variants ?? [
          { id: nanoid(), name: "Variant A (Original)", pageId: step.pageId, weight: 100, stats: emptyStats() },
        ]
        const sourceVariantPage = funnel.pages.find((p) => p.id === variants[0].pageId)
        if (!sourceVariantPage) return null
        const nextLetter = String.fromCharCode("A".charCodeAt(0) + variants.length)
        const newPage = clonePage(sourceVariantPage, `${sourceVariantPage.name} – Variant ${nextLetter}`)
        const newVariant: StepVariant = {
          id: nanoid(),
          name: `Variant ${nextLetter}`,
          pageId: newPage.id,
          weight: 0,
          stats: emptyStats(),
        }
        const updated = [...variants, newVariant]
        const evenWeight = Math.floor(100 / updated.length)
        const balanced = updated.map((v, i) => ({
          ...v,
          weight: i === updated.length - 1 ? 100 - evenWeight * (updated.length - 1) : evenWeight,
        }))
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? {
                  ...f,
                  pages: [...f.pages, newPage],
                  steps: f.steps.map((st) => (st.id === stepId ? { ...st, variants: balanced } : st)),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        }))
        return newVariant.id
      },

      removeVariant: (funnelId, stepId, variantId) => {
        set((s) => ({
          funnels: s.funnels.map((f) => {
            if (f.id !== funnelId) return f
            const step = f.steps.find((st) => st.id === stepId)
            if (!step?.variants) return f
            const target = step.variants.find((v) => v.id === variantId)
            if (!target) return f
            const remaining = step.variants.filter((v) => v.id !== variantId)
            const evenWeight = remaining.length ? Math.floor(100 / remaining.length) : 0
            const balanced = remaining.map((v, i) => ({
              ...v,
              weight: i === remaining.length - 1 ? 100 - evenWeight * (remaining.length - 1) : evenWeight,
            }))
            const isControl = target.pageId === step.pageId
            const variantsField = balanced.length > 1 ? balanced : undefined
            return {
              ...f,
              pages: isControl ? f.pages : f.pages.filter((p) => p.id !== target.pageId),
              steps: f.steps.map((st) => (st.id === stepId ? { ...st, variants: variantsField } : st)),
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
      },

      updateVariant: (funnelId, stepId, variantId, data) =>
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? {
                  ...f,
                  steps: f.steps.map((st) =>
                    st.id === stepId && st.variants
                      ? { ...st, variants: st.variants.map((v) => (v.id === variantId ? { ...v, ...data } : v)) }
                      : st
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        })),

      rebalanceVariantWeights: (funnelId, stepId) =>
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? {
                  ...f,
                  steps: f.steps.map((st) => {
                    if (st.id !== stepId || !st.variants) return st
                    const total = st.variants.reduce((acc, v) => acc + v.weight, 0)
                    if (total === 100 || total <= 0) return st
                    const factor = 100 / total
                    const scaled = st.variants.map((v) => ({ ...v, weight: Math.round(v.weight * factor) }))
                    const drift = 100 - scaled.reduce((acc, v) => acc + v.weight, 0)
                    if (drift !== 0) scaled[scaled.length - 1].weight += drift
                    return { ...st, variants: scaled }
                  }),
                }
              : f
          ),
        })),

      recordVariantVisit: (funnelId, stepId, variantId) =>
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? {
                  ...f,
                  steps: f.steps.map((st) =>
                    st.id === stepId && st.variants
                      ? {
                          ...st,
                          variants: st.variants.map((v) =>
                            v.id === variantId
                              ? { ...v, stats: recomputeConversion({ ...v.stats, visitors: v.stats.visitors + 1 }) }
                              : v
                          ),
                        }
                      : st
                  ),
                }
              : f
          ),
          events: appendEvent(s.events, { type: "visit", funnelId, stepId, variantId }),
        })),

      recordVariantConversion: (funnelId, stepId, variantId, type, amount = 0) =>
        set((s) => ({
          funnels: s.funnels.map((f) =>
            f.id === funnelId
              ? {
                  ...f,
                  steps: f.steps.map((st) =>
                    st.id === stepId && st.variants
                      ? {
                          ...st,
                          variants: st.variants.map((v) => {
                            if (v.id !== variantId) return v
                            const next =
                              type === "optin"
                                ? { ...v.stats, optins: v.stats.optins + 1 }
                                : { ...v.stats, sales: v.stats.sales + 1, revenue: v.stats.revenue + amount }
                            return { ...v, stats: recomputeConversion(next) }
                          }),
                        }
                      : st
                  ),
                }
              : f
          ),
          events: appendEvent(s.events, { type, funnelId, stepId, variantId, amount }),
        })),
    }),
    {
      name: "funnel-store",
      version: 6,
      migrate: (persisted, fromVersion) => {
        const s = persisted as Partial<FunnelStore> | undefined
        if (!s) return s
        if (fromVersion < 2) {
          const demoIdSet = new Set(DEMO_FUNNELS.map((f) => f.id))
          s.funnels = (s.funnels ?? []).map((f) =>
            demoIdSet.has(f.id)
              ? { ...f, stats: { visitors: 0, optins: 0, sales: 0, revenue: 0, conversionRate: 0 } }
              : f
          )
          s.dashboardSnapshot = null
        }
        if (fromVersion < 3) {
          if (!s.campaigns || s.campaigns.length === 0) {
            s.campaigns = DEMO_CAMPAIGNS
          }
          if (!s.events) s.events = []
        }
        if (fromVersion < 4) {
          // Migrate single `creative` → `creatives: [creative]`; reseed demos
          s.campaigns = (s.campaigns ?? []).map((c) => {
            const legacy = c as unknown as { creative?: AdCreative; creatives?: AdCreative[] }
            if (legacy.creatives && legacy.creatives.length > 0) return c
            const single = legacy.creative
            if (!single) return c
            return {
              ...c,
              creatives: [{ ...single, id: nanoid(), stats: c.stats }],
            }
          })
          // ensure demo campaigns are present after migration
          const ids = new Set(s.campaigns.map((c) => c.id))
          for (const demo of DEMO_CAMPAIGNS) {
            if (!ids.has(demo.id)) s.campaigns.push(demo)
          }
        }
        if (fromVersion < 5) {
          if (!s.contacts) s.contacts = []
          if (!s.customDomains) s.customDomains = []
          if (!s.profile) s.profile = { firstName: "Pavel", lastName: "D.", email: "pavlovdevelop@gmail.com" }
        }
        if (fromVersion < 6) {
          if (!s.telemetry) s.telemetry = { enabled: false, instanceId: nanoid(), lastSentAt: null }
        }
        return s
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          const existingIds = state.funnels.map((f) => f.id)
          const missingDemos = DEMO_FUNNELS.filter((f) => !existingIds.includes(f.id))
          if (missingDemos.length > 0) {
            state.funnels = [...state.funnels, ...missingDemos]
          }
          if (!state.campaigns) state.campaigns = DEMO_CAMPAIGNS
          if (!state.events) state.events = []
          if (!state.contacts) state.contacts = []
          if (!state.customDomains) state.customDomains = []
          if (!state.profile) state.profile = { firstName: "Pavel", lastName: "D.", email: "pavlovdevelop@gmail.com" }
          if (!state.telemetry) state.telemetry = { enabled: false, instanceId: nanoid(), lastSentAt: null }
          state.setHasHydrated(true)
        }
      },
    }
  )
)
