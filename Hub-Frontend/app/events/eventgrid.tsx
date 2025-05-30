'use client'

import { useEffect, useState, useRef } from "react"
import { useMutation } from "@apollo/client"
import { Button } from "@/components/ui/button"
import { Loader2, ExternalLink, CheckCircle } from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { EventCard } from "@/components/dashboard/eventcard"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  REGISTER_FOR_EVENT,
  UPDATE_EVENT_PARTICIPATION
} from "@/app/apollo/mutations/eventsmutations"

// Define proper types
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Event {
  id: string;
  name: string;
  description?: string;
  location: string;
  startDate: string;
  endDate?: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  isLikedByUser?: boolean;
  isSavedByUser?: boolean;
  isRegisteredByUser?: boolean; // Add registration status property
  likeCount?: number;
  saveCount?: number;
  participantCount?: number;
  __typename?: string;
  creatorType?: string;
  status?: string;
  mediaLinks?: string[];
  externalUrl?: string;
  coordinates?: Coordinates;
  creator?: {
    id: string;
    firstName?: string;
  };
}

interface EventsGridProps {
  events: Event[];
  isLoading: boolean;
  error: Error | null;
  activeTab: string;
  isAdmin: boolean;
  onAction: (event: Event, action: string, rsvpStatus?: string) => void;
  onRetry?: () => void;
  userId?: string;
}

type RSVPStatus = 'GOING' | 'MAYBE' | 'NOT_GOING';

// Main EventsGrid component
export const EventsGrid = ({
  events,
  isLoading,
  error,
  activeTab,
  isAdmin,
  onAction,
  onRetry,
  userId
}: EventsGridProps) => {
  // State for the details dialog
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState<boolean>(false);
  const [showRsvpOptions, setShowRsvpOptions] = useState<boolean>(false);
  const [registeringInProgress, setRegisteringInProgress] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false); // Track registration status
  
  // Ref for detecting clicks outside the RSVP dropdown
  const rsvpDropdownRef = useRef<HTMLDivElement>(null);
  
  // Register for event mutation
  const [registerForEvent] = useMutation(REGISTER_FOR_EVENT, {
    onCompleted: (data) => {
      setRegisteringInProgress(false);
      setIsRegistered(true); // Update registration state
      
      // Update the selected event with registration status
      if (selectedEvent) {
        setSelectedEvent({
          ...selectedEvent,
          isRegisteredByUser: true
        });
      }
      
      toast({
        title: "Registration Successful",
        description: `You're now registered for ${data.registerForEvent.event.name}`
      });
    },
    onError: (error) => {
      console.error("Error registering for event:", error);
      
      // Don't set registering to false here, as we'll try to update instead
      // We'll handle that in the smart register function
    }
  });
  
  // Update event participation mutation
  const [updateEventParticipation] = useMutation(UPDATE_EVENT_PARTICIPATION, {
    onCompleted: (data) => {
      setRegisteringInProgress(false);
      
      // Set registration status based on RSVP status
      const isNowRegistered = data.updateEventParticipation.rsvpStatus === 'GOING';
      setIsRegistered(isNowRegistered);
      
      // Update the selected event with registration status
      if (selectedEvent) {
        setSelectedEvent({
          ...selectedEvent,
          isRegisteredByUser: isNowRegistered
        });
      }
      
      toast({
        title: "RSVP Updated",
        description: `You're now ${data.updateEventParticipation.rsvpStatus.toLowerCase()} to this event`
      });
    },
    onError: (error) => {
      setRegisteringInProgress(false);
      console.error("Error updating event participation:", error);
      toast({
        title: "Error",
        description: "Failed to update your RSVP status.",
        variant: "destructive"
      });
    }
  });
  
  // Set initial registration status when event is selected
  useEffect(() => {
    if (selectedEvent) {
      setIsRegistered(selectedEvent.isRegisteredByUser || false);
    }
  }, [selectedEvent]);
  
  // Smart registration function that handles both new registrations and updates
  const handleSmartRegister = () => {
    if (!selectedEvent || !userId) {
      toast({
        title: "Error",
        description: "Missing event or user information",
        variant: "destructive"
      });
      return;
    }

    // Set loading state
    setRegisteringInProgress(true);
    
    // Try to register first
    registerForEvent({
      variables: {
        eventId: selectedEvent.id,
        userId: userId,
        rsvpStatus: "GOING"
      },
      onError: (error) => {
        // Check if error indicates user is already registered
        if (error.message.includes("already registered") || 
            error.message.includes("already exists") ||
            error.message.includes("duplicate")) {
          
          // User is already registered, try to update instead
          updateEventParticipation({
            variables: {
              eventId: selectedEvent.id,
              userId: userId,
              data: {
                rsvpStatus: "GOING",
                registrationStatus: "REGISTERED"
              }
            }
          });
        } else {
          // Different kind of error
          setRegisteringInProgress(false);
          console.error("Error registering for event:", error);
          toast({
            title: "Error",
            description: "Failed to register for this event. Please try again.",
            variant: "destructive"
          });
        }
      }
    });
  };
  
  // Open details dialog for an event
  const handleOpenDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailsDialog(true);
    setIsRegistered(event.isRegisteredByUser || false);
  };
  
  // Close details dialog
  const handleCloseDetails = () => {
    // If the registration status changed, update the event in the parent component
    if (selectedEvent && isRegistered !== (selectedEvent.isRegisteredByUser || false)) {
      const updatedEvent = {
        ...selectedEvent,
        isRegisteredByUser: isRegistered
      };
      
      // Notify parent component of registration change
      onAction(updatedEvent, 'register');
    }
    
    setShowDetailsDialog(false);
    setSelectedEvent(null);
  };
  
  // Handle RSVP action
  const handleRsvp = (status: RSVPStatus) => {
    if (!selectedEvent || !userId) {
      toast({
        title: "Error",
        description: "Missing event or user information",
        variant: "destructive"
      });
      return;
    }
    
    // Map RSVP status to registration status
    let registrationStatus;
    switch(status) {
      case 'GOING':
        registrationStatus = 'REGISTERED';
        break;
      case 'MAYBE':
        registrationStatus = 'PENDING';
        break;
      case 'NOT_GOING':
        registrationStatus = 'CANCELED';
        break;
      default:
        registrationStatus = 'REGISTERED';
    }
    
    setRegisteringInProgress(true);
    
    // Try to update first, and if that fails, try to register
    updateEventParticipation({
      variables: {
        eventId: selectedEvent.id,
        userId: userId,
        data: {
          rsvpStatus: status,
          registrationStatus: registrationStatus
        }
      },
      onError: (error) => {
        // If update fails, try to register instead
        registerForEvent({
          variables: {
            eventId: selectedEvent.id,
            userId: userId,
            rsvpStatus: status
          }
        }).catch(registerError => {
          setRegisteringInProgress(false);
          console.error("Failed to register after update failed:", registerError);
          toast({
            title: "Error",
            description: "Failed to update your RSVP status.",
            variant: "destructive"
          });
        });
      }
    });
    
    setShowRsvpOptions(false);
    
    // Also notify the parent component
    const updatedEvent = {
      ...selectedEvent,
      isRegisteredByUser: status === 'GOING'
    };
    onAction(updatedEvent, 'rsvp', status);
  };
  
  // Handle action with dropdown handling
  const handleAction = (e: React.MouseEvent, action: string, rsvpStatus?: RSVPStatus) => {
    e.stopPropagation();
    
    if (action === 'rsvp' && rsvpStatus && selectedEvent) {
      handleRsvp(rsvpStatus);
    } else if (selectedEvent) {
      onAction(selectedEvent, action, rsvpStatus);
    }
  };

  // Handle clicks outside RSVP dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        rsvpDropdownRef.current && 
        !rsvpDropdownRef.current.contains(event.target as Node)
      ) {
        setShowRsvpOptions(false);
      }
    };
    
    if (showRsvpOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRsvpOptions]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date TBD";
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (error) {
      return "Date Error";
    }
  };
  
  // Loading state
  if (isLoading && events.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center my-8 text-red-500">
        <p>Error loading events: {error.message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onRetry}
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <div className="col-span-3 text-center py-12">
        <p className="text-muted-foreground">
          {activeTab === 'all' ? "No events found. Try adjusting your filters." :
           activeTab === 'my' ? "You haven't created any events yet." :
           "You haven't saved any events yet."}
        </p>
      </div>
    );
  }

  // Check if selected event is external
  const isExternal = selectedEvent && 
    (selectedEvent.__typename === 'ExternalEvent' || 
    (selectedEvent.id && selectedEvent.id.includes('external')));

  return (
    <>
      {/* Event cards grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {events.map((event, index) => {
          // Make sure each event has the correct __typename
          const enhancedEvent = {
            ...event,
            __typename: event.__typename || (event.id && event.id.includes('external') ? 'ExternalEvent' : 'Event')
          };
          
          return (
            <div 
              key={enhancedEvent?.id || index} 
              className="cursor-pointer transition-transform hover:scale-[1.01]"
              onClick={() => handleOpenDetails(enhancedEvent)}
            >
              <EventCard
                event={enhancedEvent}
                isAdmin={isAdmin}
                onAction={onAction}
              />
            </div>
          );
        })}
      </div>
      
      {/* Details Dialog */}
      {selectedEvent && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-black">
                <div className="flex items-center justify-between">
                  <span>{selectedEvent.name}</span>
                  {/* Show registration badge in dialog title if registered */}
                  {isRegistered && !isExternal && (
                    <Badge 
                      variant="outline" 
                      className="flex items-center gap-1 text-green-600 border-green-200 bg-green-50"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Registered
                    </Badge>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div>
                <h4 className="font-medium mb-1 text-sm text-black">Date & Time</h4>
                <p className="text-sm text-gray-600">
                  {formatDate(selectedEvent.startDate)}
                  {selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.startDate && 
                    ` - ${formatDate(selectedEvent.endDate)}`}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1 text-sm text-black">Location</h4>
                <p className="text-sm text-gray-600">{selectedEvent.location}</p>
              </div>
              
              {/* Only show participant count for internal events */}
              {!isExternal && (
                <div>
                  <h4 className="font-medium mb-1 text-sm text-black">Participants</h4>
                  <p className="text-sm text-gray-600">
                    {selectedEvent.participantCount || 0} 
                    {(selectedEvent.participantCount === 1) ? ' person' : ' people'}
                  </p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-1 text-sm text-black">Description</h4>
                <p className="text-sm text-gray-600">
                  {selectedEvent.description || "No description available"}
                </p>
              </div>
              
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1 text-sm text-black">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedEvent.tags.map((tag, i) => (
                      <span key={i} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs border border-gray-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex sm:justify-between gap-2 border-t pt-4">
              {isExternal ? (
                // For external events, show a URL link button
                <Button 
                  onClick={() => {
                    if (selectedEvent.externalUrl) {
                      window.open(selectedEvent.externalUrl, '_blank');
                    }
                    handleCloseDetails();
                  }}
                  className="flex items-center gap-2 w-full bg-black text-white hover:bg-gray-800"
                >
                  Visit Event <ExternalLink className="h-4 w-4" />
                </Button>
              ) : (
                // For internal events, show RSVP and Register buttons
                <>
                  <div className="flex gap-2 flex-1">
                    <div className="relative" ref={rsvpDropdownRef}>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRsvpOptions(!showRsvpOptions);
                        }}
                        className="flex-1 border-gray-300 text-black hover:bg-gray-50"
                        disabled={registeringInProgress}
                      >
                        RSVP
                      </Button>
                      
                      {showRsvpOptions && (
                        <div className="absolute left-0 bottom-full mb-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[120px] p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-black font-medium hover:bg-gray-100"
                            onClick={(e) => handleAction(e, 'rsvp', 'GOING')}
                          >
                            Going
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-gray-700 hover:bg-gray-50 hover:text-black"
                            onClick={(e) => handleAction(e, 'rsvp', 'MAYBE')}
                          >
                            Maybe
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                            onClick={(e) => handleAction(e, 'rsvp', 'NOT_GOING')}
                          >
                            Not Going
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={handleSmartRegister} 
                    className={`flex-1 ${isRegistered ? 'bg-green-600 hover:bg-green-700' : 'bg-black hover:bg-gray-800'} text-white`}
                    disabled={registeringInProgress}
                  >
                    {registeringInProgress ? "Processing..." : isRegistered ? "Registered" : "Register"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default EventsGrid;