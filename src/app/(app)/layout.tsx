import { Sidebar } from "@/components/layout/Sidebar"
import { StoreProvider } from "@/components/providers/StoreProvider"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </StoreProvider>
  )
}
