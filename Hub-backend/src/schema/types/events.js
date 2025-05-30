const { gql } = require('apollo-server-express');

module.exports = gql`
  # Event Interface - common fields between internal and external events
  interface EventInterface {
    id: ID!
    name: String!
    description: String!
    category: String!
    location: String!
    coordinates: Coordinates!
    startDate: DateTime!
    endDate: DateTime!
    tags: [String!]
    isLikedByUser(userId: UUID!): Boolean
    isSavedByUser(userId: UUID!): Boolean
  }

  # PostgreSQL Event Type
  type Event implements EventInterface {
    id: ID!
    name: String!
    description: String!
    category: String!
    location: String!
    coordinates: Coordinates!
    status: EventStatus!
    startDate: DateTime!
    endDate: DateTime!
    capacity: Int
    isPublic: Boolean!
    creator: User!
    createdAt: DateTime!
    updatedAt: DateTime!
    tags: [String!]

    # Relationships
    participants: [EventParticipation!]!
    participantCount: Int!
    likeCount: Int!
    saveCount: Int!

    # Interface implementations
    isLikedByUser(userId: UUID!): Boolean!
    isSavedByUser(userId: UUID!): Boolean!
  }

  # Event Participation type
  type EventParticipation {
    id: ID!
    userId: UUID!
    user: User!
    eventId: ID!
    event: Event!
    rsvpStatus: RSVPStatus!
    registrationStatus: RegistrationStatus!
    timestamp: DateTime!
    checkInTime: DateTime
    feedback: String
  }

  # MongoDB External Event Type
  type ExternalEvent implements EventInterface {
    id: ID!
    name: String!
    description: String!
    category: String!
    location: String!
    startDate: DateTime!
    endDate: DateTime!
    tags: [String!]
    source: String!
    externalId: String!
    externalUrl: String
    imageUrl: String
    coordinates: Coordinates!
    createdAt: DateTime!
    updatedAt: DateTime!

    # User interactions
    likeCount: Int!
    saveCount: Int!

    # Interface implementations
    isLikedByUser(userId: UUID!): Boolean!
    isSavedByUser(userId: UUID!): Boolean!
  }

  type Coordinates {
    latitude: Float!
    longitude: Float!
  }

  # Input Types
  input EventCreateInput {
    name: String!
    description: String!
    category: String!
    location: String!
    startDate: DateTime!
    endDate: DateTime!
    capacity: Int
    isPublic: Boolean = true
    tags: [String!]
    creatorId: UUID!
  }

  # Queries and mutations
  extend type Query {
    # PostgreSQL Event Queries
    event(id: ID!): Event
    events(
      filter: EventFilterInput
      orderBy: EventOrderByInput
      skip: Int
      take: Int
    ): [Event!]!

    # MongoDB External Event Queries
    externalEvent(id: ID!): ExternalEvent
    externalEvents(
      filter: ExternalEventFilterInput
      orderBy: ExternalEventOrderByInput
      skip: Int
      take: Int
    ): [ExternalEvent!]!

    # Combined Events Query
    allEvents(
      filter: AllEventsFilterInput
      orderBy: AllEventsOrderByInput
      skip: Int
      take: Int
    ): [EventInterface!]!

    # Geo-based Event Query
    eventsNearMe(
      latitude: Float!
      longitude: Float!
      radiusInKm: Float = 10
      filter: AllEventsFilterInput
      skip: Int
      take: Int
    ): [EventInterface!]!

    # User interaction queries
    userLikedEvents(userId: UUID!): [EventInterface!]!
    userSavedEvents(userId: UUID!): [EventInterface!]!
    userParticipatedEvents(userId: UUID!): [Event!]!
    userCreatedEvents(userId: UUID!): [Event!]!
  }

  extend type Mutation {
    # PostgreSQL Event Mutations
    createEvent(data: EventCreateInput!): Event!
    updateEvent(id: ID!, data: EventUpdateInput!): Event!
    deleteEvent(id: ID!): Event

    # Event Participation Mutations
    updateEventParticipation(
      eventId: ID!
      userId: UUID!
      data: EventParticipationUpdateInput!
    ): EventParticipation!

    # Internal Event Interactions
    likeInternalEvent(eventId: ID!, userId: UUID!): Event!
    unlikeInternalEvent(eventId: ID!, userId: UUID!): Event!
    saveInternalEvent(eventId: ID!, userId: UUID!): Event!
    unsaveInternalEvent(eventId: ID!, userId: UUID!): Event!

    # External Event Interactions
    likeExternalEvent(eventId: ID!, userId: UUID!): ExternalEvent!
    unlikeExternalEvent(eventId: ID!, userId: UUID!): ExternalEvent!
    saveExternalEvent(eventId: ID!, userId: UUID!): ExternalEvent!
    unsaveExternalEvent(eventId: ID!, userId: UUID!): ExternalEvent!
    
    # Event Registration Mutation
    registerForEvent(
      eventId: ID!
      userId: UUID!
      rsvpStatus: RSVPStatus = GOING
    ): EventParticipation!
  }

  # Enums
  enum EventStatus {
    PENDING
    ACTIVE
    COMPLETED
    CANCELED
  }

  enum RSVPStatus {
    GOING
    MAYBE
    NOT_GOING
  }

  enum RegistrationStatus {
    REGISTERED
    PENDING
    CANCELED
    WAITLISTED
  }

  enum EventOrderByField {
    START_DATE
    CREATED_AT
    NAME
    CATEGORY
  }

  enum ExternalEventOrderByField {
    START_DATE
    SOURCE
    NAME
    CATEGORY
    LIKE_COUNT
  }

  enum AllEventsOrderByField {
    START_DATE
    NAME
    CATEGORY
  }

  enum OrderDirection {
    ASC
    DESC
  }

  # Complete definitions for all input types
  input EventFilterInput {
    name: String
    category: String
    location: String
    startDateAfter: DateTime
    startDateBefore: DateTime
    endDateAfter: DateTime
    endDateBefore: DateTime
    isPublic: Boolean
    status: EventStatus
    creatorId: UUID
    hasAvailableCapacity: Boolean
    tags: [String!]
  }

  input EventUpdateInput {
    name: String
    description: String
    category: String
    location: String
    startDate: DateTime
    endDate: DateTime
    capacity: Int
    isPublic: Boolean
    status: EventStatus
    tags: [String!]
  }

  input EventOrderByInput {
    field: EventOrderByField!
    direction: OrderDirection!
  }

  input ExternalEventFilterInput {
    name: String
    category: String
    location: String
    startDateAfter: DateTime
    startDateBefore: DateTime
    endDateAfter: DateTime
    endDateBefore: DateTime
    source: String
    tags: [String!]
  }

  input ExternalEventOrderByInput {
    field: ExternalEventOrderByField!
    direction: OrderDirection!
  }

  input AllEventsFilterInput {
    name: String
    category: String
    location: String
    startDateAfter: DateTime
    startDateBefore: DateTime
    endDateAfter: DateTime
    endDateBefore: DateTime
    tags: [String!]
    includeInternalEvents: Boolean
    includeExternalEvents: Boolean
  }

  input AllEventsOrderByInput {
    field: AllEventsOrderByField!
    direction: OrderDirection!
  }

  input EventParticipationUpdateInput {
    rsvpStatus: RSVPStatus
    registrationStatus: RegistrationStatus
    feedback: String
    checkInTime: DateTime
  }

  # Define scalar type for DateTime and UUID
  scalar DateTime
  scalar UUID

  # We need to define the User type since it's referenced but not defined
  type User {
    id: UUID!
    username: String!
    email: String!
    profilePicture: String
    firstName: String
    lastName: String
    bio: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }
`;