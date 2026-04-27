"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wand2, ArrowRight, Sparkles, Target, FileText, Eye, Zap } from "lucide-react"
import { LaunchWizard } from "./LaunchWizard"

const STEPS = [
  { n: 1, label: "Goal", icon: Target },
  { n: 2, label: "Offer", icon: FileText },
  { n: 3, label: "Preview", icon: Eye },
  { n: 4, label: "Launch", icon: Zap },
]

export function LaunchHero() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white">
        {/* Mesh gradient backgrounds */}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(circle at 15% 20%, rgba(99,102,241,0.30), transparent 45%), radial-gradient(circle at 85% 80%, rgba(236,72,153,0.22), transparent 50%), radial-gradient(circle at 70% 20%, rgba(168,85,247,0.18), transparent 45%)",
          }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Subtle radial highlight at top */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-3xl rounded-full" />

        {/* Content */}
        <div className="relative px-6 sm:px-10 py-10 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left side */}
          <div className="lg:col-span-7">
            {/* Tiny pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-sm text-[11px] text-zinc-300 mb-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="font-medium tracking-wide">AI-guided · 5 minutes · No tech needed</span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05]">
              Your funnel <span className="text-zinc-400">and</span> first ad.
              <span className="block mt-1 bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-amber-100 bg-clip-text text-transparent">
                Live in 5 minutes.
              </span>
            </h2>

            {/* Subheading */}
            <p className="text-zinc-400 mt-4 max-w-lg leading-relaxed text-sm sm:text-base">
              Pick a goal, tell us about your offer — we&apos;ll build the page and write the ad copy with AI. No code, no friction.
            </p>

            {/* CTA */}
            <div className="mt-7 flex items-center gap-4 flex-wrap">
              <Button
                size="lg"
                onClick={() => setOpen(true)}
                className="group bg-white text-zinc-900 hover:bg-zinc-50 font-semibold gap-2 shadow-2xl shadow-indigo-500/20 h-11 px-5 rounded-xl"
              >
                <Wand2 className="w-4 h-4" />
                <span>Start step by step</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Sparkles className="w-3 h-3" />
                AI writes your copy
              </div>
            </div>
          </div>

          {/* Right side: Step journey */}
          <div className="lg:col-span-5 lg:pl-4">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-indigo-400/40 via-fuchsia-400/30 to-amber-300/20" />

              <div className="space-y-3">
                {STEPS.map((s) => {
                  const Icon = s.icon
                  return (
                    <div
                      key={s.n}
                      className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/10 transition-all"
                    >
                      <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-zinc-300" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[9px] font-bold flex items-center justify-center shadow-lg">
                          {s.n}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-zinc-200">{s.label}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <LaunchWizard open={open} onOpenChange={setOpen} />
    </>
  )
}
