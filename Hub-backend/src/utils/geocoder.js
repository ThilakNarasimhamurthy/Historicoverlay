// utils/geocodingService.js
const NodeGeocoder = require('node-geocoder');

// Create geocoder with OpenStreetMap (no API key required)
const geocoder = NodeGeocoder({
  provider: 'openstreetmap', // OpenStreetMap/Nominatim doesn't need an API key
  httpAdapter: 'https',
  formatter: null
});

// Cache for geocoding results
const geocodeCache = new Map();

/**
 * Convert location string to coordinates
 */
async function geocodeLocation(locationString) {
  // Default coordinates
  const defaultCoords = { latitude: 0, longitude: 0 };
  
  // Handle empty inputs
  if (!locationString) return defaultCoords;
  
  // Check cache first
  if (geocodeCache.has(locationString)) {
    return geocodeCache.get(locationString);
  }
  
  try {
    console.log(`Geocoding location: "${locationString}" using OpenStreetMap`);
    
    // Request geocoding from OpenStreetMap
    const results = await geocoder.geocode(locationString);
    
    // If we got results, use the first one
    if (results && results.length > 0) {
      const coords = {
        latitude: results[0].latitude,
        longitude: results[0].longitude
      };
      
      // Cache the result for future use
      geocodeCache.set(locationString, coords);
      console.log(`Successfully geocoded "${locationString}": ${JSON.stringify(coords)}`);
      
      return coords;
    }
    
    console.warn(`No coordinates found for location: ${locationString}`);
    return defaultCoords;
  } catch (error) {
    console.error(`Geocoding error for "${locationString}":`, error.message);
    return defaultCoords;
  }
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees) {
  return degrees * (Math.PI/180);
}

module.exports = {
  geocodeLocation,
  calculateDistance
};