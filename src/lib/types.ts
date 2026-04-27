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

export interface FunnelStep {
  id: string
  name: string
  stepType: StepType
  pageId: string
  position: { x: number; y: number }
  nextStepId?: string
  upsellStepId?: string
  downsellStepId?: string
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
