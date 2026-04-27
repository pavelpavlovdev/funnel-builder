"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { useFunnelStore } from "@/lib/store/funnel-store"
import type { FunnelPage, PageElement } from "@/lib/types"

const MAX_HISTORY = 50

export function useBuilderHistory(funnelId: string, page: FunnelPage) {
  const { updatePage } = useFunnelStore()
  const historyRef = useRef<PageElement[][]>([JSON.parse(JSON.stringify(page.elements))])
  const ptrRef = useRef(0)
  const skipRef = useRef(false)
  const [, setTick] = useState(0)
  const bump = useCallback(() => setTick((n) => n + 1), [])

  // Auto-push to history whenever page.elements changes (except during undo/redo)
  const prevElementsRef = useRef(page.elements)
  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false
      return
    }
    if (page.elements !== prevElementsRef.current) {
      prevElementsRef.current = page.elements
      const trimmed = historyRef.current.slice(0, ptrRef.current + 1)
      trimmed.push(JSON.parse(JSON.stringify(page.elements)))
      if (trimmed.length > MAX_HISTORY) trimmed.shift()
      historyRef.current = trimmed
      ptrRef.current = trimmed.length - 1
      bump()
    }
  }, [page.elements, bump])

  const undo = useCallback(() => {
    if (ptrRef.current <= 0) return
    skipRef.current = true
    ptrRef.current--
    updatePage(funnelId, page.id, {
      elements: JSON.parse(JSON.stringify(historyRef.current[ptrRef.current])),
    })
    bump()
  }, [funnelId, page.id, updatePage, bump])

  const redo = useCallback(() => {
    if (ptrRef.current >= historyRef.current.length - 1) return
    skipRef.current = true
    ptrRef.current++
    updatePage(funnelId, page.id, {
      elements: JSON.parse(JSON.stringify(historyRef.current[ptrRef.current])),
    })
    bump()
  }, [funnelId, page.id, updatePage, bump])

  return {
    undo,
    redo,
    canUndo: ptrRef.current > 0,
    canRedo: ptrRef.current < historyRef.current.length - 1,
    historyCount: historyRef.current.length,
  }
}
