"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { STOCK_IMAGES, STOCK_IMAGE_CATEGORIES } from "@/lib/ad-images"
import { cn } from "@/lib/utils"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (url: string) => void
}

export function StockImagePicker({ open, onOpenChange, onPick }: Props) {
  const [category, setCategory] = useState<string>("all")
  const filtered = category === "all" ? STOCK_IMAGES : STOCK_IMAGES.filter((i) => i.category === category)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pick a stock image</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize",
              category === "all" ? "bg-primary text-white" : "bg-muted/40 text-muted-foreground hover:bg-muted"
            )}
          >
            All
          </button>
          {STOCK_IMAGE_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize",
                category === c ? "bg-primary text-white" : "bg-muted/40 text-muted-foreground hover:bg-muted"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
          {filtered.map((img) => (
            <button
              key={img.id}
              onClick={() => {
                onPick(img.url)
                onOpenChange(false)
              }}
              className="group relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.thumb} alt={img.alt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/15 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 bg-white text-xs font-semibold px-2 py-1 rounded-md shadow">
                  Use
                </span>
              </div>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground mt-2">
          Stock photos courtesy of Unsplash. In production, you&apos;d connect a media library.
        </p>
      </DialogContent>
    </Dialog>
  )
}
