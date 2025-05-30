// models/userNotification.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userNotificationSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['LIKE', 'COMMENT', 'FOLLOW', 'MENTION', 'TAG', 'SHARE', 'CUSTOM']
  },
  content: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH'],
    default: 'NORMAL'
  },
  linkedEntityType: {
    type: String,
    enum: ['POST', 'COMMENT', 'USER', 'EVENT', 'COURSE', 'MESSAGE', null],
    default: null
  },
  linkedEntityId: {
    type: String,
    default: null
  },
  metadata: {
    type: Object,
    default: {}
  },
  sender: {
    type: Object,
    default: null
  }
}, {
  timestamps: true
});

// Add expiration for notifications after 30 days
userNotificationSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 30 * 24 * 60 * 60 
});

// Add compound index for userId + isRead for faster queries
userNotificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('UserNotification', userNotificationSchema);