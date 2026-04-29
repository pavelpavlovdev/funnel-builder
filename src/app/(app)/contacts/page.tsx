"use client"

import { useState } from "react"
import { useFunnelStore } from "@/lib/store/funnel-store"
import { Header } from "@/components/layout/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, Trash2 } from "lucide-react"

const tagColors: Record<string, string> = {
  lead: "bg-blue-100 text-blue-700",
  buyer: "bg-emerald-100 text-emerald-700",
  upsell: "bg-purple-100 text-purple-700",
  applicant: "bg-amber-100 text-amber-700",
}

export default function ContactsPage() {
  const [search, setSearch] = useState("")
  const contacts = useFunnelStore((s) => s.contacts)
  const removeContact = useFunnelStore((s) => s.removeContact)
  const _hasHydrated = useFunnelStore((s) => s._hasHydrated)

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase()
    return !q || c.email.toLowerCase().includes(q) || (c.name || "").toLowerCase().includes(q) || c.source.toLowerCase().includes(q)
  })

  const exportCSV = () => {
    const rows = [
      ["Name", "Email", "Phone", "Source", "Tags", "Date"],
      ...filtered.map((c) => [
        c.name || "",
        c.email,
        c.phone || "",
        c.source,
        c.tags.join(", "),
        new Date(c.createdAt).toLocaleDateString(),
      ]),
    ]
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "contacts.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!_hasHydrated) return null

  return (
    <>
      <Header title="Contacts" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 ml-auto"
            onClick={exportCSV}
            disabled={filtered.length === 0}
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {filtered.length} contact{filtered.length !== 1 ? "s" : ""}
          {search ? ` matching "${search}"` : " total"}
        </div>

        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Contacts are captured automatically when visitors submit opt-in forms on your published funnel pages.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No contacts match &ldquo;{search}&rdquo;
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Source Funnel</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Tags</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">Date</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((contact) => (
                    <tr key={contact.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {(contact.name || contact.email)[0].toUpperCase()}
                          </div>
                          <span className="font-medium">{contact.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{contact.email}</td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">{contact.source}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {contact.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${tagColors[tag] || "bg-gray-100 text-gray-600"}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-muted-foreground">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => removeContact(contact.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          title="Delete contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
