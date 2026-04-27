import type { FunnelStep, StepVariant } from "@/lib/types"

const SESSION_KEY = "b4c:variant-bucket"

type VariantMap = Record<string, string>

function readBucketMap(): VariantMap {
  if (typeof window === "undefined") return {}
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as VariantMap) : {}
  } catch {
    return {}
  }
}

function writeBucketMap(map: VariantMap) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(map))
  } catch {
    // ignore
  }
}

function pickWeighted(variants: StepVariant[]): StepVariant {
  const total = variants.reduce((acc, v) => acc + Math.max(v.weight, 0), 0)
  if (total <= 0) return variants[0]
  const r = Math.random() * total
  let acc = 0
  for (const v of variants) {
    acc += Math.max(v.weight, 0)
    if (r < acc) return v
  }
  return variants[variants.length - 1]
}

export function resolveVariant(step: FunnelStep): StepVariant | null {
  if (!step.variants || step.variants.length === 0) return null
  const map = readBucketMap()
  const existingId = map[step.id]
  const existing = existingId ? step.variants.find((v) => v.id === existingId) : undefined
  if (existing) return existing
  const picked = pickWeighted(step.variants)
  writeBucketMap({ ...map, [step.id]: picked.id })
  return picked
}

export function clearVariantBucket(stepId?: string) {
  if (typeof window === "undefined") return
  if (!stepId) {
    sessionStorage.removeItem(SESSION_KEY)
    return
  }
  const map = readBucketMap()
  delete map[stepId]
  writeBucketMap(map)
}
