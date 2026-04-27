"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Rocket, BookOpen, Video, Headphones, ArrowRight } from "lucide-react"
import Link from "next/link"

const items = [
  {
    icon: Rocket,
    title: "Create a Funnel",
    description: "Start from scratch or use a template",
    href: "/funnels/new",
    color: "text-primary bg-primary/10",
  },
  {
    icon: BookOpen,
    title: "Browse Templates",
    description: "200+ professional funnel templates",
    href: "/templates",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: Video,
    title: "Watch Tutorial",
    description: "Learn funnel building in 10 min",
    href: "#",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: Headphones,
    title: "Get Support",
    description: "Chat with our team 24/7",
    href: "#",
    color: "text-amber-600 bg-amber-50",
  },
]

export function QuickStart() {
  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-base font-semibold">Quick Start</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors group"
              >
                <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
