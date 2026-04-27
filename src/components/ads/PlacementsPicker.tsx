"use client"

import type { AdChannel, AdPlacement } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PlacementOption {
  id: AdPlacement
  label: string
  description: string
  ratio: string
}

const PLACEMENTS: Record<AdChannel, PlacementOption[]> = {
  meta: [
    { id: "feed", label: "News Feed", description: "Highest CTR, in-feed", ratio: "1:1 / 4:5" },
    { id: "stories", label: "Stories", description: "Vertical full-screen, high recall", ratio: "9:16" },
    { id: "reels", label: "Reels", description: "Short video, viral potential", ratio: "9:16" },
    { id: "marketplace", label: "Marketplace", description: "Shopping-intent users", ratio: "1:1" },
    { id: "right_column", label: "Right column (desktop)", description: "Cheap retargeting filler", ratio: "1.91:1" },
  ],
  google: [
    { id: "search", label: "Search", description: "Keyword intent, high quality clicks", ratio: "Text" },
    { id: "display", label: "Display Network", description: "Banner ads across the web", ratio: "Various" },
    { id: "youtube", label: "YouTube", description: "Pre-roll & in-stream", ratio: "16:9" },
  ],
  tiktok: [
    { id: "in_feed", label: "In-Feed", description: "Native short video, scrolls naturally", ratio: "9:16" },
    { id: "topview", label: "TopView", description: "First ad on app open — premium", ratio: "9:16" },
  ],
}

interface Props {
  channel: AdChannel
  selected: AdPlacement[]
  onChange: (placements: AdPlacement[]) => void
}

export function PlacementsPicker({ channel, selected, onChange }: Props) {
  const options = PLACEMENTS[channel] ?? []

  const toggle = (id: AdPlacement) => {
    if (selected.includes(id)) {
      onChange(selected.filter((p) => p !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Select where your ad will show. Mix high-volume placements with high-quality ones.
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChange(options.map((o) => o.id))}
            className="text-[11px] text-primary hover:underline"
          >
            Select all
          </button>
          <span className="text-muted-foreground/40">·</span>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[11px] text-muted-foreground hover:underline"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={cn(
                "p-3 rounded-lg border-2 text-left transition-all",
                active
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold">{opt.label}</p>
                <span
                  className={cn(
                    "shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                    active ? "bg-primary border-primary" : "border-muted-foreground/30"
                  )}
                >
                  {active && <span className="text-white text-[10px]">✓</span>}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">{opt.description}</p>
              <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">{opt.ratio}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
