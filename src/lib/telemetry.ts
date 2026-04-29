import type { TelemetryPayload } from "@/lib/types"

const APP_VERSION = "1.0.0"
const TELEMETRY_ENDPOINT = "/api/telemetry"

// Minimum gap between sends: 24 hours
const MIN_INTERVAL_MS = 24 * 60 * 60 * 1000

export function buildPayload(instanceId: string): TelemetryPayload | null {
  try {
    // Lazy import to avoid circular deps — read state directly
    const { useFunnelStore } = require("@/lib/store/funnel-store")
    const state = useFunnelStore.getState()
    const { funnels, campaigns, contacts, customDomains } = state

    const activeFunnels = funnels.filter((f: any) => f.status === "active")

    // Step type distribution
    const stepTypeDistribution: Record<string, number> = {}
    for (const f of funnels) {
      for (const s of f.steps) {
        stepTypeDistribution[s.stepType] = (stepTypeDistribution[s.stepType] ?? 0) + 1
      }
    }

    // Element type distribution
    const elementTypeDistribution: Record<string, number> = {}
    for (const f of funnels) {
      for (const p of f.pages) {
        for (const el of p.elements) {
          elementTypeDistribution[el.type] = (elementTypeDistribution[el.type] ?? 0) + 1
        }
      }
    }

    // Aggregated funnel stats
    const totalVisitors = funnels.reduce((acc: number, f: any) => acc + f.stats.visitors, 0)
    const totalOptins = funnels.reduce((acc: number, f: any) => acc + f.stats.optins, 0)
    const totalSales = funnels.reduce((acc: number, f: any) => acc + f.stats.sales, 0)
    const funnelsWithVisitors = funnels.filter((f: any) => f.stats.visitors > 0)
    const avgConversionRate =
      funnelsWithVisitors.length > 0
        ? funnelsWithVisitors.reduce((acc: number, f: any) => acc + f.stats.conversionRate, 0) /
          funnelsWithVisitors.length
        : 0

    // Campaigns
    const activeCampaigns = campaigns.filter((c: any) => c.status === "active")
    const channelSet = new Set<string>(activeCampaigns.map((c: any) => c.channel))
    const totalCampSpend = campaigns.reduce((acc: number, c: any) => acc + c.stats.spend, 0)
    const totalCampRevenue = campaigns.reduce((acc: number, c: any) => acc + c.stats.revenue, 0)
    const avgROAS = totalCampSpend > 0 ? Math.round((totalCampRevenue / totalCampSpend) * 100) / 100 : null

    // A/B test count
    const abTestCount = funnels.reduce(
      (acc: number, f: any) =>
        acc + f.steps.filter((s: any) => s.variants && s.variants.length > 1).length,
      0
    )

    return {
      instanceId,
      appVersion: APP_VERSION,
      sentAt: new Date().toISOString(),
      funnelCount: funnels.length,
      activeFunnelCount: activeFunnels.length,
      stepTypeDistribution,
      elementTypeDistribution,
      avgConversionRate: Math.round(avgConversionRate * 10) / 10,
      totalVisitors,
      totalOptins,
      totalSales,
      campaignCount: campaigns.length,
      activeCampaignCount: activeCampaigns.length,
      activeChannels: Array.from(channelSet),
      avgROAS,
      abTestCount,
      contactCount: contacts.length,
      customDomainCount: customDomains.length,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  } catch {
    return null
  }
}

export async function sendTelemetry(
  instanceId: string,
  lastSentAt: string | null,
  onSuccess: (sentAt: string) => void
): Promise<void> {
  // Respect 24-hour cooldown
  if (lastSentAt) {
    const elapsed = Date.now() - new Date(lastSentAt).getTime()
    if (elapsed < MIN_INTERVAL_MS) return
  }

  const payload = buildPayload(instanceId)
  if (!payload) return

  try {
    await fetch(TELEMETRY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    onSuccess(payload.sentAt)
  } catch {
    // Telemetry is best-effort — never throw
  }
}
