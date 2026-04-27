import { Header } from "@/components/layout/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, Filter } from "lucide-react"

const MOCK_CONTACTS = [
  { name: "Sarah Johnson", email: "sarah@example.com", source: "Lead Magnet Funnel", date: "2026-04-25", tags: ["lead", "buyer"] },
  { name: "Michael Chen", email: "m.chen@example.com", source: "Product Launch", date: "2026-04-24", tags: ["buyer"] },
  { name: "Emma Wilson", email: "emma.w@gmail.com", source: "Webinar Registration", date: "2026-04-23", tags: ["lead"] },
  { name: "David Brown", email: "dbrown@work.com", source: "Product Launch", date: "2026-04-23", tags: ["buyer", "upsell"] },
  { name: "Lisa Martinez", email: "l.martinez@example.com", source: "Lead Magnet Funnel", date: "2026-04-22", tags: ["lead"] },
  { name: "James Taylor", email: "james.t@gmail.com", source: "Coaching Application", date: "2026-04-21", tags: ["applicant"] },
  { name: "Amy Davis", email: "amy.d@example.com", source: "Webinar Registration", date: "2026-04-20", tags: ["lead"] },
  { name: "Robert Wilson", email: "rwilson@work.com", source: "Product Launch", date: "2026-04-19", tags: ["buyer"] },
]

const tagColors: Record<string, string> = {
  lead: "bg-blue-100 text-blue-700",
  buyer: "bg-emerald-100 text-emerald-700",
  upsell: "bg-purple-100 text-purple-700",
  applicant: "bg-amber-100 text-amber-700",
}

export default function ContactsPage() {
  return (
    <>
      <Header title="Contacts" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search contacts..." className="pl-9 h-9" />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5"><Filter className="w-4 h-4" /> Filter</Button>
          <Button variant="outline" size="sm" className="gap-1.5 ml-auto"><Download className="w-4 h-4" /> Export CSV</Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {MOCK_CONTACTS.length} contacts total
        </div>

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
                </tr>
              </thead>
              <tbody className="divide-y">
                {MOCK_CONTACTS.map((contact) => (
                  <tr key={contact.email} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {contact.name[0]}
                        </div>
                        <span className="font-medium">{contact.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{contact.email}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{contact.source}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {contact.tags.map((tag) => (
                          <span key={tag} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${tagColors[tag] || "bg-gray-100 text-gray-600"}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-muted-foreground">{contact.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
