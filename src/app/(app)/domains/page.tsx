"use client"

import { useState } from "react"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Globe, Plus, Check, AlertCircle, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function DomainsPage() {
  const [input, setInput] = useState("")
  const customDomains = useFunnelStore((s) => s.customDomains)
  const addDomain = useFunnelStore((s) => s.addDomain)
  const removeDomain = useFunnelStore((s) => s.removeDomain)
  const _hasHydrated = useFunnelStore((s) => s._hasHydrated)

  const handleAdd = () => {
    const domain = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "")
    if (!domain) return
    if (!/^[\w.-]+\.[a-z]{2,}$/.test(domain)) {
      toast.error("Enter a valid domain — e.g. funnels.example.com")
      return
    }
    if (customDomains.some((d) => d.domain === domain)) {
      toast.error("Domain already added")
      return
    }
    addDomain(domain)
    setInput("")
    toast.success(`${domain} added — configure your DNS to verify`)
  }

  if (!_hasHydrated) return null

  return (
    <>
      <Header title="Domains" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Custom Domains</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="funnels.yourdomain.com"
                className="max-w-xs"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <Button onClick={handleAdd} className="gap-1.5">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>

            {customDomains.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No custom domains added yet.</p>
            ) : (
              <div className="space-y-3">
                {customDomains.map((d) => (
                  <div key={d.id} className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30">
                    <Globe className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{d.domain}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(d.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        d.verified
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : "text-amber-700 bg-amber-50 border-amber-200"
                      }
                    >
                      {d.verified ? (
                        <><Check className="w-3 h-3 mr-1" />Verified</>
                      ) : (
                        <><AlertCircle className="w-3 h-3 mr-1" />Pending DNS</>
                      )}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-500 shrink-0"
                      onClick={() => {
                        removeDomain(d.id)
                        toast.success("Domain removed")
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {customDomains.some((d) => !d.verified) && (
              <div className="text-xs bg-amber-50 border border-amber-100 rounded-lg p-3 space-y-1">
                <p className="font-semibold text-amber-800">DNS Setup Instructions</p>
                <p className="text-amber-700">
                  Add a <strong>CNAME</strong> record pointing your domain to{" "}
                  <code className="font-mono bg-white px-1 rounded border border-amber-200">proxy.funnelpro.app</code>.
                  Allow 24–48 hours for propagation.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Default Subdomain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg flex-wrap">
              <span className="text-sm text-muted-foreground">Your funnels are available at:</span>
              <code className="text-sm font-mono bg-white px-2 py-0.5 rounded border">yourname.funnelpro.app</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
