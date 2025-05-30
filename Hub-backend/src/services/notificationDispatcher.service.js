// services/notificationDispatcher.service.js
const notificationService = require('./notification.service');
const sendgridService = require('./sendgrid.service'); 
const twilioService = require('./twilio.service');
const fcmService = require('./fcm.service');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class NotificationDispatcher {
  async dispatchSystemNotification(data) {
    // 1. Create notification in the database
    const notification = await notificationService.createSystemNotification(data);
    
    // 2. Send via appropriate channels
    try {
      switch (data.channel) {
        case 'EMAIL':
          if (data.recipient) {
            await sendgridService.sendEmail({
              to: data.recipient,
              subject: this.getSubjectByType(data.type),
              content: data.message,
              data: data.data
            });
          }
          break;
          
        case 'SMS':
          if (data.recipient) {
            await twilioService.sendSMS({
              to: data.recipient,
              message: data.message
            });
          }
          break;
          
        case 'PUSH':
          // Get user's FCM tokens
          const user = await prisma.user.findUnique({
            where: { id: data.userId },
            select: { fcmTokens: true }
          });
          
          if (user?.fcmTokens?.length > 0) {
            await fcmService.sendPushNotification({
              tokens: user.fcmTokens,
              title: this.getTitleByType(data.type),
              body: data.message,
              data: data.data || {}
            });
          }
          break;
          
        case 'IN_APP':
          // Already created in database, nothing more needed
          break;
          
        default:
          console.log(`Unsupported channel: ${data.channel}`);
      }
    } catch (error) {
      console.error(`Error dispatching notification via ${data.channel}:`, error);
      // Still return the notification since it was created in DB
    }
    
    return notification;
  }
  
  // Create and dispatch a user-facing notification
  async dispatchUserNotification(data) {
    // 1. Create in MongoDB
    const notification = await notificationService.createUserNotification(data);
    
    // 2. Send push notification for high priority notifications
    try {
      if (data.priority === 'HIGH') {
        // Get user's FCM tokens
        const user = await prisma.user.findUnique({
          where: { id: data.userId },
          select: { pushNotificationsEnabled: true, fcmTokens: true }
        });
        
        if (user?.pushNotificationsEnabled && user?.fcmTokens?.length > 0) {
          await fcmService.sendPushNotification({
            tokens: user.fcmTokens,
            title: this.getTitleByUserType(data.type),
            body: data.content,
            data: {
              notificationId: notification.id,
              type: data.type,
              linkedEntityType: data.linkedEntityType,
              linkedEntityId: data.linkedEntityId,
              ...(data.metadata || {})
            }
          });
        }
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
      // Still return the notification since it was created in DB
    }
    
    return notification;
  }
  
  // Helper methods for notification titles/subjects
  getSubjectByType(type) {
    const subjects = {
      EVENT_UPDATE: 'Event Update',
      EVENT_REMINDER: 'Event Reminder',
      PAYMENT_CONFIRMATION: 'Payment Confirmation',
      PAYMENT_FAILED: 'Payment Failed',
      SUBSCRIPTION_EXPIRING: 'Subscription Expiring Soon',
      SYSTEM_ALERT: 'Important System Alert',
      WELCOME: 'Welcome to StudentHub'
    };
    
    return subjects[type] || 'StudentHub Notification';
  }
  
  getTitleByType(type) {
    return this.getSubjectByType(type);
  }
  
  getTitleByUserType(type) {
    const titles = {
      LIKE: 'New Like',
      COMMENT: 'New Comment',
      FOLLOW: 'New Follower',
      MENTION: 'New Mention',
      TAG: 'You were tagged',
      SHARE: 'Someone shared your post'
    };
    
    return titles[type] || 'New Notification';
  }
}

module.exports = new NotificationDispatcher();