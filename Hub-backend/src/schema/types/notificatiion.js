// graphql/typeDefs/notification.typeDefs.js
const { gql } = require('apollo-server-express');

module.exports = gql`
  # Notification types
  enum NotificationType {
    EVENT_UPDATE
    EVENT_REMINDER
    PAYMENT_CONFIRMATION
    PAYMENT_FAILED
    SUBSCRIPTION_EXPIRING
    SYSTEM_ALERT
    WELCOME
  }
  
  enum NotificationChannel {
    EMAIL
    SMS
    PUSH
    IN_APP
  }
  
  enum UserNotificationType {
    LIKE
    COMMENT
    FOLLOW
    MENTION
    TAG
    SHARE
    CUSTOM
  }
  
  enum NotificationPriority {
    LOW
    NORMAL
    HIGH
  }
  
  enum NotificationStatus {
    PENDING
    SENT
    FAILED
  }
  
  enum LinkedEntityType {
    POST
    COMMENT
    USER
    EVENT
    COURSE
    MESSAGE
  }
  
  # System notifications (PostgreSQL)
  type SystemNotification {
    id: ID!
    type: String!
    channel: String!
    message: String!
    recipient: String
    data: JSON
    status: String!
    metadata: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
    userId: ID
  }
  
  # User notifications (MongoDB)
  type UserNotification {
    id: ID!
    userId: ID!
    type: String!
    content: String!
    isRead: Boolean!
    priority: String!
    linkedEntityType: String
    linkedEntityId: ID
    metadata: JSON
    sender: UserNotificationSender
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  type UserNotificationSender {
    id: ID!
    name: String
    avatarUrl: String
  }
  
  # Inputs
  input SystemNotificationInput {
    type: NotificationType!
    channel: NotificationChannel!
    message: String!
    userId: ID
    recipient: String
    data: JSON
    metadata: JSON
  }
  
  input UserNotificationInput {
    userId: ID!
    type: UserNotificationType!
    content: String!
    priority: NotificationPriority
    linkedEntityType: LinkedEntityType
    linkedEntityId: ID
    metadata: JSON
    sender: UserNotificationSenderInput
  }
  
  input UserNotificationSenderInput {
    id: ID!
    name: String
    avatarUrl: String
  }
  
  # Responses
  type MarkAllNotificationsResponse {
    success: Boolean!
    count: Int!
  }
  
  # Extend existing types
  extend type Query {
    userUnreadNotifications: [UserNotification!]!
    systemNotifications(limit: Int = 20, offset: Int = 0): [SystemNotification!]!
  }
  
  extend type Mutation {
    markNotificationAsRead(notificationId: ID!): UserNotification
    markAllNotificationsAsRead: MarkAllNotificationsResponse!
    createSystemNotification(input: SystemNotificationInput!): SystemNotification
    createUserNotification(input: UserNotificationInput!): UserNotification
  }
  
  # Define scalar types if not already defined
  scalar DateTime
  scalar JSON
`;