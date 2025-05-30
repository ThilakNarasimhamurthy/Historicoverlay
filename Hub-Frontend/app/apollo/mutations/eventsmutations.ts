import { gql } from '@apollo/client';

// EXTERNAL EVENT MUTATIONS

// Mutation to like an external event
export const LIKE_EXTERNAL_EVENT = gql`
  mutation LikeExternalEvent($eventId: ID!, $userId: UUID!) {
    likeExternalEvent(eventId: $eventId, userId: $userId) {
      id
      likeCount
      isLikedByUser(userId: $userId)
    }
  }
`;

// Mutation to unlike an external event
export const UNLIKE_EXTERNAL_EVENT = gql`
  mutation UnlikeExternalEvent($eventId: ID!, $userId: UUID!) {
    unlikeExternalEvent(eventId: $eventId, userId: $userId) {
      id
      likeCount
      isLikedByUser(userId: $userId)
    }
  }
`;

// Mutation to save an external event
export const SAVE_EXTERNAL_EVENT = gql`
  mutation SaveExternalEvent($eventId: ID!, $userId: UUID!) {
    saveExternalEvent(eventId: $eventId, userId: $userId) {
      id
      saveCount
      isSavedByUser(userId: $userId)
    }
  }
`;

// Mutation to unsave an external event
export const UNSAVE_EXTERNAL_EVENT = gql`
  mutation UnsaveExternalEvent($eventId: ID!, $userId: UUID!) {
    unsaveExternalEvent(eventId: $eventId, userId: $userId) {
      id
      saveCount
      isSavedByUser(userId: $userId)
    }
  }
`;

// INTERNAL EVENT MUTATIONS

// Mutation to like an internal event
export const LIKE_INTERNAL_EVENT = gql`
  mutation LikeInternalEvent($eventId: ID!, $userId: UUID!) {
    likeInternalEvent(eventId: $eventId, userId: $userId) {
      id
      name
      likeCount
      isLikedByUser(userId: $userId)
    }
  }
`;

// Mutation to unlike an internal event
export const UNLIKE_INTERNAL_EVENT = gql`
  mutation UnlikeInternalEvent($eventId: ID!, $userId: UUID!) {
    unlikeInternalEvent(eventId: $eventId, userId: $userId) {
      id
      name
      likeCount
      isLikedByUser(userId: $userId)
    }
  }
`;

// Mutation to save an internal event
export const SAVE_INTERNAL_EVENT = gql`
  mutation SaveInternalEvent($eventId: ID!, $userId: UUID!) {
    saveInternalEvent(eventId: $eventId, userId: $userId) {
      id
      name
      saveCount
      isSavedByUser(userId: $userId)
    }
  }
`;

// Mutation to unsave an internal event
export const UNSAVE_INTERNAL_EVENT = gql`
  mutation UnsaveInternalEvent($eventId: ID!, $userId: UUID!) {
    unsaveInternalEvent(eventId: $eventId, userId: $userId) {
      id
      name
      saveCount
      isSavedByUser(userId: $userId)
    }
  }
`;

// EVENT CRUD OPERATIONS

export const REGISTER_FOR_EVENT = gql`
  mutation RegisterForEvent(
    $eventId: ID!,
    $userId: UUID!,
    $rsvpStatus: RSVPStatus = GOING
  ) {
    registerForEvent(
      eventId: $eventId,
      userId: $userId,
      rsvpStatus: $rsvpStatus
    ) {
      id
      rsvpStatus
      registrationStatus
      timestamp
      user {
        id
        firstName
        lastName
      }
      event {
        id
        name
      }
    }
  }
`;

// Update participation mutation
export const UPDATE_EVENT_PARTICIPATION = gql`
  mutation UpdateEventParticipation(
    $eventId: ID!,
    $userId: UUID!,
    $data: EventParticipationUpdateInput!
  ) {
    updateEventParticipation(
      eventId: $eventId,
      userId: $userId,
      data: $data
    ) {
      id
      rsvpStatus
      registrationStatus
      timestamp
      user {
        id
        firstName
        lastName
      }
      event {
        id
        name
      }
    }
  }
`;
// Mutation to create a new event
export const CREATE_EVENT = gql`
  mutation CreateEvent($data: EventCreateInput!) {
    createEvent(data: $data) {
      id
      name
      description
      category
      location
      startDate
      endDate
      capacity
      isPublic
      tags
      creator {
        id
        firstName
      }
    }
  }
`;

// Mutation to update an existing event
export const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $data: EventUpdateInput!) {
    updateEvent(id: $id, data: $data) {
      id
      name
      description
      category
      location
      startDate
      endDate
      status
      capacity
      isPublic
      tags
    }
  }
`;

// Mutation to delete an event
export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id) {
      id
      name
    }
  }
`;