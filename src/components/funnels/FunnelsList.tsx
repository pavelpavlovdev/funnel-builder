"use client"

import { useState } from "react"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  BarChart3,
  Eye,
  TrendingUp,
  Users,
  DollarSign,
  Filter,
  Grid,
  List,
  FlaskConical,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Funnel } from "@/lib/types"
import { formatDistanceToNow } from "@/lib/date-utils"
import { NewFunnelDialog } from "./NewFunnelDialog"

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  draft: "bg-amber-100 text-amber-700 border-amber-200",
  paused: "bg-gray-100 text-gray-600 border-gray-200",
  archived: "bg-red-100 text-red-600 border-red-200",
}

const stepTypeEmoji: Record<string, string> = {
  optin: "📧",
  squeeze: "📋",
  sales: "💰",
  order: "🛒",
  upsell: "⬆️",
  downsell: "⬇️",
  thankyou: "🎉",
  webinar: "📺",
  bridge: "🌉",
}

const statusDot: Record<string, string> = {
  active: "bg-emerald-500",
  draft: "bg-amber-500",
  paused: "bg-gray-400",
  archived: "bg-red-500",
}

function FunnelCard({ funnel }: { funnel: Funnel }) {
  const { deleteFunnel, duplicateFunnel, updateFunnel } = useFunnelStore()
  const visibleSteps = funnel.steps.slice(0, 5)
  const extraSteps = funnel.steps.length - visibleSteps.length
  const splitTestCount = funnel.steps.filter((s) => s.variants && s.variants.length > 1).length

  return (
    <Card className="group relative flex flex-col overflow-hidden border-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30">
      {/* Header: status + name + menu */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot[funnel.status] ?? "bg-gray-400"}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {funnel.status}
            </span>
            <span className="text-[10px] text-muted-foreground/60">·</span>
            <span className="text-[10px] text-muted-foreground">
              {funnel.steps.length} {funnel.steps.length === 1 ? "step" : "steps"}
            </span>
            {splitTestCount > 0 && (
              <>
                <span className="text-[10px] text-muted-foreground/60">·</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700">
                  <FlaskConical className="w-3 h-3" /> {splitTestCount} A/B
                </span>
              </>
            )}
          </div>
          <Link href={`/funnels/${funnel.id}`} className="block group/title">
            <h3 className="font-semibold text-base text-foreground leading-tight line-clamp-2 group-hover/title:text-primary transition-colors">
              {funnel.name}
            </h3>
          </Link>
          {funnel.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
              {funnel.description}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-1 -mt-1 shrink-0 opacity-60 group-hover:opacity-100">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
              <Link href={`/funnels/${funnel.id}`}>
                <Edit className="w-3.5 h-3.5 mr-2" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/funnels/${funnel.id}/analytics`}>
                <BarChart3 className="w-3.5 h-3.5 mr-2" /> Analytics
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => duplicateFunnel(funnel.id)}>
              <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {funnel.status !== "active" && (
              <DropdownMenuItem onClick={() => {
                updateFunnel(funnel.id, { status: "active" })
                toast.success("Funnel published!")
              }}>
                Publish
              </DropdownMenuItem>
            )}
            {funnel.status === "active" && (
              <DropdownMenuItem onClick={() => {
                updateFunnel(funnel.id, { status: "paused" })
                toast.info("Funnel paused")
              }}>
                Pause
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                deleteFunnel(funnel.id)
                toast.success("Funnel deleted")
              }}
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Step flow visualization */}
      <div
        className="relative px-4 py-4 mx-3 rounded-xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.52 0.24 264 / 0.07) 0%, oklch(0.65 0.18 320 / 0.07) 100%)",
        }}
      >
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {visibleSteps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-1.5">
              <div
                title={step.name}
                className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center text-base border border-border/50"
              >
                {stepTypeEmoji[step.stepType] ?? "📄"}
              </div>
              {i < visibleSteps.length - 1 && (
                <div className="w-3 h-px bg-border" />
              )}
            </div>
          ))}
          {extraSteps > 0 && (
            <div className="ml-1 px-2 h-6 rounded-full bg-white/80 border border-border/50 flex items-center text-[10px] font-semibold text-muted-foreground">
              +{extraSteps}
            </div>
          )}
        </div>

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
          <Button size="sm" asChild className="h-8">
            <Link href={`/funnels/${funnel.id}`}>
              <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
            </Link>
          </Button>
          <Button size="sm" variant="secondary" asChild className="h-8">
            <Link href={`/preview/${funnel.id}`} target="_blank">
              <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1 px-4 pt-4 pb-3 mt-1">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <Users className="w-3 h-3 text-blue-500" /> Visitors
          </div>
          <span className="text-base font-bold text-foreground tabular-nums">
            {funnel.stats.visitors.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <TrendingUp className="w-3 h-3 text-purple-500" /> Conv.
          </div>
          <span className="text-base font-bold text-foreground tabular-nums">
            {funnel.stats.conversionRate}%
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <DollarSign className="w-3 h-3 text-emerald-500" /> Revenue
          </div>
          <span className="text-base font-bold text-foreground tabular-nums">
            {funnel.stats.revenue > 0
              ? funnel.stats.revenue >= 1000
                ? `$${(funnel.stats.revenue / 1000).toFixed(1)}k`
                : `$${funnel.stats.revenue}`
              : "$0"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto px-4 py-2.5 border-t border-border/40 bg-muted/20 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          Updated {formatDistanceToNow(funnel.updatedAt)}
        </span>
        <Badge variant="outline" className={`text-[10px] py-0 px-2 h-5 ${statusColors[funnel.status]}`}>
          {funnel.status}
        </Badge>
      </div>
    </Card>
  )
}

export function FunnelsList() {
  const { funnels, _hasHydrated } = useFunnelStore()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = funnels.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || f.status === statusFilter
    return matchSearch && matchStatus
  })

  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search funnels..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/40">
          {["all", "active", "draft", "paused"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                statusFilter === s ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button size="sm" className="gap-1.5 ml-2" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" /> New Funnel
          </Button>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} funnel{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Create new card */}
          <button
            onClick={() => setDialogOpen(true)}
            className="h-full min-h-[280px] rounded-xl border-2 border-dashed border-border/70 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary group"
          >
            <div className="w-12 h-12 rounded-full bg-muted/70 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">Create New Funnel</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">Start from scratch or pick a template</p>
            </div>
          </button>

          {filtered.map((funnel) => (
            <FunnelCard key={funnel.id} funnel={funnel} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((funnel) => (
            <div
              key={funnel.id}
              className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border/60 hover:shadow-sm transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/funnels/${funnel.id}`} className="font-medium text-sm hover:text-primary">
                    {funnel.name}
                  </Link>
                  <Badge variant="outline" className={`text-xs ${statusColors[funnel.status]}`}>
                    {funnel.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {funnel.steps.length} steps • Updated {formatDistanceToNow(funnel.updatedAt)}
                </p>
              </div>
              <div className="flex items-center gap-6 shrink-0 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  {funnel.stats.visitors.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {funnel.stats.conversionRate}%
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <DollarSign className="w-3.5 h-3.5" />
                  ${funnel.stats.revenue.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link href={`/funnels/${funnel.id}`}><Edit className="w-4 h-4" /></Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewFunnelDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
