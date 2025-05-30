'use client'

import { useState, useCallback, memo, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MapPin, Heart, BookmarkIcon, Calendar, Users, CheckCircle } from "lucide-react"

// Enhanced type definition for Event props
interface EventProps {
  event: {
    id: string;
    name: string;
    description?: string;
    location: string;
    startDate: string;
    imageUrl?: string;
    category?: string;
    tags?: string[];
    isLikedByUser?: boolean;
    isSavedByUser?: boolean;
    isRegisteredByUser?: boolean; // Registration status
    likeCount?: number;
    saveCount?: number;
    participantCount?: number;
    __typename?: string;
    creatorType?: string;
    status?: string;
    mediaLinks?: string[];
    externalUrl?: string;
  };
  isAdmin?: boolean;
  onAction: (event: any, action: string, rsvpStatus?: string) => void;
}

// Use memo to prevent unnecessary re-renders
export const EventCard = memo(({ 
  event, 
  isAdmin, 
  onAction
}: EventProps) => {
  const [localLiked, setLocalLiked] = useState(false);
  const [localSaved, setLocalSaved] = useState(false);
  const [localRegistered, setLocalRegistered] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [localSaveCount, setLocalSaveCount] = useState(0);
  
  if (!event) return null;

  // Check if event is external or internal
  const isExternal = event.__typename === 'ExternalEvent' || 
                    (event.id && event.id.includes('external'));

  // Update local state when props change
  useEffect(() => {
    setLocalLiked(!!event.isLikedByUser);
    setLocalSaved(!!event.isSavedByUser);
    setLocalRegistered(!!event.isRegisteredByUser);
    setLocalLikeCount(event.likeCount || 0);
    setLocalSaveCount(event.saveCount || 0);
  }, [event.isLikedByUser, event.isSavedByUser, event.isRegisteredByUser, event.likeCount, event.saveCount]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Date TBD";
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date Error";
    }
  };

  // Get display image from mediaLinks or imageUrl
  const displayImage = event.mediaLinks?.length ? event.mediaLinks[0] : event.imageUrl;

  // Handle action with error handling and optimistic UI updates
  const handleAction = useCallback((e: React.MouseEvent, action: string, rsvpStatus?: string) => {
    // Stop event propagation to prevent the card click handler from firing
    e.stopPropagation();
    
    try {
      // Ensure event has __typename for proper cache handling
      const eventWithType = {
        ...event,
        __typename: event.__typename || (event.id && event.id.includes('external') ? 'ExternalEvent' : 'Event')
      };
      
      // Handle optimistic UI updates
      if (action === 'like') {
        const newLikedState = !localLiked;
        setLocalLiked(newLikedState);
        setLocalLikeCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
      } else if (action === 'save') {
        const newSavedState = !localSaved;
        setLocalSaved(newSavedState);
        setLocalSaveCount(prev => newSavedState ? prev + 1 : Math.max(0, prev - 1));
      } else if (action === 'register' || action === 'rsvp') {
        // Update registration status if register or rsvp action
        setLocalRegistered(action === 'register' || (action === 'rsvp' && rsvpStatus === 'GOING'));
      }
      
      // Pass the action to parent with proper registration status
      const optimisticEvent = {
        ...eventWithType,
        isLikedByUser: action === 'like' ? !localLiked : localLiked,
        isSavedByUser: action === 'save' ? !localSaved : localSaved,
        isRegisteredByUser: action === 'register' || (action === 'rsvp' && rsvpStatus === 'GOING') 
          ? true 
          : (action === 'rsvp' && rsvpStatus !== 'GOING') ? false : localRegistered,
        likeCount: action === 'like' 
          ? (!localLiked ? localLikeCount + 1 : Math.max(0, localLikeCount - 1)) 
          : localLikeCount,
        saveCount: action === 'save'
          ? (!localSaved ? localSaveCount + 1 : Math.max(0, localSaveCount - 1))
          : localSaveCount
      };
      
      onAction(optimisticEvent, action, rsvpStatus);
    } catch (error) {
      console.error("Error handling event action:", action, error);
      // Revert optimistic updates on error
      if (action === 'like') {
        setLocalLiked(!!event.isLikedByUser);
        setLocalLikeCount(event.likeCount || 0);
      } else if (action === 'save') {
        setLocalSaved(!!event.isSavedByUser);
        setLocalSaveCount(event.saveCount || 0);
      } else if (action === 'register' || action === 'rsvp') {
        setLocalRegistered(!!event.isRegisteredByUser);
      }
    }
  }, [event, onAction, localLiked, localSaved, localRegistered, localLikeCount, localSaveCount]);

  return (
    <Card className="overflow-hidden h-full flex flex-col relative">
      {/* Event Image */}
      <div className="h-40 w-full overflow-hidden bg-gray-200">
        {displayImage ? (
          <img
            src={displayImage}
            alt={event.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image doesn't load
              e.currentTarget.src = "/placeholder.png";
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-100 to-purple-100">
            <div className="text-2xl font-bold text-gray-500">{event.name.substring(0, 2).toUpperCase()}</div>
          </div>
        )}
        
        {/* Category Badge */}
        <Badge
          className="absolute top-2 right-2 bg-opacity-80 backdrop-blur-sm"
          variant="secondary"
        >
          {event.category || "Event"}
        </Badge>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex flex-col">
          <div className="text-lg font-bold line-clamp-1">{event.name}</div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          {/* Only show participant count for internal events */}
          {!isExternal && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Users className="h-3 w-3 mr-1" />
              <span>{event.participantCount || 0} {event.participantCount === 1 ? 'person' : 'people'}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-grow">
        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
        
        {/* Status indicator for admin */}
        {isAdmin && event.status && (
          <Badge 
            variant={event.status === 'PENDING' ? 'outline' : 
                   event.status === 'APPROVED' ? 'default' : 'destructive'}
            className="mt-2 text-xs"
          >
            {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
          </Badge>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between border-t">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`px-2 ${localLiked ? 'text-red-500' : ''}`}
            onClick={(e) => handleAction(e, 'like')}
            title={localLiked ? "Unlike" : "Like"}
          >
            <Heart className={`h-4 w-4 mr-1 ${localLiked ? 'fill-red-500' : ''}`} />
            <span>{localLikeCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={`px-2 ${localSaved ? 'text-blue-500' : ''}`}
            onClick={(e) => handleAction(e, 'save')}
            title={localSaved ? "Unsave" : "Save"}
          >
            <BookmarkIcon className={`h-4 w-4 mr-1 ${localSaved ? 'fill-blue-500' : ''}`} />
            <span>{localSaveCount}</span>
          </Button>
        </div>
        
        {/* Registration indicator - always visible based on registration status */}
        {localRegistered && !isExternal && (
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 text-green-600 border-green-200 bg-green-50"
          >
            <CheckCircle className="h-3 w-3" />
            Registered
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
});

// Add display name for debugging
EventCard.displayName = 'EventCard';

// Export default for compatibility
export default EventCard;