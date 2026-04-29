import { readFileSync, existsSync } from "fs"
import { join } from "path"
import type { TelemetryPayload } from "@/lib/types"

const TELEMETRY_FILE = join(process.cwd(), "data", "telemetry.jsonl")

export interface BenchmarkStats {
  totalInstances: number
  totalPayloads: number
  firstSeen: string | null
  lastSeen: string | null

  // Conversion
  avgConversionRate: number
  medianConversionRate: number
  conversionRateDistribution: { label: string; count: number }[]

  // Elements
  topElements: { type: string; total: number; avgPerInstance: number }[]

  // Step types
  topStepTypes: { type: string; total: number }[]

  // Channels
  channelDistribution: { channel: string; instances: number }[]

  // ROAS
  avgROAS: number | null
  roasDistribution: { label: string; count: number }[]

  // Features
  avgFunnelCount: number
  avgCampaignCount: number
  abTestAdoptionPct: number
  contactAdoptionPct: number

  // Geo
  topTimezones: { timezone: string; count: number }[]

  // Traffic totals (sum across all)
  totalVisitors: number
  totalOptins: number
  totalSales: number
}

function loadPayloads(): TelemetryPayload[] {
  if (!existsSync(TELEMETRY_FILE)) return []
  try {
    const raw = readFileSync(TELEMETRY_FILE, "utf8")
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as TelemetryPayload)
  } catch {
    return []
  }
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function bucketConvRate(rate: number): string {
  if (rate === 0) return "0%"
  if (rate < 2) return "< 2%"
  if (rate < 5) return "2–5%"
  if (rate < 10) return "5–10%"
  if (rate < 20) return "10–20%"
  return "20%+"
}

function bucketROAS(roas: number): string {
  if (roas < 1) return "< 1x"
  if (roas < 2) return "1–2x"
  if (roas < 3) return "2–3x"
  if (roas < 5) return "3–5x"
  return "5x+"
}

function aggregate(payloads: TelemetryPayload[]): BenchmarkStats {
  // Deduplicate by instanceId — keep latest payload per instance
  const byInstance = new Map<string, TelemetryPayload>()
  for (const p of payloads) {
    const existing = byInstance.get(p.instanceId)
    if (!existing || p.sentAt > existing.sentAt) {
      byInstance.set(p.instanceId, p)
    }
  }
  const latest = Array.from(byInstance.values())

  const totalInstances = latest.length
  const totalPayloads = payloads.length

  const dates = payloads.map((p) => p.sentAt).sort()
  const firstSeen = dates[0] ?? null
  const lastSeen = dates[dates.length - 1] ?? null

  // Conversion rates
  const convRates = latest.map((p) => p.avgConversionRate).filter((r) => r > 0)
  const avgConversionRate =
    convRates.length > 0
      ? Math.round((convRates.reduce((a, b) => a + b, 0) / convRates.length) * 10) / 10
      : 0
  const medianConversionRate = Math.round(median(convRates) * 10) / 10

  const convBuckets: Record<string, number> = {}
  for (const r of convRates) {
    const b = bucketConvRate(r)
    convBuckets[b] = (convBuckets[b] ?? 0) + 1
  }
  const convOrder = ["0%", "< 2%", "2–5%", "5–10%", "10–20%", "20%+"]
  const conversionRateDistribution = convOrder.map((label) => ({ label, count: convBuckets[label] ?? 0 }))

  // Element types
  const elementTotals: Record<string, number> = {}
  const elementInstanceCount: Record<string, number> = {}
  for (const p of latest) {
    for (const [type, count] of Object.entries(p.elementTypeDistribution ?? {})) {
      elementTotals[type] = (elementTotals[type] ?? 0) + count
      elementInstanceCount[type] = (elementInstanceCount[type] ?? 0) + 1
    }
  }
  const topElements = Object.entries(elementTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([type, total]) => ({
      type,
      total,
      avgPerInstance: totalInstances > 0 ? Math.round((total / totalInstances) * 10) / 10 : 0,
    }))

  // Step types
  const stepTotals: Record<string, number> = {}
  for (const p of latest) {
    for (const [type, count] of Object.entries(p.stepTypeDistribution ?? {})) {
      stepTotals[type] = (stepTotals[type] ?? 0) + count
    }
  }
  const topStepTypes = Object.entries(stepTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([type, total]) => ({ type, total }))

  // Channels
  const channelMap: Record<string, Set<string>> = {}
  for (const p of latest) {
    for (const ch of p.activeChannels ?? []) {
      if (!channelMap[ch]) channelMap[ch] = new Set()
      channelMap[ch].add(p.instanceId)
    }
  }
  const channelDistribution = Object.entries(channelMap)
    .map(([channel, set]) => ({ channel, instances: set.size }))
    .sort((a, b) => b.instances - a.instances)

  // ROAS
  const roasValues = latest.map((p) => p.avgROAS).filter((r): r is number => r !== null && r > 0)
  const avgROAS =
    roasValues.length > 0
      ? Math.round((roasValues.reduce((a, b) => a + b, 0) / roasValues.length) * 100) / 100
      : null
  const roasBuckets: Record<string, number> = {}
  for (const r of roasValues) {
    const b = bucketROAS(r)
    roasBuckets[b] = (roasBuckets[b] ?? 0) + 1
  }
  const roasOrder = ["< 1x", "1–2x", "2–3x", "3–5x", "5x+"]
  const roasDistribution = roasOrder.map((label) => ({ label, count: roasBuckets[label] ?? 0 }))

  // Feature adoption
  const avgFunnelCount =
    totalInstances > 0
      ? Math.round((latest.reduce((a, p) => a + p.funnelCount, 0) / totalInstances) * 10) / 10
      : 0
  const avgCampaignCount =
    totalInstances > 0
      ? Math.round((latest.reduce((a, p) => a + p.campaignCount, 0) / totalInstances) * 10) / 10
      : 0
  const abTestAdoptionPct =
    totalInstances > 0
      ? Math.round((latest.filter((p) => p.abTestCount > 0).length / totalInstances) * 100)
      : 0
  const contactAdoptionPct =
    totalInstances > 0
      ? Math.round((latest.filter((p) => p.contactCount > 0).length / totalInstances) * 100)
      : 0

  // Timezones
  const tzMap: Record<string, number> = {}
  for (const p of latest) {
    if (p.timezone) tzMap[p.timezone] = (tzMap[p.timezone] ?? 0) + 1
  }
  const topTimezones = Object.entries(tzMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([timezone, count]) => ({ timezone, count }))

  // Totals
  const totalVisitors = latest.reduce((a, p) => a + p.totalVisitors, 0)
  const totalOptins = latest.reduce((a, p) => a + p.totalOptins, 0)
  const totalSales = latest.reduce((a, p) => a + p.totalSales, 0)

  return {
    totalInstances,
    totalPayloads,
    firstSeen,
    lastSeen,
    avgConversionRate,
    medianConversionRate,
    conversionRateDistribution,
    topElements,
    topStepTypes,
    channelDistribution,
    avgROAS,
    roasDistribution,
    avgFunnelCount,
    avgCampaignCount,
    abTestAdoptionPct,
    contactAdoptionPct,
    topTimezones,
    totalVisitors,
    totalOptins,
    totalSales,
  }
}

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret")
  if (secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payloads = loadPayloads()
  const stats = aggregate(payloads)

  return Response.json(stats)
}
