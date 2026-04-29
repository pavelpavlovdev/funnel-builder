export type StepType =
  | "optin"
  | "sales"
  | "order"
  | "upsell"
  | "downsell"
  | "thankyou"
  | "webinar"
  | "bridge"
  | "squeeze"

export type ElementType =
  | "hero"
  | "headline"
  | "paragraph"
  | "image"
  | "video"
  | "button"
  | "form"
  | "countdown"
  | "testimonial"
  | "pricing"
  | "divider"
  | "spacer"
  | "list"
  | "guarantee"
  | "social_proof"
  | "faq"
  | "order_bump"
  | "exit_popup"

export interface AnalyticsEvent {
  id: string
  type: "visit" | "optin" | "sale"
  funnelId: string
  stepId?: string
  variantId?: string
  amount?: number
  timestamp: string
  campaignId?: string
}

export type AdChannel = "meta" | "google" | "tiktok"

export type AdObjective =
  | "leads"
  | "sales"
  | "traffic"
  | "awareness"
  | "engagement"
  | "app_installs"

export type AdStatus = "draft" | "active" | "paused" | "completed"

export interface AudienceTargeting {
  countries: string[]
  ageMin: number
  ageMax: number
  genders: ("male" | "female" | "all")[]
  interests: string[]
  customAudiences?: string[]
  lookalikePct?: number
}

export interface AdCreative {
  id: string
  name?: string
  headline: string
  body: string
  cta: string
  imageUrl?: string
  videoUrl?: string
  stats?: AdCampaignStats
}

export type AdPlacement =
  | "feed"
  | "stories"
  | "reels"
  | "right_column"
  | "marketplace"
  | "search"
  | "display"
  | "youtube"
  | "in_feed"
  | "topview"

export type BiddingStrategy = "lowest_cost" | "cost_cap" | "bid_cap" | "manual_cpc"

export interface AdSchedule {
  startDate: string
  endDate?: string
  daypartingEnabled?: boolean
}

export interface UTMParameters {
  source?: string
  medium?: string
  campaign?: string
  content?: string
  term?: string
}

export interface AdCampaignStats {
  spend: number
  impressions: number
  clicks: number
  optins: number
  sales: number
  revenue: number
}

export interface AdCampaign {
  id: string
  name: string
  channel: AdChannel
  objective: AdObjective
  status: AdStatus
  funnelId: string
  dailyBudget: number
  totalBudget?: number
  startDate: string
  endDate?: string
  audience: AudienceTargeting
  creatives: AdCreative[]
  stats: AdCampaignStats
  createdAt: string
  updatedAt: string
  notes?: string
  placements?: AdPlacement[]
  bidding?: { strategy: BiddingStrategy; cap?: number }
  utm?: UTMParameters
  conversionEvent?: "optin" | "sale"
}

export interface OptimizationInsight {
  id: string
  campaignId: string
  severity: "critical" | "warning" | "opportunity" | "info"
  title: string
  description: string
  action?: { label: string; type: "scale_budget" | "pause" | "rotate_creative" | "narrow_audience" | "broaden_audience" | "improve_landing"; payload?: Record<string, unknown> }
}

export interface ElementStyle {
  // Typography
  textAlign?: "left" | "center" | "right" | "justify"
  fontSize?: string
  fontWeight?: string
  color?: string
  lineHeight?: string
  letterSpacing?: string
  fontStyle?: "normal" | "italic"
  textDecoration?: "none" | "underline" | "line-through"
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize"
  fontFamily?: string

  // Background
  backgroundColor?: string
  backgroundImage?: string
  backgroundSize?: string
  backgroundPosition?: string

  // Spacing
  padding?: string
  paddingTop?: string
  paddingRight?: string
  paddingBottom?: string
  paddingLeft?: string
  margin?: string
  marginTop?: string
  marginRight?: string
  marginBottom?: string
  marginLeft?: string

  // Size
  width?: string
  maxWidth?: string
  height?: string
  minHeight?: string

  // Border
  border?: string
  borderWidth?: string
  borderStyle?: "none" | "solid" | "dashed" | "dotted" | "double"
  borderColor?: string
  borderRadius?: string
  borderTopLeftRadius?: string
  borderTopRightRadius?: string
  borderBottomLeftRadius?: string
  borderBottomRightRadius?: string

  // Effects
  boxShadow?: string
  opacity?: string
  overflow?: string
  display?: string
}

export interface PageElement {
  id: string
  type: ElementType
  props: Record<string, unknown>
  style: ElementStyle
}

export interface FunnelPage {
  id: string
  name: string
  stepType: StepType
  elements: PageElement[]
  settings: {
    backgroundColor: string
    backgroundImage?: string
    maxWidth: string
    fontFamily: string
    seoTitle?: string
    seoDescription?: string
  }
}

export interface StepVariant {
  id: string
  name: string
  pageId: string
  weight: number
  stats: FunnelStats
}

export interface FunnelStep {
  id: string
  name: string
  stepType: StepType
  pageId: string
  position: { x: number; y: number }
  nextStepId?: string
  upsellStepId?: string
  downsellStepId?: string
  variants?: StepVariant[]
}

export interface FunnelStats {
  visitors: number
  optins: number
  sales: number
  revenue: number
  conversionRate: number
}

export interface Funnel {
  id: string
  name: string
  description: string
  thumbnail?: string
  status: "draft" | "active" | "paused" | "archived"
  steps: FunnelStep[]
  pages: FunnelPage[]
  stats: FunnelStats
  createdAt: string
  updatedAt: string
  templateId?: string
  domain?: string
  tags: string[]
}

export interface FunnelTemplate {
  id: string
  name: string
  description: string
  category: "lead_gen" | "sales" | "webinar" | "product" | "service" | "event" | "membership"
  thumbnail: string
  steps: Omit<FunnelStep, "id">[]
  tags: string[]
  popular?: boolean
}


export interface GenerateFunnelResponse {
  headline: string
  subheadline: string
  cta: string
  adHeadline: string
  adBody: string
  audienceKeywords: string[]
  funnelGoal: "leads" | "sales" | "traffic"
}

export interface Contact {
  id: string
  email: string
  name?: string
  phone?: string
  source: string
  funnelId: string
  tags: string[]
  createdAt: string
}

export interface CustomDomain {
  id: string
  domain: string
  verified: boolean
  funnelIds: string[]
  addedAt: string
}

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
}

export interface TelemetrySettings {
  enabled: boolean
  instanceId: string
  lastSentAt: string | null
}

export interface TelemetryPayload {
  instanceId: string
  appVersion: string
  sentAt: string
  // funnels
  funnelCount: number
  activeFunnelCount: number
  stepTypeDistribution: Record<string, number>
  elementTypeDistribution: Record<string, number>
  avgConversionRate: number
  totalVisitors: number
  totalOptins: number
  totalSales: number
  // campaigns
  campaignCount: number
  activeCampaignCount: number
  activeChannels: string[]
  avgROAS: number | null
  // features used
  abTestCount: number
  contactCount: number
  customDomainCount: number
  // env
  timezone: string
}
