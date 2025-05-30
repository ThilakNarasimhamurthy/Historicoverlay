// typeDefs.js
const { gql } = require('apollo-server-express');

// Use extend for existing types and define new types
module.exports = gql`
  type AuthPayload {
    token: String!
    user: User!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type LoggedInStatus {
    isLoggedIn: Boolean!
  }

  extend type Query {
    checkLoggedIn: LoggedInStatus!
    me: User  # Add this to get the current user
  }

  extend type Mutation {
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    sendOtp(phone: String!): Boolean
    verifyOtp(phone: String!, code: String!): Boolean
  }
`;