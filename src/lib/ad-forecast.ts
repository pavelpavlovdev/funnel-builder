import type { AdChannel, AdObjective, AudienceTargeting, Funnel } from "@/lib/types"

export interface ForecastInput {
  channel: AdChannel
  objective: AdObjective
  dailyBudget: number
  audience: AudienceTargeting
  funnel: Funnel | undefined
}

export interface ForecastResult {
  audienceSize: { min: number; max: number; tier: "narrow" | "balanced" | "broad" | "very_broad" }
  daily: {
    impressions: { min: number; max: number }
    clicks: { min: number; max: number }
    conversions: { min: number; max: number }
    cpa: { min: number; max: number } | null
    spend: number
  }
  weekly: {
    spend: number
    conversions: { min: number; max: number }
    revenue: { min: number; max: number } | null
    roas: { min: number; max: number } | null
  }
}

const CHANNEL_BASELINES: Record<string, { cpm: number; ctr: number }> = {
  meta: { cpm: 12, ctr: 1.4 },
  google: { cpm: 18, ctr: 3.2 },
  tiktok: { cpm: 8, ctr: 1.7 },
}

// Population estimates by country (active users on social/search, in millions)
const POPULATION: Record<string, number> = {
  US: 240, CA: 30, UK: 50, DE: 60, FR: 50, ES: 40, IT: 45, AU: 20, JP: 95,
  IN: 600, BR: 130, MX: 90, NL: 14, SE: 8, DK: 5, NO: 5, FI: 5,
}

export function estimateAudienceSize(audience: AudienceTargeting): ForecastResult["audienceSize"] {
  // Base population from countries
  const total = audience.countries.reduce(
    (acc, code) => acc + (POPULATION[code.toUpperCase()] ?? 30),
    0
  )

  // Age range factor
  const ageSpan = Math.max(1, audience.ageMax - audience.ageMin)
  const ageFactor = Math.min(1, ageSpan / 47) // 13–60 covers most

  // Interest narrowing — each interest narrows by ~30%
  const interestFactor = Math.max(0.05, Math.pow(0.7, audience.interests.length))

  // Lookalike narrows further
  const lookalikeFactor = audience.lookalikePct ? audience.lookalikePct / 10 : 1

  const center = total * 1_000_000 * ageFactor * interestFactor * lookalikeFactor
  const min = Math.round(center * 0.7)
  const max = Math.round(center * 1.4)

  let tier: "narrow" | "balanced" | "broad" | "very_broad" = "balanced"
  if (center < 100_000) tier = "narrow"
  else if (center < 2_000_000) tier = "balanced"
  else if (center < 20_000_000) tier = "broad"
  else tier = "very_broad"

  return { min, max, tier }
}

export function forecastCampaign(input: ForecastInput): ForecastResult {
  const audienceSize = estimateAudienceSize(input.audience)
  const baseline = CHANNEL_BASELINES[input.channel] ?? CHANNEL_BASELINES.meta

  // Adjust CTR by audience tier (narrow targeting = higher CTR; broad = lower)
  const ctrFactor = {
    narrow: 1.3,
    balanced: 1.0,
    broad: 0.85,
    very_broad: 0.7,
  }[audienceSize.tier]
  const effectiveCtr = baseline.ctr * ctrFactor

  // Adjust CPM (narrow = pricier auction, very_broad = cheaper but lower quality)
  const cpmFactor = {
    narrow: 1.4,
    balanced: 1.0,
    broad: 0.9,
    very_broad: 0.85,
  }[audienceSize.tier]
  const effectiveCpm = baseline.cpm * cpmFactor

  const dailyImpressionsCenter = (input.dailyBudget / effectiveCpm) * 1000
  const dailyClicksCenter = dailyImpressionsCenter * (effectiveCtr / 100)

  // Conversion rate from funnel data, fallback by objective
  const funnelConv = input.funnel && input.funnel.stats.visitors > 0
    ? Math.max(2, input.funnel.stats.conversionRate)
    : { leads: 12, sales: 3, traffic: 0, awareness: 0, engagement: 0, app_installs: 5 }[input.objective] || 5

  const dailyConvCenter = dailyClicksCenter * (funnelConv / 100)

  // CPA
  const cpaCenter = dailyConvCenter > 0 ? input.dailyBudget / dailyConvCenter : null
  const cpa = cpaCenter !== null
    ? { min: Math.round(cpaCenter * 0.7 * 100) / 100, max: Math.round(cpaCenter * 1.4 * 100) / 100 }
    : null

  // Estimated AOV from funnel
  const aov = input.funnel && input.funnel.stats.sales > 0
    ? input.funnel.stats.revenue / input.funnel.stats.sales
    : 97

  const isSalesObjective = input.objective === "sales"
  const dailyRevenueCenter = isSalesObjective ? dailyConvCenter * aov : 0
  const dailyRoasCenter = isSalesObjective && input.dailyBudget > 0 ? dailyRevenueCenter / input.dailyBudget : null

  const weeklySpend = input.dailyBudget * 7

  return {
    audienceSize,
    daily: {
      impressions: { min: Math.round(dailyImpressionsCenter * 0.75), max: Math.round(dailyImpressionsCenter * 1.3) },
      clicks: { min: Math.round(dailyClicksCenter * 0.7), max: Math.round(dailyClicksCenter * 1.4) },
      conversions: { min: Math.round(dailyConvCenter * 0.6), max: Math.round(dailyConvCenter * 1.5) },
      cpa,
      spend: input.dailyBudget,
    },
    weekly: {
      spend: weeklySpend,
      conversions: { min: Math.round(dailyConvCenter * 7 * 0.6), max: Math.round(dailyConvCenter * 7 * 1.5) },
      revenue: isSalesObjective
        ? { min: Math.round(dailyRevenueCenter * 7 * 0.6), max: Math.round(dailyRevenueCenter * 7 * 1.5) }
        : null,
      roas: dailyRoasCenter !== null
        ? { min: Math.round(dailyRoasCenter * 0.6 * 10) / 10, max: Math.round(dailyRoasCenter * 1.5 * 10) / 10 }
        : null,
    },
  }
}

export function buildUtmUrl(funnelDomain: string | undefined, funnelId: string, utm?: { source?: string; medium?: string; campaign?: string; content?: string; term?: string }): string {
  const base = funnelDomain ? `https://${funnelDomain.replace(/^https?:\/\//, "")}` : `https://app.example.com/preview/${funnelId}`
  const params: string[] = []
  if (utm?.source) params.push(`utm_source=${encodeURIComponent(utm.source)}`)
  if (utm?.medium) params.push(`utm_medium=${encodeURIComponent(utm.medium)}`)
  if (utm?.campaign) params.push(`utm_campaign=${encodeURIComponent(utm.campaign)}`)
  if (utm?.content) params.push(`utm_content=${encodeURIComponent(utm.content)}`)
  if (utm?.term) params.push(`utm_term=${encodeURIComponent(utm.term)}`)
  return params.length > 0 ? `${base}?${params.join("&")}` : base
}
