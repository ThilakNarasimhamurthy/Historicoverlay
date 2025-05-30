import Link from "next/link"
import { GraduationCap } from "lucide-react"

export function MainNav() {
  return (
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
          href="/hackathons"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Hackathons
        </Link>
        <Link
          href="/networking"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Networking
        </Link>
        <Link
          href="/universities"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Universities
        </Link>
      </nav>
    </div>
  )
}
