// seed-events.js
// A standalone script to seed MongoDB with event data using UUIDs

const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

// Configuration - CHANGE THESE VALUES AS NEEDED
const config = {
  dbName: 'Hub',
  collectionName: 'externalEvents',
  numberOfEvents: 40
};

// Sample locations in NY and NJ
const locations = [
  { city: "New York", state: "NY", coordinates: [-74.0060, 40.7128] },
  { city: "Brooklyn", state: "NY", coordinates: [-73.9442, 40.6782] },
  { city: "Queens", state: "NY", coordinates: [-73.7949, 40.7282] },
  { city: "Manhattan", state: "NY", coordinates: [-73.9712, 40.7831] },
  { city: "Bronx", state: "NY", coordinates: [-73.8648, 40.8448] },
  { city: "Staten Island", state: "NY", coordinates: [-74.1502, 40.5795] },
  { city: "Jersey City", state: "NJ", coordinates: [-74.0776, 40.7282] },
  { city: "Hoboken", state: "NJ", coordinates: [-74.0323, 40.7439] },
  { city: "Newark", state: "NJ", coordinates: [-74.1724, 40.7357] },
  { city: "Paterson", state: "NJ", coordinates: [-74.1715, 40.9168] },
  { city: "Princeton", state: "NJ", coordinates: [-74.6672, 40.3573] },
  { city: "Atlantic City", state: "NJ", coordinates: [-74.4229, 39.3643] }
];

// Check if there are any geo indexes that could cause problems
async function checkForGeoIndexes(collection) {
  try {
    const indexes = await collection.indexes();
    console.log('Checking collection indexes...');
    
    let hasGeoIndex = false;
    for (const index of indexes) {
      if (index.name.includes('2d') || index.name.includes('2dsphere')) {
        hasGeoIndex = true;
        console.log(`⚠️ Found geospatial index: ${index.name}`);
      }
    }
    
    if (hasGeoIndex) {
      console.log('Note: Collection has geospatial indexes. Using GeoJSON Point format for coordinates.');
    }
    
    return hasGeoIndex;
  } catch (error) {
    console.log('Could not check indexes, might be a new collection');
    return false;
  }
}

// Event categories
const categories = ["Sports", "Technology", "Arts", "Food", "Education", "Fitness", "Networking", "Music"];

// Generate random tags
const tagOptions = ["running", "marathon", "training", "fitness", "outdoor", "meetup", "community", 
  "networking", "learning", "coding", "music", "performance", "workshop", "hiking", "wellness",
  "yoga", "meditation", "cooking", "photography", "dance", "art", "technology", "startup"];

// Generate a sample event
function generateEvent() {
  const state = Math.random() > 0.5 ? "NY" : "NJ";
  const locationOptions = locations.filter(loc => loc.state === state);
  const location = locationOptions[Math.floor(Math.random() * locationOptions.length)];
  
  // Generate random start date in the next 3 months
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 90));
  startDate.setHours(Math.floor(Math.random() * 12) + 6); // Between 6am and 6pm
  startDate.setMinutes(Math.random() > 0.5 ? 0 : 30); // On the hour or half hour
  startDate.setSeconds(0);
  startDate.setMilliseconds(0);
  
  // End date 1-3 hours after start date
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 3) + 1);
  
  // Generate 2-5 random tags
  const numTags = Math.floor(Math.random() * 4) + 2;
  const tags = [];
  for (let i = 0; i < numTags; i++) {
    const tag = tagOptions[Math.floor(Math.random() * tagOptions.length)];
    if (!tags.includes(tag)) tags.push(tag);
  }
  
  const category = categories[Math.floor(Math.random() * categories.length)];
  const activityWord = getRandomActivityForCategory(category);
  
  // Create event with unique UUID
  return {
    _id: uuidv4(),
    name: generateEventName(location.city, activityWord, category),
    description: generateDescription(location.city, state, activityWord, category),
    source: "Meetup",
    externalId: `meet${Math.floor(100000 + Math.random() * 900000)}`,
    category: category,
    location: `${location.city}, ${state}`,
    coordinates: {
      type: "Point",
      coordinates: location.coordinates
    },
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    imageUrl: `https://example.com/images/${tags[0]}-${Math.floor(Math.random() * 1000)}.jpg`,
    externalUrl: `https://meetup.com/${location.city.toLowerCase().replace(/\s+/g, '-')}-${tags[0]}-group`,
    tags: tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likedBy: [],
    savedBy: [],
    likeCount: 0,
    saveCount: 0
  };
}

// Get activity word based on category
function getRandomActivityForCategory(category) {
  const activityMap = {
    "Sports": ["Running", "Basketball", "Soccer", "Tennis", "Volleyball"],
    "Technology": ["Coding", "Hackathon", "JavaScript", "Python", "AI"],
    "Arts": ["Painting", "Drawing", "Sculpture", "Photography", "Theater"],
    "Food": ["Cooking", "Baking", "Tasting", "Dining", "Brewers"],
    "Education": ["Learning", "Workshop", "Seminar", "Study", "Discussion"],
    "Fitness": ["Training", "Yoga", "Pilates", "Crossfit", "Wellness"],
    "Networking": ["Professional", "Entrepreneur", "Business", "Career", "Industry"],
    "Music": ["Concert", "Jam", "Band", "Practice", "Listening"]
  };
  
  const activities = activityMap[category] || ["Meetup", "Group", "Club", "Community", "Social"];
  return activities[Math.floor(Math.random() * activities.length)];
}

// Generate event name based on location and category
function generateEventName(city, activity, category) {
  const prefixes = ["Weekend", "Morning", "Evening", "Weekly", "Monthly", "Summer"];
  const groups = ["Group", "Club", "Community", "Team", "Enthusiasts", "Circle"];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const group = groups[Math.floor(Math.random() * groups.length)];
  
  return `${city} ${prefix} ${activity} ${group}`;
}

// Generate description based on location and activity
function generateDescription(city, state, activity, category) {
  const descriptions = [
    `Join fellow ${activity.toLowerCase()} enthusiasts in ${city}, ${state} for our regular meetup. Connect with like-minded people, share experiences, and enjoy activities together.`,
    `${activity} lovers unite! Our ${city} group meets regularly to practice, learn, and connect. All skill levels welcome.`,
    `Looking to improve your ${activity.toLowerCase()} skills? Our ${city} community offers training, tips, and social connections for ${category.toLowerCase()} enthusiasts.`,
    `${city}'s premier ${category.toLowerCase()} group focused on ${activity.toLowerCase()}. Weekly meetings, special events, and a supportive community.`,
    `Connect with other ${activity} fans in the ${city} area. Whether you're a beginner or expert, you'll find friends and knowledge in our community.`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Main function to connect to MongoDB and seed data
async function seedEvents() {
  const client = new MongoClient(config.mongoUri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB server');
    
    const db = client.db(config.dbName);
    const collection = db.collection(config.collectionName);
    
    // Check if collection has geospatial indexes
    await checkForGeoIndexes(collection);
    
    // Generate sample events
    const events = [];
    for (let i = 0; i < config.numberOfEvents; i++) {
      events.push(generateEvent());
    }
    
    // Insert the events into the collection
    const result = await collection.insertMany(events);
    console.log(`✅ Successfully inserted ${result.insertedCount} events into ${config.dbName}.${config.collectionName}`);
    
    // Log sample of inserted data
    console.log('\nSample event:');
    console.log(JSON.stringify(events[0], null, 2));
    
    console.log('\nUUIDs of inserted events:');
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event._id}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedEvents().catch(console.error);