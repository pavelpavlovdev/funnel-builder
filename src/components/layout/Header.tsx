"use client"

import { Bell, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useFunnelStore } from "@/lib/store/funnel-store"

interface HeaderProps {
  title?: string
  actions?: React.ReactNode
}

export function Header({ title, actions }: HeaderProps) {
  const profile = useFunnelStore((s) => s.profile)
  const initials = `${profile?.firstName?.[0] || "P"}${profile?.lastName?.[0] || "D"}`.toUpperCase()
  const displayName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "Pavel D."

  return (
    <header className="h-16 border-b bg-card flex items-center px-6 gap-4 shrink-0">
      {title && <h1 className="text-xl font-semibold text-foreground">{title}</h1>}

      <div className="flex-1 flex items-center gap-3">
        {!title && (
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search funnels..." className="pl-9 h-9 bg-muted/50" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actions}

        <Button asChild size="sm" className="gap-1.5">
          <Link href="/funnels/new">
            <Plus className="w-4 h-4" />
            New Funnel
          </Link>
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
