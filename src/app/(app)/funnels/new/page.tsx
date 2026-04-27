"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFunnelStore } from "@/lib/store/funnel-store"

export default function NewFunnelPage() {
  const router = useRouter()
  const { createFunnel } = useFunnelStore()

  useEffect(() => {
    const funnel = createFunnel("My New Funnel")
    router.replace(`/funnels/${funnel.id}`)
  }, [])

  return null
}
