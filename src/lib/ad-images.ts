export interface StockImage {
  id: string
  url: string
  thumb: string
  category: string
  alt: string
}

export const STOCK_IMAGE_CATEGORIES = [
  "business", "lifestyle", "technology", "finance", "wellness", "abstract",
] as const

export const STOCK_IMAGES: StockImage[] = [
  // Business
  { id: "biz-1", url: "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=1200", thumb: "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=400", category: "business", alt: "Person at laptop with charts" },
  { id: "biz-2", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200", thumb: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400", category: "business", alt: "Analytics dashboard" },
  { id: "biz-3", url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200", thumb: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400", category: "business", alt: "Team meeting" },
  { id: "biz-4", url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200", thumb: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400", category: "business", alt: "Modern office" },

  // Lifestyle
  { id: "life-1", url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200", thumb: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400", category: "lifestyle", alt: "Group around laptop" },
  { id: "life-2", url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200", thumb: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400", category: "lifestyle", alt: "Brainstorm" },
  { id: "life-3", url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200", thumb: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400", category: "lifestyle", alt: "Working at cafe" },
  { id: "life-4", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200", thumb: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400", category: "lifestyle", alt: "Friends working" },

  // Technology
  { id: "tech-1", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200", thumb: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400", category: "technology", alt: "Circuit board" },
  { id: "tech-2", url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200", thumb: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400", category: "technology", alt: "Code on screen" },
  { id: "tech-3", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200", thumb: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400", category: "technology", alt: "Workspace setup" },

  // Finance
  { id: "fin-1", url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200", thumb: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400", category: "finance", alt: "Stock charts" },
  { id: "fin-2", url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200", thumb: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400", category: "finance", alt: "Calculator with charts" },

  // Wellness
  { id: "well-1", url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200", thumb: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400", category: "wellness", alt: "Yoga at sunrise" },
  { id: "well-2", url: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=1200", thumb: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400", category: "wellness", alt: "Meditation" },

  // Abstract
  { id: "abs-1", url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200", thumb: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400", category: "abstract", alt: "Gradient pattern" },
  { id: "abs-2", url: "https://images.unsplash.com/photo-1614851099175-e5b30eb6f696?w=1200", thumb: "https://images.unsplash.com/photo-1614851099175-e5b30eb6f696?w=400", category: "abstract", alt: "Holographic" },
]
