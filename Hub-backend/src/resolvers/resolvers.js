//

// resolvers.js (or index.js)
const userResolvers = require('./userResolvers');
const postResolvers = require('./postResolvers');
const subscriptionResolvers = require('./subscriptionResolver');
const userActivityResolvers = require('./userActivityResolvers');
const authResolvers = require('./authResolvers');
const savedPostResolvers = require('./savedpostResolver'); // Import saved post resolvers
const s3uploadResolvers = require('./s3UploadResolvers'); // Import S3 upload resolvers
const eventResolvers = require('./eventResolvers'); // Import event resolvers


const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...subscriptionResolvers.Query,
    ...userActivityResolvers.Query,  // Ensure this is included
    ...authResolvers.Query,
    ...savedPostResolvers.Query, // Include saved post queries
    ...s3uploadResolvers.Query, // Include S3 upload queries
    ...eventResolvers.Query, // Include event queries
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...subscriptionResolvers.Mutation,
    ...userActivityResolvers.Mutation,  // Ensure this is included
    ...authResolvers.Mutation,
    ...savedPostResolvers.Mutation, // Include saved post mutations
    ...s3uploadResolvers.Mutation, // Include S3 upload mutations
    ...eventResolvers.Mutation, // Include event mutations
  },
  Post: postResolvers.Post,
  Subscription: subscriptionResolvers.Subscription,
};

module.exports = resolvers;
