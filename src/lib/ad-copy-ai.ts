import type { AdChannel, AdObjective, AdCreative } from "@/lib/types"
import { nanoid } from "nanoid"

interface CopyContext {
  funnelName: string
  objective: AdObjective
  channel: AdChannel
  interests: string[]
  ageRange: [number, number]
}

const HEADLINE_TEMPLATES: Record<AdObjective, string[]> = {
  leads: [
    "Free {asset}: {benefit} (No Email Required)",
    "Steal Our {framework_count}-Step {topic} Playbook",
    "The {topic} Mistake {audience} Make (Fix Inside)",
    "{topic} 101: A Free Crash Course That Actually Works",
    "Why Most {audience} Fail at {topic} — And How To Fix It",
  ],
  sales: [
    "Your {topic} Transformation Starts Today — {discount} Off",
    "Get {result} in {timeframe} — Limited Spots",
    "Skip the Trial-and-Error: {topic} Mastery for {audience}",
    "Done-For-You {topic} System (Risk-Free Guarantee)",
    "From {pain} to {desire} in {timeframe}",
  ],
  traffic: [
    "{brand} — Built for {audience} Who Are Done Settling",
    "The {topic} Tool {users_count}+ {audience} Trust",
    "Discover Why Top {audience} Switched to {brand}",
    "{topic} Without the {pain}",
  ],
  awareness: [
    "{audience}: Meet the New Standard in {topic}",
    "Introducing {brand} — Built Different",
    "What if {topic} Could Actually Be {desire}?",
  ],
  engagement: [
    "Quick Question for {audience}: {hook_question}",
    "{audience}, would you rather {choice_a} or {choice_b}?",
    "Drop a {emoji} if {relatable_truth}",
  ],
  app_installs: [
    "The #1 {topic} App for {audience}",
    "Get {result} Right From Your Phone",
    "{topic}, Simplified — Free in App Store",
  ],
}

const BODY_TEMPLATES: Record<AdObjective, string[]> = {
  leads: [
    "After {iterations} of testing, we found the {framework_count} hooks that consistently {result}. We're giving the playbook away — no hoops, no email walls.",
    "{audience} keep asking us how we {result}. Here's the {topic} framework, distilled into {framework_count} actionable steps. Yours, free.",
    "Every {audience} we've talked to wishes they had this when starting out. So we wrote it down. {benefit} — instant access.",
  ],
  sales: [
    "Stop Googling. Start applying. The {topic} system that already worked for {users_count}+ {audience} is open for one week. {discount} off ends Friday.",
    "You don't need another course. You need the {framework_count}-part system that took us from {pain} to {desire}. Inside today.",
    "30-day money-back. No questions. {users_count}+ {audience} can't be wrong about this.",
  ],
  traffic: [
    "Drag-drop builder · {feature_a} · {feature_b} · Real analytics. {free_trial} free trial — no card needed.",
    "Built for {audience} who want {benefit} without the technical headaches. See it in action.",
  ],
  awareness: [
    "We rebuilt {topic} from scratch with {audience} in mind. The result? {benefit}.",
    "{brand} is what happens when {audience} get tired of {pain} and decide to fix it themselves.",
  ],
  engagement: [
    "We're curious — drop your answer in the comments. The most upvoted reply gets a free month of {brand}.",
    "Real talk: {relatable_truth}. Are we right? 👇",
  ],
  app_installs: [
    "Your {topic} workflow, in your pocket. Free download — no in-app upsells.",
    "Built for speed. Designed for {audience}. {free_trial}-day free trial inside the app.",
  ],
}

const CTA_OPTIONS: Record<AdObjective, string[]> = {
  leads: ["Get Free Access", "Download Now", "Send Me The Guide", "Claim My Copy"],
  sales: ["Enroll Now", "Buy Now", "Get Started Today", "Lock In My Spot"],
  traffic: ["Learn More", "Start Free Trial", "See Demo", "Visit Site"],
  awareness: ["Discover More", "Watch Now", "See Why", "Find Out"],
  engagement: ["Comment Below", "Share Your Take", "Vote Now", "Tell Us"],
  app_installs: ["Install Free", "Get the App", "Download Now"],
}

function pick<T>(arr: T[], avoid?: T[]): T {
  const choices = avoid && avoid.length < arr.length ? arr.filter((x) => !avoid.includes(x)) : arr
  return choices[Math.floor(Math.random() * choices.length)]
}

function fillTemplate(template: string, ctx: CopyContext, vars: Record<string, string>): string {
  const allVars: Record<string, string> = {
    asset: pick(["eBook", "Cheat Sheet", "Playbook", "Toolkit", "Guide", "Checklist", "Workshop"]),
    benefit: pick([
      "10x Your Conversion Rate",
      "2x Revenue in 90 Days",
      "Build a 6-Figure Funnel",
      "Add $10k/mo Predictably",
      "Cut Ad Spend in Half",
    ]),
    framework_count: pick(["3", "5", "7", "9"]),
    topic: ctx.interests[0] ?? "Marketing",
    audience: pick(["Founders", "Coaches", "Agencies", "Creators", "Marketers", "E-com Owners"]),
    users_count: pick(["10,000", "5,000", "2,500", "12,000"]),
    discount: pick(["50%", "40%", "30%", "$200"]),
    result: pick([
      "double conversions",
      "cut CPL by 60%",
      "scale past $50k/mo",
      "fill a webinar in 48h",
    ]),
    timeframe: pick(["30 days", "90 days", "6 weeks", "this quarter"]),
    pain: pick([
      "burning cash on traffic that doesn't convert",
      "the hamster wheel of low-ticket sales",
      "guessing at copy",
      "complicated software",
    ]),
    desire: pick([
      "predictable monthly revenue",
      "a self-running funnel",
      "a waitlist of buyers",
      "freedom to focus on the work that matters",
    ]),
    iterations: pick(["3 years", "500+ funnels", "1,000+ A/B tests", "8 figures of ad spend"]),
    brand: "FunnelPro",
    feature_a: pick(["A/B testing", "Smart routing", "Real-time analytics", "Order bumps"]),
    feature_b: pick(["1-click upsells", "Email automation", "Conversion goals", "Audience segmentation"]),
    free_trial: pick(["7-day", "14-day", "30-day"]),
    hook_question: pick([
      "what's the #1 thing holding back your funnel?",
      "if you doubled tomorrow, what changes?",
      "what would you do with one extra hour a day?",
    ]),
    choice_a: "Build it yourself",
    choice_b: "Use a proven system",
    emoji: pick(["🔥", "💯", "🚀", "✋"]),
    relatable_truth: pick([
      "you've abandoned more shopping carts this year than you'd care to admit",
      "you opened 3 marketing courses and finished none",
      "your funnel works but you have no idea why",
    ]),
    ...vars,
  }
  return template.replace(/\{(\w+)\}/g, (_, key) => allVars[key] ?? key)
}

export function generateAdCopy(context: CopyContext, count = 3): AdCreative[] {
  const headlineTemplates = HEADLINE_TEMPLATES[context.objective] ?? HEADLINE_TEMPLATES.leads
  const bodyTemplates = BODY_TEMPLATES[context.objective] ?? BODY_TEMPLATES.leads
  const ctaOptions = CTA_OPTIONS[context.objective] ?? CTA_OPTIONS.leads

  const usedHeadlines: string[] = []
  const usedBodies: string[] = []
  const usedCtas: string[] = []

  return Array.from({ length: count }, (_, i) => {
    const ht = pick(headlineTemplates, usedHeadlines)
    usedHeadlines.push(ht)
    const bt = pick(bodyTemplates, usedBodies)
    usedBodies.push(bt)
    const ct = pick(ctaOptions, usedCtas)
    usedCtas.push(ct)
    return {
      id: nanoid(),
      name: `AI Variant ${String.fromCharCode(65 + i)}`,
      headline: fillTemplate(ht, context, {}),
      body: fillTemplate(bt, context, {}),
      cta: ct,
    }
  })
}
