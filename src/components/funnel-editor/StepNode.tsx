"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye } from "lucide-react"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { toast } from "sonner"
import type { FunnelStep } from "@/lib/types"
import { cn } from "@/lib/utils"

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
  const { deleteStep } = useFunnelStore()
  const config = stepTypeConfig[step.stepType] || { emoji: "📄", color: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200" }

  return (
    <div
      className={cn(
        "w-48 rounded-xl border-2 bg-white shadow-md transition-all",
        selected ? "border-primary shadow-lg shadow-primary/20" : config.border
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-primary !border-white !border-2"
      />

      {/* Header */}
      <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-t-[10px]", config.bg)}>
        <span className="text-lg">{config.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className={cn("text-xs font-semibold leading-none truncate", config.color)}>
            {step.name}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5 capitalize">{step.stepType}</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100">
        <div className="text-center">
          <p className="text-[10px] text-gray-400">Visits</p>
          <p className="text-xs font-bold text-gray-700">—</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400">Conv.</p>
          <p className="text-xs font-bold text-gray-700">—</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400">Revenue</p>
          <p className="text-xs font-bold text-gray-700">—</p>
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
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={() => {
            deleteStep(funnelId, step.id)
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
        className="w-3 h-3 !bg-primary !border-white !border-2"
      />
    </div>
  )
}
