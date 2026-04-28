import Groq from "groq-sdk"
import type { GenerateFunnelResponse } from "@/lib/types"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

interface GenerateFunnelRequest {
  businessType: string
  businessName: string
  description: string
  targetAudience?: string
  goal: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as GenerateFunnelRequest
  const { businessType, businessName, description, targetAudience, goal } = body

  if (!businessName?.trim() || !description?.trim()) {
    return Response.json({ error: "Missing required fields" }, { status: 400 })
  }

  const goalContext = {
    leads:   "capture emails/leads with a free offer or lead magnet",
    sales:   "sell a product, course, or service directly",
    webinar: "register attendees for a live webinar or online event",
    traffic: "drive traffic to a landing page for awareness",
  }[goal] ?? goal

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 512,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: "You are a world-class direct-response copywriter. Always respond with valid JSON only — no markdown, no explanation.",
      },
      {
        role: "user",
        content: `Generate marketing funnel copy for this business:

Business type: ${businessType}
Business/brand name: ${businessName}
What they offer: ${description}
Goal: ${goalContext}${targetAudience ? `\nTarget audience: ${targetAudience}` : ""}

Return a JSON object with exactly these fields:
{
  "headline": "Powerful benefit-focused landing page headline (max 10 words)",
  "subheadline": "Supporting sentence that builds desire (max 20 words)",
  "cta": "Short action CTA button text (2-4 words)",
  "adHeadline": "Compelling ad headline for Facebook/Instagram (max 8 words)",
  "adBody": "Two-sentence ad body copy that hooks attention and drives clicks",
  "audienceKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "funnelGoal": "${goal}"
}

Rules:
- Make copy specific to their actual offer and goal, not generic
- Use power words and emotion
- audienceKeywords: interest-based targeting keywords for Meta/Google ads${targetAudience ? ` (expand on: ${targetAudience})` : ""}`,
      },
    ],
  })

  const text = completion.choices[0]?.message?.content ?? ""
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return Response.json({ error: "Failed to parse AI response" }, { status: 500 })
  }

  const result = JSON.parse(jsonMatch[0]) as GenerateFunnelResponse
  return Response.json(result)
}
