"use client"

import { useState, useEffect, useCallback } from "react"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { ElementPanel } from "./ElementPanel"
import { BuilderCanvas } from "./BuilderCanvas"
import { PropertiesPanel } from "./PropertiesPanel"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Tablet,
  Save,
  Undo2,
  Redo2,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { PageElement } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useBuilderHistory } from "./hooks/useBuilderHistory"

type ViewMode = "desktop" | "tablet" | "mobile"

interface Props {
  funnelId: string
  pageId: string
}

export function PageBuilder({ funnelId, pageId }: Props) {
  const { funnels, updatePage, _hasHydrated } = useFunnelStore()
  const funnel = funnels.find((f) => f.id === funnelId)
  const page = funnel?.pages.find((p) => p.id === pageId)

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("desktop")
  const [previewMode, setPreviewMode] = useState(false)
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)

  // Hydration guard
  if (!_hasHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!funnel || !page) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-3">
        <p className="text-muted-foreground text-lg">Page not found</p>
        <Link href={`/funnels/${funnelId}`} className="text-sm text-indigo-600 hover:underline">
          ← Back to funnel
        </Link>
      </div>
    )
  }

  return (
    <PageBuilderInner
      funnelId={funnelId}
      pageId={pageId}
      selectedElementId={selectedElementId}
      setSelectedElementId={setSelectedElementId}
      viewMode={viewMode}
      setViewMode={setViewMode}
      previewMode={previewMode}
      setPreviewMode={setPreviewMode}
      leftPanelOpen={leftPanelOpen}
      setLeftPanelOpen={setLeftPanelOpen}
    />
  )
}

// Inner component that has access to guaranteed page data
function PageBuilderInner({
  funnelId,
  pageId,
  selectedElementId,
  setSelectedElementId,
  viewMode,
  setViewMode,
  previewMode,
  setPreviewMode,
  leftPanelOpen,
  setLeftPanelOpen,
}: {
  funnelId: string
  pageId: string
  selectedElementId: string | null
  setSelectedElementId: (id: string | null) => void
  viewMode: ViewMode
  setViewMode: (m: ViewMode) => void
  previewMode: boolean
  setPreviewMode: (v: boolean) => void
  leftPanelOpen: boolean
  setLeftPanelOpen: (v: boolean) => void
}) {
  const { funnels, updatePage } = useFunnelStore()
  const funnel = funnels.find((f) => f.id === funnelId)!
  const page = funnel.pages.find((p) => p.id === pageId)!

  const { undo, redo, canUndo, canRedo } = useBuilderHistory(funnelId, page)

  const selectedElement = page.elements.find((el) => el.id === selectedElementId) ?? null

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo() }
      if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo() }
      if (ctrl && e.key === "s") { e.preventDefault(); handleSave() }
      if (e.key === "Escape") { setSelectedElementId(null) }
      if (e.key === "Delete" && selectedElementId && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        handleDeleteElement(selectedElementId)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo, selectedElementId])

  const handleSave = () => {
    toast.success("Page saved!", { description: "All changes have been saved." })
  }

  const handleDeleteElement = (elementId: string) => {
    const { deleteElement } = useFunnelStore.getState()
    deleteElement(funnelId, pageId, elementId)
    if (selectedElementId === elementId) setSelectedElementId(null)
    toast.success("Element deleted")
  }

  const canvasWidths: Record<ViewMode, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "390px",
  }

  const deviceLabels: Record<ViewMode, string> = {
    desktop: "Desktop",
    tablet: "Tablet",
    mobile: "Mobile",
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f0f0f5]">
      {/* ── Topbar ── */}
      <div className="h-14 bg-[#1a1a2e] text-white flex items-center px-4 gap-3 shrink-0 z-30">
        {/* Back */}
        <Link
          href={`/funnels/${funnelId}`}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="h-4 w-px bg-gray-700" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm min-w-0">
          <span className="text-gray-400 truncate max-w-[120px]">{funnel.name}</span>
          <span className="text-gray-600">/</span>
          <span className="font-medium truncate max-w-[140px]">{page.name}</span>
        </div>

        {/* Page selector (if multiple pages) */}
        {funnel.pages.length > 1 && (
          <div className="relative group">
            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex-1" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={cn(
              "w-8 h-7 rounded flex items-center justify-center transition-colors",
              canUndo ? "text-gray-300 hover:text-white hover:bg-white/10" : "text-gray-600 cursor-not-allowed"
            )}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={cn(
              "w-8 h-7 rounded flex items-center justify-center transition-colors",
              canRedo ? "text-gray-300 hover:text-white hover:bg-white/10" : "text-gray-600 cursor-not-allowed"
            )}
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-gray-700" />

        {/* Device switcher */}
        <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
          {(["desktop", "tablet", "mobile"] as ViewMode[]).map((mode) => {
            const Icon = mode === "desktop" ? Monitor : mode === "tablet" ? Tablet : Smartphone
            return (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={`${deviceLabels[mode]} view`}
                className={cn(
                  "w-8 h-7 rounded flex items-center justify-center transition-colors",
                  viewMode === mode
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            )
          })}
        </div>

        <div className="h-4 w-px bg-gray-700" />

        {/* Preview toggle */}
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className={cn(
            "flex items-center gap-1.5 px-3 h-8 rounded-lg text-sm font-medium transition-colors",
            previewMode
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
          )}
        >
          {previewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {previewMode ? "Exit" : "Preview"}
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        {!previewMode && leftPanelOpen && (
          <ElementPanel
            funnelId={funnelId}
            pageId={pageId}
            onElementAdded={(el) => setSelectedElementId(el.id)}
          />
        )}

        {/* Canvas area */}
        <div className="flex-1 overflow-auto flex flex-col items-center py-8 px-6 relative">
          {/* Canvas size indicator */}
          {viewMode !== "desktop" && (
            <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              {deviceLabels[viewMode]} — {canvasWidths[viewMode]}
            </div>
          )}

          <div
            className="transition-all duration-300 w-full"
            style={{ maxWidth: canvasWidths[viewMode] }}
          >
            <BuilderCanvas
              page={page}
              funnelId={funnelId}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              previewMode={previewMode}
            />
          </div>

          {/* Keyboard shortcuts hint */}
          {!previewMode && (
            <div className="mt-6 flex items-center gap-4 text-[11px] text-gray-400">
              <span><kbd className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-mono">Ctrl+Z</kbd> Undo</span>
              <span><kbd className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-mono">Ctrl+Y</kbd> Redo</span>
              <span><kbd className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-mono">Del</kbd> Delete</span>
              <span><kbd className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-mono">Esc</kbd> Deselect</span>
            </div>
          )}
        </div>

        {/* Right panel */}
        {!previewMode && (
          <PropertiesPanel
            element={selectedElement}
            funnelId={funnelId}
            pageId={pageId}
            page={page}
            onClose={() => setSelectedElementId(null)}
          />
        )}
      </div>
    </div>
  )
}
