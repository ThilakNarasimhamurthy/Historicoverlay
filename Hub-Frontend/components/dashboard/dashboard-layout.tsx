import type { ReactNode } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 pt-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>
    </div>
  )
}
