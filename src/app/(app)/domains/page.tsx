import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Globe, Plus, Check, AlertCircle } from "lucide-react"

const domains = [
  { domain: "funnels.mycompany.com", status: "active", verified: true, funnels: 3 },
  { domain: "offers.mybusiness.co", status: "pending", verified: false, funnels: 1 },
]

export default function DomainsPage() {
  return (
    <>
      <Header title="Domains" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Custom Domains</CardTitle>
            <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Add Domain</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="yourdomain.com" className="max-w-xs" />
              <Button variant="outline">Add</Button>
            </div>
            <div className="space-y-3">
              {domains.map((d) => (
                <div key={d.domain} className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{d.domain}</p>
                    <p className="text-xs text-muted-foreground">{d.funnels} funnel{d.funnels !== 1 ? "s" : ""} connected</p>
                  </div>
                  <Badge variant="outline" className={d.verified ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200"}>
                    {d.verified ? <><Check className="w-3 h-3 mr-1" />Verified</> : <><AlertCircle className="w-3 h-3 mr-1" />Pending</>}
                  </Badge>
                  <Button variant="ghost" size="sm">Configure</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Default Subdomain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Your funnels are available at:</span>
              <code className="text-sm font-mono bg-white px-2 py-0.5 rounded border">yourname.funnelpro.app</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
