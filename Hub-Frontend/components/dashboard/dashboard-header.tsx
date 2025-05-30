'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Bell } from "lucide-react";

interface UserType {
  name?: string;
  role?: string;
  isFirstVisit?: boolean;
}

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
  user?: UserType;
}

export function DashboardHeader({ heading, text, children, user }: DashboardHeaderProps) {
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");

  // Check if it's the user's first visit using localStorage
  useEffect(() => {
    // Default to true for first visit
    const isFirstVisit = localStorage.getItem('hasVisitedDashboard') !== 'true';
    
    if (isFirstVisit) {
      setShowWelcome(true);
      // Set the flag in localStorage for future visits
      localStorage.setItem('hasVisitedDashboard', 'true');
      
      // Hide the welcome message after 5 seconds
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Set user name when user prop changes
  useEffect(() => {
    if (user?.name) {
      setUserName(user.name);
    }
  }, [user]);

  return (
    <>
      {showWelcome && (
        <div className="bg-primary/10 mb-6 p-4 rounded-lg border border-primary/20 text-center">
          <h2 className="text-xl font-semibold text-primary">
            Welcome to your dashboard{userName ? `, ${userName}` : ''}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Here you can manage all your activities and access your resources
          </p>
        </div>
      )}
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {heading}
            {userName && !showWelcome && (
              <span className="text-primary ml-2 text-xl font-normal">
                Welcome back, {userName}
              </span>
            )}
          </h1>
          {text && <p className="text-muted-foreground">{text}</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="w-[200px] pl-8 md:w-[300px]" />
          </div>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          {children}
        </div>
      </div>
    </>
  );
}