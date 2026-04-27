"use client"

import type { OptimizationInsight, AdCampaign, Funnel } from "@/lib/types"
import { generateInsights } from "@/lib/ad-optimization"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  Info,
  Wand2,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Props {
  campaign: AdCampaign
  funnel: Funnel | undefined
  compact?: boolean
}

const SEVERITY_STYLE: Record<OptimizationInsight["severity"], { icon: React.ComponentType<{ className?: string }>; bg: string; border: string; iconColor: string; label: string }> = {
  critical: { icon: AlertOctagon, bg: "bg-red-50", border: "border-red-200", iconColor: "text-red-600", label: "Critical" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50", border: "border-amber-200", iconColor: "text-amber-600", label: "Warning" },
  opportunity: { icon: TrendingUp, bg: "bg-emerald-50", border: "border-emerald-200", iconColor: "text-emerald-600", label: "Opportunity" },
  info: { icon: Info, bg: "bg-blue-50", border: "border-blue-200", iconColor: "text-blue-600", label: "Info" },
}

export function OptimizationInsights({ campaign, funnel, compact = false }: Props) {
  const { updateCampaign, setCampaignStatus } = useFunnelStore()
  const insights = generateInsights(campaign, funnel)

  const handleAction = (insight: OptimizationInsight) => {
    if (!insight.action) return
    switch (insight.action.type) {
      case "scale_budget": {
        const mult = (insight.action.payload?.multiplier as number) ?? 1.2
        const newBudget = Math.round(campaign.dailyBudget * mult)
        updateCampaign(campaign.id, { dailyBudget: newBudget })
        if (insight.action.payload?.setStatus === "active") {
          setCampaignStatus(campaign.id, "active")
        }
        toast.success(`Daily budget set to $${newBudget}`, {
          description: `+${Math.round((mult - 1) * 100)}% from $${campaign.dailyBudget}`,
        })
        return
      }
      case "pause":
        setCampaignStatus(campaign.id, "paused")
        toast.success("Campaign paused")
        return
      case "rotate_creative":
        toast.info("Open creative tab to rotate", { description: "Click 'Edit creative' to swap headline, body, or image." })
        return
      case "narrow_audience":
      case "broaden_audience":
        toast.info("Adjust audience in campaign settings")
        return
      case "improve_landing":
        toast.success("Opening A/B test setup", {
          description: "Click 'View funnel' below to set up a split test on the landing step.",
        })
        return
    }
  }

  return (
    <Card className={compact ? "border-amber-200 bg-amber-50/40" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Optimization Insights
          <span className="text-xs font-normal text-muted-foreground">
            · Live analysis of your campaign
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm font-medium text-foreground">All clear — no urgent insights</p>
            <p className="text-xs text-muted-foreground mt-1">
              Performance is within healthy benchmarks. Keep monitoring.
            </p>
          </div>
        ) : (
          insights.map((insight) => {
            const style = SEVERITY_STYLE[insight.severity]
            const Icon = style.icon
            return (
              <div
                key={insight.id}
                className={`rounded-lg border ${style.border} ${style.bg} p-3 flex gap-3`}
              >
                <div className={`shrink-0 mt-0.5 ${style.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${style.iconColor} shrink-0`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1.5 bg-white"
                        onClick={() => handleAction(insight)}
                      >
                        <Wand2 className="w-3 h-3" /> {insight.action.label}
                      </Button>
                      {typeof insight.action.payload?.funnelId === "string" && (
                        <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                          <Link href={`/funnels/${insight.action.payload.funnelId}`}>
                            View funnel →
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
