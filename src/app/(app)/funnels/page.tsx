import { Header } from "@/components/layout/Header"
import { FunnelsList } from "@/components/funnels/FunnelsList"

export default function FunnelsPage() {
  return (
    <>
      <Header title="My Funnels" />
      <div className="flex-1 overflow-y-auto p-6">
        <FunnelsList />
      </div>
    </>
  )
}
