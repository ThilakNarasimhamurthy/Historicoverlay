const { PrismaClient } = require('@prisma/client');
const Post = require('../models/Post');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();
const userActivityResolvers = require('./userActivityResolvers');
const { geocodeLocation, calculateDistance } = require('../utils/geocoder');

const postResolvers = {
  Query: {
    post: async (_, { id }) => await Post.findById(id),
    posts: async (_, { limit = 10, offset = 0 }) => await Post.find().limit(limit).skip(offset).sort({ createdAt: -1 }),
    postsByUser: async (_, { userId, limit = 10, offset = 0 }) => await Post.find({ userId: userId.toString() }).limit(limit).skip(offset).sort({ createdAt: -1 }),
    getLikesCount: async (_, { postId }) => {
      const post = await Post.findById(postId);
      if (!post) throw new Error('Post not found');
      return post.likesCount;
    },
  },

  Mutation: {
    createPost: async (_, { input }) => {
      const { userId, content, mediaLinks = [], tags = [], location = null } = input;
      
      console.log(`Creating post for user ID: ${userId} (type: ${typeof userId})`);
      
      const userExists = await prisma.user.findUnique({ 
        where: { id: userId.toString() } 
      });
      
      if (!userExists) {
        console.error(`User not found with ID: ${userId}`);
        throw new Error('User not found');
      }

      // Geocode the location string if provided
      let geoLocation = null;
      if (location) {
        const coordinates = await geocodeLocation(location);
        
        if (coordinates) {
          geoLocation = {
            type: 'Point',
            coordinates: [coordinates.longitude, coordinates.latitude],
            address: location
          };
        } else {
          console.warn(`Could not geocode location: ${location}`);
        }
      }

      const post = new Post({
        _id: uuidv4(),
        userId: userId.toString(),
        content,
        mediaLinks: mediaLinks,
        tags,
        location: geoLocation,
        likesCount: 0,
        commentsCount: 0,
      });

      await post.save();

      await userActivityResolvers.Mutation.addUserActivity(null, {
        userId: userExists.id,
        activity_type: 'Post Created',
        related_entity_id: post._id,
        related_entity_type: 'Post',
        metadata: {
          firstName: userExists.firstName,
          lastName: userExists.lastName,
          email: userExists.email,
          content,
        },
      });

      return post;
    },

    updatePost: async (_, { id, input }) => {
      const { content, mediaLinks, tags, location } = input;
      const updateData = {};
    
      if (content !== undefined) updateData.content = content;
      if (mediaLinks !== undefined) updateData.mediaLinks = mediaLinks;
      if (tags !== undefined) updateData.tags = tags;
      
      // Handle location geocoding
      if (location !== undefined) {
        if (location) {
          const coordinates = await geocodeLocation(location);
          
          if (coordinates) {
            updateData.location = {
              type: 'Point',
              coordinates: [coordinates.longitude, coordinates.latitude],
              address: location
            };
          } else {
            console.warn(`Could not geocode location: ${location}`);
          }
        } else {
          updateData.location = null;
        }
      }
    
      const updatedPost = await Post.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedPost) throw new Error('Post not found');
    
      const userExists = await prisma.user.findUnique({ 
        where: { id: updatedPost.userId.toString() } 
      });
      
      if (!userExists) {
        console.error(`User not found with ID: ${updatedPost.userId}`);
        throw new Error('User not found');
      }
    
      await userActivityResolvers.Mutation.addUserActivity(null, {
        userId: userExists.id,
        activity_type: 'Post Updated',
        related_entity_id: updatedPost._id,
        related_entity_type: 'Post',
        metadata: {
          firstName: userExists.firstName,
          lastName: userExists.lastName,
          email: userExists.email,
          content: updatedPost.content,
        },
      });
    
      return updatedPost;
    },

    deletePost: async (_, { id, userId }) => {
      try {
        const post = await Post.findById(id);
        if (!post) throw new Error('Post not found');
    
        if (post.userId.toString() !== userId.toString()) {
          throw new Error('You are not authorized to delete this post');
        }
    
        const deletedPost = await Post.findByIdAndDelete(id);
        if (!deletedPost) throw new Error('Failed to delete the post');
    
        const userExists = await prisma.user.findUnique({ 
          where: { id: userId.toString() } 
        });
        
        if (userExists) {
          await userActivityResolvers.Mutation.addUserActivity(null, {
            userId: userId.toString(),
            activity_type: 'Post Deleted',
            related_entity_id: id,
            related_entity_type: 'Post',
            metadata: {
              firstName: userExists.firstName,
              lastName: userExists.lastName,
              email: userExists.email,
            },
          });
        }
    
        return true;
      } catch (error) {
        console.error('Error deleting post:', error);
        throw new Error(error.message || 'Unable to delete post');
      }
    },
    
    toggleLike: async (_, { postId, userId }) => {
      try {
        console.log(`Toggling like for post: ${postId} by user: ${userId}`);

        const post = await Post.findById(postId);
        if (!post) {
          throw new Error('Post not found');
        }

        const existingLike = post.likes.some(like => like.userId.toString() === userId.toString());

        if (existingLike) {
          post.likes = post.likes.filter(like => like.userId.toString() !== userId.toString());
          post.likesCount -= 1;
          console.log(`Like removed from post: ${postId} by user: ${userId}`);
        } else {
          post.likes.push({ userId: userId.toString(), likedAt: new Date() });
          post.likesCount += 1;
          console.log(`Like added to post: ${postId} by user: ${userId}`);
        }

        await post.save();

        return post;
      } catch (error) {
        console.error('Error toggling like:', error);
        throw new Error('Unable to toggle like');
      }
    },

    addComment: async (_, { postId, userId, content }) => {
      try {
        const post = await Post.findById(postId);
        if (!post) throw new Error('Post not found');
    
        console.log(`Checking if user ${userId} exists in Prisma PostgreSQL database`);
        const user = await prisma.user.findUnique({ 
          where: { id: userId.toString() } 
        });
        
        if (!user) {
          console.error(`Critical error: User with ID ${userId} not found in Prisma!`);
          console.error(`This means the UUID doesn't exist in the PostgreSQL database.`);
          throw new Error('User not found in user database');
        }
        
        console.log(`Found user in Prisma: ${JSON.stringify({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        })}`);
        
        const commentId = uuidv4();
        const comment = {
          id: commentId,
          userId: user.id, // Use the exact ID from Prisma
          content,
          commentedAt: new Date()
        };
        
        post.comments.push(comment);
        post.commentsCount += 1;
        await post.save();
        
        console.log(`Added comment to post. Comment details: ${JSON.stringify(comment)}`);
        
        // Attach user information directly to ensure it works
        return {
          ...comment,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
        };
      } catch (error) {
        console.error('Error adding comment:', error);
        throw new Error(error.message || 'Unable to add comment');
      }
    },

    deleteComment: async (_, { commentId }) => {
      try {
        // Find the post containing the comment
        const post = await Post.findOne({ "comments.id": commentId });
        if (!post) throw new Error('Comment not found');
        
        // Remove the comment from the comments array
        post.comments = post.comments.filter(comment => comment.id !== commentId);
        post.commentsCount = Math.max(0, post.commentsCount - 1);
        
        await post.save();
        return true;
      } catch (error) {
        console.error('Error deleting comment:', error);
        throw new Error(error.message || 'Unable to delete comment');
      }
    }
  },

  Post: {
    user: async (parent) => {
      try {
        console.log(`Resolving user for post with userId: ${parent.userId} (Type: ${typeof parent.userId})`);
        
        if (!parent.userId) {
          console.log('userId is null or undefined in Post.user resolver');
          return null;
        }
        
        const user = await prisma.user.findUnique({ 
          where: { id: parent.userId.toString() } 
        });
        
        if (!user) {
          console.log(`User not found with ID: ${parent.userId}`);
          return null;
        }

        return {
          id: user.id,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          email: user.email,
        };
      } catch (error) {
        console.error(`Error fetching user for post: ${error.message}`);
        return null;
      }
    },
    likesCount: (parent) => parent.likesCount,
    commentsCount: (parent) => parent.commentsCount,
    mediaLinks: (parent) => parent.mediaLinks || [],
    tags: (parent) => parent.tags || [],
    location: (parent) => parent.location,
    createdAt: (parent) => parent.createdAt || new Date(),
    updatedAt: (parent) => parent.updatedAt || new Date()
  },

  Like: {
    user: async (parent) => {
      try {
        console.log(`Resolving user for like with userId: ${parent.userId}`);

        if (!parent.userId) return null;

        const user = await prisma.user.findUnique({ 
          where: { id: parent.userId.toString() } 
        });

        if (!user) return null;

        return {
          id: user.id,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          email: user.email,
        };
      } catch (error) {
        console.error(`Error fetching user for like: ${error.message}`);
        return null;
      }
    },
    likedAt: (parent) => parent.likedAt,
  },

  Comment: {
    user: async (parent) => {
      try {

        if (!parent.userId) {
          console.error('ERROR: userId is missing in comment object');
          return null;
        }

        const user = await prisma.user.findUnique({ 
          where: { id: parent.userId.toString() } 
        });

        if (!user) {
          console.error(`User not found with ID: ${parent.userId}`);
          return null;
        }

        console.log(`Comment.user resolver - Found user:`, JSON.stringify(user));

        return {
          id: user.id,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          email: user.email,
        };
      } catch (error) {
        console.error(`Error resolving user for comment: ${error.message}`);
        return null;
      }
    },
  }
};

module.exports = postResolvers;