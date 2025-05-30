import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react"

export function TrendingPosts() {
  const posts = [
    {
      id: 1,
      user: {
        name: "David Timber",
        avatar: "/placeholder.svg?height=40&width=40",
        initials: "DT",
        role: "Computer Science Student, NYU",
      },
      content:
        "Just finished the AI hackathon at NYU! Our team built a machine learning model that predicts student success based on engagement patterns. So excited to share our findings!",
      image: "/placeholder.svg?height=300&width=600",
      likes: 42,
      comments: 8,
      time: "2 hours ago",
    },
    {
      id: 2,
      user: {
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        initials: "SJ",
        role: "Business Major, Columbia University",
      },
      content:
        "Looking for team members for the upcoming Startup Weekend! We're building a platform to connect students with short-term project opportunities. DM if interested!",
      image: null,
      likes: 28,
      comments: 15,
      time: "5 hours ago",
    },
    {
      id: 3,
      user: {
        name: "Tech Club at MIT",
        avatar: "/placeholder.svg?height=40&width=40",
        initials: "TC",
        role: "Student Organization",
      },
      content:
        "We're hosting a workshop on blockchain development next week! Learn how to build decentralized applications with hands-on exercises. Registration link in comments.",
      image: "/placeholder.svg?height=300&width=600",
      likes: 56,
      comments: 23,
      time: "1 day ago",
    },
  ]

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                <AvatarFallback>{post.user.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {post.user.role} • {post.time}
                </p>
              </div>
            </div>
            <p className="text-sm mb-4">{post.content}</p>
            {post.image && (
              <div className="rounded-md overflow-hidden mb-4">
                <img src={post.image || "/placeholder.svg"} alt="Post content" className="w-full h-auto" />
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0 border-t flex justify-between">
            <Button variant="ghost" size="sm" className="gap-1">
              <ThumbsUp className="h-4 w-4" /> {post.likes}
            </Button>
            <Button variant="ghost" size="sm" className="gap-1">
              <MessageSquare className="h-4 w-4" /> {post.comments}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
