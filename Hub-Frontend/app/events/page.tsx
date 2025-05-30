'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useMutation, useQuery } from "@apollo/client"
import { gql } from "@apollo/client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardShell } from "@/components/dashboard-shell"
import { Search, MapPin, Calendar, Loader2, X } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"
import { IS_LOGGED_IN } from "@/app/apollo/operations/auth"
import { 
  GetAllEvents,
  GET_EVENTS_NEAR_ME,
  GET_MY_CREATED_EVENTS,
  GET_SAVED_EVENTS,
  GET_USER_PARTICIPATIONS
} from "@/app/apollo/queries/events"
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
  UPDATE_EVENT_PARTICIPATION,
  CREATE_EVENT
} from "@/app/apollo/mutations/eventsmutations"
import client from "@/app/apollo/client";
import { EventsGrid } from "@/app/events/eventgrid"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FileUploader from "@/components/uploads/fileuploader"
import { toast } from "@/components/ui/use-toast"

// Define proper type interfaces
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface EventFormData {
  name: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  capacity: number;
  isPublic: boolean;
  tags: string;
  perks: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  category?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  submit?: string;
  [key: string]: string | undefined;
}

interface EventParticipation {
  id: string;
  userId: string;
  rsvpStatus: string;
  registrationStatus: string;
  timestamp?: string;
  __typename?: string;
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
  isRegisteredByUser?: boolean; 
  likeCount?: number;
  saveCount?: number;
  participantCount?: number;
  __typename?: string;
  creatorType?: string;
  status?: string;
  mediaLinks?: string[];
  externalUrl?: string;
  coordinates?: Coordinates;
  participants?: EventParticipation[];
  creator?: {
    id: string;
    firstName?: string;
  };
}

// Add type for the user participations query response
interface UserParticipationsResponse {
  userParticipatedEvents: {
    id: string;
    name: string;
    startDate: string;
    endDate?: string;
    status?: string;
    participantCount?: number;
    participants?: EventParticipation[];
    __typename?: string;
  }[];
}

// FileUploader ref type
interface FileUploaderRef {
  clear: () => void;
}

const EVENTS_PER_PAGE = 100

export default function EventsPageWrapper() {
  return (
    <ProtectedRoute allowedRoles={['student', 'university', 'company', 'admin']}>
      <EventsPage />
    </ProtectedRoute>
  );
}

function EventsPage() {
  // Router and search params
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleParam = searchParams.get('role');

  // Initialize all state variables at the top
  const [userRole, setUserRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);
  const [nearMeActive, setNearMeActive] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Pagination state - using offset instead of page for "Load More"
  const [offset, setOffset] = useState<number>(0);

  // Create event modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false);

  // Map to track registered events
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set());

  // Ref for the FileUploader component
  const fileUploaderRef = useRef<FileUploaderRef>(null);

  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    description: "",
    category: "",
    location: "",
    startDate: "",
    startTime: "10:00",
    endDate: "",
    endTime: "16:00",
    capacity: 50,
    isPublic: true,
    tags: "",
    perks: ""
  });

  // Get user data from Apollo cache
  const { data: authData, loading: authLoading } = useQuery(IS_LOGGED_IN);
  const currentUser = authData?.currentUser || null;
  const userId = currentUser?.id || null;

  // Helper function to get query variables
  const getQueryVariables = useCallback(() => {
    return {
      filter: {
        name: searchTerm || undefined,
        category: categoryFilter === "ALL" ? undefined : categoryFilter,
        startDateAfter: dateFilter === "today" ? new Date().toISOString() :
               dateFilter === "week" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() :
               dateFilter === "month" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() :
               undefined,
        getAllEvents: dateFilter === "ALL" ? true : undefined,
        includeInternalEvents: true,
        includeExternalEvents: true
      },
      orderBy: { field: "START_DATE", direction: "ASC" },
      skip: offset,
      take: EVENTS_PER_PAGE,
      userId: userId
    };
  }, [searchTerm, categoryFilter, dateFilter, offset, userId]);

  // Query to fetch user participations for tracking registration status
  const {
    data: userParticipationsData,
    loading: userParticipationsLoading
  } = useQuery<UserParticipationsResponse>(GET_USER_PARTICIPATIONS, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'network-only'
  });

  // Query to fetch all events
  const {
    loading: allEventsLoading,
    error: allEventsError,
    data: allEventsData,
    fetchMore: fetchMoreAllEvents,
    refetch: refetchAllEvents
  } = useQuery(GetAllEvents, {
    variables: getQueryVariables(),
    fetchPolicy: 'network-only', // Changed to network-only to always get fresh data
    skip: !userId || nearMeActive || activeTab !== 'all'
  });

  // Query for near me events
  const {
    data: nearMeData,
    loading: nearMeLoading,
    fetchMore: fetchMoreNearMe,
    refetch: refetchNearMe
  } = useQuery(GET_EVENTS_NEAR_ME, {
    variables: {
      latitude: userCoordinates?.latitude || 0,
      longitude: userCoordinates?.longitude || 0,
      radiusInKm: 10,
      skip: offset,
      take: EVENTS_PER_PAGE,
      userId: userId,
      filter: {
        name: searchTerm || undefined,
        category: categoryFilter === "ALL" ? undefined : categoryFilter,
        startDateAfter: dateFilter === "today" ? new Date().toISOString() :
                       dateFilter === "week" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() :
                       dateFilter === "month" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() :
                       undefined,
      }
    },
    fetchPolicy: 'network-only', // Changed to network-only
    skip: !userCoordinates || !nearMeActive || !userId || activeTab !== 'all'
  });

  // Query for my events
  const {
    data: myEventsData,
    loading: myEventsLoading,
    fetchMore: fetchMoreMyEvents,
    refetch: refetchMyEvents
  } = useQuery(GET_MY_CREATED_EVENTS, {
    variables: {
      userId,
      skip: offset,
      take: EVENTS_PER_PAGE
    },
    fetchPolicy: 'network-only', // Changed to network-only
    skip: !userId || activeTab !== 'my' || (userRole !== 'company' && userRole !== 'university')
  });

  // Query for saved events
  const {
    data: savedEventsData,
    loading: savedEventsLoading,
    fetchMore: fetchMoreSavedEvents,
    refetch: refetchSavedEvents
  } = useQuery(GET_SAVED_EVENTS, {
    variables: {
      userId: userId,
      skip: offset,
      take: EVENTS_PER_PAGE
    },
    fetchPolicy: 'network-only', // Changed to network-only
    skip: !userId || activeTab !== 'saved'
  });

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

  // Create event mutation
  const [createEvent, { loading: createLoading }] = useMutation(CREATE_EVENT, {
    onCompleted: (data) => {
      // Reset form and close modal
      resetForm();
      setIsCreateModalOpen(false);

      // Refetch queries based on active tab
      if (activeTab === 'all') {
        refetchAllEvents();
      } else if (activeTab === 'my') {
        refetchMyEvents();
      }

      // Show success toast
      toast({
        title: "Success",
        description: "Event created successfully"
      });
    },
    onError: (error) => {
      console.error("Error creating event:", error);
      setFormErrors({
        submit: error.message || "Failed to create event. Please try again."
      });
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Event interaction mutations
  const [likeExternalEvent] = useMutation(LIKE_EXTERNAL_EVENT);
  const [unlikeExternalEvent] = useMutation(UNLIKE_EXTERNAL_EVENT);
  const [saveExternalEvent] = useMutation(SAVE_EXTERNAL_EVENT);
  const [unsaveExternalEvent] = useMutation(UNSAVE_EXTERNAL_EVENT);
  const [likeInternalEvent] = useMutation(LIKE_INTERNAL_EVENT);
  const [unlikeInternalEvent] = useMutation(UNLIKE_INTERNAL_EVENT);
  const [saveInternalEvent] = useMutation(SAVE_INTERNAL_EVENT);
  const [unsaveInternalEvent] = useMutation(UNSAVE_INTERNAL_EVENT);

  // Registration mutations
  const [registerForEvent] = useMutation(REGISTER_FOR_EVENT, {
    onCompleted: (data) => {
      // Update registration status in the registered events Set
      setRegisteredEventIds(prev => {
        const newSet = new Set(prev);
        newSet.add(data.registerForEvent.eventId);
        return newSet;
      });

      toast({
        title: "Registration Successful",
        description: `You're now registered for ${data.registerForEvent.event.name}`
      });
    },
    onError: (error) => {
      console.error("Error registering for event:", error);
    }
  });
  
  const [updateEventParticipation] = useMutation(UPDATE_EVENT_PARTICIPATION, {
    onCompleted: (data) => {
      // Only set as registered if RSVP status is GOING
      if (data.updateEventParticipation.rsvpStatus === 'GOING') {
        setRegisteredEventIds(prev => {
          const newSet = new Set(prev);
          newSet.add(data.updateEventParticipation.eventId);
          return newSet;
        });
      } else {
        setRegisteredEventIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.updateEventParticipation.eventId);
          return newSet;
        });
      }
      
      toast({
        title: "RSVP Updated",
        description: `Your attendance status has been updated to ${data.updateEventParticipation.rsvpStatus.toLowerCase()}`
      });
    },
    onError: (error) => {
      console.error("Error updating event participation:", error);
      toast({
        title: "Error",
        description: "Failed to update your RSVP status.",
        variant: "destructive"
      });
    }
  });
  
  // Update role from cache and URL parameter
  useEffect(() => {
    if (authLoading) return;
    
    if (currentUser) {
      // Set whether the user is an admin
      setIsAdmin(currentUser.role?.toLowerCase() === 'admin');
      
      // Determine the effective role
      let effectiveRole = currentUser.role?.toLowerCase() || 'student';
      
      // If role param exists and is valid, use it instead
      if (roleParam && ['student', 'university', 'company', 'admin'].includes(roleParam)) {
        effectiveRole = roleParam;
      } else if (roleParam) {
        // If role is invalid, redirect to the user's actual role
        router.replace(`/events?role=${effectiveRole}`);
        return;
      } else {
        // If no role provided, add the user's role to URL
        router.replace(`/events?role=${effectiveRole}`);
        return;
      }
      
      setUserRole(effectiveRole);
    }
  }, [authLoading, currentUser, roleParam, router]);

  // Reset offset when filters or tab changes
  useEffect(() => {
    setOffset(0);
  }, [categoryFilter, dateFilter, searchTerm, activeTab, nearMeActive]);
  
  // Helper to check if user is registered for an event
  const isUserRegisteredForEvent = useCallback((eventId: string) => {
    return registeredEventIds.has(eventId);
  }, [registeredEventIds]);

  // Handle file upload complete
  const handleUploadComplete = useCallback((urls: string[]) => {
    setMediaUrls(prevUrls => [...prevUrls, ...urls]);
    console.log("Media URLs after upload:", urls);
    
    if (urls.length > 0) {
      // Clear the single image if file uploader is used
      setImageFile(null);
      setImagePreview(null);
    }
  }, []);
  
  // Reset form state
  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      category: "",
      location: "",
      startDate: "",
      startTime: "10:00",
      endDate: "",
      endTime: "16:00",
      capacity: 50,
      isPublic: true,
      tags: "",
      perks: ""
    });
    setImageFile(null);
    setImagePreview(null);
    setMediaUrls([]);
    setFormErrors({});
    
    // Reset the file uploader
    if (fileUploaderRef.current) {
      fileUploaderRef.current.clear();
    }
  }, []);

  // Handle image file selection (for single image upload)
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors for this field when user changes input
    if (formErrors[id]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[id];
        return newErrors;
      });
    }
  }, [formErrors]);

  // Handle select change
  const handleSelectChange = useCallback((value: string, fieldName: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear errors for this field
    if (formErrors[fieldName]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [formErrors]);

  // SIMPLFIIED: Function to force refetch based on current tab
  const refetchCurrentView = useCallback(() => {
    console.log(`Refetching ${activeTab} tab data...`);
    
    if (activeTab === 'all') {
      if (nearMeActive) {
        refetchNearMe();
      } else {
        refetchAllEvents();
      }
    } else if (activeTab === 'my') {
      refetchMyEvents();
    } else if (activeTab === 'saved') {
      refetchSavedEvents();
    }
  }, [activeTab, nearMeActive, refetchAllEvents, refetchNearMe, refetchMyEvents, refetchSavedEvents]);

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: FormErrors = {};
    if (!formData.name.trim()) errors.name = "Title is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.category) errors.category = "Category is required";
    if (!formData.location.trim()) errors.location = "Location is required";
    if (!formData.startDate) errors.startDate = "Start date is required";
    if (!formData.endDate) errors.endDate = "End date is required";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Convert form data to match the GraphQL mutation structure
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      // Validate dates
      if (endDateTime <= startDateTime) {
        setFormErrors({
          endDate: "End date must be after start date"
        });
        return;
      }
      
      // Prepare tags array from comma-separated string
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];
      
      // Add perks to tags if provided
      if (formData.perks) {
        tagsArray.push(...formData.perks.split(',').map(perk => perk.trim()).filter(Boolean));
      }
      
      // Submit mutation with mediaLinks
      await createEvent({
        variables: {
          data: {
            name: formData.name,
            description: formData.description,
            category: formData.category.toUpperCase(),
            location: formData.location,
            startDate: startDateTime.toISOString(),
            endDate: endDateTime.toISOString(),
            capacity: parseInt(formData.capacity.toString(), 10),
            isPublic: formData.isPublic,
            tags: tagsArray,
            creatorId: userId,
            // mediaLinks: mediaUrls, // Add media URLs from FileUploader
          }
        }
      });
      
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormErrors({
        submit: "Failed to create event. Please try again."
      });
    }
  };

  // Get user location when "Near Me" is clicked
  const handleNearMeClick = () => {
    // If already active, deactivate
    if (nearMeActive) {
      setNearMeActive(false);
      return;
    }
    
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setNearMeActive(true);
          setIsLoadingLocation(false);
          
          // Show success toast
          toast({ 
            title: "Location Found",
            description: "Showing events near your location" 
          });
        }, 
        (error) => {
          console.error("Error getting location:", error);
          
          let errorMessage = "Unable to get your location.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "You denied the request for geolocation. Please check your browser permissions.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "The request to get your location timed out.";
              break;
          }
          
          toast({
            title: "Location Error",
            description: errorMessage,
            variant: "destructive"
          });
          
          setIsLoadingLocation(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive"
      });
      setIsLoadingLocation(false);
    }
  };

  // SIMPLIFIED Function to handle event interactions
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
            // Unlike external event
            unlikeExternalEvent({ 
              variables: { 
                eventId: event.id, 
                userId 
              },
              onCompleted: () => {
                refetchCurrentView();
                toast({
                  title: "Unliked",
                  description: "You've unliked this event",
                });
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
            // Like external event
            likeExternalEvent({ 
              variables: { 
                eventId: event.id, 
                userId 
              },
              onCompleted: () => {
                refetchCurrentView();
                toast({
                  title: "Liked",
                  description: "You've liked this event",
                });
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
          // Handle internal event like/unlike
          if (event.isLikedByUser) {
            // Unlike internal event
            unlikeInternalEvent({ 
              variables: { 
                eventId: event.id, 
                userId 
              },
              onCompleted: () => {
                refetchCurrentView();
                toast({
                  title: "Unliked",
                  description: "You've unliked this event",
                });
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
            // Like internal event
            likeInternalEvent({ 
              variables: { 
                eventId: event.id, 
                userId 
              },
              onCompleted: () => {
                refetchCurrentView();
                toast({
                  title: "Liked",
                  description: "You've liked this event",
                });
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
            // Unsave external event
            unsaveExternalEvent({ 
              variables: { 
                eventId: event.id, 
                userId 
              },
              onCompleted: () => {
                refetchCurrentView();
                toast({
                  title: "Unsaved",
                  description: "Event has been removed from your saved events",
                });
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
            // Save external event
            saveExternalEvent({ 
              variables: { 
                eventId: event.id, 
                userId 
              },
              onCompleted: () => {
                refetchCurrentView();
                toast({
                  title: "Saved",
                  description: "Event has been added to your saved events",
                });
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
          // Handle internal event save/unsave
          if (event.isSavedByUser) {
            // Unsave internal event
            unsaveInternalEvent({ 
              variables: { 
                eventId: event.id, 
                userId 
              },
              onCompleted: () => {
                refetchCurrentView();
                toast({
                  title: "Unsaved",
                  description: "Event has been removed from your saved events",
                });
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
            // Save internal event
            saveInternalEvent({ 
              variables: { 
                eventId: event.id, 
                userId 
              },
              onCompleted: () => {
                refetchCurrentView();
                toast({
                  title: "Saved",
                  description: "Event has been added to your saved events",
                });
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
        
        // Try to update first, if it fails, try to register
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
            refetchCurrentView();
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
                refetchCurrentView();
              }
            }).catch(registerError => {
              console.error("Error registering after RSVP update failed:", registerError);
              toast({
                title: "Error",
                description: "Failed to update your RSVP status.",
                variant: "destructive"
              });
              
              // Revert optimistic update on error
              if (rsvpStatus === 'GOING') {
                setRegisteredEventIds(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(event.id);
                  return newSet;
                });
              } else {
                // If not going failed, we don't know original state, so refetch
                client.refetchQueries({
                  include: [GET_USER_PARTICIPATIONS]
                });
              }
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

        // Try to register
        registerForEvent({
          variables: {
            eventId: event.id,
            userId: userId,
            rsvpStatus: "GOING"
          },
          onCompleted: () => {
            refetchCurrentView();
          },
          onError: (error) => {
            console.error("Error registering for event:", error);
            
            // Check if error indicates user is already registered
            if (error.message.includes("already registered") || 
                error.message.includes("already exists") ||
                error.message.includes("duplicate")) {
              
              // User is already registered, try to update instead
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
                  refetchCurrentView();
                },
                onError: (updateError) => {
                  console.error("Error updating participation:", updateError);
                  toast({
                    title: "Error",
                    description: "Failed to update your registration status.",
                    variant: "destructive"
                  });
                  
                  // Revert optimistic update on error
                  client.refetchQueries({
                    include: [GET_USER_PARTICIPATIONS]
                  });
                }
              });
            } else {
              // Different kind of error
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
      
      case 'approve':
        // Only for admin users to approve events from universities and companies
        if (isAdmin && (event.creatorType === 'UNIVERSITY' || event.creatorType === 'COMPANY')) {
          // Implement approval mutation here
          toast({
            title: "Event Approved",
            description: `${event.name} has been approved.`,
          });
          refetchCurrentView();
        }
        break;
      default:
        break;
    }
  }, [userId, isAdmin, refetchCurrentView, likeExternalEvent, unlikeExternalEvent, saveExternalEvent, unsaveExternalEvent, 
      likeInternalEvent, unlikeInternalEvent, saveInternalEvent, unsaveInternalEvent,
      registerForEvent, updateEventParticipation]);

  // Load more events handler
  const handleLoadMore = async () => {
    setLoadingMore(true);
    const newOffset = offset + EVENTS_PER_PAGE;
    
    try {
      if (activeTab === 'all') {
        if (nearMeActive && userCoordinates) {
          await fetchMoreNearMe({
            variables: {
              ...getQueryVariables(),
              skip: newOffset,
              latitude: userCoordinates.latitude,
              longitude: userCoordinates.longitude
            }
          });
        } else {
          await fetchMoreAllEvents({
            variables: {
              ...getQueryVariables(),
              skip: newOffset
            }
          });
        }
      } else if (activeTab === 'my') {
        await fetchMoreMyEvents({
          variables: {
            userId,
            skip: newOffset,
            take: EVENTS_PER_PAGE
          }
        });
      } else if (activeTab === 'saved') {
        await fetchMoreSavedEvents({
          variables: {
            userId: userId,
            skip: newOffset,
            take: EVENTS_PER_PAGE
          }
        });
      }
      
      setOffset(newOffset);
    } catch (error) {
      console.error("Error loading more events:", error);
      toast({
        title: "Error",
        description: "Failed to load more events. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingMore(false);
    }
  };

  // Add registration status to events
  const eventsWithRegistrationStatus = useMemo(() => {
    const getEvents = () => {
      if (activeTab === 'all') {
        return nearMeActive ? nearMeData?.eventsNearMe : allEventsData?.allEvents;
      } else if (activeTab === 'my') {
        return myEventsData?.userCreatedEvents;
      } else if (activeTab === 'saved') {
        return savedEventsData?.userSavedEvents;
      }
      return [];
    };
    
    const events = getEvents() || [];
    
    return events.map((event: { id: string }) => ({
      ...event,
      isRegisteredByUser: isUserRegisteredForEvent(event.id)
    }));
  }, [activeTab, nearMeActive, nearMeData, allEventsData, myEventsData, savedEventsData, isUserRegisteredForEvent]);
  
  // Get loading state based on active tab
  const isLoading = useMemo(() => {
    if (activeTab === 'all') {
      return nearMeActive ? nearMeLoading : allEventsLoading;
    } else if (activeTab === 'my') {
      return myEventsLoading;
    } else if (activeTab === 'saved') {
      return savedEventsLoading;
    }
    return false;
  }, [activeTab, nearMeActive, nearMeLoading, allEventsLoading, myEventsLoading, savedEventsLoading]);
  
  // Get error state based on active tab
  const getError = useMemo(() => {
    if (activeTab === 'all') {
      return allEventsError;
    }
    return null;
  }, [activeTab, allEventsError]);

  // Check if page is in initial loading state
  const isPageLoading = authLoading || !userRole || userParticipationsLoading;

  // Determine if there are more events to load
  const hasMoreEvents = eventsWithRegistrationStatus.length > 0 && eventsWithRegistrationStatus.length % EVENTS_PER_PAGE === 0;

  // Render loading state if needed
  if (isPageLoading) {
    return (
      <DashboardLayout>
        <DashboardShell>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">Loading...</p>
          </div>
        </DashboardShell>
      </DashboardLayout>
    );
  }

  const handleRetry = () => {
    refetchCurrentView();
  };

  // Main render
  return (
    <DashboardLayout>
      <DashboardShell>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          {/* Only show Create Event for universities and companies */}
          {(userRole === 'university' || userRole === 'company') && (
            <Button onClick={() => setIsCreateModalOpen(true)}>Create Event</Button>
          )}
        </div>

        {/* Tabs Navigation */}
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mt-6"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Events</TabsTrigger>
            {/* Only show My Events for universities and companies */}
            {(userRole === 'university' || userRole === 'company') && (
              <TabsTrigger value="my">My Events</TabsTrigger>
            )}
            <TabsTrigger value="saved">Saved Events</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Filters - Only show in "All Events" tab */}
            <div className="grid gap-4 md:grid-cols-[1fr_200px_200px_auto]">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search events..." 
                  className="w-full pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      refetchAllEvents();
                    }
                  }}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="HACKATHON">Hackathon</SelectItem>
                  <SelectItem value="WORKSHOP">Workshop</SelectItem>
                  <SelectItem value="NETWORKING">Networking</SelectItem>
                  <SelectItem value="CONFERENCE">Conference</SelectItem>
                  <SelectItem value="SUMMIT">Summit</SelectItem>
                  <SelectItem value="COMPETITION">Competition</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger><SelectValue placeholder="Date" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant={nearMeActive ? "default" : "outline"} 
                className="flex gap-2"
                onClick={handleNearMeClick}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                <span>{isLoadingLocation ? "Loading..." : nearMeActive ? "Near Me Active" : "Near Me"}</span>
              </Button>
            </div>
            
            {/* Event Grid for All Events */}
            <EventsGrid 
              events={eventsWithRegistrationStatus}
              isLoading={isLoading}
              error={null}
              activeTab={activeTab}
              isAdmin={isAdmin}
              onAction={handleEventAction}
              onRetry={handleRetry}
              userId={userId}
            />
          </TabsContent>

          {/* My Events Tab - Only for universities and companies */}
          {(userRole === 'university' || userRole === 'company') && (
            <TabsContent value="my" className="space-y-4">
              <EventsGrid 
                events={eventsWithRegistrationStatus}
                isLoading={isLoading}
                error={null}
                activeTab={activeTab}
                isAdmin={isAdmin}
                onAction={handleEventAction}
                onRetry={handleRetry}
                userId={userId}
              />
            </TabsContent>
          )}

          {/* Saved Events Tab */}
          <TabsContent value="saved" className="space-y-4">
            <EventsGrid
              events={eventsWithRegistrationStatus}
              isLoading={isLoading}
              error={null}
              activeTab={activeTab}
              isAdmin={isAdmin}
              onAction={handleEventAction}
              onRetry={handleRetry}
              userId={userId}
            />
          </TabsContent>
        </Tabs>

        {/* Load More Button */}
        {hasMoreEvents && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loadingMore || isLoading}
              className="w-48"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}

        {/* Create Event Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white-100">
            <DialogHeader className="border-red-200">
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Fill out the details to create a new event
              </DialogDescription>
            </DialogHeader>

            {formErrors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{formErrors.submit}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleFormSubmit}>
              {/* File Uploader Component */}
              <div className="space-y-2">
                <Label>Upload Event Images</Label>
                <FileUploader
                  ref={fileUploaderRef}
                  onUploadComplete={handleUploadComplete}
                  allowedTypes="image/*"
                  maxFiles={5}
                  onUploadStarted={() => setIsUploadingFiles(true)}
                  onUploadFinished={() => setIsUploadingFiles(false)}
                  clearAfterUpload={false}
                />

                {/* Display uploaded media */}
                {mediaUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {mediaUrls.map((url, index) => (
                      <div key={index} className="relative rounded-md overflow-hidden border">
                        <img
                          src={url}
                          alt={`Event image ${index + 1}`}
                          className="w-full h-20 object-cover"
                          onError={(e) => {
                            console.error(`Failed to load image: ${url}`);
                            e.currentTarget.src = "/placeholder.png";
                          }}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full"
                          onClick={() => {
                            setMediaUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
                          }}
                          disabled={createLoading}
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Title*</Label>
                <Input
                  id="name"
                  placeholder="Event Title"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date*</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={formErrors.startDate ? "border-red-500" : ""}
                  />
                  {formErrors.startDate && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date*</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={formErrors.endDate ? "border-red-500" : ""}
                  />
                  {formErrors.endDate && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.endDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location*</Label>
                <Input
                  id="location"
                  placeholder="e.g., NYU Tech Center"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={formErrors.location ? "border-red-500" : ""}
                />
                {formErrors.location && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category*</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange(value, "category")}
                >
                  <SelectTrigger id="category" className={formErrors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HACKATHON">Hackathon</SelectItem>
                    <SelectItem value="WORKSHOP">Workshop</SelectItem>
                    <SelectItem value="NETWORKING">Networking</SelectItem>
                    <SelectItem value="CONFERENCE">Conference</SelectItem>
                    <SelectItem value="SUMMIT">Summit</SelectItem>
                    <SelectItem value="COMPETITION">Competition</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input 
                  id="capacity" 
                  type="number" 
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perks">Perks (comma-separated)</Label>
                <Input 
                  id="perks" 
                  placeholder="e.g., Free swag, food, networking" 
                  value={formData.perks}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input 
                  id="tags" 
                  placeholder="e.g., technology, career, learning" 
                  value={formData.tags}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="isPublic" 
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => {
                    setFormData({...formData, isPublic: checked});
                  }}
                />
                <Label htmlFor="isPublic">Make event public</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  className={`w-full min-h-24 p-2 border rounded-md ${formErrors.description ? "border-red-500" : ""}`}
                  placeholder="Detailed event description..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsCreateModalOpen(false);
                  }}
                  disabled={createLoading || isUploadingFiles}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createLoading || isUploadingFiles}
                >
                  {createLoading ? "Creating..." : isUploadingFiles ? "Uploading Files..." : "Create Event"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </DashboardLayout>
  );
}