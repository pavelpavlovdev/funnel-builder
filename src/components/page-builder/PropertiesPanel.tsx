"use client"

import { useState } from "react"
import { useFunnelStore } from "@/lib/store/funnel-store"
import type { FunnelPage, PageElement, ElementStyle } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  X,
  ChevronDown,
  ChevronRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Type,
  Palette,
  Settings,
  Layers,
  Link2,
  Unlink2,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Props {
  element: PageElement | null
  funnelId: string
  pageId: string
  page: FunnelPage
  onClose: () => void
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseSpacing(value: string | undefined): [string, string, string, string] {
  if (!value) return ["0", "0", "0", "0"]
  const parts = value.trim().split(/\s+/)
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]]
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]]
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]]
  return [parts[0], parts[1], parts[2], parts[3]]
}

function serializeSpacing(t: string, r: string, b: string, l: string): string {
  if (t === r && r === b && b === l) return t
  if (t === b && r === l) return `${t} ${r}`
  return `${t} ${r} ${b} ${l}`
}

function extractPx(v: string): number {
  const n = parseFloat(v)
  return isNaN(n) ? 0 : n
}

// ── Section wrapper ────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  defaultOpen = true,
  children,
}: {
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors"
      >
        {icon && <span className="text-gray-400">{icon}</span>}
        <span className="flex-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
          {title}
        </span>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-gray-500">{label}</label>
      {children}
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <FieldRow label={label}>
      <div className="flex gap-1.5 items-center">
        <div className="relative shrink-0">
          <input
            type="color"
            value={value || "#ffffff"}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded-md border border-gray-200 cursor-pointer p-0.5 bg-white"
            title="Pick color"
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs font-mono flex-1"
          placeholder={placeholder || "transparent"}
        />
      </div>
    </FieldRow>
  )
}

function BoxModelControl({
  label,
  value,
  onChange,
}: {
  label: "Padding" | "Margin"
  value: string | undefined
  onChange: (v: string) => void
}) {
  const [linked, setLinked] = useState(true)
  const [t, r, b, l] = parseSpacing(value)

  const handleChange = (side: "t" | "r" | "b" | "l", val: string) => {
    const px = val ? `${val}px` : "0"
    if (linked) {
      onChange(`${px}`)
    } else {
      const next = { t, r, b, l, [side]: px }
      onChange(serializeSpacing(next.t, next.r, next.b, next.l))
    }
  }

  const sides = [
    { key: "t" as const, label: "T", value: t },
    { key: "r" as const, label: "R", value: r },
    { key: "b" as const, label: "B", value: b },
    { key: "l" as const, label: "L", value: l },
  ]

  return (
    <FieldRow label={label}>
      <div className="flex items-center gap-2">
        {linked ? (
          <div className="flex-1">
            <input
              type="number"
              min={0}
              value={extractPx(t)}
              onChange={(e) => {
                const px = e.target.value ? `${e.target.value}px` : "0"
                onChange(px)
              }}
              className="w-full h-7 text-xs border border-gray-200 rounded-md px-2 focus:outline-none focus:border-indigo-400"
              placeholder="0"
            />
            <p className="text-[10px] text-gray-400 mt-0.5">All sides</p>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-4 gap-1">
            {sides.map((s) => (
              <div key={s.key} className="text-center">
                <input
                  type="number"
                  min={0}
                  value={extractPx(s.value)}
                  onChange={(e) => handleChange(s.key, e.target.value)}
                  className="w-full h-7 text-[11px] border border-gray-200 rounded-md text-center focus:outline-none focus:border-indigo-400"
                />
                <span className="text-[9px] text-gray-400 mt-0.5 block">{s.label}</span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setLinked(!linked)}
          title={linked ? "Unlink sides" : "Link all sides"}
          className={cn(
            "w-7 h-7 rounded-md border flex items-center justify-center transition-colors shrink-0",
            linked
              ? "border-indigo-300 bg-indigo-50 text-indigo-600"
              : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
          )}
        >
          {linked ? <Link2 className="w-3 h-3" /> : <Unlink2 className="w-3 h-3" />}
        </button>
      </div>
    </FieldRow>
  )
}

// ── Tab: Content ───────────────────────────────────────────────────────────

function ContentTab({
  element,
  funnelId,
  pageId,
}: {
  element: PageElement
  funnelId: string
  pageId: string
}) {
  const { updateElement } = useFunnelStore()
  const p = element.props as Record<string, unknown>

  const setProps = (updates: Record<string, unknown>) => {
    updateElement(funnelId, pageId, element.id, { props: { ...element.props, ...updates } })
  }

  return (
    <div className="space-y-3">
      {element.type === "hero" && (
        <>
          <FieldRow label="Pre-headline">
            <Input
              value={(p.preHeadline as string) || ""}
              onChange={(e) => setProps({ preHeadline: e.target.value })}
              className="h-8 text-xs"
              placeholder="Optional tagline..."
            />
          </FieldRow>
          <FieldRow label="Headline">
            <Textarea
              value={(p.headline as string) || ""}
              onChange={(e) => setProps({ headline: e.target.value })}
              rows={2}
              className="text-xs resize-none"
            />
          </FieldRow>
          <FieldRow label="Subheadline">
            <Textarea
              value={(p.subheadline as string) || ""}
              onChange={(e) => setProps({ subheadline: e.target.value })}
              rows={2}
              className="text-xs resize-none"
            />
          </FieldRow>
          <FieldRow label="Button Text">
            <Input
              value={(p.buttonText as string) || ""}
              onChange={(e) => setProps({ buttonText: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
          <FieldRow label="Button URL">
            <Input
              value={(p.buttonUrl as string) || "#"}
              onChange={(e) => setProps({ buttonUrl: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
          <FieldRow label="Guarantee text (optional)">
            <Input
              value={(p.guarantee as string) || ""}
              onChange={(e) => setProps({ guarantee: e.target.value })}
              className="h-8 text-xs"
              placeholder="e.g. No credit card required"
            />
          </FieldRow>
        </>
      )}

      {element.type === "headline" && (
        <>
          <FieldRow label="Text">
            <Textarea
              value={(p.text as string) || ""}
              onChange={(e) => setProps({ text: e.target.value })}
              rows={3}
              className="text-xs resize-none"
            />
          </FieldRow>
          <FieldRow label="Tag">
            <Select value={(p.tag as string) || "h1"} onValueChange={(v) => setProps({ tag: v })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["h1", "h2", "h3", "h4", "h5", "p"].map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">
                    {t.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </>
      )}

      {element.type === "paragraph" && (
        <FieldRow label="Text">
          <Textarea
            value={(p.text as string) || ""}
            onChange={(e) => setProps({ text: e.target.value })}
            rows={6}
            className="text-xs resize-none"
          />
        </FieldRow>
      )}

      {element.type === "button" && (
        <>
          <FieldRow label="Button Label">
            <Input
              value={(p.text as string) || ""}
              onChange={(e) => setProps({ text: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
          <FieldRow label="URL">
            <Input
              value={(p.url as string) || "#"}
              onChange={(e) => setProps({ url: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
          <FieldRow label="Size">
            <Select
              value={(p.size as string) || "large"}
              onValueChange={(v) => setProps({ size: v })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small" className="text-xs">Small</SelectItem>
                <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                <SelectItem value="large" className="text-xs">Large</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Style">
            <Select
              value={(p.variant as string) || "primary"}
              onValueChange={(v) => setProps({ variant: v })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary" className="text-xs">Primary (Indigo)</SelectItem>
                <SelectItem value="secondary" className="text-xs">Secondary (Gray)</SelectItem>
                <SelectItem value="danger" className="text-xs">Danger (Red)</SelectItem>
                <SelectItem value="success" className="text-xs">Success (Green)</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Sub-text">
            <Input
              value={(p.subtext as string) || ""}
              onChange={(e) => setProps({ subtext: e.target.value })}
              className="h-8 text-xs"
              placeholder="e.g. 30-day guarantee"
            />
          </FieldRow>
        </>
      )}

      {element.type === "image" && (
        <>
          <FieldRow label="Image URL">
            <Input
              value={(p.src as string) || ""}
              onChange={(e) => setProps({ src: e.target.value })}
              className="h-8 text-xs"
              placeholder="https://..."
            />
          </FieldRow>
          <FieldRow label="Alt Text">
            <Input
              value={(p.alt as string) || ""}
              onChange={(e) => setProps({ alt: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
          <FieldRow label="Caption">
            <Input
              value={(p.caption as string) || ""}
              onChange={(e) => setProps({ caption: e.target.value })}
              className="h-8 text-xs"
              placeholder="Optional caption"
            />
          </FieldRow>
          <FieldRow label="Width">
            <Input
              value={(p.width as string) || "100%"}
              onChange={(e) => setProps({ width: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
        </>
      )}

      {element.type === "video" && (
        <>
          <FieldRow label="Video URL (embed)">
            <Input
              value={(p.url as string) || ""}
              onChange={(e) => setProps({ url: e.target.value })}
              className="h-8 text-xs"
              placeholder="https://youtube.com/embed/..."
            />
          </FieldRow>
          <p className="text-[10px] text-gray-400">
            Use YouTube or Vimeo embed URLs (e.g. youtube.com/embed/...)
          </p>
        </>
      )}

      {element.type === "form" && (
        <>
          <FieldRow label="Headline">
            <Input
              value={(p.headline as string) || ""}
              onChange={(e) => setProps({ headline: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
          <FieldRow label="Button Text">
            <Input
              value={(p.buttonText as string) || ""}
              onChange={(e) => setProps({ buttonText: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
          <FieldRow label="Privacy Text">
            <Input
              value={(p.privacyText as string) || ""}
              onChange={(e) => setProps({ privacyText: e.target.value })}
              className="h-8 text-xs"
              placeholder="We respect your privacy..."
            />
          </FieldRow>
        </>
      )}

      {element.type === "testimonial" && (
        <>
          <FieldRow label="Quote">
            <Textarea
              value={(p.quote as string) || ""}
              onChange={(e) => setProps({ quote: e.target.value })}
              rows={4}
              className="text-xs resize-none"
            />
          </FieldRow>
          <FieldRow label="Name">
            <Input
              value={(p.name as string) || ""}
              onChange={(e) => setProps({ name: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
          <FieldRow label="Role / Title">
            <Input
              value={(p.role as string) || ""}
              onChange={(e) => setProps({ role: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
          <FieldRow label="Rating (1–5)">
            <Select
              value={String(p.rating || 5)}
              onValueChange={(v) => setProps({ rating: parseInt(v) })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)} className="text-xs">
                    {"★".repeat(n)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </>
      )}

      {element.type === "countdown" && (
        <>
          <FieldRow label="Headline">
            <Input
              value={(p.headline as string) || ""}
              onChange={(e) => setProps({ headline: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
          <FieldRow label="Duration (minutes)">
            <Input
              type="number"
              min={1}
              value={(p.minutes as number) || 15}
              onChange={(e) => setProps({ minutes: parseInt(e.target.value) })}
              className="h-8 text-xs"
            />
          </FieldRow>
          <FieldRow label="Expired Text">
            <Input
              value={(p.expiredText as string) || "Offer expired!"}
              onChange={(e) => setProps({ expiredText: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
        </>
      )}

      {element.type === "pricing" && (
        <>
          <FieldRow label="Package Name">
            <Input
              value={(p.name as string) || ""}
              onChange={(e) => setProps({ name: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
          <div className="grid grid-cols-2 gap-2">
            <FieldRow label="Price">
              <Input
                value={(p.price as string) || ""}
                onChange={(e) => setProps({ price: e.target.value })}
                className="h-8 text-xs"
              />
            </FieldRow>
            <FieldRow label="Original Price">
              <Input
                value={(p.originalPrice as string) || ""}
                onChange={(e) => setProps({ originalPrice: e.target.value })}
                className="h-8 text-xs"
                placeholder="crossed out"
              />
            </FieldRow>
          </div>
          <FieldRow label="Currency">
            <Input
              value={(p.currency as string) || "$"}
              onChange={(e) => setProps({ currency: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
          <FieldRow label="Period">
            <Select
              value={(p.period as string) || "one-time"}
              onValueChange={(v) => setProps({ period: v })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time" className="text-xs">One-time</SelectItem>
                <SelectItem value="month" className="text-xs">Per Month</SelectItem>
                <SelectItem value="year" className="text-xs">Per Year</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="CTA Button">
            <Input
              value={(p.ctaText as string) || "Get Instant Access"}
              onChange={(e) => setProps({ ctaText: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
        </>
      )}

      {element.type === "guarantee" && (
        <>
          <FieldRow label="Headline">
            <Input
              value={(p.headline as string) || ""}
              onChange={(e) => setProps({ headline: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
          <FieldRow label="Description">
            <Textarea
              value={(p.text as string) || ""}
              onChange={(e) => setProps({ text: e.target.value })}
              rows={3}
              className="text-xs resize-none"
            />
          </FieldRow>
          <FieldRow label="Days">
            <Input
              type="number"
              value={(p.days as number) || 30}
              onChange={(e) => setProps({ days: parseInt(e.target.value) })}
              className="h-8 text-xs"
            />
          </FieldRow>
        </>
      )}

      {element.type === "social_proof" && (
        <>
          <FieldRow label="Count">
            <Input
              value={(p.count as string) || "10,000"}
              onChange={(e) => setProps({ count: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
          <FieldRow label="Label">
            <Input
              value={(p.text as string) || "happy customers"}
              onChange={(e) => setProps({ text: e.target.value })}
              className="h-8 text-xs"
            />
          </FieldRow>
        </>
      )}

      {element.type === "spacer" && (
        <FieldRow label="Height">
          <Input
            value={(p.height as string) || "40px"}
            onChange={(e) => setProps({ height: e.target.value })}
            className="h-8 text-xs"
            placeholder="e.g. 40px"
          />
        </FieldRow>
      )}

      {element.type === "divider" && (
        <>
          <FieldRow label="Style">
            <Select
              value={(p.style as string) || "solid"}
              onValueChange={(v) => setProps({ style: v })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid" className="text-xs">Solid</SelectItem>
                <SelectItem value="dashed" className="text-xs">Dashed</SelectItem>
                <SelectItem value="dotted" className="text-xs">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Width">
            <Input
              value={(p.width as string) || "80%"}
              onChange={(e) => setProps({ width: e.target.value })}
              className="h-8 text-xs"
              placeholder="e.g. 80%"
            />
          </FieldRow>
        </>
      )}

      {(element.type === "list" || element.type === "faq") && (
        <p className="text-xs text-gray-500 py-2">
          Edit list items in the Style tab or directly in the canvas.
        </p>
      )}
    </div>
  )
}

// ── Tab: Style ─────────────────────────────────────────────────────────────

function StyleTab({
  element,
  funnelId,
  pageId,
}: {
  element: PageElement
  funnelId: string
  pageId: string
}) {
  const { updateElement } = useFunnelStore()
  const s = element.style

  const setStyle = (updates: Partial<ElementStyle>) => {
    updateElement(funnelId, pageId, element.id, { style: { ...element.style, ...updates } })
  }

  const FONT_WEIGHTS = [
    { value: "300", label: "Light" },
    { value: "400", label: "Regular" },
    { value: "500", label: "Medium" },
    { value: "600", label: "Semi Bold" },
    { value: "700", label: "Bold" },
    { value: "800", label: "Extra Bold" },
    { value: "900", label: "Black" },
  ]

  const SHADOWS = [
    { label: "None", value: "none" },
    { label: "Soft", value: "0 2px 8px rgba(0,0,0,0.08)" },
    { label: "Medium", value: "0 4px 20px rgba(0,0,0,0.12)" },
    { label: "Hard", value: "0 8px 30px rgba(0,0,0,0.18)" },
    { label: "Colored", value: "0 8px 30px rgba(99,102,241,0.35)" },
    { label: "Custom", value: s.boxShadow || "" },
  ]

  return (
    <div>
      {/* Typography */}
      <Section title="Typography" icon={<Type className="w-3.5 h-3.5" />}>
        {/* Text align */}
        <FieldRow label="Alignment">
          <div className="flex gap-1">
            {(["left", "center", "right", "justify"] as const).map((align) => {
              const Icon =
                align === "left"
                  ? AlignLeft
                  : align === "center"
                  ? AlignCenter
                  : align === "right"
                  ? AlignRight
                  : AlignJustify
              return (
                <button
                  key={align}
                  onClick={() => setStyle({ textAlign: align })}
                  className={cn(
                    "flex-1 h-8 flex items-center justify-center rounded-md border transition-colors",
                    s.textAlign === align
                      ? "border-indigo-400 bg-indigo-50 text-indigo-600"
                      : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              )
            })}
          </div>
        </FieldRow>

        {/* Font size + weight */}
        <div className="grid grid-cols-2 gap-2">
          <FieldRow label="Size">
            <div className="flex gap-1">
              <Input
                value={s.fontSize || ""}
                onChange={(e) => setStyle({ fontSize: e.target.value })}
                className="h-8 text-xs"
                placeholder="1rem"
              />
            </div>
          </FieldRow>
          <FieldRow label="Weight">
            <Select
              value={s.fontWeight || "400"}
              onValueChange={(v) => setStyle({ fontWeight: v })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_WEIGHTS.map((w) => (
                  <SelectItem key={w.value} value={w.value} className="text-xs">
                    {w.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </div>

        {/* Line height + Letter spacing */}
        <div className="grid grid-cols-2 gap-2">
          <FieldRow label="Line Height">
            <Input
              value={s.lineHeight || ""}
              onChange={(e) => setStyle({ lineHeight: e.target.value })}
              className="h-8 text-xs"
              placeholder="1.5"
            />
          </FieldRow>
          <FieldRow label="Spacing">
            <Input
              value={s.letterSpacing || ""}
              onChange={(e) => setStyle({ letterSpacing: e.target.value })}
              className="h-8 text-xs"
              placeholder="0em"
            />
          </FieldRow>
        </div>

        {/* Text transforms */}
        <FieldRow label="Style">
          <div className="flex gap-1">
            <button
              onClick={() => setStyle({ fontStyle: s.fontStyle === "italic" ? "normal" : "italic" })}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-md border text-sm font-medium transition-colors",
                s.fontStyle === "italic"
                  ? "border-indigo-400 bg-indigo-50 text-indigo-600"
                  : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
              )}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setStyle({ fontWeight: s.fontWeight === "700" ? "400" : "700" })}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-md border text-sm font-medium transition-colors",
                s.fontWeight === "700"
                  ? "border-indigo-400 bg-indigo-50 text-indigo-600"
                  : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
              )}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                setStyle({
                  textDecoration: s.textDecoration === "underline" ? "none" : "underline",
                })
              }
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-md border text-sm font-medium transition-colors",
                s.textDecoration === "underline"
                  ? "border-indigo-400 bg-indigo-50 text-indigo-600"
                  : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
              )}
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <Select
              value={s.textTransform || "none"}
              onValueChange={(v) => setStyle({ textTransform: v as ElementStyle["textTransform"] })}
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs">Default</SelectItem>
                <SelectItem value="uppercase" className="text-xs">UPPERCASE</SelectItem>
                <SelectItem value="lowercase" className="text-xs">lowercase</SelectItem>
                <SelectItem value="capitalize" className="text-xs">Capitalize</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FieldRow>

        {/* Text color */}
        <ColorField
          label="Text Color"
          value={s.color || ""}
          onChange={(v) => setStyle({ color: v })}
          placeholder="#111827"
        />
      </Section>

      {/* Background */}
      <Section title="Background" icon={<Palette className="w-3.5 h-3.5" />}>
        <ColorField
          label="Color"
          value={s.backgroundColor || ""}
          onChange={(v) => setStyle({ backgroundColor: v })}
          placeholder="transparent"
        />
      </Section>

      {/* Spacing */}
      <Section title="Spacing" icon={<Layers className="w-3.5 h-3.5" />}>
        <BoxModelControl
          label="Padding"
          value={s.padding}
          onChange={(v) => setStyle({ padding: v })}
        />
        <BoxModelControl
          label="Margin"
          value={s.margin}
          onChange={(v) => setStyle({ margin: v })}
        />
      </Section>

      {/* Border */}
      <Section title="Border" defaultOpen={false}>
        <FieldRow label="Style">
          <Select
            value={s.borderStyle || "none"}
            onValueChange={(v) => setStyle({ borderStyle: v as ElementStyle["borderStyle"] })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-xs">None</SelectItem>
              <SelectItem value="solid" className="text-xs">Solid</SelectItem>
              <SelectItem value="dashed" className="text-xs">Dashed</SelectItem>
              <SelectItem value="dotted" className="text-xs">Dotted</SelectItem>
              <SelectItem value="double" className="text-xs">Double</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        {s.borderStyle && s.borderStyle !== "none" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="Width">
                <Input
                  value={s.borderWidth || "1px"}
                  onChange={(e) => setStyle({ borderWidth: e.target.value })}
                  className="h-8 text-xs"
                  placeholder="1px"
                />
              </FieldRow>
              <ColorField
                label="Color"
                value={s.borderColor || "#e5e7eb"}
                onChange={(v) => setStyle({ borderColor: v })}
              />
            </div>
          </>
        )}
        <FieldRow label="Border Radius">
          <Input
            value={s.borderRadius || ""}
            onChange={(e) => setStyle({ borderRadius: e.target.value })}
            className="h-8 text-xs"
            placeholder="e.g. 8px or 50%"
          />
        </FieldRow>
      </Section>

      {/* Effects */}
      <Section title="Effects" defaultOpen={false}>
        <FieldRow label="Shadow">
          <div className="grid grid-cols-3 gap-1 mb-2">
            {SHADOWS.slice(0, 5).map((sh) => (
              <button
                key={sh.label}
                onClick={() => setStyle({ boxShadow: sh.value })}
                className={cn(
                  "px-2 py-1.5 rounded border text-[11px] font-medium transition-colors",
                  (s.boxShadow === sh.value || (sh.label === "None" && !s.boxShadow))
                    ? "border-indigo-400 bg-indigo-50 text-indigo-600"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                )}
              >
                {sh.label}
              </button>
            ))}
          </div>
          <Input
            value={s.boxShadow || ""}
            onChange={(e) => setStyle({ boxShadow: e.target.value })}
            className="h-8 text-xs font-mono"
            placeholder="Custom shadow..."
          />
        </FieldRow>

        <FieldRow label="Opacity">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={parseFloat(s.opacity || "1")}
              onChange={(e) => setStyle({ opacity: e.target.value })}
              className="flex-1 accent-indigo-600"
            />
            <span className="text-xs text-gray-600 w-10 text-right">
              {Math.round(parseFloat(s.opacity || "1") * 100)}%
            </span>
          </div>
        </FieldRow>
      </Section>
    </div>
  )
}

// ── Tab: Advanced ──────────────────────────────────────────────────────────

function AdvancedTab({
  element,
  funnelId,
  pageId,
}: {
  element: PageElement
  funnelId: string
  pageId: string
}) {
  const { updateElement } = useFunnelStore()
  const p = element.props as Record<string, unknown>

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-gray-500">Element ID</label>
        <Input
          value={(p.elementId as string) || element.id}
          readOnly
          className="h-8 text-xs font-mono bg-gray-50 text-gray-400"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-gray-500">CSS Class</label>
        <Input
          value={(p.cssClass as string) || ""}
          onChange={(e) =>
            updateElement(funnelId, pageId, element.id, {
              props: { ...element.props, cssClass: e.target.value },
            })
          }
          className="h-8 text-xs font-mono"
          placeholder="custom-class"
        />
      </div>
      <div className="pt-2 border-t border-gray-100">
        <p className="text-[11px] font-semibold text-gray-400 mb-2">Visibility</p>
        <div className="flex gap-2">
          {(["desktop", "tablet", "mobile"] as const).map((device) => {
            const key = `hideOn_${device}` as keyof typeof p
            const hidden = !!p[key]
            return (
              <button
                key={device}
                onClick={() =>
                  updateElement(funnelId, pageId, element.id, {
                    props: { ...element.props, [key]: !hidden },
                  })
                }
                className={cn(
                  "flex-1 py-1.5 rounded-md border text-[11px] font-medium transition-colors",
                  hidden
                    ? "border-red-300 bg-red-50 text-red-600"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                )}
              >
                {hidden ? "Hide" : "Show"} {device}
              </button>
            )
          })}
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">Toggle to hide on specific device sizes</p>
      </div>
    </div>
  )
}

// ── Page Settings ──────────────────────────────────────────────────────────

function PageSettingsPanel({ page, funnelId }: { page: FunnelPage; funnelId: string }) {
  const { updatePage } = useFunnelStore()

  const setSettings = (updates: Partial<FunnelPage["settings"]>) => {
    updatePage(funnelId, page.id, { settings: { ...page.settings, ...updates } })
  }

  return (
    <div>
      <Section title="Page Design" icon={<Palette className="w-3.5 h-3.5" />}>
        <ColorField
          label="Background Color"
          value={page.settings.backgroundColor}
          onChange={(v) => setSettings({ backgroundColor: v })}
        />
        <FieldRow label="Max Width">
          <Select
            value={page.settings.maxWidth}
            onValueChange={(v) => setSettings({ maxWidth: v })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="600px" className="text-xs">600px — Narrow</SelectItem>
              <SelectItem value="768px" className="text-xs">768px — Tablet</SelectItem>
              <SelectItem value="960px" className="text-xs">960px — Standard</SelectItem>
              <SelectItem value="1200px" className="text-xs">1200px — Wide</SelectItem>
              <SelectItem value="100%" className="text-xs">100% — Full Width</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Font Family">
          <Select
            value={page.settings.fontFamily}
            onValueChange={(v) => setSettings({ fontFamily: v })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: "Inter, sans-serif", label: "Inter" },
                { value: "Georgia, serif", label: "Georgia" },
                { value: "'Playfair Display', serif", label: "Playfair Display" },
                { value: "'Open Sans', sans-serif", label: "Open Sans" },
                { value: "'Roboto', sans-serif", label: "Roboto" },
                { value: "system-ui, sans-serif", label: "System UI" },
              ].map((f) => (
                <SelectItem key={f.value} value={f.value} className="text-xs">
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
      </Section>

      <Section title="SEO" icon={<Settings className="w-3.5 h-3.5" />} defaultOpen={false}>
        <FieldRow label="Page Title">
          <Input
            value={page.settings.seoTitle || ""}
            onChange={(e) => setSettings({ seoTitle: e.target.value })}
            className="h-8 text-xs"
            placeholder={page.name}
          />
        </FieldRow>
        <FieldRow label="Meta Description">
          <Textarea
            value={page.settings.seoDescription || ""}
            onChange={(e) => setSettings({ seoDescription: e.target.value })}
            rows={3}
            className="text-xs resize-none"
            placeholder="Describe this page for search engines..."
          />
        </FieldRow>
      </Section>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────

const TABS = [
  { id: "content", label: "Content", icon: <Type className="w-3 h-3" /> },
  { id: "style", label: "Style", icon: <Palette className="w-3 h-3" /> },
  { id: "advanced", label: "Advanced", icon: <Settings className="w-3 h-3" /> },
]

export function PropertiesPanel({ element, funnelId, pageId, page, onClose }: Props) {
  const [activeTab, setActiveTab] = useState("content")

  return (
    <div className="w-72 shrink-0 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden shadow-sm">
      {/* Header */}
      <div className="h-10 border-b border-gray-100 flex items-center px-4 gap-2 shrink-0 bg-gray-50">
        <span className="text-xs font-semibold text-gray-600 flex-1 truncate capitalize">
          {element ? element.type.replace(/_/g, " ") : "Page Settings"}
        </span>
        {element && (
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Tabs (only when element is selected) */}
      {element && (
        <div className="flex border-b border-gray-100 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition-colors border-b-2",
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1">
        {element ? (
          <>
            {activeTab === "content" && (
              <div className="p-4">
                <ContentTab element={element} funnelId={funnelId} pageId={pageId} />
              </div>
            )}
            {activeTab === "style" && (
              <StyleTab element={element} funnelId={funnelId} pageId={pageId} />
            )}
            {activeTab === "advanced" && (
              <AdvancedTab element={element} funnelId={funnelId} pageId={pageId} />
            )}
          </>
        ) : (
          <PageSettingsPanel page={page} funnelId={funnelId} />
        )}
      </ScrollArea>
    </div>
  )
}
