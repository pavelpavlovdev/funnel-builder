"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, DollarSign, MousePointerClick, ArrowUpRight, ArrowDownRight } from "lucide-react"

const stats = [
  {
    label: "Total Visitors",
    value: "14,161",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    label: "Total Optins",
    value: "1,247",
    change: "+8.2%",
    trend: "up",
    icon: MousePointerClick,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    label: "Total Sales",
    value: "312",
    change: "+23.1%",
    trend: "up",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    label: "Total Revenue",
    value: "$46,800",
    change: "-2.4%",
    trend: "down",
    icon: DollarSign,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight
        return (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className={`flex items-center text-xs font-semibold ${stat.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
                  <TrendIcon className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
