import { Header } from "@/components/layout/Header"
import { AdsList } from "@/components/ads/AdsList"

export default function AdsPage() {
  return (
    <>
      <Header title="Ads Manager" />
      <div className="flex-1 overflow-y-auto p-6">
        <AdsList />
      </div>
    </>
  )
}
