"use client"

import { useFunnelStore } from "@/lib/store/funnel-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import type { Funnel } from "@/lib/types"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export function FunnelSettings({ funnel }: { funnel: Funnel }) {
  const { updateFunnel } = useFunnelStore()
  const [name, setName] = useState(funnel.name)
  const [description, setDescription] = useState(funnel.description)
  const [domain, setDomain] = useState(funnel.domain || "")
  const [tag, setTag] = useState("")
  const [tags, setTags] = useState(funnel.tags)

  const handleSave = () => {
    updateFunnel(funnel.id, { name, description, domain, tags })
    toast.success("Settings saved")
  }

  const addTag = () => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()])
      setTag("")
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Funnel Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="resize-none" />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={funnel.status}
              onValueChange={(v) => updateFunnel(funnel.id, { status: v as Funnel["status"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Domain & Publishing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Custom Domain</Label>
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="funnel.yourdomain.com" />
            <p className="text-xs text-muted-foreground">Connect a custom domain for professional branding</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyDown={(e) => e.key === "Enter" && addTag()}
            />
            <Button variant="outline" onClick={addTag} type="button">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1">
                {t}
                <button onClick={() => setTags(tags.filter((x) => x !== t))}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave}>Save Settings</Button>
    </div>
  )
}
