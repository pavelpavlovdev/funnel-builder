import { Header } from "@/components/layout/Header"
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard"

export default function AnalyticsPage() {
  return (
    <>
      <Header title="Analytics" />
      <div className="flex-1 overflow-y-auto p-6">
        <AnalyticsDashboard />
      </div>
    </>
  )
}
