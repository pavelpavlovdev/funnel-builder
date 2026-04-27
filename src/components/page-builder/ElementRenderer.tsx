"use client"

import React from "react"
import type { PageElement } from "@/lib/types"
import { usePreviewContext } from "@/components/preview/PreviewContext"
import { useFunnelStore } from "@/lib/store/funnel-store"
import confetti from "canvas-confetti"

function celebrateConversion(rect?: DOMRect) {
  const origin = rect
    ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight }
    : { x: 0.5, y: 0.6 }
  confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 35,
    origin,
    colors: ["#6366f1", "#a855f7", "#10b981", "#f59e0b", "#ec4899"],
    scalar: 0.9,
    ticks: 200,
  })
}

type P = Record<string, unknown>

function str(v: unknown, fallback = ""): string {
  return (v as string) || fallback
}

interface Props {
  element: PageElement
}

export function ElementRenderer({ element }: Props) {
  const previewCtx = usePreviewContext()
  const recordOptin = useFunnelStore((s) => s.recordOptin)
  const recordSale = useFunnelStore((s) => s.recordSale)
  const recordVariantConversion = useFunnelStore((s) => s.recordVariantConversion)

  const trackOptin = () => {
    if (!previewCtx) return
    recordOptin(previewCtx.funnelId)
    if (previewCtx.stepId && previewCtx.variantId) {
      recordVariantConversion(previewCtx.funnelId, previewCtx.stepId, previewCtx.variantId, "optin")
    }
  }

  const trackSale = (amount: number) => {
    if (!previewCtx) return
    recordSale(previewCtx.funnelId, amount)
    if (previewCtx.stepId && previewCtx.variantId) {
      recordVariantConversion(previewCtx.funnelId, previewCtx.stepId, previewCtx.variantId, "sale", amount)
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = element.props as any
  const { type, style } = element
  // keep props alias for compatibility
  const props = p

  switch (type) {
    case "hero":
      return (
        <div
          style={{
            background: p.backgroundType === "gradient"
              ? `linear-gradient(135deg, ${str(p.gradientFrom, "#1a1a2e")}, ${str(p.gradientTo, "#16213e")})`
              : str(p.backgroundColor, "#1a1a2e"),
            padding: style.padding || "80px 40px",
            textAlign: style.textAlign || "center",
          }}
        >
          <div className="max-w-3xl mx-auto">
            {p.preHeadline && (
              <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#a78bfa" }}>
                {str(p.preHeadline)}
              </p>
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4" style={{ color: style.color || "#ffffff" }}>
              {str(p.headline)}
            </h1>
            {p.subheadline && (
              <p className="text-xl mb-8 opacity-80" style={{ color: style.color || "#ffffff" }}>
                {str(p.subheadline)}
              </p>
            )}
            {p.buttonText && (
              <div>
                <a
                  href={str(p.buttonUrl, "#")}
                  className="inline-block px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105"
                  style={{ background: "#6366f1", color: "#fff" }}
                >
                  {str(p.buttonText)}
                </a>
                {p.guarantee && (
                  <p className="text-xs mt-3 opacity-60" style={{ color: style.color || "#ffffff" }}>
                    {str(p.guarantee)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )

    case "headline":
      const Tag = (str(p.tag, "h1")) as keyof React.JSX.IntrinsicElements
      return (
        <div style={{ padding: style.padding || "16px 24px" }}>
          <Tag
            style={{
              fontSize: style.fontSize || "2.5rem",
              fontWeight: style.fontWeight || "700",
              textAlign: style.textAlign as "center" || "center",
              color: style.color || "#111827",
              lineHeight: "1.2",
            }}
          >
            {props.text as string}
          </Tag>
        </div>
      )

    case "paragraph":
      return (
        <div style={{ padding: style.padding || "8px 24px" }}>
          <p
            style={{
              fontSize: style.fontSize || "1.1rem",
              textAlign: style.textAlign as "center" || "center",
              color: style.color || "#6b7280",
              lineHeight: style.lineHeight || "1.7",
              maxWidth: "720px",
              margin: "0 auto",
            }}
          >
            {props.text as string}
          </p>
        </div>
      )

    case "button":
      return (
        <div style={{ padding: style.padding || "16px 24px", textAlign: (style.textAlign as "center") || "center" }}>
          <a
            href={props.url as string || "#"}
            className="inline-block font-bold rounded-xl transition-all hover:scale-105 hover:shadow-lg active:scale-95"
            style={{
              padding: props.size === "large" ? "20px 48px" : props.size === "small" ? "10px 24px" : "14px 36px",
              fontSize: props.size === "large" ? "1.2rem" : "1rem",
              background: props.variant === "secondary" ? "#e5e7eb" : props.variant === "danger" ? "#ef4444" : "#6366f1",
              color: props.variant === "secondary" ? "#111827" : "#ffffff",
            }}
          >
            {props.text as string}
          </a>
          {props.subtext && (
            <p className="text-xs text-gray-400 mt-2">{props.subtext as string}</p>
          )}
        </div>
      )

    case "image":
      return (
        <div style={{ padding: style.padding || "16px 24px", textAlign: (style.textAlign as "center") || "center" }}>
          <img
            src={props.src as string}
            alt={props.alt as string || ""}
            style={{
              width: props.width as string || "100%",
              maxWidth: "100%",
              borderRadius: style.borderRadius || "0",
              display: "inline-block",
            }}
          />
          {props.caption && <p className="text-xs text-gray-400 mt-1">{props.caption as string}</p>}
        </div>
      )

    case "video":
      return (
        <div style={{ padding: style.padding || "16px 24px" }}>
          <div style={{ position: "relative", paddingTop: "56.25%" }}>
            <iframe
              src={props.url as string}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: "12px" }}
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )

    case "form":
      return (
        <div style={{ padding: style.padding || "32px", backgroundColor: style.backgroundColor || "#f9fafb", borderRadius: style.borderRadius || "16px", margin: "0 24px" }}>
          <form
            className="max-w-md mx-auto"
            onSubmit={(e) => {
              e.preventDefault()
              trackOptin()
              const form = e.currentTarget as HTMLFormElement
              celebrateConversion(form.getBoundingClientRect())
              form.reset()
              const note = form.querySelector<HTMLElement>("[data-success-note]")
              if (note) note.style.display = "block"
            }}
          >
            {props.headline && (
              <h3 className="text-xl font-bold text-center text-gray-900 mb-4">{props.headline as string}</h3>
            )}
            {(props.fields as string[] || ["email"]).map((field) => (
              <div key={field} className="mb-3">
                <input
                  required
                  name={field}
                  type={field === "email" ? "email" : "text"}
                  placeholder={field === "email" ? "Enter your email..." : field === "name" ? "Your name..." : field === "phone" ? "Phone number..." : field}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-white text-lg"
              style={{ background: "#6366f1" }}
            >
              {props.buttonText as string || "Get Instant Access!"}
            </button>
            {props.privacyText && (
              <p className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                🔒 {props.privacyText as string}
              </p>
            )}
            <p
              data-success-note
              style={{ display: "none" }}
              className="text-sm text-emerald-600 text-center mt-3 font-semibold"
            >
              ✓ Submitted — opt-in recorded
            </p>
          </form>
        </div>
      )

    case "countdown":
      return (
        <div style={{ padding: style.padding || "24px", textAlign: "center", backgroundColor: style.backgroundColor || "#fff7ed" }}>
          {props.headline && (
            <p className="text-sm font-semibold text-amber-800 uppercase tracking-wider mb-3">
              {props.headline as string}
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            {[
              { label: "Hours", value: "00" },
              { label: "Minutes", value: String(props.minutes || 15).padStart(2, "0") },
              { label: "Seconds", value: "00" },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-3xl font-black text-gray-900 border border-orange-100">
                  {value}
                </div>
                <span className="text-xs font-medium text-amber-700 mt-1 uppercase">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )

    case "testimonial":
      return (
        <div style={{ padding: style.padding || "32px", backgroundColor: style.backgroundColor || "#f9fafb", borderRadius: style.borderRadius || "16px", margin: "0 24px" }}>
          <div className="max-w-lg mx-auto">
            <div className="flex gap-0.5 mb-3 justify-center">
              {Array.from({ length: props.rating as number || 5 }).map((_, i) => (
                <span key={i} className="text-amber-400 text-xl">★</span>
              ))}
            </div>
            <p className="text-lg font-medium text-gray-800 italic text-center mb-4">
              &ldquo;{props.quote as string}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                {(props.name as string || "?")[0]}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{props.name as string}</p>
                {props.role && <p className="text-xs text-gray-500">{props.role as string}</p>}
              </div>
            </div>
          </div>
        </div>
      )

    case "pricing":
      return (
        <div style={{ padding: style.padding || "32px 24px", textAlign: "center" }}>
          <div
            className="relative max-w-sm mx-auto rounded-2xl border-2 overflow-hidden"
            style={{ borderColor: props.popular ? "#6366f1" : "#e5e7eb" }}
          >
            {props.popular && (
              <div className="bg-indigo-600 text-white text-xs font-bold py-1 uppercase tracking-wider">
                Most Popular
              </div>
            )}
            <div className="p-8">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{props.name as string}</p>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-2xl font-bold text-gray-500">{props.currency as string || "$"}</span>
                <span className="text-5xl font-black text-gray-900">{props.price as string}</span>
                {props.period && <span className="text-gray-400">/{props.period as string}</span>}
              </div>
              {props.originalPrice && (
                <p className="text-sm text-gray-400 line-through mb-4">
                  {props.currency as string}{props.originalPrice as string}
                </p>
              )}
              <ul className="text-left space-y-2 mb-6">
                {(props.features as string[] || []).map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-emerald-500 font-bold">✓</span> {feat}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={(e) => {
                  trackSale(Number(props.price) || 0)
                  celebrateConversion((e.currentTarget as HTMLButtonElement).getBoundingClientRect())
                }}
                className="w-full py-4 rounded-xl font-bold text-white"
                style={{ background: "#6366f1" }}
              >
                {props.ctaText as string || "Get Started"}
              </button>
            </div>
          </div>
        </div>
      )

    case "divider":
      return (
        <div style={{ padding: style.padding || "8px 24px" }}>
          <hr
            style={{
              borderStyle: props.style as string || "solid",
              width: props.width as string || "80%",
              margin: "0 auto",
              borderColor: "#e5e7eb",
            }}
          />
        </div>
      )

    case "spacer":
      return <div style={{ height: props.height as string || "40px" }} />

    case "list":
      return (
        <div style={{ padding: style.padding || "16px 40px" }}>
          <ul className="space-y-3 max-w-2xl mx-auto">
            {(props.items as string[] || []).map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-bold text-lg shrink-0" style={{ color: props.iconColor as string || "#10b981" }}>
                  {props.icon as string || "✓"}
                </span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )

    case "guarantee":
      return (
        <div style={{ padding: style.padding || "24px 32px", textAlign: "center" }}>
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl mb-4">
              🛡️
            </div>
            <p className="text-xl font-bold text-gray-900 mb-2">{props.headline as string}</p>
            <p className="text-gray-600 text-sm leading-relaxed">{props.text as string}</p>
          </div>
        </div>
      )

    case "social_proof":
      return (
        <div style={{ padding: style.padding || "16px 24px", textAlign: "center" }}>
          <div className="flex items-center justify-center gap-2">
            {props.showAvatars && (
              <div className="flex -space-x-2">
                {["👩", "👨", "👩‍💼", "👨‍💼", "🧑"].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-sm"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm font-semibold text-gray-700">
              <span className="font-black text-indigo-600">{props.count as string}</span>+ {props.text as string}
            </p>
          </div>
        </div>
      )

    case "faq":
      return (
        <div style={{ padding: style.padding || "32px 24px" }}>
          <div className="max-w-2xl mx-auto">
            {props.headline && (
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">{props.headline as string}</h3>
            )}
            <div className="space-y-4">
              {(props.items as { question: string; answer: string }[] || []).map((item, i) => (
                <details key={i} className="group border border-gray-200 rounded-xl">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-gray-900 list-none">
                    {item.question}
                    <span className="text-indigo-600 text-xl group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">{item.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      )

    case "order_bump":
      return (
        <OrderBumpElement
          element={element}
          previewMode={!!previewCtx}
          onAccept={(amount, rect) => {
            trackSale(amount)
            celebrateConversion(rect)
          }}
        />
      )

    case "exit_popup":
      return previewCtx ? (
        <ExitPopupElement
          element={element}
          onConvert={(rect) => {
            trackOptin()
            celebrateConversion(rect)
          }}
        />
      ) : (
        <ExitPopupPreview element={element} />
      )

    default:
      return (
        <div className="p-4 text-center text-sm text-muted-foreground bg-muted">
          Unknown element: {type}
        </div>
      )
  }
}

function OrderBumpElement({
  element,
  previewMode,
  onAccept,
}: {
  element: PageElement
  previewMode: boolean
  onAccept: (amount: number, rect: DOMRect) => void
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = element.props as any
  const accent = (p.accentColor as string) || "#f59e0b"
  const [accepted, setAccepted] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const price = Number(p.price) || 0

  return (
    <div style={{ padding: element.style.padding || "16px 24px" }}>
      <div
        ref={ref}
        className="max-w-xl mx-auto rounded-xl border-2 border-dashed transition-all"
        style={{ borderColor: accept(accepted, accent), background: accepted ? `${accent}15` : "#fffbeb" }}
      >
        <label className="flex items-start gap-3 p-4 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => {
              const next = e.currentTarget.checked
              setAccepted(next)
              if (next && previewMode && ref.current) {
                onAccept(price, ref.current.getBoundingClientRect())
              }
            }}
            className="mt-1 w-5 h-5 rounded shrink-0 cursor-pointer"
            style={{ accentColor: accent }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-base font-bold" style={{ color: accent }}>
                {p.headline as string}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: accent, color: "white" }}>
                +{p.currency || "$"}{p.price}
                {p.originalPrice && (
                  <span className="ml-1 line-through opacity-60">{p.currency || "$"}{p.originalPrice}</span>
                )}
              </span>
            </div>
            <p className="font-semibold text-gray-900">{p.offer as string}</p>
            <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{p.description as string}</p>
            {accepted && (
              <p className="text-xs font-semibold mt-2 flex items-center gap-1" style={{ color: accent }}>
                ✓ Added to your order
              </p>
            )}
          </div>
        </label>
      </div>
    </div>
  )
}

function accept(accepted: boolean, color: string) {
  return accepted ? color : "#fbbf24"
}

function ExitPopupPreview({ element }: { element: PageElement }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = element.props as any
  return (
    <div style={{ padding: "16px 24px" }}>
      <div className="max-w-md mx-auto rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 p-5 text-center">
        <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 mb-2">
          🚪 Exit-Intent Popup (preview-only)
        </p>
        <p className="text-base font-bold text-gray-900">{p.headline as string}</p>
        <p className="text-sm text-gray-600 mt-1">{p.subheadline as string}</p>
        <button className="mt-3 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold pointer-events-none">
          {p.buttonText as string}
        </button>
        <p className="text-[10px] text-gray-400 mt-2">Triggers when visitor moves cursor toward closing the tab</p>
      </div>
    </div>
  )
}

function ExitPopupElement({
  element,
  onConvert,
}: {
  element: PageElement
  onConvert: (rect: DOMRect) => void
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = element.props as any
  const sessionKey = `b4c:exit-popup-shown:${element.id}`
  const [open, setOpen] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    if (sessionStorage.getItem(sessionKey)) return

    const delayMs = Math.max(0, Number(p.delaySeconds ?? 1) * 1000)
    let armedAt = 0
    const armTimer = window.setTimeout(() => {
      armedAt = Date.now()
    }, delayMs)

    const handleMouseLeave = (e: MouseEvent) => {
      if (Date.now() < armedAt) return
      // top-only exit intent: cursor leaving via the top of the viewport
      if (e.clientY <= 0 && (e.relatedTarget === null || (e.relatedTarget as Element | null)?.nodeName === "HTML")) {
        sessionStorage.setItem(sessionKey, "1")
        setOpen(true)
      }
    }
    document.addEventListener("mouseleave", handleMouseLeave)
    return () => {
      window.clearTimeout(armTimer)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [sessionKey, p.delaySeconds])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in"
      style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false)
      }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{
          animation: "exit-popup-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="p-8 text-center">
          <div className="text-5xl mb-3">⏳</div>
          <h3 className="text-2xl font-extrabold text-gray-900 leading-tight">
            {p.headline as string}
          </h3>
          <p className="text-gray-600 mt-2">{p.subheadline as string}</p>
          <button
            ref={buttonRef}
            onClick={() => {
              const rect = buttonRef.current?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0)
              onConvert(rect)
              setOpen(false)
            }}
            className="mt-5 w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
          >
            {p.buttonText as string}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="mt-3 text-xs text-gray-400 hover:text-gray-700 underline"
          >
            {p.dismissText as string}
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes exit-popup-pop {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
