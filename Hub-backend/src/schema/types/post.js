const { gql } = require('apollo-server-express');

module.exports = gql`
  scalar DateTime
  scalar UUID

  type Post {
    id: ID!
    userId: UUID!
    user: User
    content: String!
    mediaLinks: [String]
    tags: [String]
    location: GeoLocation
    likes: [Like!]!            # Nested list of likes
    comments: [Comment!]!      # Nested list of comments
    likesCount: Int!
    commentsCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Like {
    userId: UUID!
    user: User                 # User who liked the post
    likedAt: DateTime!
  }

  type Comment {
    id: ID!
    userId: UUID!
    user: User                 # User who commented
    content: String!
    commentedAt: DateTime!
  }

  type GeoLocation {
    type: String
    coordinates: [Float!]     # [longitude, latitude]
    address: String           # The original address string
  }

  type Query {
    post(id: ID!): Post
    posts(limit: Int, offset: Int): [Post!]!
    postsByUser(userId: UUID!, limit: Int, offset: Int): [Post!]!
    getLikesCount(postId: ID!): Int
  }

  type Mutation {
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): Boolean!
    
    toggleLike(postId: ID!, userId: UUID!): Post!       # Like/Unlike toggle
    addComment(postId: ID!, userId: UUID!, content: String!): Comment!
    deleteComment(commentId: ID!): Boolean!
  }

  input CreatePostInput {
    userId: UUID!
    content: String!
    mediaLinks: [String]
    tags: [String]
    location: String          # Now just a string instead of GeoLocationInput
  }

  input UpdatePostInput {
    content: String
    mediaLinks: [String]
    tags: [String]
    location: String          # Now just a string instead of GeoLocationInput
  }

  type User {
    id: UUID!
    firstName: String!
    lastName: String!
    email: String!
  }
`;