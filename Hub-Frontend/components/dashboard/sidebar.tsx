'use client';

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IS_LOGGED_IN, logout } from '@/app/apollo/operations/auth';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  GraduationCap,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Users,
  FileText,
  Settings,
  LogOut,
  Map,
  BookOpen,
  Shield,
  Building,
  FileSpreadsheet,
  Briefcase,
  Backpack,
  User,
  BarChart,
  UserPlus,
  BookMarked,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import { useQuery } from "@apollo/client";

// Define proper TypeScript interfaces
interface UserType {
  firstName?: string;
  lastName?: string;
  role?: string;
  avatar?: string;
  initials?: string;
}

interface NavLinkType {
  href: string;
  icon: ReactNode;
  label: string;
  id: string;
  badge?: string;
  className?: string;
}

interface NavSectionType {
  heading: string;
  id: string;
  links: NavLinkType[];
}

// Add interface for Sidebar props
interface SidebarProps {
  role?: string;
}

const useAuth = () => {
  const { data, loading } = useQuery(IS_LOGGED_IN);

  return {
    user: data?.currentUser || null,
    isLoading: loading
  }
};

export function Sidebar({ role: propRole }: SidebarProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Client-side only effect to fix hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Add this function to handle logout
  const handleLogout = () => {
    // Call the logout function to clear Apollo cache
    logout();
    // Then navigate to the home page
    router.push('/');
  };

  // Use propRole with priority if provided, otherwise fall back to user?.role
  const effectiveRole = propRole || user?.role;

  // Helper function to get full name
  const getFullName = () => {
    if (!user) return "User";
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.lastName) {
      return user.lastName;
    }
    
    return "User";
  };

  // Get user initials correctly
  const getUserInitials = () => {
    if (!user) return "U";
    
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    } else if (user.firstName) {
      return user.firstName.charAt(0);
    } else if (user.lastName) {
      return user.lastName.charAt(0);
    }
    
    return "U";
  };

  // Navigation items construction
  const getNavItems = (role?: string): NavSectionType[] => {
    // Common navigation items for all roles
    const commonItems: NavSectionType[] = [
      {
        heading: "ACCOUNT",
        id: "account-section",
        links: [
          {
            href: "/profile",
            icon: <FileText className="h-4 w-4" />,
            label: "Profile",
            id: "profile-link"
          },
          // {
          //   href: "/dashboard/settings",
          //   icon: <Settings className="h-4 w-4" />,
          //   label: "Settings",
          //   id: "settings-link"
          // },
          {
            href: "/auth/sigin", // Changed to # as we'll handle navigation programmatically
            icon: <LogOut className="h-4 w-4" />,
            label: "Log Out",
            id: "logout-link",
            className: "text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
          }
        ]
      }
    ];

    // Role-specific navigation items with role-aware URLs for shared pages
    const userRole = role?.toLowerCase() || 'default';
  
    // Role-specific navigation items
    const roleItems: Record<string, NavSectionType[]> = {
      student: [
        {
          heading: "MAIN",
          id: "student-main",
          links: [
            {
              href: "/dashboard/student",
              icon: <LayoutDashboard className="h-4 w-4" />,
              label: "Dashboard",
              id: "student-dashboard"
            },
            {
              href: `/events?role=${userRole}`,
              icon: <Calendar className="h-4 w-4" />,
              label: "Events",
              badge: "5",
              id: "student-events"
            },
            {
              href: `/posts?role=${userRole}`,
              icon: <MessageSquare className="h-4 w-4" />,
              label: "Posts",
              badge: "New",
              id: "student-posts"
            },
            {
              href: `/maps?role=${userRole}`,
              icon: <Map className="h-4 w-4" />,
              label: "Map View",
              id: "student-map"
            },
          ]
        }
      ],
      university: [
        {
          heading: "MAIN",
          id: "university-main",
          links: [
            {
              href: "/dashboard/university",
              icon: <LayoutDashboard className="h-4 w-4" />,
              label: "Dashboard",
              id: "university-dashboard"
            },
            {
              href: `/events?role=${userRole}`,
              icon: <Calendar className="h-4 w-4" />,
              label: "Events",
              badge: "2",
              id: "university-events"
            },
            {
              href: `/posts?role=${userRole}`,
              icon: <MessageSquare className="h-4 w-4" />,
              label: "Posts",
              id: "university-posts"
            },
          ]
        }
      ],
      company: [
        {
          heading: "MAIN",
          id: "company-main",
          links: [
            {
              href: "/dashboard/company",
              icon: <LayoutDashboard className="h-4 w-4" />,
              label: "Dashboard",
              id: "company-dashboard"
            },
            {
              href: `/posts?role=${userRole}`,
              icon: <Briefcase className="h-4 w-4" />,
              label: "Posts",
              id: "company-jobs"
            },
            {
              href: `/events?role=${userRole}`,
              icon: <Calendar className="h-4 w-4" />,
              label: "Events",
              id: "company-events"
            },
          ]
        }
      ],
      admin: [
        {
          heading: "CONTENT",
          id: "admin-content",
          links: [
            {
              href: "/admin/posts",
              icon: <MessageSquare className="h-4 w-4" />,
              label: "Posts",
              id: "admin-posts"
            },
            {
              href: "/admin/events",
              icon: <Calendar className="h-4 w-4" />,
              label: "Events",
              id: "admin-events"
            },
            {
              href: "/admin/resources",
              icon: <BookOpen className="h-4 w-4" />,
              label: "Resources",
              id: "admin-resources"
            }
          ]
        },
      ],
      default: [
        {
          heading: "MAIN",
          id: "default-main",
          links: [
            {
              href: "/dashboard",
              icon: <LayoutDashboard className="h-4 w-4" />,
              label: "Dashboard",
              id: "default-dashboard"
            }
          ]
        }
      ]
    };

    const specificItems = roleItems[userRole as keyof typeof roleItems] || roleItems.default;
    
    return [...specificItems, ...commonItems];
  };
  
  // Toggle a section's expanded state
  const toggleSection = (heading: string): void => {
    setExpandedSections(prev => ({
      ...prev,
      [heading]: !prev[heading]
    }));
  };

  // Check if a link is active, considering both pathname and query params
  const isLinkActive = (href: string): boolean => {
    // Extract the base path and query params from href
    const [basePath, queryString] = href.split('?');
    
    // If no query params, just check the pathname
    if (!queryString) {
      return pathname === basePath || pathname.startsWith(basePath + '/');
    }
    
    // For paths with query params (like events and posts)
    if (pathname === basePath) {
      // Parse the query params from href
      const urlParams = new URLSearchParams(queryString);
      const linkRole = urlParams.get('role');
      
      // Get the role from current URL query params
      const currentRole = searchParams.get('role');
      
      // Match if the pathname matches and roles match (or if no role in current URL)
      return linkRole === currentRole || (!currentRole && linkRole === effectiveRole);
    }
    
    return false;
  };

  // Initialize expanded sections based on current path
  useEffect(() => {
    if (isMounted && pathname && (effectiveRole || user)) {
      const navItems = getNavItems(effectiveRole);
      const initialExpandedSections: Record<string, boolean> = {};
      
      navItems.forEach(section => {
        const hasActiveLink = section.links.some(link => isLinkActive(link.href));
        initialExpandedSections[section.heading] = hasActiveLink;
      });
      
      setExpandedSections(initialExpandedSections);
    }
  }, [pathname, searchParams, user, effectiveRole, isMounted]);

  // Show loading skeleton for both SSR and initial client render
  if (!isMounted || (isLoading && !propRole)) {
    return (
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40 w-64">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4">
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="flex-1 p-4">
            <div className="flex items-center gap-2 px-2 py-1 mb-6">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-2"></div>
                <div className="h-3 w-16 bg-gray-100 animate-pulse rounded"></div>
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-gray-100 animate-pulse rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use either the prop role or fall back to user info
  const activeRole = effectiveRole?.toLowerCase() || "student";
  const displayRole = activeRole.charAt(0).toUpperCase() + activeRole.slice(1);
  const userInitials = getUserInitials();
  
  // Get navigation items based on role
  const navItems = getNavItems(activeRole);
  
  return (
    <div 
      className={cn(
        "border-r bg-gray-100/40 dark:bg-gray-800/40 transition-all duration-300 hidden lg:block",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-14 items-center justify-between border-b px-4">
          {!isCollapsed ? (
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span>StudentHub</span>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex w-full items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 transition-transform duration-200"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-2 p-4">
            {/* User Profile Section - Updated with name and role */}
            <div className={cn(
              "flex items-center gap-2 px-2 py-3 mb-2 rounded-md bg-white/50 dark:bg-gray-700/50 shadow-sm transition-all duration-300",
              isCollapsed ? "justify-center" : "justify-start"
            )}>
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={user?.avatar || "/placeholder.png"} alt="User" />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate">{getFullName()}</span>
                </div>
              )}
            </div>
            
            <ScrollArea className="h-[calc(100vh-10rem)]">
              {navItems.map((section) => (
                <div key={section.id} className="flex flex-col gap-1 pt-4">
                  {section.heading && !isCollapsed && (
                    <div 
                      className={cn(
                        "flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-gray-200/40 dark:hover:bg-gray-700/40 rounded-md transition-colors duration-150",
                        expandedSections[section.heading] && "bg-gray-200/40 dark:bg-gray-700/40"
                      )}
                      onClick={() => toggleSection(section.heading)}
                      aria-expanded={expandedSections[section.heading]}
                      aria-controls={`section-${section.id}-content`}
                    >
                      <h3 className="text-xs font-medium text-muted-foreground">{section.heading}</h3>
                      <div className="transition-transform duration-200">
                        {expandedSections[section.heading] ? (
                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div 
                    id={`section-${section.id}-content`}
                    className={cn(
                      "flex flex-col gap-1 transition-all duration-200",
                      !isCollapsed && "pl-1",
                      (!isCollapsed && expandedSections[section.heading] === false) && "h-0 opacity-0 overflow-hidden"
                    )}
                  >
                    {section.links.map((link: NavLinkType) => {
                      const isActive = isLinkActive(link.href);
                      
                      // Special handling for logout link
                      if (link.id === "logout-link") {
                        return (
                          <TooltipProvider key={link.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleLogout} // Use the handleLogout function
                                  className={cn(
                                    "justify-start transition-all",
                                    isCollapsed ? "w-10 h-10 p-0 rounded-full" : "w-full",
                                    link.className || ""
                                  )}
                                >
                                  <div className={cn(
                                    "flex items-center",
                                    isCollapsed ? "justify-center" : "justify-start gap-3 w-full"
                                  )}>
                                    <span className={cn(
                                      "flex items-center justify-center transition-transform duration-200",
                                      isCollapsed ? "w-full" : ""
                                    )}>
                                      {link.icon}
                                    </span>
                                    {!isCollapsed && (
                                      <span className="flex-1">{link.label}</span>
                                    )}
                                  </div>
                                </Button>
                              </TooltipTrigger>
                              {isCollapsed && (
                                <TooltipContent side="right">
                                  <p>{link.label}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        );
                      }
                      
                      // Regular links
                      return (
                        <TooltipProvider key={link.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={isActive ? "default" : "ghost"}
                                size="sm"
                                asChild
                                className={cn(
                                  "justify-start transition-all",
                                  isActive ? "bg-primary text-primary-foreground" : "",
                                  isCollapsed ? "w-10 h-10 p-0 rounded-full" : "w-full",
                                  link.className || ""
                                )}
                                aria-current={isActive ? "page" : undefined}
                              >
                                <Link href={link.href} className={cn(
                                  "flex items-center",
                                  isCollapsed ? "justify-center" : "justify-start gap-3 w-full"
                                )}>
                                  <span className={cn(
                                    "flex items-center justify-center transition-transform duration-200",
                                    isActive && "animate-pulse",
                                    isCollapsed ? "w-full" : ""
                                  )}>
                                    {link.icon}
                                  </span>
                                  {!isCollapsed && (
                                    <span className="flex-1">{link.label}</span>
                                  )}
                                  {!isCollapsed && link.badge && (
                                    <Badge variant={
                                      link.badge === "New" ? "default" : "secondary"
                                    } className="ml-auto">
                                      {link.badge}
                                    </Badge>
                                  )}
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            {isCollapsed && (
                              <TooltipContent side="right">
                                <p>{link.label}</p>
                                {link.badge && (
                                  <Badge variant={
                                    link.badge === "New" ? "default" : "secondary"
                                  } className="ml-2">
                                    {link.badge}
                                  </Badge>
                                )}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}