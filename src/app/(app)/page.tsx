import { Header } from "@/components/layout/Header"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { RecentFunnels } from "@/components/dashboard/RecentFunnels"
import { QuickStart } from "@/components/dashboard/QuickStart"
import { LaunchHero } from "@/components/dashboard/LaunchHero"

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <LaunchHero />
        <DashboardStats />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentFunnels />
          </div>
          <div>
            <QuickStart />
          </div>
        </div>
      </div>
    </>
  )
}
