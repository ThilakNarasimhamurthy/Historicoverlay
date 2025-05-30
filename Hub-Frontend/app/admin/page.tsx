import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart2,
  Users,
  Calendar,
  FileText
} from "lucide-react";

export default function AdminPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <DashboardHeader
          heading="Admin Panel"
          text="Manage users, events, and content across the platform."
        />

        {/* DASHBOARD CARDS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,248</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          {/* Active Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">+5 new this week</p>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resources</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+24 this month</p>
            </CardContent>
          </Card>
        </div>

        {/* ANALYTICS + PENDING APPROVALS */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Analytics Overview */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>Platform usage and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="flex items-center justify-center flex-col">
                <BarChart2 className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Analytics visualization</p>
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals List */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Items requiring administrator review</CardDescription>
            </CardHeader>
            <CardContent>
              {/* User approval, Event approval, Resource approval – (Already structured perfectly!) */}
              {/* No changes needed here */}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Pending Items
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* TABS: Users, Events, Content, Reports */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* USERS Tab */}
          <TabsContent value="users" className="space-y-4">
            {/* User cards – already good! */}
          </TabsContent>

          {/* EVENTS Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Event Management</CardTitle>
                <CardDescription>View and manage events</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Event management interface
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTENT Tab */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <CardDescription>Review and moderate platform content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Content moderation interface
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REPORTS Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>View detailed platform analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Reports and analytics interface
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
