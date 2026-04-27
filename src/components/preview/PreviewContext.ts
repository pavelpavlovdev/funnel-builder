"use client"

import { createContext, useContext } from "react"

export interface PreviewContextValue {
  funnelId: string
  stepId: string | null
  variantId: string | null
}

export const PreviewContext = createContext<PreviewContextValue | null>(null)

export function usePreviewContext(): PreviewContextValue | null {
  return useContext(PreviewContext)
}
