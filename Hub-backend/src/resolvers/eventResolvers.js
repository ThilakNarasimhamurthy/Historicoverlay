const { PrismaClient } = require('@prisma/client');
const ExternalEvent = require('../models/ExternalEvent'); // MongoDB model
const { geocodeLocation, calculateDistance } = require('../utils/geocoder');

const prisma = new PrismaClient();

// Helper function to convert MongoDB ObjectId to string
const objectIdToString = (id) => id.toString();

/**
 * Transform MongoDB document to match GraphQL schema
 * @param {Object} event - MongoDB event document
 * @returns {Object} - Transformed event object
 */
const transformMongoEvent = (event) => {
  // First check if event exists
  if (!event) return null;
  
  try {
    // Get raw data (handle mongoose documents)
    const rawEvent = event.toObject ? event.toObject() : {...event};
    
    // Ensure savedBy and likedBy are arrays
    const savedBy = Array.isArray(rawEvent.savedBy) ? rawEvent.savedBy : [];
    const likedBy = Array.isArray(rawEvent.likedBy) ? rawEvent.likedBy : [];
    
    // Create the transformed object with ALL required fields
    const transformedEvent = {
      id: rawEvent._id.toString(),
      name: rawEvent.name || '',
      description: rawEvent.description || '',
      category: rawEvent.category || '',
      location: rawEvent.location || '',
      source: rawEvent.source || '',
      externalId: rawEvent.externalId || '',
      externalUrl: rawEvent.externalUrl || null,
      imageUrl: rawEvent.imageUrl || null,
      startDate: rawEvent.startDate,
      endDate: rawEvent.endDate,
      tags: rawEvent.tags || [],
      createdAt: rawEvent.createdAt || new Date(),
      updatedAt: rawEvent.updatedAt || new Date(),
      likeCount: likedBy.length,
      saveCount: savedBy.length,
      likedBy: likedBy,
      savedBy: savedBy,
      __typename: 'ExternalEvent'
    };
    
    // Handle coordinates specifically since they're nested
    if (rawEvent.coordinates && 
        rawEvent.coordinates.coordinates && 
        Array.isArray(rawEvent.coordinates.coordinates) && 
        rawEvent.coordinates.coordinates.length === 2) {
      transformedEvent.coordinates = {
        latitude: rawEvent.coordinates.coordinates[1],
        longitude: rawEvent.coordinates.coordinates[0]
      };
    } else {
      // Default coordinates
      transformedEvent.coordinates = {
        latitude: 0,
        longitude: 0
      };
    }
    
    console.log('Successfully transformed event:', transformedEvent.id);
    return transformedEvent;
  } catch (error) {
    console.error('Error transforming event:', error);
    return null;
  }
};

/**
 * Helper functions for building filters and sorts
 */
const filterHelpers = {
  buildEventFilter(filter) {
    if (!filter) return {};
    
    const where = {};
    
    if (filter.name) {
      where.name = { contains: filter.name, mode: 'insensitive' };
    }
    
    if (filter.category) {
      where.category = { equals: filter.category };
    }
    
    if (filter.location) {
      where.location = { contains: filter.location, mode: 'insensitive' };
    }
    
    if (filter.startDateAfter) {
      where.startDate = { ...where.startDate, gte: new Date(filter.startDateAfter) };
    }
    
    if (filter.startDateBefore) {
      where.startDate = { ...where.startDate, lte: new Date(filter.startDateBefore) };
    }
    
    if (filter.endDateAfter) {
      where.endDate = { ...where.endDate, gte: new Date(filter.endDateAfter) };
    }
    
    if (filter.endDateBefore) {
      where.endDate = { ...where.endDate, lte: new Date(filter.endDateBefore) };
    }
    
    if (filter.status) {
      where.status = { equals: filter.status };
    }
    
    if (filter.isPublic !== undefined) {
      where.isPublic = filter.isPublic;
    }
    
    if (filter.creatorId) {
      where.creatorId = filter.creatorId;
    }
    
    if (filter.hasAvailableCapacity === true) {
      where.OR = [
        { capacity: null }, // No capacity limit
        {
          capacity: {
            gt: {
              _count: {
                participants: {
                  where: {
                    registrationStatus: {
                      in: ['REGISTERED', 'PENDING']
                    }
                  }
                }
              }
            }
          }
        }
      ];
    }
    
    if (filter.tags && filter.tags.length > 0) {
      where.tags = { 
        hasSome: filter.tags
      };
    }
    
    return where;
  },

  buildExternalEventFilter(filter) {
    if (!filter) return {};
    
    const query = {};
    
    if (filter.name) {
      query.name = { $regex: filter.name, $options: 'i' };
    }
    
    if (filter.category) {
      query.category = filter.category;
    }
    
    if (filter.location) {
      // Fix: Use direct location field instead of nested address
      query.location = { $regex: filter.location, $options: 'i' };
    }
    
    if (filter.startDateAfter || filter.startDateBefore) {
      query.startDate = {};
      
      if (filter.startDateAfter) {
        query.startDate.$gte = new Date(filter.startDateAfter);
      }
      
      if (filter.startDateBefore) {
        query.startDate.$lte = new Date(filter.startDateBefore);
      }
    }
    
    if (filter.endDateAfter || filter.endDateBefore) {
      query.endDate = {};
      
      if (filter.endDateAfter) {
        query.endDate.$gte = new Date(filter.endDateAfter);
      }
      
      if (filter.endDateBefore) {
        query.endDate.$lte = new Date(filter.endDateBefore);
      }
    }
    
    if (filter.source) {
      query.source = filter.source;
    }
    
    if (filter.tags && filter.tags.length > 0) {
      query.tags = { $in: filter.tags };
    }
    
    return query;
  },

  buildEventOrderBy(orderBy) {
    if (!orderBy) return { startDate: 'asc' };
    
    const { field, direction } = orderBy;
    const orderDirection = direction.toLowerCase();
    
    switch (field) {
      case 'START_DATE':
        return { startDate: orderDirection };
      case 'CREATED_AT':
        return { createdAt: orderDirection };
      case 'NAME':
        return { name: orderDirection };
      case 'CATEGORY':
        return { category: orderDirection };
      default:
        return { startDate: 'asc' };
    }
  },

  buildExternalEventSort(orderBy) {
    if (!orderBy) return { startDate: 1 };
    
    const { field, direction } = orderBy;
    const orderDirection = direction === 'DESC' ? -1 : 1;
    
    switch (field) {
      case 'START_DATE':
        return { startDate: orderDirection };
      case 'SOURCE':
        return { source: orderDirection };
      case 'NAME':
        return { name: orderDirection };
      case 'CATEGORY':
        return { category: orderDirection };
      case 'LIKE_COUNT':
        return { likedBy: orderDirection }; // Sorts by array length
      default:
        return { startDate: 1 };
    }
  },

  sortCombinedResults(results, orderBy) {
    if (!orderBy) return results;
    
    const { field, direction } = orderBy;
    const multiplier = direction === 'DESC' ? -1 : 1;
    
    return results.sort((a, b) => {
      switch (field) {
        case 'START_DATE':
          return multiplier * (new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        case 'NAME':
          return multiplier * a.name.localeCompare(b.name);
        case 'CATEGORY':
          return multiplier * a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  }
};

/**
 * Query resolvers for events
 */
const queryResolvers = {
  // PostgreSQL Event Queries
  event: async (_, { id }) => {
    try {
      // First, check if the event exists
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          creator: true,
          participants: true  // Include participants
        }
      });
      
      if (!event) {
        return null; // We'll let GraphQL handle the not-found case
      }
      
      // Separately fetch the participant count to ensure it's never null
      const participantCount = await prisma.eventParticipation.count({
        where: { eventId: id }
      });
      
      // Check if coordinates exist, if not, geocode and update
      if (!event.coordinates && event.location) {
        try {
          // Geocode the location
          const { geocodeLocation } = require('../utils/geocodingService');
          const coordinates = await geocodeLocation(event.location);
          
          // Update the event with coordinates
          await prisma.event.update({
            where: { id: event.id },
            data: {
              coordinates: coordinates
            }
          }).catch(err => console.warn('Could not update event coordinates:', err.message));
          
          // Add coordinates to the event object
          event.coordinates = coordinates;
        } catch (geocodeError) {
          console.error('[ERROR] Geocoding failed:', geocodeError.message);
          // Provide default coordinates if geocoding fails
          event.coordinates = { latitude: 0, longitude: 0 };
        }
      } else if (!event.coordinates) {
        // Ensure coordinates are never null
        event.coordinates = { latitude: 0, longitude: 0 };
      }
      
      // Add the count directly to the event object
      // And ensure participants is never null
      return {
        ...event,
        participantCount: participantCount || 0, // Ensure this is never null
        participants: event.participants || [] // Ensure participants is never null
      };
    } catch (error) {
      console.error('[ERROR] event query error:', error.message);
      throw new Error(`Failed to fetch event: ${error.message}`);
    }
  },
  
  events: async (_, { filter, orderBy, skip, take }) => {
    try {
      const where = filterHelpers.buildEventFilter(filter);
      const order = filterHelpers.buildEventOrderBy(orderBy);
      
      // First fetch the events
      const events = await prisma.event.findMany({
        where,
        orderBy: order,
        skip: skip || 0,
        take: take || 10,
        include: {
          creator: true,
          participants: true
        }
      });
      
      // Process each event to ensure non-nullable fields
      const processedEvents = await Promise.all(events.map(async (event) => {
        // If participants or participantCount is missing/null, fix it
        const participants = event.participants || [];
        let participantCount = participants.length;
        
        // If we still need to calculate participantCount
        if (participantCount === 0 && !event.participants) {
          participantCount = await prisma.eventParticipation.count({
            where: { eventId: event.id }
          });
        }
        
        return {
          ...event,
          participants: participants,
          participantCount: participantCount || 0
        };
      }));
      
      return processedEvents;
    } catch (error) {
      console.error('[ERROR] events query error:', error.message);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  },
  
  // MongoDB External Event Queries
  externalEvent: async (_, { id }) => {
    try {
      let event;
      try {
        event = await ExternalEvent.findById(id);
      } catch (idError) {
        event = await ExternalEvent.findOne({ uuid: id });
      }
      if (!event) return null;
      return transformMongoEvent(event);
    } catch (error) {
      console.error('[ERROR] externalEvent query error:', error.message, error.stack);
      throw new Error(`Failed to fetch external event: ${error.message}`);
    }
  },

  externalEvents: async (_, { filter, orderBy, skip, take }) => {
    try {
      console.log('[DEBUG] externalEvents query with filter:', JSON.stringify(filter));

      const query = filterHelpers.buildExternalEventFilter(filter);
      const sort = filterHelpers.buildExternalEventSort(orderBy);

      console.log('[DEBUG] Transformed MongoDB query:', JSON.stringify(query));

      const events = await ExternalEvent.find(query)
        .sort(sort)
        .skip(skip || 0)
        .limit(take || 10);

      console.log(`[DEBUG] Found ${events.length} external events`);

      return events.map(transformMongoEvent);
    } catch (error) {
      console.error('[ERROR] externalEvents query error:', error.message, error.stack);
      throw new Error(`Failed to fetch external events: ${error.message}`);
    }
  },

  // Combined Events Query
allEvents: async (_, { filter, orderBy, skip, take }) => {
  try {
    const { includeInternalEvents = true, includeExternalEvents = true } = filter || {};
    
    // Create a modified filter without date restrictions if we want ALL events
    const modifiedFilter = {...filter};
    
    // Remove date filters if ALL events are requested
    if (filter && filter.getAllEvents) {
      delete modifiedFilter.startDateAfter;
      delete modifiedFilter.startDateBefore;
      delete modifiedFilter.endDateAfter;
      delete modifiedFilter.endDateBefore;
    }
    
    let results = [];
    
    // Get PostgreSQL events if requested - INCREASE LIMITS
    if (includeInternalEvents) {
      const where = filterHelpers.buildEventFilter(modifiedFilter);
      const pgEvents = await prisma.event.findMany({
        where,
        include: {
          creator: true
        },
        // Increase default to at least 500 events of each type
        take: includeExternalEvents ? Math.floor((take || 500) / 2) : (take || 500),
        skip: skip || 0
      });
      
      results = results.concat(pgEvents.map(event => ({
        ...event,
        __typename: 'Event'
      })));
    }
    
    // Get MongoDB events if requested - INCREASE LIMITS
    if (includeExternalEvents) {
      const query = filterHelpers.buildExternalEventFilter(modifiedFilter);
      const mongoEvents = await ExternalEvent.find(query)
        // Increase default to at least 500 events of each type
        .limit(includeInternalEvents ? Math.floor((take || 500) / 2) : (take || 500))
        .skip(skip || 0);
      
      const transformedMongoEvents = mongoEvents.map(transformMongoEvent);
      results = results.concat(transformedMongoEvents);
    }
    
    // Sort combined results
    return filterHelpers.sortCombinedResults(results, orderBy);
  } catch (error) {
    console.error('[ERROR] allEvents query error:', error.message);
    throw new Error('Failed to fetch combined events');
  }
},

  // Geo-based Event Query
  eventsNearMe: async (_, { latitude, longitude, radiusInKm, filter, skip, take }) => {
    try {
      // Convert inputs to numbers
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radius = parseFloat(radiusInKm);

      // Validate inputs
      if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
        throw new Error('Invalid coordinates or radius values');
      }

      console.log('[DEBUG] Executing geo query with:', { lat, lng, radius });

      // Initialize results array
      let results = [];
      
      // PART 1: Get external events from MongoDB
      try {
        console.log('[DEBUG] Starting MongoDB geospatial query...');
        
        // Ensure the index exists on the correct path
        await ExternalEvent.collection.createIndex({ 'coordinates': '2dsphere' });
        
        // Simple, direct query that matches your document structure
        const mongoEvents = await ExternalEvent.find({
          'coordinates': {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lng, lat]  // Note: MongoDB uses [longitude, latitude] order
                },
              $maxDistance: radius * 1000  // Convert km to meters
            }
          }
        });
        
        console.log(`[DEBUG] Found ${mongoEvents.length} external events near location`);
        
        // Transform and add to results
        if (mongoEvents.length > 0) {
          results = results.concat(mongoEvents.map(transformMongoEvent));
        } else {
          console.log('[DEBUG] No external events found with geo query, trying fallback');
        }
      } catch (mongoError) {
        console.error('[ERROR] MongoDB query failed:', mongoError.message);
        
        // Fallback to regular query
        try {
          const fallbackEvents = await ExternalEvent.find({});
          
          console.log(`[DEBUG] Found ${fallbackEvents.length} external events with fallback`);
          results = results.concat(fallbackEvents.map(transformMongoEvent));
        } catch (fallbackError) {
          console.error('[ERROR] MongoDB fallback query failed:', fallbackError.message);
        }
      }

      // PART 2: Get internal events from PostgreSQL and filter by distance
      try {
        // Get all recent internal events
        // When getting Prisma events, we need to postprocess them to filter by distance
        const pgEvents = await prisma.event.findMany({
          where: {
            startDate: { gte: new Date() },
            ...(filter ? filterHelpers.buildEventFilter(filter) : {})
          },
          include: {
            creator: true
          },
          // Get more events than needed since we'll filter by distance
          take: take ? take * 2 : 20,
          skip: skip || 0
        });

        // Filter events by distance
        const nearbyPgEvents = [];

        for (const event of pgEvents) {
          // Get coordinates, geocode if needed
          let eventCoords = event.coordinates;
          
          if (!eventCoords && event.location) {
            eventCoords = await geocodeLocation(event.location);
            
            // Optionally update the database with these coordinates
            try {
              await prisma.event.update({
                where: { id: event.id },
                data: { coordinates: eventCoords }
              });
            } catch (updateError) {
              console.warn(`Could not update coordinates for event ${event.id}`);
            }
          }
          
          if (!eventCoords) {
            eventCoords = { latitude: 0, longitude: 0 };
          }
          
          // Calculate distance
          const distance = calculateDistance(
            lat, lng,
            eventCoords.latitude, eventCoords.longitude
          );
          
          // If within radius, add to results
          if (distance <= radius) {
            nearbyPgEvents.push({
              ...event,
              __typename: 'Event',
              distance // Optional, for sorting
            });
          }
        }
          
        console.log(`[DEBUG] Filtered to ${nearbyPgEvents.length} internal events within ${radius}km`);
        
        // Sort by distance and take only what we need
        nearbyPgEvents.sort((a, b) => a.distance - b.distance);
        const limitedPgEvents = nearbyPgEvents.slice(0, take ? Math.floor(take/2) : 5);
        
        // Add to results
        results = results.concat(limitedPgEvents);
      } catch (pgError) {
        console.error('[ERROR] PostgreSQL query failed:', pgError.message);
      }
      
      // Combine and sort results by start date or distance
      results.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      
      // Limit total results to requested 'take' value
      if (take && results.length > take) {
        results = results.slice(0, take);
      }
      
      console.log(`[DEBUG] Returning ${results.length} total events (combined)`);
      
      return results;
    } catch (error) {
      console.error('[ERROR] eventsNearMe query error:', error.message, error.stack);
      throw new Error(`Failed to fetch nearby events: ${error.message}`);
    }
  },
  
  // User interaction queries
  userLikedEvents: async (_, { userId }) => {
    try {
      const results = [];
      
      // Get external events liked by user from MongoDB
      const mongoEvents = await ExternalEvent.find({ likedBy: userId });
      results.push(...mongoEvents.map(transformMongoEvent));
      
      // Get internal events liked by user
      const likedEvents = await prisma.likedEvent.findMany({
        where: { 
          userId,
          isExternal: false
        },
        select: { eventId: true }
      });
      
      if (likedEvents.length > 0) {
        const pgEvents = await prisma.event.findMany({
          where: {
            id: { in: likedEvents.map(liked => liked.eventId) }
          },
          include: { creator: true }
        });
        
        results.push(...pgEvents.map(event => ({
          ...event,
          __typename: 'Event'
        })));
      }
      
      return results;
    } catch (error) {
      console.error('[ERROR] userLikedEvents query error:', error.message);
      throw new Error('Failed to fetch user liked events');
    }
  },
  
  userSavedEvents: async (_, { userId }) => {
    try {
      const results = [];
      
      // Get external events saved by user from MongoDB
      const mongoEvents = await ExternalEvent.find({ savedBy: userId });
      results.push(...mongoEvents.map(transformMongoEvent));
      
      // Get saved event IDs from PostgreSQL
      const savedEvents = await prisma.savedEvent.findMany({
        where: { userId },
        select: { eventId: true }
      });
      
      if (savedEvents.length > 0) {
        // First fetch the events with creator and participants
        const pgEvents = await prisma.event.findMany({
          where: {
            id: { in: savedEvents.map(saved => saved.eventId) }
          },
          include: { 
            creator: true,
            participants: true  // Include participants for counting
          }
        });
        
        // Process each event to ensure non-nullable fields
        const processedEvents = pgEvents.map(event => {
          // Ensure participants is never null
          const participants = event.participants || [];
          
          return {
            ...event,
            __typename: 'Event',
            participants: participants,
            participantCount: participants.length || 0  // Ensure participantCount is never null
          };
        });
        
        results.push(...processedEvents);
      }
      
      return results;
    } catch (error) {
      console.error('[ERROR] userSavedEvents query error:', error.message);
      throw new Error('Failed to fetch user saved events');
    }
  },
  
  userParticipatedEvents: async (_, { userId }) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        participants: {
          some: {
            userId
          }
        }
      },
      include: {
        creator: true,
        participants: true  // Get all participants to count them
      }
    });

    // Add participantCount to each event
    return events.map(event => ({
      ...event,
      participantCount: event.participants.length,
      // Filter to only include the current user's participant record
      participants: event.participants.filter(p => p.userId === userId)
    }));
  } catch (error) {
    console.error('[ERROR] userParticipatedEvents query error:', error.message);
    throw new Error('Failed to fetch user participated events');
  }
},
  
  // Events created by user
  userCreatedEvents: async (_, { userId }) => {
    try {
      // Get events normally
      const events = await prisma.event.findMany({
        where: {
          creatorId: userId
        },
        include: {
          creator: true,
          participants: true
        },
        orderBy: {
          startDate: 'desc'
        }
      });
      
      // Process each event to ensure non-nullable fields are never null
      return events.map(event => {
        // Ensure participants is never null
        const participants = event.participants || [];
        
        return {
          ...event,
          participants: participants,
          participantCount: participants.length || 0 // Ensure participantCount is never null
        };
      });
    } catch (error) {
      console.error('[ERROR] userCreatedEvents query error:', error.message);
      throw new Error('Failed to fetch user created events');
    }
  }};

/**
 * Mutation resolvers for events
 */
const mutationResolvers = {
  // PostgreSQL Event Mutations
  createEvent: async (_, { data }) => {
    try {
      console.log('[DEBUG] createEvent mutation input:', data);

      // Get coordinates from location string
      const coords = await geocodeLocation(data.location);

      const newEvent = await prisma.event.create({
        data: {
          name: data.name,
          description: data.description,
          category: data.category,
          location: data.location,
          // Store as JSON in the coordinates field
          coordinates: {
            latitude: coords.latitude,
            longitude: coords.longitude
          },
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          capacity: data.capacity,
          isPublic: data.isPublic !== undefined ? data.isPublic : true,
          tags: data.tags || [],
          creatorId: data.creatorId,
          status: 'PENDING', // Default status
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          creator: true,
          participants: true
        }
      });

      console.log('[DEBUG] Created event:', JSON.stringify(newEvent, null, 2));

      return newEvent;
    } catch (error) {
      console.error('[ERROR] createEvent mutation error:', error.message);
      throw new Error(`Failed to create event: ${error.message}`);
    }
  },

  updateEvent: async (_, { id, data }) => {
    try {
      return prisma.event.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: {
          creator: true
        }
      });
    } catch (error) {
      console.error('[ERROR] updateEvent mutation error:', error.message);
      throw new Error(`Failed to update event: ${error.message}`);
    }
  },
  
  deleteEvent: async (_, { id }) => {
    try {
      // First, delete all related records
      await Promise.allSettled([
        prisma.eventParticipation.deleteMany({
          where: { eventId: id }
        }),
        prisma.savedEvent.deleteMany({
          where: { eventId: id }
        }),
        prisma.likedEvent.deleteMany({
          where: { eventId: id }
        }),
        prisma.notification.deleteMany({
          where: { eventId: id }
        })
      ]);
      
      // Then delete the event itself
      return prisma.event.delete({
        where: { id },
        include: {
          creator: true
        }
      });
    } catch (error) {
      console.error('[ERROR] deleteEvent mutation error:', error.message);
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  },
  
  // Event Participation Mutations
  updateEventParticipation: async (_, { eventId, userId, data }) => {
    try {
      // Check if participation record exists
      const existing = await prisma.eventParticipation.findFirst({
        where: {
          eventId,
          userId
        }
      });
      
      if (existing) {
        // Update existing record
        return prisma.eventParticipation.update({
          where: {
            id: existing.id
          },
          data: {
            rsvpStatus: data.rsvpStatus,
            registrationStatus: data.registrationStatus,
            feedback: data.feedback,
            checkInTime: data.checkInTime
          },
          include: {
            user: true,
            event: true
          }
        });
      } else {
        // Create new participation record
        return prisma.eventParticipation.create({
          data: {
            userId,
            eventId,
            rsvpStatus: data.rsvpStatus || 'GOING',
            registrationStatus: data.registrationStatus || 'REGISTERED',
            timestamp: new Date(),
            feedback: data.feedback,
            checkInTime: data.checkInTime
          },
          include: {
            user: true,
            event: true
          }
        });
      }
    } catch (error) {
      console.error('[ERROR] updateEventParticipation mutation error:', error.message);
      throw new Error(`Failed to update event participation: ${error.message}`);
    }
  },
  
  // Register for event - a more user-friendly version of updateEventParticipation
  registerForEvent: async (_, { eventId, userId, rsvpStatus }) => {
    try {
      // First, check if the event exists
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          participants: true
        }
      });
      
      if (!event) {
        throw new Error(`Event with ID ${eventId} not found`);
      }
      
      // Check if user is already registered
      const existingParticipation = await prisma.eventParticipation.findFirst({
        where: {
          eventId,
          userId
        }
      });
      
      if (existingParticipation) {
        // Update existing participation
        return prisma.eventParticipation.update({
          where: {
            id: existingParticipation.id
          },
          data: {
            rsvpStatus,
            // Don't change registration status if already registered
            timestamp: new Date()
          },
          include: {
            user: true,
            event: true
          }
        });
      }
      
      // Check if event has capacity
      let registrationStatus = 'REGISTERED';
      if (event.capacity !== null) {
        const currentParticipantCount = event.participants.filter(
          p => p.registrationStatus === 'REGISTERED' || p.registrationStatus === 'PENDING'
        ).length;
        
        if (currentParticipantCount >= event.capacity) {
          // Event is full, add to waitlist
          registrationStatus = 'WAITLISTED';
        }
      }
      
      // Create new participation record
      return prisma.eventParticipation.create({
        data: {
          userId,
          eventId,
          rsvpStatus,
          registrationStatus,
          timestamp: new Date()
        },
        include: {
          user: true,
          event: true
        }
      });
    } catch (error) {
      console.error('[ERROR] registerForEvent mutation error:', error.message);
      throw new Error(`Failed to register for event: ${error.message}`);
    }
  },

  // External Event Interactions - FIXED VERSION
  likeExternalEvent: async (_, { eventId, userId }) => {
    try {
      console.log(`[DEBUG] Liking external event ${eventId} for user ${userId}`);
      
      // Start transaction for cross-database consistency
      const [event] = await Promise.all([
        // Update MongoDB document
        ExternalEvent.findByIdAndUpdate(
          eventId,
          { $addToSet: { likedBy: userId } },
          { new: true }
        ),
        
        // Create record in PostgreSQL LikedEvent table
        prisma.likedEvent.upsert({
          where: {
            userId_eventId: {
              userId,
              eventId
            }
          },
          update: {
            likedAt: new Date() // Update timestamp on re-like
          },
          create: {
            userId,
            eventId,
            isExternal: true, // Mark as external event
            likedAt: new Date()
          }
        }).catch(error => {
          console.error('[ERROR] Prisma likedEvent operation failed:', error);
          // Continue processing even if Prisma operation fails
        })
      ]);
      
      if (!event) {
        throw new Error(`External event with ID ${eventId} not found`);
      }

      // Ensure the likedBy array exists and contains the userId
      if (!event.likedBy) {
        event.likedBy = [userId];
      } else if (!event.likedBy.includes(userId)) {
        event.likedBy.push(userId);
      }
      
      // Transform to GraphQL type
      const transformedEvent = transformMongoEvent(event);
      
      // Force set isLikedByUser function for this userId to always return true
      if (transformedEvent) {
        // Add a property that returns true for this specific user
        transformedEvent.isLikedByUser = function(args) {
          return args && args.userId === userId;
        };
      }
      
      return transformedEvent;
    } catch (error) {
      console.error('[ERROR] likeExternalEvent mutation error:', error.message);
      throw new Error(`Failed to like external event: ${error.message}`);
    }
  },
  
  unlikeExternalEvent: async (_, { eventId, userId }) => {
    try {
      console.log(`[DEBUG] Unliking external event ${eventId} for user ${userId}`);
      
      // Start transaction for cross-database consistency
      const [event] = await Promise.all([
        // Update MongoDB document
        ExternalEvent.findByIdAndUpdate(
          eventId,
          { $pull: { likedBy: userId } },
          { new: true }
        ),
        
        // Remove record from PostgreSQL LikedEvent table
        prisma.likedEvent.deleteMany({
          where: {
            userId,
            eventId,
            isExternal: true
          }
        }).catch(error => {
          console.error('[ERROR] Prisma likedEvent delete operation failed:', error);
          // Continue processing even if Prisma operation fails
        })
      ]);
      
      if (!event) {
        throw new Error(`External event with ID ${eventId} not found`);
      }
      
      // Ensure likedBy exists
      if (!event.likedBy) {
        event.likedBy = [];
      }
      
      // Transform to GraphQL type
      const transformedEvent = transformMongoEvent(event);
      
      // Force set isLikedByUser function for this userId to always return false
      if (transformedEvent) {
        // Add a property that returns false for this specific user
        transformedEvent.isLikedByUser = function(args) {
          return false; // Always returns false since we just unliked it
        };
      }
      
      return transformedEvent;
    } catch (error) {
      console.error('[ERROR] unlikeExternalEvent mutation error:', error.message);
      throw new Error(`Failed to unlike external event: ${error.message}`);
    }
  },
  
  // FIXED VERSION of saveExternalEvent
  saveExternalEvent: async (_, { eventId, userId }) => {
    try {
      console.log(`[DEBUG] Saving external event ${eventId} for user ${userId}`);
      
      // Find and update the MongoDB document first
      const event = await ExternalEvent.findByIdAndUpdate(
        eventId,
        { $addToSet: { savedBy: userId } },
        { new: true }
      );
      
      if (!event) {
        throw new Error(`External event with ID ${eventId} not found`);
      }
      
      // Ensure the savedBy array exists and contains the userId
      if (!event.savedBy) {
        event.savedBy = [userId];
      } else if (!event.savedBy.includes(userId)) {
        event.savedBy.push(userId);
      }
      
      // Then create/update the record in PostgreSQL
      await prisma.savedEvent.upsert({
        where: {
          userId_eventId: {
            userId,
            eventId
          }
        },
        update: {
          // Update the savedAt timestamp if it already exists
          savedAt: new Date()
        }, 
        create: {
          userId,
          eventId,
          savedAt: new Date()
        }
      }).catch(prismaError => {
        console.error('[ERROR] Prisma SavedEvent operation failed:', prismaError);
        console.error('[DEBUG] Save operation details:', { userId, eventId });
      });
      
      // Transform the event
      const transformedEvent = transformMongoEvent(event);
      
      // For this specific case, override the isSavedByUser field resolver 
      // to ensure it never returns null for the user who just saved it
      if (transformedEvent) {
        // Define a function that will always return true for this userId
        transformedEvent.isSavedByUser = function(args) {
          return true; // Always returns true since we just saved it
        };
      }
      
      console.log(`[DEBUG] Successfully saved event, savedBy:`, event.savedBy);
      return transformedEvent;
    } catch (error) {
      console.error('[ERROR] saveExternalEvent mutation error:', error.message);
      throw new Error(`Failed to save external event: ${error.message}`);
    }
  },
  
  // FIXED VERSION of unsaveExternalEvent
  unsaveExternalEvent: async (_, { eventId, userId }) => {
    try {
      console.log(`[DEBUG] Unsaving external event ${eventId} for user ${userId}`);
      
      // Find and update the MongoDB document first
      const event = await ExternalEvent.findByIdAndUpdate(
        eventId,
        { $pull: { savedBy: userId } },
        { new: true }
      );
      
      if (!event) {
        throw new Error(`External event with ID ${eventId} not found`);
      }
      
      // Ensure savedBy exists
      if (!event.savedBy) {
        event.savedBy = [];
      }
      
      // Then delete the record from PostgreSQL
      await prisma.savedEvent.deleteMany({
        where: {
          userId,
          eventId
        }
      }).catch(prismaError => {
        console.error('[ERROR] Prisma SavedEvent delete operation failed:', prismaError);
        console.error('[DEBUG] Unsave operation details:', { userId, eventId });
      });
      
      // Transform the event
      const transformedEvent = transformMongoEvent(event);
      
      // Override isSavedByUser to ensure it never returns null
      if (transformedEvent) {
        // Define a function that will always return false for this userId
        transformedEvent.isSavedByUser = function(args) {
          return false; // Always return false since we just unsaved it
        };
      }
      
      console.log(`[DEBUG] Successfully unsaved event, savedBy:`, event.savedBy);
      return transformedEvent;
    } catch (error) {
      console.error('[ERROR] unsaveExternalEvent mutation error:', error.message);
      throw new Error(`Failed to unsave external event: ${error.message}`);
    }
  }
};

/**
 * Additional mutations for internal events
 */
const internalEventMutations = {
  likeInternalEvent: async (_, { eventId, userId }) => {
    try {
      // Check if event exists
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      });
      
      if (!event) {
        throw new Error(`Event with ID ${eventId} not found`);
      }
      
      // Check if user has already liked this event
      const existingLike = await prisma.likedEvent.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId
          }
        }
      });
      
      // Only increment count if it's a new like
      const likeCountDelta = existingLike ? 0 : 1;
      
      // Use a transaction to ensure consistency
      await prisma.$transaction([
        // Upsert the like record
        prisma.likedEvent.upsert({
          where: {
            userId_eventId: {
              userId,
              eventId
            }
          },
          update: {
            likedAt: new Date() // Update timestamp on re-like
          },
          create: {
            userId,
            eventId,
            isExternal: false,
            likedAt: new Date()
          }
        }),
        
        // Update the count on the event itself
        prisma.event.update({
          where: { id: eventId },
          data: {
            likeCount: {
              increment: likeCountDelta
            },
            updatedAt: new Date()
          }
        })
      ]);
      
      // Fetch the updated event with creator info
      const updatedEvent = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          creator: true
        }
      });
      
      // Add the isLikedByUser property directly to handle the non-nullable field
      // This will override the default field resolver for this specific instance
      const eventWithLikeInfo = {
        ...updatedEvent,
        // Add direct functions to handle parameterized field resolvers
        isLikedByUser: function() {
          return true; // We know it's true because we just liked it
        },
        isSavedByUser: async function(args) {
          // Still need to check if it's saved
          const savedEvent = await prisma.savedEvent.findUnique({
            where: {
              userId_eventId: {
                userId: args.userId,
                eventId
              }
            }
          });
          return !!savedEvent;
        }
      };
      
      return eventWithLikeInfo;
    } catch (error) {
      console.error('[ERROR] likeInternalEvent mutation error:', error.message);
      throw new Error(`Failed to like event: ${error.message}`);
    }
  },
  
  unlikeInternalEvent: async (_, { eventId, userId }) => {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      });
      
      if (!event) {
        throw new Error(`Event with ID ${eventId} not found`);
      }
      
      // Check if user has liked this event
      const existingLike = await prisma.likedEvent.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId
          }
        }
      });
      
      // Only decrement count if a like exists
      const likeCountDelta = existingLike ? -1 : 0;
      
      // Use a transaction to ensure consistency
      await prisma.$transaction([
        // Delete the like record
        prisma.likedEvent.deleteMany({
          where: {
            userId,
            eventId,
            isExternal: false
          }
        }),
        
        // Update the count on the event
        prisma.event.update({
          where: { id: eventId },
          data: {
            likeCount: {
              increment: likeCountDelta // Will decrement since value is negative
            },
            updatedAt: new Date()
          }
        })
      ]);
      
      // Fetch the updated event with creator info
      const updatedEvent = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          creator: true
        }
      });
      
      // Add the isLikedByUser property directly to handle the non-nullable field
      const eventWithLikeInfo = {
        ...updatedEvent,
        // Add direct functions to handle parameterized field resolvers
        isLikedByUser: function() {
          return false; // We know it's false because we just unliked it
        },
        isSavedByUser: async function(args) {
          // Still need to check if it's saved
          const savedEvent = await prisma.savedEvent.findUnique({
            where: {
              userId_eventId: {
                userId: args.userId,
                eventId
              }
            }
          });
          return !!savedEvent;
        }
      };
      
      return eventWithLikeInfo;
    } catch (error) {
      console.error('[ERROR] unlikeInternalEvent mutation error:', error.message);
      throw new Error(`Failed to unlike event: ${error.message}`);
    }
  },
  
  saveInternalEvent: async (_, { eventId, userId }) => {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      });
      
      if (!event) {
        throw new Error(`Event with ID ${eventId} not found`);
      }
      
      // Check if user has already saved this event
      const existingSave = await prisma.savedEvent.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId
          }
        }
      });
      
      // Only increment count if it's a new save
      const saveCountDelta = existingSave ? 0 : 1;
      
      // Use a transaction to ensure consistency
      await prisma.$transaction([
        // Upsert the save record
        prisma.savedEvent.upsert({
          where: {
            userId_eventId: {
              userId,
              eventId
            }
          },
          update: {
            savedAt: new Date() // Update timestamp on re-save
          },
          create: {
            userId,
            eventId,
            savedAt: new Date()
          }
        }),
        
        // Update the count on the event itself
        prisma.event.update({
          where: { id: eventId },
          data: {
            saveCount: {
              increment: saveCountDelta
            },
            updatedAt: new Date()
          }
        })
      ]);
      
      // Fetch the updated event with creator info
      const updatedEvent = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          creator: true
        }
      });
      
      // Add the isSavedByUser property directly to handle the non-nullable field
      const eventWithSaveInfo = {
        ...updatedEvent,
        // Add direct functions to handle parameterized field resolvers
        isSavedByUser: function() {
          return true; // We know it's true because we just saved it
        },
        isLikedByUser: async function(args) {
          // Still need to check if it's liked
          const likedEvent = await prisma.likedEvent.findUnique({
            where: {
              userId_eventId: {
                userId: args.userId,
                eventId
              }
            }
          });
          return !!likedEvent;
        }
      };
      
      return eventWithSaveInfo;
    } catch (error) {
      console.error('[ERROR] saveInternalEvent mutation error:', error.message);
      throw new Error(`Failed to save event: ${error.message}`);
    }
  },
  
  unsaveInternalEvent: async (_, { eventId, userId }) => {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      });
      
      if (!event) {
        throw new Error(`Event with ID ${eventId} not found`);
      }
      
      // Check if user has saved this event
      const existingSave = await prisma.savedEvent.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId
          }
        }
      });
      
      // Only decrement count if a save exists
      const saveCountDelta = existingSave ? -1 : 0;
      
      // Use a transaction to ensure consistency
      await prisma.$transaction([
        // Delete the save record
        prisma.savedEvent.deleteMany({
          where: {
            userId,
            eventId
          }
        }),
        
        // Update the count on the event
        prisma.event.update({
          where: { id: eventId },
          data: {
            saveCount: {
              increment: saveCountDelta // Will decrement since value is negative
            },
            updatedAt: new Date()
          }
        })
      ]);
      
      // Fetch the updated event with creator info
      const updatedEvent = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          creator: true
        }
      });
      
      // Add the isSavedByUser property directly to handle the non-nullable field
      const eventWithSaveInfo = {
        ...updatedEvent,
        // Add direct functions to handle parameterized field resolvers
        isSavedByUser: function() {
          return false; // We know it's false because we just unsaved it
        },
        isLikedByUser: async function(args) {
          // Still need to check if it's liked
          const likedEvent = await prisma.likedEvent.findUnique({
            where: {
              userId_eventId: {
                userId: args.userId,
                eventId
              }
            }
          });
          return !!likedEvent;
        }
      };
      
      return eventWithSaveInfo;
    } catch (error) {
      console.error('[ERROR] unsaveInternalEvent mutation error:', error.message);
      throw new Error(`Failed to unsave event: ${error.message}`);
    }
  }
};

/**
 * Type resolvers
 */
const typeResolvers = {
  // Interface implementations
  EventInterface: {
    __resolveType(obj) {
      if (obj.__typename) return obj.__typename;
      return obj.source ? 'ExternalEvent' : 'Event';
    }
  },
  
  // Field resolvers for Event type
  Event: {
    participantCount: async (parent) => {
      try {
        // Always return a number, never null
        if (parent.participantCount !== undefined && parent.participantCount !== null) {
          return typeof parent.participantCount === 'number' ? parent.participantCount : 0;
        }
        
        // Query the database and ensure we return a number even if the query fails
        try {
          const count = await prisma.eventParticipation.count({
            where: { eventId: parent.id }
          });
          return count || 0; // Convert null, undefined, or falsy to 0
        } catch (dbError) {
          console.error('[ERROR] Database error in participantCount resolver:', dbError);
          return 0; // Return 0 on database error
        }
      } catch (error) {
        console.error('[ERROR] General error in participantCount resolver:', error);
        return 0; // Return 0 on any error
      }
    },
    
    participants: async (parent) => {
      try {
        if (parent.participants) return parent.participants;
        
        return prisma.eventParticipation.findMany({
          where: { eventId: parent.id },
          include: {
            user: true
          }
        });
      } catch (error) {
        console.error('[ERROR] participants resolver:', error);
        return []; // Return empty array as fallback
      }
    },
    
    isLikedByUser: async (parent, { userId }) => {
      try {
        if (!userId) return false;
        
        const likedEvent = await prisma.likedEvent.findUnique({
          where: {
            userId_eventId: {
              userId,
              eventId: parent.id
            }
          }
        });
        
        return !!likedEvent;
      } catch (error) {
        console.error('[ERROR] isLikedByUser resolver:', error);
        return false; // Default to false on error
      }
    },
    
    // Resolver to get like count for internal events
    likeCount: async (parent) => {
      try {
        const count = await prisma.likedEvent.count({
          where: { 
            eventId: parent.id,
            isExternal: false
          }
        });
        return count || 0;
      } catch (error) {
        console.error('[ERROR] likeCount resolver:', error);
        return 0; // Return 0 as fallback
      }
    },
    
    isSavedByUser: async (parent, { userId }) => {
      try {
        if (!userId) return false;
        
        const savedEvent = await prisma.savedEvent.findUnique({
          where: {
            userId_eventId: {
              userId,
              eventId: parent.id
            }
          }
        });
        
        return !!savedEvent;
      } catch (error) {
        console.error('[ERROR] isSavedByUser resolver:', error);
        return false; // Default to false on error
      }
    },
    
    // Resolver to get save count for internal events
    saveCount: async (parent) => {
      try {
        const count = await prisma.savedEvent.count({
          where: { eventId: parent.id }
        });
        return count || 0;
      } catch (error) {
        console.error('[ERROR] saveCount resolver:', error);
        return 0; // Return 0 as fallback
      }
    }
  },
  
  // FIXED Field resolvers for ExternalEvent type
  ExternalEvent: {
    isLikedByUser: (parent, { userId }) => {
      // Ensure we always return a boolean
      if (!userId) return false;
      if (!parent || !parent.likedBy) return false;
      
      // Ensure likedBy is an array before using includes()
      return Array.isArray(parent.likedBy) && parent.likedBy.includes(userId);
    },
    
    isSavedByUser: (parent, { userId }) => {
      // Ensure we always return a boolean, never null
      if (!userId) return false;
      if (!parent || !parent.savedBy) return false;
      
      // Ensure savedBy is an array before using includes()
      return Array.isArray(parent.savedBy) && parent.savedBy.includes(userId);
    }
  },
  
  // User resolver
  User: {
    username: (parent) => {
      // Ensure parent exists and has necessary properties
      if (!parent) return "user";
      
      // Create a username from firstName and lastName if available
      // Or use email as a fallback
      if (parent.firstName && parent.lastName) {
        return `${parent.firstName} ${parent.lastName}`;
      } else if (parent.firstName) {
        return parent.firstName;
      } else if (parent.email) {
        // Use email address without the domain part
        return parent.email.split('@')[0];
      } else {
        // Default fallback
        return "user";
      }
    }
  }
};

// Combine all resolvers
const eventResolvers = {
  Query: queryResolvers,
  Mutation: {
    ...mutationResolvers,
    ...internalEventMutations,
    registerForEvent: mutationResolvers.registerForEvent
  },
  ...typeResolvers
};

module.exports = eventResolvers;