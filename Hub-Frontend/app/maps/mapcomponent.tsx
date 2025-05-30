'use client';
import React, { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
// Import Leaflet CSS directly
import 'leaflet/dist/leaflet.css';
// Import Leaflet directly
import L from 'leaflet';

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
  [key: string]: any; // Allow other properties
}

interface MapComponentProps {
  userCoordinates: Coordinates | null;
  events: Event[];
  loading: boolean;
  onEventSelect: (event: Event) => void;
  setUserCoordinates: (coords: Coordinates) => void;
  distance?: number; // Add distance prop to control radius
}

// Make sure icons are defined outside component
// Using CDN URLs to avoid any path issues
const defaultIconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const defaultRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const defaultShadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

// Fix default icon issue globally
if (typeof window !== 'undefined') {
  // Only run on client-side
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: defaultIconUrl,
    iconRetinaUrl: defaultRetinaUrl,
    shadowUrl: defaultShadowUrl,
  });
}

// Custom icons (optional)
const createUserIcon = () => {
  return L.icon({
    iconUrl: defaultIconUrl,
    iconRetinaUrl: defaultRetinaUrl,
    shadowUrl: defaultShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const createEventIcon = () => {
  return L.icon({
    iconUrl: defaultIconUrl,
    iconRetinaUrl: defaultRetinaUrl,
    shadowUrl: defaultShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const MapComponent = ({ 
  userCoordinates, 
  events, 
  loading, 
  onEventSelect, 
  setUserCoordinates,
  distance = 10 // Default to 10km radius
}: MapComponentProps): ReactElement => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const userCircleRef = useRef<any>(null);
  const eventMarkersRef = useRef<Map<string, any>>(new Map()); // Use Map to track markers by event ID
  
  // Flag to track if component is mounted
  const isMountedRef = useRef<boolean>(true);
  
  // Track map dimensions to detect container resizes
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  
  // Track if map has been initialized
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Function to initialize the map - defined once and reused
  const initializeMap = () => {
    // Make sure this only runs in browser environment
    if (typeof window === 'undefined') return;
    
    // Check if container exists and map hasn't been initialized yet
    if (!mapContainerRef.current || mapInstanceRef.current) {
      return;
    }
    
    console.log("Initializing map");
    
    try {
      // Ensure container has dimensions before creating map
      if (mapContainerRef.current.clientHeight === 0) {
        mapContainerRef.current.style.height = '500px';
      }
      
      // Default center (NYC)
      const defaultCenter: [number, number] = userCoordinates 
        ? [userCoordinates.latitude, userCoordinates.longitude]
        : [40.7128, -74.0060];
      
      // Create the map
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        attributionControl: true,
      });
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Create layer for markers
      const markersLayer = L.layerGroup().addTo(map);
      
      // Store references
      mapInstanceRef.current = map;
      markersLayerRef.current = markersLayer;
      
      // Add click handler for map
      map.on('click', (e: any) => {
        if (setUserCoordinates && isMountedRef.current) {
          const { lat, lng } = e.latlng;
          setUserCoordinates({
            latitude: lat,
            longitude: lng
          });
          
          // Log to console for debugging
          console.log(`Map clicked at: ${lat}, ${lng}`);
        }
      });
      
      // Mark map as initialized
      setIsMapInitialized(true);
      
      // Force a resize after a short timeout to ensure map renders correctly
      setTimeout(() => {
        if (map && isMountedRef.current) {
          map.invalidateSize();
          console.log("Map resized");
        }
      }, 300);
      
      // If we already have user coordinates, update location immediately
      if (userCoordinates) {
        setTimeout(() => {
          updateUserLocation();
        }, 500);
      }
      
      // If we already have events, update markers immediately
      if (events.length > 0 && !loading) {
        setTimeout(() => {
          updateEventMarkers();
        }, 600);
      }
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };
  
  // Function to update user location marker
  const updateUserLocation = () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    // Check prerequisites
    if (!mapInstanceRef.current) {
      console.log("Cannot update user location - map not initialized");
      return;
    }
    
    if (!userCoordinates) {
      console.log("Cannot update user location - no coordinates provided");
      return;
    }
    
    if (!isMountedRef.current) {
      console.log("Cannot update user location - component unmounted");
      return;
    }
    
    const map = mapInstanceRef.current;
    
    // Update map view
    try {
      map.setView(
        [userCoordinates.latitude, userCoordinates.longitude],
        12
      );
      
      console.log(`Map view updated to: ${userCoordinates.latitude}, ${userCoordinates.longitude}`);
    } catch (e) {
      console.error("Error updating map view:", e);
    }
    
    // Clean up previous markers
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    
    if (userCircleRef.current) {
      userCircleRef.current.remove();
      userCircleRef.current = null;
    }
    
    try {
      console.log("Creating user marker and circle");
      
      // Create marker for user location with custom icon
      const userIcon = createUserIcon();
      const marker = L.marker(
        [userCoordinates.latitude, userCoordinates.longitude], 
        { icon: userIcon }
      ).addTo(map);
      
      // Add popup to marker
      marker.bindPopup(`
        <div class="text-center">
          <p class="font-medium">Your Location</p>
          <p class="text-xs text-muted-foreground">
            ${userCoordinates.latitude.toFixed(6)}, ${userCoordinates.longitude.toFixed(6)}
          </p>
        </div>
      `);
      
      // Calculate radius in meters (distance is in km)
      const radiusInMeters = (distance || 10) * 1000;
      
      // Create circle around user location
      const circle = L.circle(
        [userCoordinates.latitude, userCoordinates.longitude],
        {
          radius: radiusInMeters,
          color: '#2196F3',
          fillColor: '#2196F3',
          fillOpacity: 0.1,
          weight: 2
        }
      ).addTo(map);
      
      // Store references
      userMarkerRef.current = marker;
      userCircleRef.current = circle;
      
      console.log(`User marker and circle (${radiusInMeters}m radius) added to map`);
      
      // Adjust zoom level based on radius
      const adjustZoom = () => {
        if (distance && distance > 25) {
          map.setZoom(10);
        } else if (distance && distance > 10) {
          map.setZoom(11);
        } else {
          map.setZoom(12);
        }
      };
      
      adjustZoom();
    } catch (e) {
      console.error("Error updating user location on map:", e);
    }
  };
  
  // Function to update event markers
  const updateEventMarkers = () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    // Check prerequisites with detailed logging
    if (!mapInstanceRef.current) {
      console.log("Cannot update event markers - map not initialized");
      return;
    }
    
    if (!isMountedRef.current) {
      console.log("Cannot update event markers - component unmounted");
      return;
    }
    
    if (!events.length) {
      console.log("Cannot update event markers - no events to display");
      return;
    }
    
    const map = mapInstanceRef.current;
    
    console.log(`Updating ${events.length} event markers`);
    
    try {
      // Remove all existing event markers
      eventMarkersRef.current.forEach((marker) => {
        if (marker) marker.remove();
      });
      eventMarkersRef.current.clear();
      
      // Track how many valid events we process
      let validEventsCount = 0;
      
      // Process each event
      events.forEach((event) => {
        // Skip events without valid coordinates
        if (!event.coordinates || 
            !event.coordinates.latitude || 
            !event.coordinates.longitude || 
            isNaN(event.coordinates.latitude) || 
            isNaN(event.coordinates.longitude)) {
          console.warn(`Event ${event.id} has invalid/missing coordinates`);
          return;
        }
        
        validEventsCount++;
        const { latitude, longitude } = event.coordinates;
        
        try {
          // Create marker with custom icon
          const eventIcon = createEventIcon();
          const marker = L.marker(
            [latitude, longitude], 
            { icon: eventIcon }
          ).addTo(map);
          
          // Store reference
          eventMarkersRef.current.set(event.id, marker);
          
          // Enhanced popup content with better styling and information
          const popupContent = `
            <div class="text-sm p-2 min-w-[250px] max-w-[300px]">
              <div class="font-medium text-base mb-2 text-gray-900 leading-tight">${event.name}</div>
              
              <div class="space-y-2 mb-3">
                <div class="flex items-start gap-2">
                  <div class="text-xs text-gray-500 mt-0.5 font-medium">📍</div>
                  <div class="text-xs text-gray-600 leading-relaxed">${event.location}</div>
                </div>
                
                <div class="flex items-start gap-2">
                  <div class="text-xs text-gray-500 mt-0.5 font-medium">📅</div>
                  <div class="text-xs text-gray-600">
                    ${new Date(event.startDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                
                ${event.category ? `
                  <div class="flex items-center gap-2">
                    <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      ${event.category}
                    </span>
                  </div>
                ` : ''}
                
                ${event.description ? `
                  <div class="text-xs text-gray-600 leading-relaxed mt-2 max-h-16 overflow-hidden">
                    ${event.description.length > 100 ? event.description.substring(0, 100) + '...' : event.description}
                  </div>
                ` : ''}
              </div>
              
              <div class="mt-3 pt-2 border-t border-gray-100">
                <button 
                  id="view-event-${event.id}" 
                  class="w-full text-xs py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  View Full Details
                </button>
              </div>
            </div>
          `;
          
          marker.bindPopup(popupContent, {
            maxWidth: 320,
            className: 'custom-popup'
          });
          
          // Add click handler for marker
          marker.on('click', () => {
            if (isMountedRef.current) {
              console.log(`Event marker clicked: ${event.id}`);
            }
          });
          
          // Add click handler for popup button
          marker.on('popupopen', () => {
            setTimeout(() => {
              if (!isMountedRef.current) return;
              
              const button = document.getElementById(`view-event-${event.id}`);
              if (button) {
                button.addEventListener('click', () => {
                  if (isMountedRef.current) {
                    console.log(`View details clicked for event: ${event.id}`);
                    onEventSelect(event);
                    // Close the popup but keep marker visible
                    marker.closePopup();
                  }
                });
              }
            }, 10);
          });
          
          console.log(`Added marker for event ${event.id} at ${latitude}, ${longitude}`);
        } catch (err) {
          console.error(`Error creating marker for event ${event.id}:`, err);
        }
      });
      
      console.log(`${validEventsCount} events have valid coordinates`);
    } catch (e) {
      console.error("Error updating event markers:", e);
    }
  };

  // Initialize map when component mounts in the browser
  useEffect(() => {
    // Skip if not client-side
    if (typeof window === 'undefined') {
      console.log("Skipping map initialization - not in browser");
      return;
    }
    
    // Set mounted flag
    isMountedRef.current = true;
    
    console.log("Component mounted, initializing map...");
    
    // Delay initialization slightly to ensure DOM is ready
    const initTimer = setTimeout(() => {
      initializeMap();
    }, 100);
    
    // Create resize observer
    const observer = new ResizeObserver((entries) => {
      if (entries[0] && isMountedRef.current) {
        const { width, height } = entries[0].contentRect;
        setMapDimensions({ width, height });
      }
    });
    
    // Start observing after a short delay
    const observerTimer = setTimeout(() => {
      if (mapContainerRef.current && isMountedRef.current) {
        observer.observe(mapContainerRef.current);
      }
    }, 200);
    
    // Clean up on unmount
    return () => {
      console.log("Component unmounting, cleaning up...");
      isMountedRef.current = false;
      
      clearTimeout(initTimer);
      clearTimeout(observerTimer);
      
      if (mapContainerRef.current) {
        observer.unobserve(mapContainerRef.current);
      }
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);
  
  // Handle container resizing
  useEffect(() => {
    if (mapInstanceRef.current && mapDimensions.width > 0 && mapDimensions.height > 0) {
      console.log(`Map container resized: ${mapDimensions.width}x${mapDimensions.height}`);
      mapInstanceRef.current.invalidateSize();
    }
  }, [mapDimensions]);
  
  // Update user location when coordinates change
  useEffect(() => {
    if (isMapInitialized && userCoordinates) {
      console.log("User coordinates changed, updating location");
      updateUserLocation();
    } else if (userCoordinates && !isMapInitialized) {
      console.log("Have user coordinates but map not initialized yet");
    }
  }, [userCoordinates, distance, isMapInitialized]);
  
  // Update event markers when events change
  useEffect(() => {
    if (isMapInitialized && !loading) {
      if (events.length > 0) {
        console.log("Events updated and map initialized, updating markers");
        updateEventMarkers();
      } else {
        console.log("No events to display");
      }
    } else if (events.length > 0 && !isMapInitialized) {
      console.log("Have events but map not initialized yet");
    }
  }, [events, loading, isMapInitialized]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full min-h-[500px] bg-gray-100" // Added bg-gray-100 to make container visible during loading
      style={{ height: '500px' }} // Ensure explicit height is set
      data-testid="map-container"
    />
  );
};

export default MapComponent;