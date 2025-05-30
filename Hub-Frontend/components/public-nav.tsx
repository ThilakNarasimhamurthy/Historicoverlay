import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"

export function PublicNav() {
  return (
    <div className="flex w-full justify-between items-center">
      <div className="flex gap-6 md:gap-10">
        <Link href="/" className="flex items-center space-x-2">
          <GraduationCap className="h-6 w-6" />
          <span className="font-bold inline-block">StudentHub</span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          <Link
            href="/events"
            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Events
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/connections"
            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Connections
          </Link>
          <Link
            href="/dashboard/discover"
            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Discover
          </Link>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/events">
          <Button variant="outline">Browse Events</Button>
        </Link>
        <Link href="/dashboard">
          <Button>Explore Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
