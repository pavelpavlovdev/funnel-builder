"use client"

import { useState } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye, FlaskConical } from "lucide-react"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { toast } from "sonner"
import type { FunnelStep } from "@/lib/types"
import { cn } from "@/lib/utils"
import { SplitTestDialog } from "./SplitTestDialog"

const stepTypeConfig: Record<string, { emoji: string; color: string; bg: string; border: string }> = {
  optin: { emoji: "📧", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  squeeze: { emoji: "📋", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
  sales: { emoji: "💰", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  order: { emoji: "🛒", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  upsell: { emoji: "⬆️", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  downsell: { emoji: "⬇️", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  thankyou: { emoji: "🎉", color: "text-pink-700", bg: "bg-pink-50", border: "border-pink-200" },
  webinar: { emoji: "📺", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
  bridge: { emoji: "🌉", color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200" },
}

type StepNodeData = {
  step: FunnelStep
  funnelId: string
  pageId: string
}

export function StepNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as StepNodeData
  const { step, funnelId, pageId } = nodeData
  const { deleteStep, funnels } = useFunnelStore()

  const liveStep = funnels.find((f) => f.id === funnelId)?.steps.find((s) => s.id === step.id) ?? step
  const variants = liveStep.variants ?? []
  const hasSplitTest = variants.length > 1

  const config = stepTypeConfig[liveStep.stepType] || { emoji: "📄", color: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200" }

  const [splitOpen, setSplitOpen] = useState(false)

  const stats = hasSplitTest
    ? variants.reduce(
        (acc, v) => ({
          visitors: acc.visitors + v.stats.visitors,
          optins: acc.optins + v.stats.optins,
          sales: acc.sales + v.stats.sales,
          revenue: acc.revenue + v.stats.revenue,
        }),
        { visitors: 0, optins: 0, sales: 0, revenue: 0 }
      )
    : null

  const conv = stats && stats.visitors > 0
    ? Math.round(((stats.optins + stats.sales) / stats.visitors) * 1000) / 10
    : null

  return (
    <>
      <div
        className={cn(
          "w-52 rounded-xl border-2 bg-white shadow-md transition-all",
          selected ? "border-primary shadow-lg shadow-primary/20" : config.border
        )}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!w-5 !h-5 !bg-primary !border-white !border-[3px] !-left-2.5 hover:!ring-4 hover:!ring-primary/30 transition-all cursor-crosshair shadow-md"
        />

        {/* Header */}
        <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-t-[10px]", config.bg)}>
          <span className="text-lg">{config.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className={cn("text-xs font-semibold leading-none truncate", config.color)}>{liveStep.name}</p>
            <p className="text-[10px] text-gray-500 mt-0.5 capitalize">{liveStep.stepType}</p>
          </div>
          {hasSplitTest && (
            <button
              onClick={() => setSplitOpen(true)}
              title={`A/B testing: ${variants.length} variants`}
              className="px-1.5 h-5 rounded-md bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold flex items-center gap-1 hover:bg-amber-200 transition-colors"
            >
              <FlaskConical className="w-3 h-3" /> A/B
            </button>
          )}
        </div>

        {/* Variant rail */}
        {hasSplitTest && (
          <div className="px-3 py-1.5 border-b border-gray-100 bg-amber-50/40">
            <div className="flex items-center gap-1">
              {variants.map((v) => (
                <div
                  key={v.id}
                  title={`${v.name} · ${v.weight}%`}
                  className="flex-1 h-1.5 rounded-full bg-amber-200 overflow-hidden"
                >
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${v.weight}%` }}
                  />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-amber-700 mt-1 font-medium">
              {variants.length} variants · split {variants.map((v) => `${v.weight}%`).join(" / ")}
            </p>
          </div>
        )}

        {/* Stats bar */}
        <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100">
          <div className="text-center">
            <p className="text-[10px] text-gray-400">Visits</p>
            <p className="text-xs font-bold text-gray-700 tabular-nums">
              {stats ? stats.visitors.toLocaleString() : "—"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400">Conv.</p>
            <p className="text-xs font-bold text-gray-700 tabular-nums">
              {conv !== null ? `${conv}%` : "—"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400">Revenue</p>
            <p className="text-xs font-bold text-gray-700 tabular-nums">
              {stats && stats.revenue > 0 ? `$${(stats.revenue / 1000).toFixed(1)}k` : "—"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <Button asChild variant="ghost" size="icon" className="h-6 w-6">
            <Link href={`/funnels/${funnelId}/pages/${pageId}`} title="Edit page">
              <Edit className="w-3 h-3" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="h-6 w-6">
            <Link href={`/preview/${funnelId}/${pageId}`} target="_blank" title="Preview">
              <Eye className="w-3 h-3" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6", hasSplitTest ? "text-amber-600 hover:text-amber-700" : "text-gray-500 hover:text-amber-600")}
            onClick={() => setSplitOpen(true)}
            title={hasSplitTest ? "Manage A/B test" : "Add A/B split test"}
          >
            <FlaskConical className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={() => {
              deleteStep(funnelId, liveStep.id)
              toast.success("Step removed")
            }}
            title="Delete step"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          className="!w-5 !h-5 !bg-primary !border-white !border-[3px] !-right-2.5 hover:!ring-4 hover:!ring-primary/30 transition-all cursor-crosshair shadow-md"
        />
      </div>

      <SplitTestDialog
        open={splitOpen}
        onOpenChange={setSplitOpen}
        funnelId={funnelId}
        step={liveStep}
      />
    </>
  )
}
