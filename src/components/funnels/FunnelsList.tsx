"use client"

import { useState } from "react"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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

function FunnelCard({ funnel }: { funnel: Funnel }) {
  const { deleteFunnel, duplicateFunnel, updateFunnel } = useFunnelStore()

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all group border-border/60">
      {/* Visual preview header */}
      <div
        className="h-32 relative flex items-center justify-center gap-1 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, oklch(0.52 0.24 264 / 0.08) 0%, oklch(0.55 0.15 300 / 0.08) 100%)",
        }}
      >
        <div className="flex items-center gap-1">
          {funnel.steps.slice(0, 4).map((step, i) => (
            <div key={step.id} className="flex items-center gap-1">
              <div className="w-16 h-10 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center text-[9px] font-medium text-center px-1 border border-border/40">
                <span className="text-sm">{stepTypeEmoji[step.stepType] || "📄"}</span>
                <span className="text-muted-foreground leading-tight">{step.name}</span>
              </div>
              {i < funnel.steps.slice(0, 4).length - 1 && (
                <div className="w-3 h-px bg-border" />
              )}
            </div>
          ))}
          {funnel.steps.length > 4 && (
            <div className="text-xs text-muted-foreground ml-1">+{funnel.steps.length - 4}</div>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" asChild>
            <Link href={`/funnels/${funnel.id}`}>
              <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
            </Link>
          </Button>
          <Button size="sm" variant="secondary" asChild>
            <Link href={`/preview/${funnel.id}`} target="_blank">
              <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview
            </Link>
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <Link href={`/funnels/${funnel.id}`} className="hover:text-primary transition-colors">
              <h3 className="font-semibold text-sm text-foreground truncate">{funnel.name}</h3>
            </Link>
            {funnel.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{funnel.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="outline" className={`text-xs ${statusColors[funnel.status]}`}>
              {funnel.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="w-3.5 h-3.5" />
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
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-blue-500" />
            <span className="text-xs font-medium">{funnel.stats.visitors.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-purple-500" />
            <span className="text-xs font-medium">{funnel.stats.conversionRate}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3 h-3 text-emerald-500" />
            <span className="text-xs font-medium">
              {funnel.stats.revenue > 0 ? `$${(funnel.stats.revenue / 1000).toFixed(1)}k` : "$0"}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground mt-2">
          Updated {formatDistanceToNow(funnel.updatedAt)}
        </p>
      </CardContent>
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
            className="h-full min-h-[240px] rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary group"
          >
            <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Create New Funnel</span>
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
