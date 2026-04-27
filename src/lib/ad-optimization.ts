import { nanoid } from "nanoid"
import type { AdCampaign, AdCreative, Funnel, OptimizationInsight } from "@/lib/types"

export interface CampaignMetrics {
  ctr: number
  cpc: number
  cpm: number
  cpa: number | null
  roas: number | null
  conversionRate: number
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  budgetSpentPct: number
  daysActive: number
}

export function computeMetrics(campaign: AdCampaign): CampaignMetrics {
  const { stats } = campaign
  const conversions = stats.optins + stats.sales
  const ctr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0
  const cpc = stats.clicks > 0 ? stats.spend / stats.clicks : 0
  const cpm = stats.impressions > 0 ? (stats.spend / stats.impressions) * 1000 : 0
  const cpa = conversions > 0 ? stats.spend / conversions : null
  const roas = stats.spend > 0 ? stats.revenue / stats.spend : null
  const conversionRate = stats.clicks > 0 ? (conversions / stats.clicks) * 100 : 0

  const startTs = new Date(campaign.startDate).getTime()
  const now = Date.now()
  const daysActive = Math.max(1, Math.round((now - startTs) / (24 * 60 * 60 * 1000)))
  const expectedSpend = campaign.dailyBudget * daysActive
  const budgetSpentPct = expectedSpend > 0 ? (stats.spend / expectedSpend) * 100 : 0

  return {
    ctr: round(ctr, 2),
    cpc: round(cpc, 2),
    cpm: round(cpm, 2),
    cpa: cpa !== null ? round(cpa, 2) : null,
    roas: roas !== null ? round(roas, 2) : null,
    conversionRate: round(conversionRate, 2),
    spend: stats.spend,
    impressions: stats.impressions,
    clicks: stats.clicks,
    conversions,
    revenue: stats.revenue,
    budgetSpentPct: round(budgetSpentPct, 0),
    daysActive,
  }
}

function round(n: number, digits: number) {
  const f = Math.pow(10, digits)
  return Math.round(n * f) / f
}

export function generateInsights(campaign: AdCampaign, funnel: Funnel | undefined): OptimizationInsight[] {
  const m = computeMetrics(campaign)
  const insights: OptimizationInsight[] = []

  if (campaign.status === "paused" || campaign.status === "draft") {
    if (m.roas !== null && m.roas >= 2.5 && campaign.status === "paused") {
      insights.push(make(campaign.id, "opportunity",
        "Strong ROAS — consider reactivating",
        `This campaign was profitable at ${m.roas}x ROAS. Restarting could resume revenue. Re-check creative freshness first.`,
        { label: "Reactivate", type: "scale_budget", payload: { setStatus: "active" } }
      ))
    }
    return insights
  }

  // Sample-size guard
  if (m.impressions < 1000) {
    insights.push(make(campaign.id, "info",
      "Still learning — give it 24–48 hours",
      `${m.impressions.toLocaleString()} impressions so far. Most platforms need 50+ conversions or 1k+ impressions before optimization decisions are reliable.`,
    ))
    return insights
  }

  // CTR analysis
  const ctrThresholds: Record<string, { low: number; great: number }> = {
    meta: { low: 0.9, great: 2.0 },
    google: { low: 1.5, great: 4.0 },
    tiktok: { low: 1.0, great: 2.5 },
  }
  const t = ctrThresholds[campaign.channel]
  if (m.ctr < t.low) {
    insights.push(make(campaign.id, "warning",
      `CTR ${m.ctr}% below ${campaign.channel} baseline (${t.low}%)`,
      "Creative likely doesn't resonate with this audience. Test new hook, swap image, or rewrite headline.",
      { label: "Rotate creative", type: "rotate_creative" }
    ))
  } else if (m.ctr >= t.great) {
    insights.push(make(campaign.id, "opportunity",
      `Excellent CTR (${m.ctr}%) — winning creative`,
      "Creative is overperforming. Save as a template, build look-alike variations, and consider increasing budget.",
      { label: "Scale +20% budget", type: "scale_budget", payload: { multiplier: 1.2 } }
    ))
  }

  // ROAS analysis
  if (m.roas !== null) {
    if (m.roas < 1) {
      insights.push(make(campaign.id, "critical",
        `Unprofitable: ROAS ${m.roas}x`,
        `Spending $${m.spend.toFixed(0)} returned $${m.revenue.toFixed(0)}. Pause and investigate: bad audience match, weak landing page, or wrong offer-market fit.`,
        { label: "Pause campaign", type: "pause" }
      ))
    } else if (m.roas >= 3 && m.budgetSpentPct >= 80) {
      insights.push(make(campaign.id, "opportunity",
        `Highly profitable: ROAS ${m.roas}x — scale budget`,
        `Hitting daily budget consistently and returning $${m.roas} per $1 spent. Increase daily budget by 20–30%, monitor for the next 3 days.`,
        { label: "Scale +25%", type: "scale_budget", payload: { multiplier: 1.25 } }
      ))
    }
  }

  // CPA spike vs early baseline
  if (m.cpa !== null && m.daysActive >= 5 && m.cpa > 0) {
    if (m.cpa > 50 && campaign.objective === "leads") {
      insights.push(make(campaign.id, "warning",
        `Lead CPA at $${m.cpa} — verify benchmark`,
        "If your customer LTV justifies this cost, you're fine. Otherwise, narrow audience to higher-intent interests or rebuild the form for fewer fields.",
        { label: "Narrow audience", type: "narrow_audience" }
      ))
    }
  }

  // Funnel conversion drop
  if (funnel && m.clicks > 100) {
    const expectedRate = 12
    if (m.conversionRate < expectedRate * 0.5) {
      insights.push(make(campaign.id, "warning",
        `Low landing conversion (${m.conversionRate}%)`,
        `Of ${m.clicks.toLocaleString()} clicks, only ${m.conversions} converted. Likely the bottleneck is the landing page, not the ad. Run an A/B test on the first step.`,
        { label: "A/B test landing", type: "improve_landing", payload: { funnelId: campaign.funnelId } }
      ))
    }
  }

  // Audience too narrow detector
  if (campaign.audience.interests.length === 1 && m.impressions < 5000) {
    insights.push(make(campaign.id, "info",
      "Single-interest targeting may be limiting reach",
      "With only one interest you may be hitting frequency cap fast. Add 2–3 related interests or test broad targeting + creative-led targeting.",
      { label: "Broaden audience", type: "broaden_audience" }
    ))
  }

  // Budget pacing
  if (m.budgetSpentPct < 60 && m.daysActive >= 3) {
    insights.push(make(campaign.id, "info",
      `Under-pacing: ${m.budgetSpentPct}% of expected spend`,
      "Budget isn't fully delivering. Audience may be too narrow, bid too low, or creative not engaging enough to compete in auction.",
    ))
  }

  // Frequency / fatigue heuristic
  if (m.impressions / Math.max(1, (m.clicks * 100)) > 0.5 && m.daysActive >= 7) {
    // crude fatigue estimate when same eyeballs see ad many times
    insights.push(make(campaign.id, "info",
      "Possible creative fatigue at day " + m.daysActive,
      "After a week, even good creatives lose juice. Refresh the image or rewrite the hook to keep CTR up.",
      { label: "Rotate creative", type: "rotate_creative" }
    ))
  }

  return insights.slice(0, 6)
}

function make(
  campaignId: string,
  severity: OptimizationInsight["severity"],
  title: string,
  description: string,
  action?: OptimizationInsight["action"]
): OptimizationInsight {
  return { id: nanoid(), campaignId, severity, title, description, action }
}

export interface SimulatedBurst {
  spend: number
  impressions: number
  clicks: number
  optins: number
  sales: number
  revenue: number
  visits: number
  creativeId?: string
}

export function pickCreative(creatives: AdCreative[]): AdCreative | undefined {
  if (creatives.length === 0) return undefined
  if (creatives.length === 1) return creatives[0]
  // Slight bias toward better-performing creatives (Thompson-style by CTR)
  const weights = creatives.map((c) => {
    const ctr = c.stats && c.stats.impressions > 0 ? c.stats.clicks / c.stats.impressions : 0.01
    return Math.max(0.01, ctr)
  })
  const total = weights.reduce((a, b) => a + b, 0)
  const r = Math.random() * total
  let acc = 0
  for (let i = 0; i < creatives.length; i++) {
    acc += weights[i]
    if (r < acc) return creatives[i]
  }
  return creatives[creatives.length - 1]
}

export function bestCreative(creatives: AdCreative[]): AdCreative | null {
  const withData = creatives.filter((c) => c.stats && c.stats.impressions >= 100)
  if (withData.length < 2) return null
  return withData.reduce((best, c) => {
    const cBest = best.stats!.impressions > 0 ? best.stats!.clicks / best.stats!.impressions : 0
    const cCur = c.stats!.impressions > 0 ? c.stats!.clicks / c.stats!.impressions : 0
    return cCur > cBest ? c : best
  })
}

/**
 * Generate a realistic 60-second performance burst for a campaign.
 * Spend rises proportional to dailyBudget, impressions/clicks scaled to channel CPM/CTR baselines,
 * conversion rates blended with the linked funnel's actual conversion data.
 */
export function simulateCampaignBurst(campaign: AdCampaign, funnel: Funnel | undefined): SimulatedBurst {
  const channelCpm: Record<string, number> = { meta: 12, google: 18, tiktok: 8 }
  const channelCtr: Record<string, number> = { meta: 1.4, google: 3.2, tiktok: 1.7 }
  const cpm = channelCpm[campaign.channel] ?? 12
  const baselineCtr = channelCtr[campaign.channel] ?? 1.4

  const creative = pickCreative(campaign.creatives)

  // Burst represents ~5% of a daily budget
  const spend = round(jitter(campaign.dailyBudget * 0.05, 0.25), 2)
  const impressions = Math.round((spend / cpm) * 1000)
  const clicks = Math.max(0, Math.round(impressions * (baselineCtr / 100) * jitter(1, 0.3)))

  // Funnel conversion rate (visit → conversion). If funnel has data, use it; else baseline 8%.
  const funnelConvRate =
    funnel && funnel.stats.visitors > 0
      ? Math.max(2, funnel.stats.conversionRate || 8)
      : 8

  const isSalesObjective = campaign.objective === "sales"
  const conversions = Math.max(0, Math.round(clicks * (funnelConvRate / 100) * jitter(1, 0.4)))
  const optins = isSalesObjective ? Math.round(conversions * 0.2) : conversions
  const sales = isSalesObjective ? conversions - optins : 0
  const aov = 97 // assumed avg order value
  const revenue = round(sales * aov * jitter(1, 0.15), 2)

  return { spend, impressions, clicks, optins, sales, revenue, visits: clicks, creativeId: creative?.id }
}

function jitter(value: number, pct: number): number {
  const factor = 1 + (Math.random() * 2 - 1) * pct
  return value * factor
}
