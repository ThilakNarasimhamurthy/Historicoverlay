import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import  {EventCard } from "@/components/dashboard/eventcard"
import  RecentActivity  from "@/components/dashboard/recent-activity"
import { TrendingPosts } from "@/components/dashboard/trending-posts"
// import { NearbyEvents } from "@/components/dashboard/nearby-events"
import ProtectedRoute from '@/components/ProtectedRoute'


export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['university']}>
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <DashboardHeader heading="Dashboard" text="Welcome back organization! Here's what's happening." />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">812</div>

                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                 
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">214</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Partner Companies</CardTitle>
              
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">56</div>
                </CardContent>
              </Card>
            </div>

        <Tabs defaultValue="feed" className="space-y-4">
          <TabsList>
            <TabsTrigger value="feed">Personalized Feed</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="trending">Trending Posts</TabsTrigger>
            <TabsTrigger value="nearby">Nearby Events</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Events matching your interests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* <EventCard
                    title="Tech Hackathon 2025"
                    description="Join us for a 48-hour coding challenge with top tech companies."
                    date="April 15-17, 2025"
                    location="NYU Tech Center"
                    category="Hackathon"
                  />
                  <EventCard
                    title="AI Workshop Series"
                    description="Learn about the latest advancements in artificial intelligence."
                    date="April 22, 2025"
                    location="Virtual Event"
                    category="Workshop"
                  /> */}
                  <Button variant="outline" className="w-full">
                    View All Events
                  </Button>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your network updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivity />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* <EventCard
                title="Tech Hackathon 2025"
                description="Join us for a 48-hour coding challenge with top tech companies."
                date="April 15-17, 2025"
                location="NYU Tech Center"
                category="Hackathon"
                image="/placeholder.svg?height=200&width=300"
              />
              <EventCard
                title="Career Fair: Tech Industry"
                description="Meet recruiters from top tech companies and explore job opportunities."
                date="May 5, 2025"
                location="Columbia University"
                category="Networking"
                image="/placeholder.svg?height=200&width=300"
              />
              <EventCard
                title="AI Workshop Series"
                description="Learn about the latest advancements in artificial intelligence."
                date="April 22, 2025"
                location="Virtual Event"
                category="Workshop"
                image="/placeholder.svg?height=200&width=300"
              /> */}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <TrendingPosts />
          </TabsContent>

          {/* <TabsContent value="nearby" className="space-y-4">
            <NearbyEvents />
          </TabsContent> */}
        </Tabs>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  )
}
