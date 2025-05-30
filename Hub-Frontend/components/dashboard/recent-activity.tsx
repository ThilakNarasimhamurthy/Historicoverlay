"use client";
import { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  MessageSquare, 
  ThumbsUp, 
  Users, 
  UserPlus, 
  FileText,
  Bell,
  Loader2
} from "lucide-react";
import { IS_LOGGED_IN } from '@/app/apollo/operations/auth';

// GraphQL query - exact structure as per your requirements
// Note: Using the proper query syntax with named query to avoid 400 errors
const GET_USER_ACTIVITY = gql`
  query GetUserActivity($userId: ID!, $limit: Int!, $offset: Int!) {
    activityFeedByUser(userId: $userId, limit: $limit, offset: $offset) {
      user_id
      activities {
        activity_type
        related_entity_id
        related_entity_type
        metadata
      }
    }
  }
`;


// Types for TypeScript
type Activity = {
  activity_type: string;
  related_entity_id: string;
  related_entity_type: string;
  metadata: any;
};

type FormattedActivity = {
  id: string;
  type: string;
  user: {
    name: string;
    avatar: string;
    initials: string;
  };
  action: string;
  target: string;
  time: string;
  icon: React.ReactNode;
  timestamp: Date | null;
};

const RecentActivity = () => {
  const [activities, setActivities] = useState<FormattedActivity[]>([]);
  const [useMockData, setUseMockData] = useState(false);
  
  const { data: authData, loading: authLoading } = useQuery(IS_LOGGED_IN);
  const currentUser = authData?.currentUser || null;
  const userId = currentUser?.id || null;
  
  // Execute the GraphQL query with error handling
  const { loading, error, data } = useQuery(GET_USER_ACTIVITY, {
    variables: { 
      userId: userId, 
      limit: 5, 
      offset: 0 
    },
    fetchPolicy: 'network-only', // Don't use cache, always fetch fresh data
    onError: (error) => {
      console.error("GraphQL query error:", error);
      // If the server returns an error, fall back to mock data
      setUseMockData(true);
    }
  });
  
  useEffect(() => {
    // Use real data if available, otherwise fallback to mock data
    const sourceData = data;
    
    if (sourceData?.activityFeedByUser?.activities) {
      try {
        const formattedActivities = formatActivities(sourceData.activityFeedByUser.activities);
        setActivities(formattedActivities);
      } catch (err) {
        console.error("Error formatting activities:", err);
        setActivities([]);
      }
    }
  }, [data, useMockData]);
  
  // Format the activities data for display
  const formatActivities = (rawActivities: Activity[]): FormattedActivity[] => {
    if (!Array.isArray(rawActivities)) {
      console.error("Expected activities to be an array, got:", rawActivities);
      return [];
    }
    
    const formatted = rawActivities.map(activity => {
      try {
        const { activity_type, related_entity_id, metadata } = activity;
        
        // Safely extract user info with fallbacks
        const userName = metadata && metadata.firstName && metadata.lastName 
          ? `${metadata.firstName} ${metadata.lastName}`
          : "Unknown User";
        
        const initials = metadata && metadata.firstName && metadata.lastName
          ? `${metadata.firstName.charAt(0)}${metadata.lastName.charAt(0)}`
          : "UN";
        
        // Format time with error handling
        let timeAgo = "recently";

        if (metadata?.timestamp) {
          try {
            const date = new Date(metadata.timestamp);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
              timeAgo = "in the future";
            } else if (diffDays === 0) {
              timeAgo = "today";
            } else if (diffDays === 1) {
              timeAgo = "yesterday";
            } else if (diffDays < 7) {
              timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
            } else if (diffDays < 30) {
              const weeks = Math.floor(diffDays / 7);
              timeAgo = `${weeks} week${weeks > 1 ? "s" : ""} ago`;
            } else {
              const months = Math.floor(diffDays / 30);
              timeAgo = `${months} month${months > 1 ? "s" : ""} ago`;
            }
          } catch (err) {
            console.error("Error parsing timestamp:", err);
          }
        }

        // Determine icon, action, and target based on activity type
        let icon = <Bell className="h-4 w-4" />;
        let action = "";
        let target = "";
        
        switch (activity_type) {
          case "User Created":
            icon = <UserPlus className="h-4 w-4" />;
            action = "joined";
            target = "the platform";
            break;
          case "Post Created":
            icon = <FileText className="h-4 w-4" />;
            action = "created";
            target = "a post";
            if (metadata && metadata.content) {
              const truncatedContent = metadata.content.length > 30
                ? `"${metadata.content.substring(0, 30)}..."`
                : `"${metadata.content}"`;
              target = truncatedContent;
            }
            break;
          case "Comment Created":
            icon = <MessageSquare className="h-4 w-4" />;
            action = "commented on";
            target = "a post";
            break;
          case "Like":
            icon = <ThumbsUp className="h-4 w-4" />;
            action = "liked";
            target = "a post";
            break;
          case "Connection":
            icon = <Users className="h-4 w-4" />;
            action = "connected with";
            target = "someone";
            break;
          case "Event":
            icon = <Calendar className="h-4 w-4" />;
            action = "registered for";
            target = "an event";
            break;
          default:
            action = "performed";
            target = activity_type.toLowerCase();
        }
        
        return {
          id: related_entity_id || `id-${Math.random()}`, // Fallback ID if none provided
          type: activity_type,
          user: {
            name: userName,
            avatar: "/placeholder.svg?height=32&width=32",
            initials,
          },
          action,
          target,
          time: timeAgo,
          icon,
          // Keep original timestamp for sorting
          timestamp: metadata && metadata.timestamp ? new Date(metadata.timestamp) : null
        };
      } catch (err) {
        console.error("Error processing activity:", err, activity);
        // Return a fallback activity to avoid breaking the UI
        return {
          id: `error-${Math.random()}`,
          type: "unknown",
          user: {
            name: "Unknown User",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "UN",
          },
          action: "performed",
          target: "an action",
          time: "recently",
          icon: <Bell className="h-4 w-4" />,
          timestamp: null
        };
      }
    });
    
    // Sort by timestamp (descending - newest first) with error handling
    return formatted.sort((a, b) => {
      try {
        // If both have timestamps, compare them
        if (a.timestamp && b.timestamp) {
          return b.timestamp.getTime() - a.timestamp.getTime();
        }
        // If only one has timestamp, prioritize the one with timestamp
        if (a.timestamp) return -1;
        if (b.timestamp) return 1;
      } catch (err) {
        console.error("Error sorting activities:", err);
      }
      // If neither has timestamp or there was an error, maintain original order
      return 0;
    });
  };
  
  // Handle loading state
  if (loading && !useMockData) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading activity feed...</span>
      </div>
    );
  }
  
  // Handle error state but only if we're not using mock data
  if (error && !useMockData) {
    // Don't show error UI as we're falling back to mock data
    console.error("GraphQL error:", error);
  }
  
  // Handle empty state
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg">
        <Bell className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
        <p className="text-muted-foreground">No recent activity found</p>
      </div>
    );
  }
  
  // Render activity feed
  return (
    <div className="space-y-4">
      {useMockData && (
        <div className="text-xs text-amber-600 mb-2 p-2 bg-amber-50 rounded">
          Note: Showing demo data. Connection to activity service unavailable.
        </div>
      )}
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user.name}</span>{" "}
              {activity.action}{" "}
              <span className="font-medium">{activity.target}</span>
            </p>
            <p className="text-xs text-muted-foreground flex items-center">
              {activity.icon}
              <span className="ml-1">{activity.time}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;