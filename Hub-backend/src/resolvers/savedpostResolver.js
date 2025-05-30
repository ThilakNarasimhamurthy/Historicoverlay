const { PrismaClient } = require('@prisma/client');
const Post = require('../models/Post'); // Import Post model directly
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

const savedpostResolvers = {
  Query: {
    // Get all saved posts for the current user
    savedPosts: async (_, __, { user }) => {
      // AUTHENTICATION TEMPORARILY DISABLED
      // if (!user) {
      //   throw new Error('Authentication required');
      // }
      
      // Placeholder user for testing purposes
      const placeholderUser = { id: 'a30b47d9-3e87-46cc-95af-566c91216a28' };
      const currentUser = user || placeholderUser;
      
      try {
        // Get saved post IDs from PostgreSQL
        const savedPosts = await prisma.savedPost.findMany({
          where: { userId: currentUser.id },
          orderBy: { savedAt: 'desc' },
        });
        
        if (savedPosts.length === 0) {
          return [];
        }
        
        const postIds = savedPosts.map(sp => sp.postId);
        
        // Fetch posts from MongoDB
        const posts = await Post.find({ _id: { $in: postIds } });
        
        // Return posts in the same order as they were saved
        return postIds
          .map(id => posts.find(post => post._id.toString() === id))
          .filter(Boolean); // Remove any null values (in case posts were deleted)
      } catch (error) {
        console.error('Error fetching saved posts:', error);
        throw new Error('Failed to fetch saved posts');
      }
    },
    
    // Check if a post is saved by the current user
    isSaved: async (_, { postId }, { user }) => {
      // AUTHENTICATION TEMPORARILY DISABLED
      // if (!user) {
      //   return false;
      // }
      
      // Placeholder user for testing purposes
      const placeholderUser = { id: 'a30b47d9-3e87-46cc-95af-566c91216a28' };
      const currentUser = user || placeholderUser;
      
      try {
        const savedPost = await prisma.savedPost.findUnique({
          where: {
            userId_postId: {
              userId: currentUser.id,
              postId,
            },
          },
        });
        
        return !!savedPost;
      } catch (error) {
        console.error('Error checking saved status:', error);
        return false;
      }
    },
  },
  
  Mutation: {
    // Save a post for the current user
    savePost: async (_, { postId }, { user }) => {
      // AUTHENTICATION TEMPORARILY DISABLED
      // if (!user) {
      //   throw new Error('Authentication required');
      // }
      
      // Placeholder user for testing purposes
      const placeholderUser = { id: 'a30b47d9-3e87-46cc-95af-566c91216a28' };
      const currentUser = user || placeholderUser;
      
      try {
        // Verify the post exists in MongoDB
        const post = await Post.findById(postId);
        if (!post) {
          return { 
            success: false, 
            message: 'Post not found' 
          };
        }
        
        // Save the post reference in PostgreSQL
        await prisma.savedPost.create({
          data: {
            id: uuidv4(), // Generate UUID for the saved post record
            userId: currentUser.id,
            postId,
          },
        });
        
        return { 
          success: true, 
          message: 'Post saved successfully' 
        };
      } catch (error) {
        // Handle unique constraint violation
        if (error.code === 'P2002') {
          return { 
            success: false, 
            message: 'Post already saved' 
          };
        }
        
        console.error('Error saving post:', error);
        return { 
          success: false, 
          message: 'Failed to save post' 
        };
      }
    },
    
    // Unsave a post for the current user
    unsavePost: async (_, { postId }, { user }) => {
      // AUTHENTICATION TEMPORARILY DISABLED
      // if (!user) {
      //   throw new Error('Authentication required');
      // }
      
      // Placeholder user for testing purposes
      const placeholderUser = { id: 'a30b47d9-3e87-46cc-95af-566c91216a28' };
      const currentUser = user || placeholderUser;
      
      try {
        await prisma.savedPost.delete({
          where: {
            userId_postId: {
              userId: currentUser.id,
              postId,
            },
          },
        });
        
        return { 
          success: true, 
          message: 'Post unsaved successfully' 
        };
      } catch (error) {
        // Handle not found error
        if (error.code === 'P2025') {
          return { 
            success: false, 
            message: 'Post was not saved' 
          };
        }
        
        console.error('Error unsaving post:', error);
        return { 
          success: false, 
          message: 'Failed to unsave post' 
        };
      }
    },
  },
};

module.exports = savedpostResolvers;