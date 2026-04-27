"use client"

import { useEffect } from "react"
import { useFunnelStore } from "@/lib/store/funnel-store"

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Mark store as hydrated after first client render.
    // onRehydrateStorage also fires this, but useEffect covers the
    // case where localStorage is empty and hydration never triggers.
    useFunnelStore.getState().setHasHydrated(true)
  }, [])

  return <>{children}</>
}
