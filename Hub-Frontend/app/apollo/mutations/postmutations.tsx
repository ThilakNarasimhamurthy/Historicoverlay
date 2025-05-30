import { gql } from '@apollo/client';

// Query to get all posts
export const GET_ALL_POSTS = gql`
query GetAllPosts($limit: Int, $offset: Int) {
  posts(limit: $limit, offset: $offset) {
    id
    content
    userId
    mediaLinks
    tags
    location {
      type
      coordinates
    }
    likesCount
    commentsCount
    createdAt
    updatedAt
    user {
      id
      firstName
      lastName
    }
    likes {
      userId
      likedAt
      user {
        id
        firstName
        lastName
      }
    }
    comments {
      userId
      content
      commentedAt
      user {
        id
        firstName
        lastName
      }
    }
  }
}
`;

// Query to get posts by a specific user
export const GET_MY_POSTS = gql`
  query GetMyPosts($userId: UUID!) {
    postsByUser(userId: $userId) {
      id
      content
      mediaLinks
      tags
      location {
        type
        coordinates
      }
      likesCount
      commentsCount
      createdAt
      updatedAt
    }
  }
`;

// For now, we'll use the same query for saved posts (you might need to adjust this)
export const GET_SAVED_POSTS = gql`
query GetSavedPosts {
  savedPosts {
    id       # Use "id" instead of "_id"
    content
    mediaLinks
    likesCount
    commentsCount
  }
}
`;

// Mutation to create a post
export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      userId
      content
      mediaLinks
      tags
      location {
        address
      }
      likesCount
      commentsCount
      createdAt
      updatedAt
    }
  }
`;


// Mutation to update a post
export const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $content: String, $mediaLinks: [String], $tags: [String], $location: GeoLocationInput) {
    updatePost(id: $id, input: {
      content: $content,
      mediaLinks: $mediaLinks,
      tags: $tags,
      location: $location
    }) {
      id
      content
      mediaLinks
      tags
      location {
        type
        coordinates
      }
      updatedAt
    }
  }
`;

// Mutation to delete a post
export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

// Mutation to toggle like on a post
export const LIKE_POST = gql`
  mutation LikePost($postId: ID!, $userId: UUID!) {
    toggleLike(postId: $postId, userId: $userId) {
      id
      likesCount
    }
  }
`;

// Mutation to add a comment to a post
export const ADD_COMMENT = gql`
mutation AddComment($postId: ID!, $userId: UUID!, $content: String!) {
  addComment(postId: $postId, userId: $userId, content: $content) {
    id
    content
    commentedAt
    user {
      id
      firstName
      lastName
      email
    }
  }
}`;

// Mutation to delete a comment
export const DELETE_COMMENT = gql`
  mutation DeleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId)
  }
`;

// S3 file upload related mutations
export const GET_PRESIGNED_URL = gql`
  mutation GetPresignedUrl($filename: String!, $contentType: String!) {
    getPresignedUrl(filename: $filename, contentType: $contentType) {
      uploadUrl
      fileUrl
      key
    }
  }
`;

export const COMPLETE_FILE_UPLOAD = gql`
  mutation CompleteFileUpload($key: String!, $originalFilename: String!, $fileSize: Int!, $fileType: String!, $fileUrl: String!) {
    completeFileUpload(key: $key, originalFilename: $originalFilename, fileSize: $fileSize, fileType: $fileType, fileUrl: $fileUrl) {
      success
      fileUrl
    }
  }
`;