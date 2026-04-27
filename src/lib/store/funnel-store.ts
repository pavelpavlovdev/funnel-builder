import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import type { Funnel, FunnelStep, FunnelPage, PageElement, StepType } from "@/lib/types"

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
    stats: { visitors: 4821, optins: 1247, sales: 0, revenue: 0, conversionRate: 25.9 },
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
    stats: { visitors: 9340, optins: 0, sales: 312, revenue: 46800, conversionRate: 3.3 },
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

interface FunnelStore {
  funnels: Funnel[]
  activeFunnelId: string | null
  activePageId: string | null
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
}

export const useFunnelStore = create<FunnelStore>()(
  persist(
    (set, get) => ({
      funnels: DEMO_FUNNELS,
      activeFunnelId: null,
      activePageId: null,
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
    }),
    {
      name: "funnel-store",
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure demo funnels are always present
          const demoIds = DEMO_FUNNELS.map((f) => f.id)
          const existingIds = state.funnels.map((f) => f.id)
          const missingDemos = DEMO_FUNNELS.filter((f) => !existingIds.includes(f.id))
          if (missingDemos.length > 0) {
            state.funnels = [...state.funnels, ...missingDemos]
          }
          state.setHasHydrated(true)
        }
      },
    }
  )
)
