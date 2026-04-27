"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { ElementRenderer } from "@/components/page-builder/ElementRenderer"
import { PreviewContext } from "@/components/preview/PreviewContext"
import { resolveVariant, clearVariantBucket } from "@/lib/ab-testing"
import type { FunnelPage, FunnelStep } from "@/lib/types"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Monitor, Smartphone, Eye, FlaskConical, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  funnelId: string
  pageId: string | null
}

const VISIT_SESSION_KEY = "b4c:visited-funnels"

function shouldRecordVisit(funnelId: string): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = sessionStorage.getItem(VISIT_SESSION_KEY)
    const visited: string[] = raw ? JSON.parse(raw) : []
    if (visited.includes(funnelId)) return false
    sessionStorage.setItem(VISIT_SESSION_KEY, JSON.stringify([...visited, funnelId]))
    return true
  } catch {
    return true
  }
}

export function PreviewPage({ funnelId, pageId }: Props) {
  const { funnels, _hasHydrated, recordVisit, recordVariantVisit } = useFunnelStore()
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const visitTrackedRef = useRef(false)
  const variantTrackedRef = useRef<string | null>(null)
  const [bucketTick, setBucketTick] = useState(0)

  useEffect(() => {
    if (!_hasHydrated || visitTrackedRef.current) return
    visitTrackedRef.current = true
    if (shouldRecordVisit(funnelId)) recordVisit(funnelId)
  }, [_hasHydrated, funnelId, recordVisit])

  const funnel = funnels.find((f) => f.id === funnelId)

  const requestedPage: FunnelPage | undefined = pageId
    ? funnel?.pages.find((p) => p.id === pageId)
    : funnel?.pages[0]

  const requestedStep: FunnelStep | undefined = funnel?.steps.find((s) => {
    if (!requestedPage) return false
    if (s.pageId === requestedPage.id) return true
    return s.variants?.some((v) => v.pageId === requestedPage.id) ?? false
  })

  const activeVariant = useMemo(() => {
    if (!requestedStep) return null
    return resolveVariant(requestedStep)
    // bucketTick forces re-evaluation when user resets bucket
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedStep?.id, requestedStep?.variants, bucketTick])

  const page: FunnelPage | undefined = activeVariant
    ? funnel?.pages.find((p) => p.id === activeVariant.pageId)
    : requestedPage

  const currentStep = requestedStep
  const nextStep = currentStep?.nextStepId
    ? funnel?.steps.find((s) => s.id === currentStep.nextStepId)
    : null
  const nextPage = nextStep ? funnel?.pages.find((p) => p.id === nextStep.pageId) : null

  useEffect(() => {
    if (!_hasHydrated) return
    if (!currentStep || !activeVariant) return
    const key = `${currentStep.id}:${activeVariant.id}`
    if (variantTrackedRef.current === key) return
    variantTrackedRef.current = key
    recordVariantVisit(funnelId, currentStep.id, activeVariant.id)
  }, [_hasHydrated, funnelId, currentStep, activeVariant, recordVariantVisit])

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!funnel || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <p className="text-xl font-semibold text-gray-800">Page not found</p>
          <p className="text-gray-500 text-sm">This funnel page doesn't exist or has been deleted.</p>
          <Link href={`/funnels/${funnelId}`} className="inline-block mt-2 text-indigo-600 text-sm hover:underline">
            ← Back to funnel editor
          </Link>
        </div>
      </div>
    )
  }

  return (
    <PreviewContext.Provider value={{ funnelId, stepId: currentStep?.id ?? null, variantId: activeVariant?.id ?? null }}>
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Preview toolbar */}
      <div className="h-12 bg-gray-900 text-white flex items-center px-4 gap-3 shrink-0 z-50 fixed top-0 left-0 right-0">
        <Link
          href={`/funnels/${funnelId}`}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Editor
        </Link>

        <div className="h-4 w-px bg-gray-700" />

        <div className="flex items-center gap-1.5 text-xs text-gray-300">
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium text-white">{funnel.name}</span>
          <span className="text-gray-500">→</span>
          <span>{page.name}</span>
        </div>

        {currentStep?.variants && activeVariant && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px]">
            <FlaskConical className="w-3 h-3" />
            <span className="font-medium">A/B: {activeVariant.name}</span>
            <button
              onClick={() => {
                clearVariantBucket(currentStep.id)
                variantTrackedRef.current = null
                setBucketTick((t) => t + 1)
              }}
              title="Re-roll variant"
              className="hover:text-white transition-colors ml-1"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex-1" />

        {/* Step navigation */}
        {funnel.steps.length > 1 && (
          <div className="flex items-center gap-1 mr-3">
            {funnel.steps.map((step, i) => {
              const isActive = step.pageId === page.id
              const stepPage = funnel.pages.find((p) => p.id === step.pageId)
              return (
                <Link
                  key={step.id}
                  href={`/preview/${funnelId}/${step.pageId}`}
                  title={step.name}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  )}
                >
                  <span>{i + 1}.</span>
                  <span>{step.name}</span>
                </Link>
              )
            })}
          </div>
        )}

        {/* Device switcher */}
        <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-0.5">
          <button
            onClick={() => setDevice("desktop")}
            className={cn("p-1.5 rounded transition-colors", device === "desktop" ? "bg-gray-600 text-white" : "text-gray-500 hover:text-gray-300")}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={cn("p-1.5 rounded transition-colors", device === "mobile" ? "bg-gray-600 text-white" : "text-gray-500 hover:text-gray-300")}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 flex justify-center pt-12 pb-8 px-4">
        <div
          className={cn(
            "w-full transition-all duration-300 shadow-2xl",
            device === "mobile" ? "max-w-[375px]" : "max-w-full"
          )}
          style={{
            backgroundColor: page.settings.backgroundColor,
            fontFamily: page.settings.fontFamily,
            minHeight: "calc(100vh - 80px)",
          }}
        >
          <div style={{ maxWidth: device === "mobile" ? "100%" : page.settings.maxWidth, margin: "0 auto" }}>
            {page.elements.length > 0 ? (
              page.elements.map((element) => (
                <ElementRenderer key={element.id} element={element} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                <span className="text-5xl mb-4">📄</span>
                <p className="text-lg font-medium">This page has no content yet</p>
                <p className="text-sm mt-1">Add elements in the page builder</p>
                <Link
                  href={`/funnels/${funnelId}/pages/${page.id}`}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                >
                  Open Page Builder
                </Link>
              </div>
            )}
          </div>

          {/* Next step CTA at bottom if there's a next page */}
          {nextPage && page.elements.length > 0 && (
            <div className="border-t border-dashed border-gray-200 p-6 text-center">
              <p className="text-xs text-gray-400 mb-3">— Next step in funnel —</p>
              <Link
                href={`/preview/${funnelId}/${nextPage.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                Continue to {nextStep?.name} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
    </PreviewContext.Provider>
  )
}
