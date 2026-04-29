"use client"

import { useState, useEffect } from "react"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { buildPayload } from "@/lib/telemetry"
import { BarChart3, Shield, Eye, ChevronDown, ChevronUp } from "lucide-react"

const INTEGRATIONS = [
  { name: "Mailchimp", icon: "📧" },
  { name: "Stripe", icon: "💳" },
  { name: "Zapier", icon: "⚡" },
  { name: "ActiveCampaign", icon: "📨" },
  { name: "ConvertKit", icon: "✉️" },
]

const COLLECTED: { label: string; example: string }[] = [
  { label: "Брой фунии и активни фунии", example: "funnelCount: 4, activeFunnelCount: 2" },
  { label: "Разпределение на типовете стъпки", example: "stepTypeDistribution: { optin: 3, sales: 1 }" },
  { label: "Разпределение на типовете елементи", example: "elementTypeDistribution: { hero: 2, form: 3 }" },
  { label: "Среден conversion rate (агрегиран)", example: "avgConversionRate: 4.2" },
  { label: "Общо посетители / opt-ins / продажби", example: "totalVisitors: 1240" },
  { label: "Брой кампании и активни канали", example: "activeChannels: [\"meta\", \"google\"]" },
  { label: "Среден ROAS", example: "avgROAS: 3.1" },
  { label: "Брой A/B тестове, контакти, домейни", example: "abTestCount: 2" },
  { label: "Часова зона", example: "timezone: \"Europe/Sofia\"" },
]

const NOT_COLLECTED = [
  "Имена, имейли или лични данни",
  "Съдържание на фунии, заглавия или текстове",
  "Данни на контактите ти",
  "IP адрес или точна локация",
  "Данни за плащания",
]

export default function SettingsPage() {
  const profile = useFunnelStore((s) => s.profile)
  const updateProfile = useFunnelStore((s) => s.updateProfile)
  const telemetry = useFunnelStore((s) => s.telemetry)
  const updateTelemetry = useFunnelStore((s) => s.updateTelemetry)
  const _hasHydrated = useFunnelStore((s) => s._hasHydrated)

  const [firstName, setFirstName] = useState(profile.firstName)
  const [lastName, setLastName] = useState(profile.lastName)
  const [email, setEmail] = useState(profile.email)
  const [showSample, setShowSample] = useState(false)
  const [samplePayload, setSamplePayload] = useState<object | null>(null)

  useEffect(() => {
    if (_hasHydrated) {
      setFirstName(profile.firstName)
      setLastName(profile.lastName)
      setEmail(profile.email)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated])

  const handleSave = () => {
    const first = firstName.trim()
    const last = lastName.trim()
    const mail = email.trim()
    if (!first || !mail) {
      toast.error("First name and email are required")
      return
    }
    updateProfile({ firstName: first, lastName: last, email: mail })
    toast.success("Profile saved")
  }

  const handleToggleTelemetry = (enabled: boolean) => {
    updateTelemetry({ enabled })
    toast.success(
      enabled
        ? "Благодаря! Помагаш за benchmark данните на общността."
        : "Telemetry изключена."
    )
  }

  const handleViewSample = () => {
    const payload = buildPayload(telemetry.instanceId)
    setSamplePayload(payload)
    setShowSample(true)
  }

  const initials = `${firstName[0] || "?"}${lastName[0] || ""}`.toUpperCase()

  return (
    <>
      <Header title="Settings" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={() => toast.info("Photo upload coming soon")}>
                Change Photo
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
            <Button size="sm" onClick={handleSave}>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Telemetry / Benchmark program */}
        <Card className={telemetry.enabled ? "border-emerald-200 bg-emerald-50/30" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    Benchmark Program
                    {telemetry.enabled && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] py-0 px-1.5">
                        Active
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Помогни на общността с анонимни данни за performance
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant={telemetry.enabled ? "outline" : "default"}
                  onClick={() => handleToggleTelemetry(!telemetry.enabled)}
                  className={telemetry.enabled ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50" : ""}
                >
                  {telemetry.enabled ? "Изключи" : "Включи"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Изпращаме агрегирани, анонимизирани метрики веднъж на 24 часа. Никакви лични данни — само числа за conversion rate, елементи и канали. Данните ни помагат да публикуваме безплатни industry benchmarks за всички.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* What IS collected */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <p className="text-xs font-semibold text-emerald-800">Какво събираме</p>
                </div>
                <ul className="space-y-1">
                  {COLLECTED.map((item) => (
                    <li key={item.label} className="text-[11px] text-emerald-900 flex gap-1.5">
                      <span className="text-emerald-500 shrink-0">✓</span>
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What is NOT collected */}
              <div className="rounded-lg border border-red-100 bg-red-50/40 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Shield className="w-3.5 h-3.5 text-red-500" />
                  <p className="text-xs font-semibold text-red-800">Какво НЕ събираме</p>
                </div>
                <ul className="space-y-1">
                  {NOT_COLLECTED.map((item) => (
                    <li key={item} className="text-[11px] text-red-900 flex gap-1.5">
                      <span className="text-red-400 shrink-0">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* View sample */}
            <div className="rounded-lg border border-border/60 bg-muted/30 overflow-hidden">
              <button
                onClick={() => {
                  if (!showSample) handleViewSample()
                  setShowSample(!showSample)
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Виж точно какво изпращаме (примерен payload)
                {showSample ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
              </button>
              {showSample && samplePayload && (
                <pre className="px-3 pb-3 text-[10px] font-mono text-muted-foreground overflow-x-auto bg-muted/50 border-t border-border/40">
                  {JSON.stringify(samplePayload, null, 2)}
                </pre>
              )}
            </div>

            {telemetry.lastSentAt && (
              <p className="text-[11px] text-muted-foreground">
                Последно изпратено: {new Date(telemetry.lastSentAt).toLocaleString()}
                {" · "}
                Instance ID: <span className="font-mono">{telemetry.instanceId.slice(0, 8)}…</span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {INTEGRATIONS.map((integration) => (
              <div key={integration.name} className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{integration.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">Not connected</p>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => toast.info(`${integration.name} integration coming soon`)}
                >
                  Connect
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Pro Plan</p>
                <p className="text-xs text-muted-foreground">$97/month · Next billing: May 27, 2026</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info("Billing management coming soon")}>
                Manage Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
