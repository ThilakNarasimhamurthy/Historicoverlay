import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, Menu, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DashboardNav } from "@/components/dashboard-nav"

export function PublicDashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="flex items-center space-x-2 mb-8">
              <GraduationCap className="h-6 w-6" />
              <span className="font-bold inline-block">StudentHub</span>
            </div>
            <DashboardNav />
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center space-x-2 md:mr-6">
          <GraduationCap className="h-6 w-6" />
          <span className="hidden font-bold md:inline-block">StudentHub</span>
        </Link>
        <div className="hidden md:flex">
          <DashboardNav />
        </div>
        <div className="flex-1 flex items-center justify-end space-x-4">
          <div className="relative w-full max-w-sm hidden md:flex">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search events, people..." className="w-full pl-8" />
          </div>
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
          <Link href="/events">
            <Button>Events</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
