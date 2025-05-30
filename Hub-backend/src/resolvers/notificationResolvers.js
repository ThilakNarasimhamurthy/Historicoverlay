// graphql/resolvers/notification.resolvers.js
const notificationService = require('../../services/notification.service');
const notificationDispatcher = require('../../services/notificationDispatcher.service');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');

module.exports = {
  Query: {
    // Get all unread notifications for the current user
    userUnreadNotifications: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      
      return await notificationService.getUserUnreadNotifications(user.id);
    },
    
    // Get all system notifications for the current user
    systemNotifications: async (_, { limit, offset }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      
      return await notificationService.getSystemNotifications(user.id, limit, offset);
    }
  },
  
  Mutation: {
    // Mark a notification as read
    markNotificationAsRead: async (_, { notificationId }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      
      const notification = await notificationService.markNotificationAsRead(notificationId, user.id);
      
      if (!notification) {
        throw new ForbiddenError('Notification not found or you do not have permission');
      }
      
      return notification;
    },
    
    // Mark all notifications as read
    markAllNotificationsAsRead: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      
      const result = await notificationService.markAllNotificationsAsRead(user.id);
      
      return {
        success: true,
        count: result.modifiedCount
      };
    },
    
    // Create system notification (admin only)
    createSystemNotification: async (_, { input }, { user, isAdmin }) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      if (!isAdmin) throw new ForbiddenError('Admin access required');
      
      return await notificationDispatcher.dispatchSystemNotification({
        type: input.type,
        channel: input.channel,
        message: input.message,
        userId: input.userId,
        recipient: input.recipient,
        data: input.data,
        metadata: input.metadata
      });
    },
    
    // Create user notification (for internal use)
    createUserNotification: async (_, { input }, { user, isAdmin, isInternalService }) => {
      if (!isAdmin && !isInternalService) {
        throw new ForbiddenError('Admin or internal service access required');
      }
      
      return await notificationDispatcher.dispatchUserNotification({
        userId: input.userId,
        type: input.type,
        content: input.content,
        priority: input.priority,
        linkedEntityType: input.linkedEntityType,
        linkedEntityId: input.linkedEntityId,
        metadata: input.metadata,
        sender: input.sender
      });
    }
  }
};