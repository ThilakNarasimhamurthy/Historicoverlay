const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const PostSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(), // UUID for post _id
  },
  userId: {
    type: String,
    required: true,
    ref: 'User', // Reference to MongoDB User model
  },
  content: {
    type: String,
    required: true,
  },
  mediaLinks: [{
    type: String,
  }],
  tags: [{
    type: String,
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'], // Ensuring the location type is 'Point'
      required: false,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false,
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2 && !isNaN(v[0]) && !isNaN(v[1]),
        message: 'Coordinates must be an array of [longitude, latitude]',
      },
    },
    address: {
      type: String,
      required: false,
    }
  },
  likes: [{
    userId: {
      type: String,
      required: true,
      ref: 'User', // Reference to User who liked the post
    },
    likedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  comments: [{
    id: {
      type: String,
      required: true,
      default: () => uuidv4(),
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
    },
    commentedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  likesCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  collection: 'posts', // Collection name
});

// Create a geospatial index for location-based queries
PostSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Post', PostSchema);