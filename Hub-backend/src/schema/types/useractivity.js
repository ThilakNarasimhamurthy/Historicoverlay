const { gql } = require('apollo-server-express');

module.exports = gql`
  scalar JSON

  type UserActivity {
    activity_id: UUID!
    activity_type: String!
    related_entity_id: String!
    related_entity_type: String!
    timestamp: String!
    metadata: JSON
  }

  type UserActivityFeed {
    user_id: ID!
    activities: [UserActivity!]!
  }

  type Query {
    activityFeedByUser(userId: ID!, limit: Int, offset: Int): UserActivityFeed!
  }

  type Mutation {
    addUserActivity(userId: ID!, activity_type: String!, related_entity_id: String!, related_entity_type: String!, metadata: JSON): UserActivity!
  }
`;
