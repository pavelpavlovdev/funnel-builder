"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { toast } from "sonner"
import { Zap, BookOpen, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

const starters = [
  { id: "blank", label: "Blank Funnel", icon: Zap, desc: "Start from scratch" },
  { id: "lead", label: "Lead Magnet", icon: BookOpen, desc: "Capture emails with a free offer" },
  { id: "sales", label: "Sales Funnel", icon: Rocket, desc: "Sell a product or service" },
]

export function NewFunnelDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const router = useRouter()
  const { createFunnel } = useFunnelStore()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [starter, setStarter] = useState("blank")

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a funnel name")
      return
    }
    const funnel = createFunnel(name.trim())
    if (description.trim()) {
      useFunnelStore.getState().updateFunnel(funnel.id, { description: description.trim() })
    }
    toast.success("Funnel created!")
    onOpenChange(false)
    setName("")
    setDescription("")
    router.push(`/funnels/${funnel.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Funnel</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-3 gap-2">
            {starters.map((s) => {
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  onClick={() => setStarter(s.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-all",
                    starter === s.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{s.label}</span>
                  <span className="text-[10px] opacity-70 leading-tight">{s.desc}</span>
                </button>
              )
            })}
          </div>

          <div className="space-y-2">
            <Label htmlFor="funnel-name">Funnel Name</Label>
            <Input
              id="funnel-name"
              placeholder="e.g. Summer Product Launch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="funnel-desc">Description (optional)</Label>
            <Textarea
              id="funnel-desc"
              placeholder="What is this funnel for?"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create Funnel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
