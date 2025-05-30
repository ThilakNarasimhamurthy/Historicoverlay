const { v4: uuidv4 } = require('uuid');
const UserActivityFeed = require('../models/UserActivity');

const resolvers = {
  Query: {
    activityFeedByUser: async (parent, { userId, limit = 10, offset = 0 }) => {
      try {
        const userActivity = await UserActivityFeed.findOne({ _id: userId });

        if (!userActivity) {
          throw new Error('No activity found for user');
        }

        // Sort and paginate activities
        const slicedActivities = userActivity.activities
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(offset, offset + limit)
          .map((activity) => ({
            ...activity.toObject?.() ?? activity, // Support Mongoose docs
            timestamp: activity.created_at,        // Rename field for GraphQL
          }));

        return {
          user_id: userActivity._id.toString(),
          activities: slicedActivities,
        };
      } catch (error) {
        console.error('Error fetching activity feed:', error);
        throw new Error('Unable to fetch user activity feed');
      }
    },
  },

  Mutation: {
    addUserActivity: async (
      parent,
      { userId, activity_type, related_entity_id, related_entity_type, metadata }
    ) => {
      try {

        const newActivity = {
          _id: uuidv4(),
          activity_type,
          related_entity_id,
          related_entity_type,
          metadata,
          created_at: new Date(),
        };

        let userActivity = await UserActivityFeed.findOne({ _id: userId });

        if (!userActivity) {
          userActivity = new UserActivityFeed({
            _id: userId,
            activities: [newActivity],
          });
        } else {
          userActivity.activities.push(newActivity);
        }

        await userActivity.save();

        return {
          ...newActivity,
          timestamp: newActivity.created_at, // Map to match schema
        };
      } catch (error) {
        console.error('Error adding user activity:', error);
        throw new Error('Unable to add user activity');
      }
    },
  },
};

module.exports = resolvers;
