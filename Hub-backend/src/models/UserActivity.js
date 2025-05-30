const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const activitySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(), // UUID for activity _id
  },
  activity_type: {
    type: String,
    required: true
  },
  related_entity_id: {
    type: String,
    required: true
  },
  related_entity_type: {
    type: String,
    required: true
  },
  metadata: {
    type: Object,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const UserActivityFeedSchema = new mongoose.Schema({
  _id: { // This will be the user_id
    type: String,
    required: true,
    ref: 'User'
  },
  activities: [activitySchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('UserActivityFeed', UserActivityFeedSchema);
