// app/apollo/queries/events.js
import { gql } from '@apollo/client';

// Fragment for common event fields
const EVENT_FIELDS = gql`
  fragment EventFields on EventInterface {
    id
    name
    description
    category
    location
    startDate
    endDate
    tags
    isLikedByUser(userId: $userId)
    isSavedByUser(userId: $userId)
    ... on Event {
      status
      isPublic
      capacity
      creator {
        id
        username
        profilePicture
      }
      participantCount
    }
    ... on ExternalEvent {
      source
      externalUrl
      imageUrl
      coordinates {
        latitude
        longitude
      }
      likeCount
      saveCount
    }
  }
`;

// Query to get all events (both internal and external)
export const GetAllEvents = gql`
query GetAllEvents {
  allEvents(
    filter: {
      includeInternalEvents: true
      includeExternalEvents: true
    }
  ) {
    id
    name
    startDate
    location
    description
    coordinates {
      latitude
      longitude
    }
    ... on ExternalEvent {
      source
      location
      description
      coordinates {
        latitude
        longitude
      }
    }
  }
}`;

// Query to get events near a location
export const GET_EVENTS_NEAR_ME = gql`
query GetEventsNearMe($latitude: Float!, $longitude: Float!, $radiusInKm: Float, $filter: AllEventsFilterInput, $skip: Int, $take: Int) {
  eventsNearMe(latitude: $latitude, longitude: $longitude, radiusInKm: $radiusInKm, filter: $filter, skip: $skip, take: $take) {
    id
    name
    description
    category
    location
    coordinates {
      latitude
      longitude
    }
    startDate
    endDate
    tags
    
    ... on Event {
      creator {
        id
        username
      }
      participantCount
    }
    
    ... on ExternalEvent {
      source
      externalUrl
    }
  }
}

`;

// Query to get an external event by ID
export const GET_EXTERNAL_EVENT = gql`
  query GetExternalEvent($id: ID!, $userId: UUID!) {
    externalEvent(id: $id) {
      ...EventFields
    }
  }
  ${EVENT_FIELDS}
`;

// Query to get events liked by a user
export const GET_USER_LIKED_EVENTS = gql`
  query GetUserLikedEvents($userId: UUID!) {
    userLikedEvents(userId: $userId) {
      ...EventFields
    }
  }
  ${EVENT_FIELDS}
`;


// Query to get events a user is participating in
export const GET_USER_PARTICIPATIONS = gql`
  query GetUserParticipations($userId: UUID!) {
    userParticipatedEvents(userId: $userId) {
      id
      name
      startDate
      endDate
      status
      participantCount
      participants {
        rsvpStatus
        registrationStatus
      }
    }
  }
`;

export const GET_SAVED_EVENTS = gql`
  query GetSavedEvents($userId: UUID!) {
    userSavedEvents(userId: $userId) {
      id
      name
      description
      startDate
      endDate
      
      coordinates {
        latitude
        longitude
      }
      
      ... on Event {
        status
        participantCount
        likeCount
      }
      
      ... on ExternalEvent {
        source
        externalUrl
      }
    }
  }
`;

export const GET_MY_CREATED_EVENTS = gql`
  query GetMyCreatedEvents($userId: UUID!) {
    userCreatedEvents(
      userId: $userId
    ) {
      id
      name
      startDate
      endDate
      status
      participantCount
      creator {
        id
        firstName
      }
      likeCount
      saveCount
      description
    }
  }
`;