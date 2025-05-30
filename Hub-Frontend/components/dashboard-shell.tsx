import type React from "react"
interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="container">
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  )
}
