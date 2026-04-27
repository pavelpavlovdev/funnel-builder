"use client"

import { useState } from "react"
import { ELEMENTS, ELEMENT_CATEGORIES, createElementFromDef } from "./elements-config"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { Search, Layout, FileText, Film, Zap, Users, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PageElement } from "@/lib/types"

interface Props {
  funnelId: string
  pageId: string
  onElementAdded: (el: PageElement) => void
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  layout: <Layout className="w-3.5 h-3.5" />,
  content: <FileText className="w-3.5 h-3.5" />,
  media: <Film className="w-3.5 h-3.5" />,
  conversion: <Zap className="w-3.5 h-3.5" />,
  social: <Users className="w-3.5 h-3.5" />,
}

const ELEMENT_ICONS: Record<string, string> = {
  hero: "🎯",
  headline: "Hh",
  paragraph: "¶",
  image: "🖼️",
  video: "▶️",
  button: "⚡",
  form: "📝",
  countdown: "⏰",
  testimonial: "💬",
  pricing: "💲",
  divider: "—",
  spacer: "⬚",
  list: "✓",
  guarantee: "🛡️",
  social_proof: "👥",
  faq: "❓",
  order_bump: "🎁",
  exit_popup: "🚪",
}

export function ElementPanel({ funnelId, pageId, onElementAdded }: Props) {
  const { addElement } = useFunnelStore()
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const filtered = ELEMENTS.filter((el) => {
    const matchSearch = search === "" || el.label.toLowerCase().includes(search.toLowerCase())
    const matchCategory = activeCategory === "all" || el.category === activeCategory
    return matchSearch && matchCategory
  })

  const handleAdd = (type: string) => {
    const def = ELEMENTS.find((e) => e.type === type)
    if (!def) return
    const element = createElementFromDef(def)
    addElement(funnelId, pageId, element)
    onElementAdded(element)
  }

  // Group by category for "all" view
  const grouped =
    activeCategory === "all" && search === ""
      ? ELEMENT_CATEGORIES.map((cat) => ({
          ...cat,
          elements: ELEMENTS.filter((el) => el.category === cat.id),
        }))
      : null

  return (
    <div className="w-[240px] shrink-0 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Elements</p>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-8 py-2 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
            placeholder="Search elements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-0.5 px-2 py-2 border-b border-gray-100 bg-gray-50">
        <button
          onClick={() => setActiveCategory("all")}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all whitespace-nowrap",
            activeCategory === "all"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-white"
          )}
        >
          All
        </button>
        {ELEMENT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            title={cat.label}
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium transition-all",
              activeCategory === cat.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-white"
            )}
          >
            {CATEGORY_ICONS[cat.id]}
          </button>
        ))}
      </div>

      {/* Elements list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {grouped ? (
          grouped.map((cat) => (
            <div key={cat.id}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                {cat.label}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {cat.elements.map((el) => (
                  <ElementCard
                    key={el.type}
                    type={el.type}
                    label={el.label}
                    icon={ELEMENT_ICONS[el.type] || el.icon}
                    onAdd={handleAdd}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 gap-1.5">
                {filtered.map((el) => (
                  <ElementCard
                    key={el.type}
                    type={el.type}
                    label={el.label}
                    icon={ELEMENT_ICONS[el.type] || el.icon}
                    onAdd={handleAdd}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-xs text-gray-400">No elements found</p>
                <button
                  onClick={() => { setSearch(""); setActiveCategory("all") }}
                  className="text-xs text-indigo-500 mt-2 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
        <p className="text-[10px] text-gray-400 text-center">Click to add · Drag to reorder</p>
      </div>
    </div>
  )
}

function ElementCard({
  type,
  label,
  icon,
  onAdd,
}: {
  type: string
  label: string
  icon: string
  onAdd: (type: string) => void
}) {
  const isEmoji = icon.length <= 2 && !/^[a-zA-Z¶—✓⬚]/.test(icon)
  const isTextIcon = !isEmoji

  return (
    <button
      onClick={() => onAdd(type)}
      className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/50 text-center transition-all cursor-pointer shadow-sm hover:shadow-md"
    >
      <div className="w-9 h-9 rounded-lg bg-gray-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors shrink-0">
        {isTextIcon ? (
          <span className="text-sm font-bold text-gray-500 group-hover:text-indigo-600 transition-colors">
            {icon}
          </span>
        ) : (
          <span className="text-lg leading-none">{icon}</span>
        )}
      </div>
      <span className="text-[11px] font-medium text-gray-600 group-hover:text-indigo-700 leading-tight transition-colors">
        {label}
      </span>
    </button>
  )
}
