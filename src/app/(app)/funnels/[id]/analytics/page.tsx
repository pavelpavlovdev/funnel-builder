"use client"

import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard"
import { use } from "react"

export default function FunnelAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <>
      <Header
        title="Analytics"
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href={`/funnels/${id}`}>
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Funnel
            </Link>
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        <AnalyticsDashboard />
      </div>
    </>
  )
}
