import Link from "next/link"
import { Calendar, Users, Compass, MessageSquare, LayoutDashboard } from "lucide-react"

export function DashboardNav() {
  return (
    <nav className="flex flex-col gap-2">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <LayoutDashboard className="h-4 w-4" />
        <span>Dashboard</span>
      </Link>
      <Link
        href="/events"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <Calendar className="h-4 w-4" />
        <span>Events</span>
      </Link>
      <Link
        href="/dashboard/discover"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <Compass className="h-4 w-4" />
        <span>Discover</span>
      </Link>
      <Link
        href="/dashboard/connections"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <Users className="h-4 w-4" />
        <span>Connections</span>
      </Link>
      <Link
        href="/"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Home</span>
      </Link>
    </nav>
  )
}
