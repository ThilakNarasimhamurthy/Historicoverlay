'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from "@apollo/client";
import { GET_EVENTS_NEAR_ME, GET_USER_PARTICIPATIONS } from "@/app/apollo/queries/events";
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Navigation, List, Loader2, Filter, Heart, Bookmark, UserPlus, UserCheck, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EventsGrid } from '@/app/events/eventgrid';
import { EventCard } from '@/components/dashboard/eventcard';
import { IS_LOGGED_IN } from '@/app/apollo/operations/auth';
import { useToast } from "@/components/ui/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import {
  LIKE_EXTERNAL_EVENT,
  UNLIKE_EXTERNAL_EVENT,
  SAVE_EXTERNAL_EVENT,
  UNSAVE_EXTERNAL_EVENT,
  LIKE_INTERNAL_EVENT,
  UNLIKE_INTERNAL_EVENT,
  SAVE_INTERNAL_EVENT,
  UNSAVE_INTERNAL_EVENT,
  REGISTER_FOR_EVENT,
  UPDATE_EVENT_PARTICIPATION
} from "@/app/apollo/mutations/eventsmutations"

// Import leaflet CSS
import 'leaflet/dist/leaflet.css';

// Define interfaces
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Event {
  id: string;
  name: string;
  description?: string;
  category?: string;
  location: string;
  startDate: string;
  endDate?: string;
  coordinates?: Coordinates;
  mediaLinks?: string[];
  isLikedByUser?: boolean;
  isSavedByUser?: boolean;
  isRegisteredByUser?: boolean;
  likeCount?: number;
  saveCount?: number;
  participantCount?: number;
  __typename?: string;
  creatorType?: string;
  status?: string;
  externalUrl?: string;
  tags?: string[];
  creator?: {
    id: string;
    firstName?: string;
  };
  [key: string]: any;
}

// Dynamic import for Map components to avoid SSR issues
const MapWithNoSSR = dynamic(
  () => import('./mapcomponent'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] flex items-center justify-center bg-muted rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
);

export default function MapPage() {
  // Route parameter handling
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleParam = searchParams.get('role');
  const [userRole, setUserRole] = useState('student');
  
  // State management
  const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);
  const [viewMode, setViewMode] = useState('map');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [distance, setDistance] = useState(10); // Default 10km radius
  const [events, setEvents] = useState<Event[]>([]); // Store events locally
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  // Get current user from auth system with cache-first policy
  const { data: authData, loading: authLoading } = useQuery(IS_LOGGED_IN, {
    fetchPolicy: 'cache-first'
  });
  const currentUser = authData?.currentUser;
  const userId = currentUser?.id;

  // Event interaction mutations
  const [likeExternalEvent] = useMutation(LIKE_EXTERNAL_EVENT);
  const [unlikeExternalEvent] = useMutation(UNLIKE_EXTERNAL_EVENT);
  const [saveExternalEvent] = useMutation(SAVE_EXTERNAL_EVENT);
  const [unsaveExternalEvent] = useMutation(UNSAVE_EXTERNAL_EVENT);
  const [likeInternalEvent] = useMutation(LIKE_INTERNAL_EVENT);
  const [unlikeInternalEvent] = useMutation(UNLIKE_INTERNAL_EVENT);
  const [saveInternalEvent] = useMutation(SAVE_INTERNAL_EVENT);
  const [unsaveInternalEvent] = useMutation(UNSAVE_INTERNAL_EVENT);
  const [registerForEvent] = useMutation(REGISTER_FOR_EVENT);
  const [updateEventParticipation] = useMutation(UPDATE_EVENT_PARTICIPATION);

  // Query to fetch user participations for tracking registration status
  const { data: userParticipationsData } = useQuery(GET_USER_PARTICIPATIONS, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'network-only'
  });

  // Update role when URL parameter changes
  useEffect(() => {
    if (!currentUser) return; // Don't update if user not loaded

    if (roleParam && ['student', 'university', 'company'].includes(roleParam)) {
      setUserRole(roleParam);
    } else if (roleParam) {
      router.replace(`/maps?role=student`);
    } else {
      router.replace(`/maps?role=student`);
    }
  }, [roleParam, router, currentUser]);

  // Update registration ID map when participations data changes
  useEffect(() => {
    if (userParticipationsData?.userParticipatedEvents) {
      const newRegisteredIds = new Set<string>();
      userParticipationsData.userParticipatedEvents.forEach((event) => {
        newRegisteredIds.add(event.id);
      });
      setRegisteredEventIds(newRegisteredIds);
    }
  }, [userParticipationsData]);

  // Get user's location
  const getUserLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        console.log("Got user location:", coords);
        setUserCoordinates(coords);
        setIsLoadingLocation(false);
        toast({
          title: "Location updated",
          description: "Showing events near your current location",
        });
      }, (error) => {
        console.error("Error getting location:", error);
        toast({
          variant: "destructive",
          title: "Location Error",
          description: `Unable to get your location: ${error.message}. Please check your browser permissions.`
        });
        setIsLoadingLocation(false);
      });
    } else {
      toast({
        variant: "destructive",
        title: "Browser Error",
        description: "Geolocation is not supported by this browser."
      });
      setIsLoadingLocation(false);
    }
  };

  // Query for near me events - with cache-first policy for better performance during refresh
  const { data, loading, error, refetch } = useQuery(GET_EVENTS_NEAR_ME, {
    variables: {
      latitude: userCoordinates?.latitude || 40.7128, // Default to NYC
      longitude: userCoordinates?.longitude || -74.0060,
      radiusInKm: distance,
      take: 50,
      userId: userId,
      filter: {
        includeInternalEvents: true,
        includeExternalEvents: true
      }
    },
    skip: !userId, // Skip if no user ID is available
    fetchPolicy: 'cache-first', // Use cache-first to prevent refresh issues
    nextFetchPolicy: 'cache-and-network' // Then update when possible
  });

  // Update local events state when data changes or distance changes
  useEffect(() => {
    if (data?.eventsNearMe) {
      console.log(`Received ${data.eventsNearMe.length} events from query`);
      
      // Filter out events without valid coordinates
      const validEvents = data.eventsNearMe.filter(
        (event: Event) => hasValidCoordinates(event)
      );
      
      console.log(`${validEvents.length} events have valid coordinates`);
      
      // Set events with valid coordinates and add registration status
      const eventsWithRegistrationStatus = validEvents.map((event: Event) => ({
        ...event,
        isRegisteredByUser: registeredEventIds.has(event.id)
      }));
      
      setEvents(eventsWithRegistrationStatus);
    }
  }, [data, distance, registeredEventIds]);

  // Calculate distance from user to event
  const calculateDistance = (eventCoords?: Coordinates): string => {
    if (!userCoordinates || !eventCoords) return "Unknown";
    
    const R = 6371; // Earth's radius in km
    const dLat = (eventCoords.latitude - userCoordinates.latitude) * Math.PI / 180;
    const dLon = (eventCoords.longitude - userCoordinates.longitude) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userCoordinates.latitude * Math.PI / 180) * Math.cos(eventCoords.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Convert to miles
    const miles = distance * 0.621371;
    
    return miles.toFixed(1) + " miles away";
  };

  // Get user location on initial load - wait for authentication to complete
  useEffect(() => {
    if (!userCoordinates && !isLoadingLocation && userId && !authLoading) {
      getUserLocation();
    }
  }, [userId, authLoading]);

  // Handle event selection
  const handleEventSelect = (event: Event) => {
    // Add registration status to selected event
    const eventWithRegistrationStatus = {
      ...event,
      isRegisteredByUser: registeredEventIds.has(event.id)
    };
    setSelectedEvent(eventWithRegistrationStatus);
  };

  // Handle event actions - comprehensive handler like in events page
  const handleEventAction = useCallback((event: Event, action: string, rsvpStatus = 'GOING') => {
    if (!event || !event.id || !userId) {
      console.log("Missing required data:", { eventId: event?.id, userId });
      return;
    }
    
    // Determine if event is external or internal
    const isExternal = event.__typename === 'ExternalEvent';
    console.log(`${isExternal ? 'External' : 'Internal'} event ${action} action`, event.id);
    
    switch(action) {
      case 'like':
        if (isExternal) {
          if (event.isLikedByUser) {
            unlikeExternalEvent({ 
              variables: { eventId: event.id, userId },
              onCompleted: () => {
                refetch();
                toast({ title: "Unliked", description: "You've unliked this event" });
              },
              onError: (error) => {
                console.error("Error unliking external event:", error);
                toast({
                  title: "Error",
                  description: "Could not unlike event. Please try again.",
                  variant: "destructive"
                });
              }
            });
          } else {
            likeExternalEvent({ 
              variables: { eventId: event.id, userId },
              onCompleted: () => {
                refetch();
                toast({ title: "Liked", description: "You've liked this event" });
              },
              onError: (error) => {
                console.error("Error liking external event:", error);
                toast({
                  title: "Error",
                  description: "Could not like event. Please try again.",
                  variant: "destructive"
                });
              }
            });
          }
        } else {
          if (event.isLikedByUser) {
            unlikeInternalEvent({ 
              variables: { eventId: event.id, userId },
              onCompleted: () => {
                refetch();
                toast({ title: "Unliked", description: "You've unliked this event" });
              },
              onError: (error) => {
                console.error("Error unliking internal event:", error);
                toast({
                  title: "Error",
                  description: "Could not unlike event. Please try again.",
                  variant: "destructive"
                });
              }
            });
          } else {
            likeInternalEvent({ 
              variables: { eventId: event.id, userId },
              onCompleted: () => {
                refetch();
                toast({ title: "Liked", description: "You've liked this event" });
              },
              onError: (error) => {
                console.error("Error liking internal event:", error);
                toast({
                  title: "Error",
                  description: "Could not like event. Please try again.",
                  variant: "destructive"
                });
              }
            });
          }
        }
        break;
        
      case 'save':
        if (isExternal) {
          if (event.isSavedByUser) {
            unsaveExternalEvent({ 
              variables: { eventId: event.id, userId },
              onCompleted: () => {
                refetch();
                toast({ title: "Unsaved", description: "Event removed from saved events" });
              },
              onError: (error) => {
                console.error("Error unsaving external event:", error);
                toast({
                  title: "Error",
                  description: "Could not unsave event. Please try again.",
                  variant: "destructive"
                });
              }
            });
          } else {
            saveExternalEvent({ 
              variables: { eventId: event.id, userId },
              onCompleted: () => {
                refetch();
                toast({ title: "Saved", description: "Event added to saved events" });
              },
              onError: (error) => {
                console.error("Error saving external event:", error);
                toast({
                  title: "Error",
                  description: "Could not save event. Please try again.",
                  variant: "destructive"
                });
              }
            });
          }
        } else {
          if (event.isSavedByUser) {
            unsaveInternalEvent({ 
              variables: { eventId: event.id, userId },
              onCompleted: () => {
                refetch();
                toast({ title: "Unsaved", description: "Event removed from saved events" });
              },
              onError: (error) => {
                console.error("Error unsaving internal event:", error);
                toast({
                  title: "Error",
                  description: "Could not unsave event. Please try again.",
                  variant: "destructive"
                });
              }
            });
          } else {
            saveInternalEvent({ 
              variables: { eventId: event.id, userId },
              onCompleted: () => {
                refetch();
                toast({ title: "Saved", description: "Event added to saved events" });
              },
              onError: (error) => {
                console.error("Error saving internal event:", error);
                toast({
                  title: "Error",
                  description: "Could not save event. Please try again.",
                  variant: "destructive"
                });
              }
            });
          }
        }
        break;
        
      case 'rsvp':
        // Skip for external events
        if (isExternal) {
          toast({
            title: "External Event",
            description: "RSVP is not available for external events.",
            variant: "destructive"
          });
          return;
        }

        // Map RSVP status to registration status
        let registrationStatus;
        switch(rsvpStatus) {
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
        
        // Update the registration status in UI immediately (optimistic update)
        if (rsvpStatus === 'GOING') {
          setRegisteredEventIds(prev => {
            const newSet = new Set(prev);
            newSet.add(event.id);
            return newSet;
          });
        } else {
          setRegisteredEventIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(event.id);
            return newSet;
          });
        }
        
        updateEventParticipation({
          variables: {
            eventId: event.id,
            userId: userId,
            data: {
              rsvpStatus: rsvpStatus,
              registrationStatus: registrationStatus
            }
          },
          onCompleted: () => {
            refetch();
            toast({
              title: "RSVP Updated",
              description: `You're now ${rsvpStatus.toLowerCase()} to this event`
            });
          },
          onError: (error) => {
            console.error("Error updating RSVP:", error);
            
            // If update fails, try to register instead
            registerForEvent({
              variables: {
                eventId: event.id,
                userId: userId,
                rsvpStatus: rsvpStatus
              },
              onCompleted: () => {
                refetch();
                toast({
                  title: "Registration Successful",
                  description: `You're now registered for this event`
                });
              }
            }).catch(registerError => {
              console.error("Error registering after RSVP update failed:", registerError);
              toast({
                title: "Error",
                description: "Failed to update your RSVP status.",
                variant: "destructive"
              });
            });
          }
        });
        break;
      
      case 'register':
        // Skip for external events
        if (isExternal) {
          if (event.externalUrl) {
            window.open(event.externalUrl, '_blank');
          } else {
            toast({
              title: "External Event",
              description: "No registration link available for this event.",
              variant: "destructive"
            });
          }
          return;
        }

        // Optimistic UI update
        setRegisteredEventIds(prev => {
          const newSet = new Set(prev);
          newSet.add(event.id);
          return newSet;
        });

        registerForEvent({
          variables: {
            eventId: event.id,
            userId: userId,
            rsvpStatus: "GOING"
          },
          onCompleted: () => {
            refetch();
            toast({
              title: "Registration Successful",
              description: `You're now registered for this event`
            });
          },
          onError: (error) => {
            console.error("Error registering for event:", error);
            
            if (error.message.includes("already registered") || 
                error.message.includes("already exists") ||
                error.message.includes("duplicate")) {
              
              updateEventParticipation({
                variables: {
                  eventId: event.id,
                  userId: userId,
                  data: {
                    rsvpStatus: "GOING",
                    registrationStatus: "REGISTERED"
                  }
                },
                onCompleted: () => {
                  refetch();
                },
                onError: (updateError) => {
                  console.error("Error updating participation:", updateError);
                  toast({
                    title: "Error",
                    description: "Failed to update your registration status.",
                    variant: "destructive"
                  });
                }
              });
            } else {
              toast({
                title: "Error",
                description: "Failed to register for this event. Please try again.",
                variant: "destructive"
              });
              
              // Revert optimistic update on error
              setRegisteredEventIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(event.id);
                return newSet;
              });
            }
          }
        });
        break;
        
      case 'close':
        setSelectedEvent(null);
        break;
        
      default:
        break;
    }
  }, [userId, refetch, toast, registeredEventIds, likeExternalEvent, unlikeExternalEvent, 
      saveExternalEvent, unsaveExternalEvent, likeInternalEvent, unlikeInternalEvent, 
      saveInternalEvent, unsaveInternalEvent, registerForEvent, updateEventParticipation]);

  // When distance changes, refetch events
  useEffect(() => {
    if (userId && userCoordinates) {
      console.log(`Refetching events with distance: ${distance}km`);
      refetch({
        latitude: userCoordinates.latitude,
        longitude: userCoordinates.longitude,
        radiusInKm: distance,
        userId: userId
      });
    }
  }, [distance, userCoordinates, refetch, userId]);

  const hasValidCoordinates = (event: Event) => {
    return event.coordinates && 
           typeof event.coordinates.latitude === 'number' && 
           typeof event.coordinates.longitude === 'number' &&
           !isNaN(event.coordinates.latitude) && 
           !isNaN(event.coordinates.longitude);
  };

  return (
    <ProtectedRoute allowedRoles={['student', 'university', 'company', 'admin']}>
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <DashboardHeader 
            heading="Events Near Me" 
            text="Discover events happening in your area" 
          />

          <div className="flex flex-col md:flex-row gap-2 justify-between mb-2">
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                className="gap-1"
                onClick={getUserLocation}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                {isLoadingLocation ? "Getting Location..." : "Update Location"}
              </Button>

              <Button
                variant={viewMode === 'map' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                Map View
              </Button>
              
              <Button
                variant={viewMode === 'list' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-1" />
                List View
              </Button>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  className="text-sm border rounded p-1"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                >
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                  <option value="100">100 km</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Map View */}
          {viewMode === 'map' && (
            <div className="space-y-4">
              {/* Selected event details - inline display above map */}
              {selectedEvent && (
                <Card className="w-full">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-semibold">{selectedEvent.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(selectedEvent.startDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {selectedEvent.endDate && ` - ${new Date(selectedEvent.endDate).toLocaleDateString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{selectedEvent.location}</span>
                          {userCoordinates && selectedEvent.coordinates && (
                            <span className="ml-2">• {calculateDistance(selectedEvent.coordinates)}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEvent(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {selectedEvent.description && (
                      <p className="text-sm text-muted-foreground mb-4">{selectedEvent.description}</p>
                    )}
                    
                    {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedEvent.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {/* Like Button */}
                      <Button
                        variant={selectedEvent.isLikedByUser ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleEventAction(selectedEvent, 'like')}
                        className="gap-1"
                      >
                        <Heart 
                          className={`h-4 w-4 ${selectedEvent.isLikedByUser ? 'fill-current' : ''}`}
                        />
                        {selectedEvent.isLikedByUser ? 'Liked' : 'Like'}
                        {selectedEvent.likeCount && selectedEvent.likeCount > 0 && (
                          <span className="ml-1">({selectedEvent.likeCount})</span>
                        )}
                      </Button>
                      
                      {/* Save Button */}
                      <Button
                        variant={selectedEvent.isSavedByUser ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleEventAction(selectedEvent, 'save')}
                        className="gap-1"
                      >
                        <Bookmark 
                          className={`h-4 w-4 ${selectedEvent.isSavedByUser ? 'fill-current' : ''}`}
                        />
                        {selectedEvent.isSavedByUser ? 'Saved' : 'Save'}
                      </Button>
                      
                      {/* Register/RSVP Button */}
                      {selectedEvent.__typename !== 'ExternalEvent' ? (
                        <Button
                          variant={selectedEvent.isRegisteredByUser ? "secondary" : "default"}
                          size="sm"
                          onClick={() => handleEventAction(selectedEvent, selectedEvent.isRegisteredByUser ? 'rsvp' : 'register', selectedEvent.isRegisteredByUser ? 'NOT_GOING' : 'GOING')}
                          className="gap-1"
                        >
                          {selectedEvent.isRegisteredByUser ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                          {selectedEvent.isRegisteredByUser ? 'Unregister' : 'Register'}
                        </Button>
                      ) : (
                        selectedEvent.externalUrl && (
                          <Button
                            size="sm"
                            onClick={() => window.open(selectedEvent.externalUrl, '_blank')}
                            className="gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Event
                          </Button>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Map Component */}
              <Card className="w-full border overflow-hidden">
                <div className="w-full h-[500px]">
                  {authLoading ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <MapWithNoSSR 
                      userCoordinates={userCoordinates}
                      events={events}
                      loading={loading}
                      onEventSelect={handleEventSelect}
                      setUserCoordinates={setUserCoordinates}
                      distance={distance}
                    />
                  )}
                </div>
              </Card>
              
              {/* Events count */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {loading ? "Loading events..." : `Found ${events.length} events within ${distance} km`}
                </p>
                {events.length > 0 && (
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    View as list
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : events.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Found {events.length} events within {distance} km
                  </p>
                  <EventsGrid 
                    events={events}
                    isLoading={loading}
                    error={error}
                    activeTab="map"
                    isAdmin={false}
                    onAction={handleEventAction}
                    userId={userId}
                  />
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No events found nearby</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={getUserLocation} disabled={isLoadingLocation}>
                      {isLoadingLocation ? "Getting Location..." : "Update Location"}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setDistance(distance + 10)}
                    >
                      Increase Search Radius
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}