import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function UserConnections() {
  const connections = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Business Major, Columbia University",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SJ",
      mutualConnections: 5,
    },
    {
      id: 2,
      name: "David Timber",
      role: "Computer Science, NYU",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "DT",
      mutualConnections: 3,
    },
    {
      id: 3,
      name: "Emily Chen",
      role: "Data Science, MIT",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "EC",
      mutualConnections: 2,
    },
    {
      id: 4,
      name: "Michael Brown",
      role: "Engineering, Stanford",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "MB",
      mutualConnections: 1,
    },
    {
      id: 5,
      name: "Jessica Lee",
      role: "Marketing, UCLA",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JL",
      mutualConnections: 4,
    },
    {
      id: 6,
      name: "Robert Kim",
      role: "Finance, Harvard",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "RK",
      mutualConnections: 2,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search connections..." className="w-full pl-8" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {connections.map((connection) => (
          <Card key={connection.id}>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <Avatar className="h-16 w-16 mt-2">
                  <AvatarImage src={connection.avatar} alt={connection.name} />
                  <AvatarFallback>{connection.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{connection.name}</h3>
                  <p className="text-sm text-muted-foreground">{connection.role}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {connection.mutualConnections} mutual connection{connection.mutualConnections !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" size="sm" className="flex-1">
                    Message
                  </Button>
                  <Button size="sm" className="flex-1">
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
