const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ExternalEventSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(), // UUID for event _id
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true, // Source of the external event (e.g., "Eventbrite", "Meetup")
  },
  externalId: {
    type: String,
    required: true, // ID from external source
  },
  category: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2 && !isNaN(v[0]) && !isNaN(v[1]),
        message: 'Coordinates must be an array of [longitude, latitude]',
      },
    },
    address: { 
      type: String, 
      required: true 
    }
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  imageUrl: { 
    type: String 
  },
  externalUrl: { 
    type: String 
  }, // URL to the event on the external platform
  tags: [String],
  likedBy: [{ 
    type: String  // Array of PostgreSQL User IDs who liked this event
  }],
  savedBy: [{ 
    type: String  // Array of PostgreSQL User IDs who saved this event
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  collection: 'externalEvents', // Collection name
  // Add virtuals to the JSON output
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a geospatial index for location-based queries
ExternalEventSchema.index({ 'location.coordinates': '2dsphere' });
ExternalEventSchema.index({ startDate: 1 });
ExternalEventSchema.index({ category: 1 });
ExternalEventSchema.index({ tags: 1 });
ExternalEventSchema.index({ likedBy: 1 });
ExternalEventSchema.index({ savedBy: 1 });
ExternalEventSchema.index({ externalId: 1, source: 1 }, { unique: true }); // Prevent duplicates

// Add a virtual property to calculate like count
ExternalEventSchema.virtual('likeCount').get(function() {
  return this.likedBy?.length || 0;
});

// Add a virtual property to calculate save count
ExternalEventSchema.virtual('saveCount').get(function() {
  return this.savedBy?.length || 0;
});

module.exports = mongoose.model('ExternalEvent', ExternalEventSchema);