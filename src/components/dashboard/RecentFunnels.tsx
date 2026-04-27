"use client"

import { useFunnelStore } from "@/lib/store/funnel-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, BarChart3, ArrowRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { formatDistanceToNow } from "@/lib/date-utils"

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  draft: "bg-amber-100 text-amber-700 border-amber-200",
  paused: "bg-gray-100 text-gray-600 border-gray-200",
  archived: "bg-red-100 text-red-600 border-red-200",
}

export function RecentFunnels() {
  const { funnels, deleteFunnel, duplicateFunnel, _hasHydrated } = useFunnelStore()
  const recent = _hasHydrated ? funnels.slice(0, 5) : []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-base font-semibold">Recent Funnels</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/funnels" className="gap-1 text-primary">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {recent.map((funnel) => (
            <div key={funnel.id} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/40 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground truncate">{funnel.name}</p>
                  <Badge variant="outline" className={`text-xs shrink-0 ${statusColors[funnel.status]}`}>
                    {funnel.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{funnel.steps.length} steps</span>
                  <span>•</span>
                  <span>{funnel.stats.visitors.toLocaleString()} visitors</span>
                  {funnel.stats.conversionRate > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 font-medium">{funnel.stats.conversionRate}% conv.</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{formatDistanceToNow(funnel.updatedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link href={`/funnels/${funnel.id}/analytics`} title="Analytics">
                    <BarChart3 className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link href={`/funnels/${funnel.id}`} title="Edit">
                    <Edit className="w-4 h-4" />
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/funnels/${funnel.id}`}>Edit Funnel</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicateFunnel(funnel.id)}>
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/preview/${funnel.id}`} target="_blank">
                        <Eye className="w-3.5 h-3.5 mr-2" /> Preview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteFunnel(funnel.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {recent.length === 0 && (
            <div className="px-6 py-12 text-center text-muted-foreground text-sm">
              No funnels yet.{" "}
              <Link href="/funnels/new" className="text-primary hover:underline">
                Create your first funnel
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
