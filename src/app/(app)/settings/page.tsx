import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function SettingsPage() {
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
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">PD</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">Change Photo</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input defaultValue="Pavel" />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input defaultValue="D." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue="pavlovdevelop@gmail.com" type="email" />
            </div>
            <Button size="sm">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Mailchimp", status: "connected", icon: "📧" },
              { name: "Stripe", status: "connected", icon: "💳" },
              { name: "Zapier", status: "not connected", icon: "⚡" },
              { name: "ActiveCampaign", status: "not connected", icon: "📨" },
              { name: "ConvertKit", status: "not connected", icon: "✉️" },
            ].map((integration) => (
              <div key={integration.name} className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{integration.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{integration.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{integration.status}</p>
                  </div>
                </div>
                <Button variant={integration.status === "connected" ? "outline" : "default"} size="sm">
                  {integration.status === "connected" ? "Disconnect" : "Connect"}
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
              <Button variant="outline" size="sm">Manage Plan</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
