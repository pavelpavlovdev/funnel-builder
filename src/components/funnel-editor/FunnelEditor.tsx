"use client"

import { useState } from "react"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { FunnelFlow } from "./FunnelFlow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Play,
  Settings2,
  BarChart3,
  Globe,
  Save,
  ChevronDown,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { StepType } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FunnelSettings } from "./FunnelSettings"

const STEP_TYPES: { type: StepType; label: string; emoji: string }[] = [
  { type: "optin", label: "Opt-in Page", emoji: "📧" },
  { type: "squeeze", label: "Squeeze Page", emoji: "📋" },
  { type: "sales", label: "Sales Page", emoji: "💰" },
  { type: "order", label: "Order Form", emoji: "🛒" },
  { type: "upsell", label: "Upsell Page", emoji: "⬆️" },
  { type: "downsell", label: "Downsell Page", emoji: "⬇️" },
  { type: "thankyou", label: "Thank You Page", emoji: "🎉" },
  { type: "webinar", label: "Webinar Page", emoji: "📺" },
  { type: "bridge", label: "Bridge Page", emoji: "🌉" },
]

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  paused: "bg-gray-100 text-gray-600",
}

interface FunnelEditorProps {
  funnelId: string
}

export function FunnelEditor({ funnelId }: FunnelEditorProps) {
  const { funnels, updateFunnel, addStep, _hasHydrated } = useFunnelStore()
  const funnel = funnels.find((f) => f.id === funnelId)
  const [tab, setTab] = useState<"flow" | "settings">("flow")
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(funnel?.name || "")

  if (!_hasHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading funnel...</p>
        </div>
      </div>
    )
  }

  if (!funnel) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Funnel not found</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/funnels">Back to Funnels</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleSaveName = () => {
    if (nameValue.trim()) {
      updateFunnel(funnel.id, { name: nameValue.trim() })
      toast.success("Saved")
    }
    setEditingName(false)
  }

  const handlePublish = () => {
    updateFunnel(funnel.id, { status: funnel.status === "active" ? "draft" : "active" })
    toast.success(funnel.status === "active" ? "Funnel unpublished" : "Funnel published!")
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top bar */}
      <div className="h-14 border-b bg-card flex items-center px-4 gap-3 shrink-0 z-10">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/funnels"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>

        {editingName ? (
          <Input
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            className="h-8 text-sm font-semibold max-w-xs"
            autoFocus
          />
        ) : (
          <button
            onClick={() => { setEditingName(true); setNameValue(funnel.name) }}
            className="text-sm font-semibold hover:text-primary transition-colors"
          >
            {funnel.name}
          </button>
        )}

        <Badge variant="outline" className={`text-xs ${statusColors[funnel.status]}`}>
          {funnel.status}
        </Badge>

        <div className="ml-auto flex items-center gap-2">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="h-8">
              <TabsTrigger value="flow" className="text-xs px-3">Flow</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs px-3">Settings</TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-8">
                <Plus className="w-3.5 h-3.5" /> Add Step <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {STEP_TYPES.map((st) => (
                <DropdownMenuItem
                  key={st.type}
                  onClick={() => {
                    addStep(funnel.id, st.type, st.label)
                    toast.success(`${st.label} added`)
                  }}
                >
                  <span className="mr-2">{st.emoji}</span> {st.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            className="h-8 gap-1.5"
            variant={funnel.status === "active" ? "secondary" : "default"}
            onClick={handlePublish}
          >
            <Globe className="w-3.5 h-3.5" />
            {funnel.status === "active" ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Content */}
      {tab === "flow" ? (
        <div className="flex-1 overflow-hidden">
          <FunnelFlow funnel={funnel} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <FunnelSettings funnel={funnel} />
        </div>
      )}
    </div>
  )
}
