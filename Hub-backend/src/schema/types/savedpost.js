const { gql } = require('apollo-server-express');

module.exports = gql`

type Mutation {
    savePost(postId: ID!): SavedPostResponse!
    unsavePost(postId: ID!): SavedPostResponse!
  }

type Query {
    savedPosts: [Post!]!
    isSaved(postId: ID!): Boolean!
  }

  type SavedPostResponse {
    success: Boolean!
    message: String
  }
`;