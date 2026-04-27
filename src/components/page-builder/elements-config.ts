import type { ElementType, PageElement } from "@/lib/types"

export interface ElementDef {
  type: ElementType
  label: string
  icon: string
  category: "layout" | "content" | "media" | "conversion" | "social"
  defaultProps: Record<string, unknown>
  defaultStyle: Record<string, string>
}

export const ELEMENTS: ElementDef[] = [
  // Layout
  {
    type: "hero",
    label: "Hero Section",
    icon: "🎯",
    category: "layout",
    defaultProps: {
      headline: "Transform Your Business with Our Solution",
      subheadline: "Join 10,000+ entrepreneurs who already use our platform",
      buttonText: "Get Started Free",
      buttonUrl: "#",
      backgroundType: "color",
      backgroundColor: "#1a1a2e",
    },
    defaultStyle: { padding: "80px 40px", textAlign: "center", color: "#ffffff" },
  },
  {
    type: "headline",
    label: "Headline",
    icon: "H",
    category: "content",
    defaultProps: { text: "Your Compelling Headline Here", tag: "h1" },
    defaultStyle: { fontSize: "2.5rem", fontWeight: "700", textAlign: "center", padding: "16px 24px", color: "#111827" },
  },
  {
    type: "paragraph",
    label: "Paragraph",
    icon: "¶",
    category: "content",
    defaultProps: { text: "Add your description here. Make it compelling and focused on the benefits for your reader." },
    defaultStyle: { fontSize: "1.1rem", textAlign: "center", padding: "8px 24px", color: "#6b7280", lineHeight: "1.7" },
  },
  {
    type: "button",
    label: "Button",
    icon: "▶",
    category: "conversion",
    defaultProps: {
      text: "YES! I Want Access Now",
      url: "#",
      size: "large",
      variant: "primary",
      subtext: "30-Day Money-Back Guarantee",
    },
    defaultStyle: { padding: "16px 24px", textAlign: "center" },
  },
  {
    type: "image",
    label: "Image",
    icon: "🖼",
    category: "media",
    defaultProps: {
      src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
      alt: "Product image",
      width: "100%",
    },
    defaultStyle: { padding: "16px 24px", textAlign: "center" },
  },
  {
    type: "video",
    label: "Video",
    icon: "▶️",
    category: "media",
    defaultProps: {
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      aspectRatio: "16/9",
      autoplay: false,
    },
    defaultStyle: { padding: "16px 24px" },
  },
  {
    type: "form",
    label: "Opt-in Form",
    icon: "📝",
    category: "conversion",
    defaultProps: {
      headline: "Get Instant Access",
      fields: ["name", "email"],
      buttonText: "Send Me The Free Guide!",
      privacyText: "We respect your privacy. No spam ever.",
    },
    defaultStyle: { padding: "32px", backgroundColor: "#f9fafb", borderRadius: "16px" },
  },
  {
    type: "countdown",
    label: "Countdown Timer",
    icon: "⏰",
    category: "conversion",
    defaultProps: {
      headline: "Offer Expires In:",
      minutes: 15,
      style: "flip",
      expiredText: "Offer has expired!",
    },
    defaultStyle: { padding: "24px", textAlign: "center", backgroundColor: "#fff7ed" },
  },
  {
    type: "testimonial",
    label: "Testimonial",
    icon: "💬",
    category: "social",
    defaultProps: {
      quote: "This completely transformed my business! I went from struggling to making $10k/month in just 90 days.",
      name: "Sarah Johnson",
      role: "Online Entrepreneur",
      avatar: "",
      rating: 5,
    },
    defaultStyle: { padding: "32px", backgroundColor: "#f9fafb", borderRadius: "16px" },
  },
  {
    type: "pricing",
    label: "Pricing Box",
    icon: "💲",
    category: "conversion",
    defaultProps: {
      name: "Pro Package",
      price: "97",
      originalPrice: "197",
      currency: "$",
      period: "one-time",
      features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
      ctaText: "Get Instant Access",
      popular: true,
    },
    defaultStyle: { padding: "32px 24px", textAlign: "center" },
  },
  {
    type: "divider",
    label: "Divider",
    icon: "—",
    category: "layout",
    defaultProps: { style: "solid", width: "80%" },
    defaultStyle: { padding: "8px 24px" },
  },
  {
    type: "spacer",
    label: "Spacer",
    icon: "⬜",
    category: "layout",
    defaultProps: { height: "40px" },
    defaultStyle: {},
  },
  {
    type: "list",
    label: "Bullet List",
    icon: "•",
    category: "content",
    defaultProps: {
      items: [
        "Benefit one – explain the value here",
        "Benefit two – make it specific and measurable",
        "Benefit three – address a key pain point",
      ],
      icon: "✓",
      iconColor: "#10b981",
    },
    defaultStyle: { padding: "16px 40px" },
  },
  {
    type: "guarantee",
    label: "Guarantee Badge",
    icon: "🛡️",
    category: "social",
    defaultProps: {
      headline: "100% Money-Back Guarantee",
      text: "If you're not completely satisfied within 30 days, we'll refund every penny. No questions asked.",
      days: 30,
    },
    defaultStyle: { padding: "24px 32px", textAlign: "center" },
  },
  {
    type: "social_proof",
    label: "Social Proof",
    icon: "👥",
    category: "social",
    defaultProps: {
      count: "10,247",
      text: "happy customers",
      showAvatars: true,
    },
    defaultStyle: { padding: "16px 24px", textAlign: "center" },
  },
  {
    type: "faq",
    label: "FAQ Section",
    icon: "❓",
    category: "content",
    defaultProps: {
      headline: "Frequently Asked Questions",
      items: [
        { question: "Is this right for me?", answer: "Yes! This works for anyone who wants to..." },
        { question: "How long until I see results?", answer: "Most people start seeing results within..." },
        { question: "What if I'm not satisfied?", answer: "We offer a 30-day money-back guarantee..." },
      ],
    },
    defaultStyle: { padding: "32px 24px" },
  },
  {
    type: "order_bump",
    label: "Order Bump",
    icon: "🎁",
    category: "conversion",
    defaultProps: {
      headline: "YES! Add this to my order",
      offer: "Bonus Resource Pack",
      description: "30+ premium templates, scripts and swipe files. A perfect complement to your purchase.",
      price: "27",
      originalPrice: "97",
      currency: "$",
      accentColor: "#f59e0b",
    },
    defaultStyle: { padding: "16px 24px" },
  },
  {
    type: "exit_popup",
    label: "Exit-Intent Popup",
    icon: "🚪",
    category: "conversion",
    defaultProps: {
      headline: "Wait! Don't leave empty-handed",
      subheadline: "Get 20% OFF your first order — today only.",
      buttonText: "Yes, Send Me My Discount",
      dismissText: "No thanks, I'll pay full price",
      delaySeconds: 1,
    },
    defaultStyle: { padding: "0" },
  },
]

export const ELEMENT_CATEGORIES = [
  { id: "layout", label: "Layout", icon: "🏗️" },
  { id: "content", label: "Content", icon: "📝" },
  { id: "media", label: "Media", icon: "🎬" },
  { id: "conversion", label: "Conversion", icon: "🎯" },
  { id: "social", label: "Social Proof", icon: "💬" },
] as const

export function createElementFromDef(def: ElementDef): PageElement {
  return {
    id: Math.random().toString(36).slice(2),
    type: def.type,
    props: { ...def.defaultProps },
    style: { ...def.defaultStyle },
  }
}
