const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


const subscriptionResolvers = {
    Mutation: {
      // Update user's subscription plan
      updateSubscriptionPlan: async (_, { userId, newPlan }) => {
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
          });
  
          if (!user) {
            throw new Error('User not found');
          }
  
          const updatedSubscription = await prisma.subscription.update({
            where: { userId },
            data: {
              planType: newPlan,
              nextRenewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            },
          });
  
          return updatedSubscription;
        } catch (error) {
          throw new Error(`Failed to update subscription: ${error.message}`);
        }
      },
    },
  
    Query: {
      getUserSubscription: async (_, { userId }) => {
        try {
          const subscription = await prisma.subscription.findUnique({
            where: { userId },
          });
  
          if (!subscription) {
            throw new Error('Subscription not found for this user');
          }
  
          return subscription;
        } catch (error) {
          throw new Error(`Error fetching subscription: ${error.message}`);
        }
      },
    },
  
    // Placeholder resolver for Subscription (this resolves the error)
    Subscription: {

    },
  };
  
  module.exports = subscriptionResolvers;
  