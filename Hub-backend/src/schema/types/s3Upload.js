// schema.js (or your GraphQL schema file)
const { gql } = require('apollo-server-express');

module.exports = gql`
  type Mutation {
    # File upload mutations
    getPresignedUrl(filename: String!, contentType: String!): PresignedUrlResponse!
    completeFileUpload(input: CompleteFileUploadInput!): FileUploadResponse!
  }

  # File upload types
  type PresignedUrlResponse {
    uploadUrl: String!
    fileUrl: String!
    key: String!
  }
  
  input CompleteFileUploadInput {
    key: String!
    originalFilename: String!
    fileSize: Int!
    fileType: String!
    fileUrl: String!
  }
  
  type FileUploadResponse {
    success: Boolean!
    fileUrl: String
    error: String
  }
`;
