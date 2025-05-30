const { gql } = require('apollo-server-express');

module.exports = gql`
scalar Date
scalar JSON
# Subscription Type
type Subscription {
  id: ID!
  userId: String!
  planType: PlanType!
  paymentStatus: PaymentStatus!
  lastRenewalDate: String!
  nextRenewalDate: String!
  billingHistory: JSON
}

# Enum for subscription plans
enum PlanType {
  FREE
  PREMIUM
  ENTERPRISE
}

# Enum for payment status
enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
}

# Mutation to update a user's subscription plan
type Mutation {
  updateSubscriptionPlan(
    userId: String!,
    newPlan: PlanType!
    ): Subscription
}

# Query to get the subscription details of a user
type Query {
  getUserSubscription(userId: String!): Subscription
}

`;