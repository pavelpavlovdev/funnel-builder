"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useFunnelStore } from "@/lib/store/funnel-store"
import type { FunnelStep, StepVariant } from "@/lib/types"
import {
  FlaskConical,
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  AlertCircle,
  Crown,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  funnelId: string
  step: FunnelStep
}

export function SplitTestDialog({ open, onOpenChange, funnelId, step }: Props) {
  const {
    enableSplitTest,
    disableSplitTest,
    addVariant,
    removeVariant,
    updateVariant,
    rebalanceVariantWeights,
  } = useFunnelStore()

  const variants = step.variants ?? []
  const isActive = variants.length > 0
  const totalWeight = variants.reduce((acc, v) => acc + v.weight, 0)
  const weightOff = totalWeight !== 100

  const totalVisits = variants.reduce((acc, v) => acc + v.stats.visitors, 0)
  const winner = pickWinner(variants)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-amber-500" />
            A/B Split Test — {step.name}
          </DialogTitle>
          <DialogDescription>
            Send traffic to multiple page variants and let conversions decide the winner.
          </DialogDescription>
        </DialogHeader>

        {!isActive ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
              <FlaskConical className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold">No split test running</p>
              <p className="text-sm text-muted-foreground">
                Enable A/B testing and we&apos;ll create a duplicate of the current page as Variant B. You can edit it independently.
              </p>
            </div>
            <Button
              onClick={() => {
                enableSplitTest(funnelId, step.id)
                toast.success("A/B test enabled — Variant B created")
              }}
            >
              <FlaskConical className="w-4 h-4 mr-2" /> Enable A/B Test
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
                  Running
                </Badge>
                <span>{totalVisits.toLocaleString()} total visits</span>
                {winner && (
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <Crown className="w-3.5 h-3.5" /> {winner.name} leading
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    addVariant(funnelId, step.id)
                    toast.success("Variant added")
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Variant
                </Button>
                {weightOff && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-amber-600"
                    onClick={() => {
                      rebalanceVariantWeights(funnelId, step.id)
                      toast.success("Weights rebalanced to 100%")
                    }}
                  >
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Rebalance
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {variants.map((variant) => (
                <VariantRow
                  key={variant.id}
                  funnelId={funnelId}
                  stepId={step.id}
                  variant={variant}
                  isWinner={winner?.id === variant.id}
                  totalVisits={totalVisits}
                  onUpdate={(data) => updateVariant(funnelId, step.id, variant.id, data)}
                  onRemove={() => {
                    if (variants.length <= 1) {
                      toast.error("Disable the test instead — at least one variant must exist")
                      return
                    }
                    removeVariant(funnelId, step.id, variant.id)
                    toast.success("Variant removed")
                  }}
                />
              ))}
            </div>

            <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 leading-relaxed">
              Visitors are bucketed once per browser session by weighted random — they always see the same variant on subsequent visits. Use the re-roll button in the preview toolbar to simulate a different visitor.
            </div>
          </div>
        )}

        <DialogFooter>
          {isActive && (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive mr-auto"
              onClick={() => {
                if (!confirm("Disable the A/B test? Variant pages will be deleted, only the control survives.")) return
                disableSplitTest(funnelId, step.id)
                toast.success("A/B test disabled")
              }}
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Disable Test
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function pickWinner(variants: StepVariant[]): StepVariant | null {
  const eligible = variants.filter((v) => v.stats.visitors >= 5)
  if (eligible.length < 2) return null
  return eligible.reduce((best, v) => (v.stats.conversionRate > best.stats.conversionRate ? v : best))
}

interface RowProps {
  funnelId: string
  stepId: string
  variant: StepVariant
  isWinner: boolean
  totalVisits: number
  onUpdate: (data: Partial<Pick<StepVariant, "name" | "weight">>) => void
  onRemove: () => void
}

function VariantRow({ funnelId, variant, isWinner, totalVisits, onUpdate, onRemove }: RowProps) {
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(variant.name)
  const trafficShare = totalVisits > 0 ? (variant.stats.visitors / totalVisits) * 100 : variant.weight

  return (
    <div
      className={`border rounded-xl p-3 ${
        isWinner ? "border-amber-300 bg-amber-50/40" : "border-border/60"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {editingName ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  if (name.trim()) onUpdate({ name: name.trim() })
                  setEditingName(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (name.trim()) onUpdate({ name: name.trim() })
                    setEditingName(false)
                  } else if (e.key === "Escape") {
                    setName(variant.name)
                    setEditingName(false)
                  }
                }}
                className="h-7 text-sm font-semibold max-w-[180px]"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="font-semibold text-sm hover:text-primary flex items-center gap-1.5"
              >
                {variant.name}
                <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100" />
              </button>
            )}
            {isWinner && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] py-0 px-1.5 h-5">
                <Crown className="w-3 h-3 mr-0.5" /> Winner
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {variant.stats.visitors.toLocaleString()} visits · {variant.stats.conversionRate}% conv. · {trafficShare.toFixed(0)}% share
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Weight</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={variant.weight}
            onChange={(e) => onUpdate({ weight: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
            className="w-16 h-8 text-sm"
          />
          <span className="text-xs text-muted-foreground">%</span>
        </div>

        <Button asChild size="sm" variant="ghost" className="h-8 px-2">
          <Link href={`/funnels/${funnelId}/pages/${variant.pageId}`} target="_blank">
            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
          </Link>
        </Button>
        <Button asChild size="sm" variant="ghost" className="h-8 px-2">
          <Link href={`/preview/${funnelId}/${variant.pageId}`} target="_blank">
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full ${isWinner ? "bg-amber-400" : "bg-primary"} transition-all`}
          style={{ width: `${Math.min(100, trafficShare)}%` }}
        />
      </div>

      <div className="mt-2 grid grid-cols-4 gap-3 text-[11px]">
        <Stat label="Visitors" value={variant.stats.visitors.toLocaleString()} />
        <Stat label="Optins" value={variant.stats.optins.toLocaleString()} />
        <Stat label="Sales" value={variant.stats.sales.toLocaleString()} />
        <Stat label="Revenue" value={`$${variant.stats.revenue.toLocaleString()}`} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  )
}

