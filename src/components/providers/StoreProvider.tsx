"use client"

import { useEffect } from "react"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { sendTelemetry } from "@/lib/telemetry"

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useFunnelStore.getState().setHasHydrated(true)

    // Fire telemetry once per session if user opted in (respects 24h cooldown)
    const { telemetry, updateTelemetry } = useFunnelStore.getState()
    if (telemetry.enabled) {
      sendTelemetry(telemetry.instanceId, telemetry.lastSentAt, (sentAt) => {
        updateTelemetry({ lastSentAt: sentAt })
      })
    }
  }, [])

  return <>{children}</>
}
