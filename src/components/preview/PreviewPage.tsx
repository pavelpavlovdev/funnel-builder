"use client"

import { useEffect, useState } from "react"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { ElementRenderer } from "@/components/page-builder/ElementRenderer"
import type { FunnelPage } from "@/lib/types"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Monitor, Smartphone, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  funnelId: string
  pageId: string | null
}

export function PreviewPage({ funnelId, pageId }: Props) {
  const { funnels, _hasHydrated } = useFunnelStore()
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")

  const funnel = funnels.find((f) => f.id === funnelId)

  // Resolve which page to show
  const page: FunnelPage | undefined = pageId
    ? funnel?.pages.find((p) => p.id === pageId)
    : funnel?.pages[0]

  // Find current step index for navigation
  const currentStep = funnel?.steps.find((s) => s.pageId === page?.id)
  const nextStep = currentStep?.nextStepId
    ? funnel?.steps.find((s) => s.id === currentStep.nextStepId)
    : null
  const nextPage = nextStep ? funnel?.pages.find((p) => p.id === nextStep.pageId) : null

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
  )
}
