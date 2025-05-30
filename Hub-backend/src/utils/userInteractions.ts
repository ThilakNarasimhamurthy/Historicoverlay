// // src/utils/userInteractions.ts
// import { PrismaClient } from '@prisma/client';
// import { ExternalEvent } from '../models/ExternalEvent';

// const prisma = new PrismaClient();

// /**
//  * Simplified module for handling user interactions with events
//  * across both PostgreSQL and MongoDB databases
//  */
// export class UserInteractions {
//   /**
//    * Like an external event (MongoDB)
//    * @param userId PostgreSQL User ID
//    * @param eventId MongoDB Event ID
//    * @returns Success status
//    */
//   static async likeExternalEvent(userId: string, eventId: string): Promise<boolean> {
//     try {
//       // Add to MongoDB
//       const result = await ExternalEvent.findByIdAndUpdate(
//         eventId,
//         { $addToSet: { likedBy: userId } },
//         { new: true }
//       );
      
//       if (!result) {
//         console.error(`External event not found: ${eventId}`);
//         return false;
//       }
      
//       // Add to PostgreSQL
//       await prisma.likedEvent.upsert({
//         where: {
//           userId_eventId: {
//             userId,
//             eventId
//           }
//         },
//         update: {}, // Nothing to update if it exists
//         create: {
//           userId,
//           eventId,
//           isExternal: true,
//           likedAt: new Date()
//         }
//       });
      
//       return true;
//     } catch (error) {
//       console.error('Error liking external event:', error);
//       return false;
//     }
//   }
  
//   /**
//    * Unlike an external event (MongoDB)
//    * @param userId PostgreSQL User ID
//    * @param eventId MongoDB Event ID
//    * @returns Success status
//    */
//   static async unlikeExternalEvent(userId: string, eventId: string): Promise<boolean> {
//     try {
//       // Remove from MongoDB
//       const result = await ExternalEvent.findByIdAndUpdate(
//         eventId,
//         { $pull: { likedBy: userId } },
//         { new: true }
//       );
      
//       if (!result) {
//         console.error(`External event not found: ${eventId}`);
//         return false;
//       }
      
//       // Remove from PostgreSQL
//       await prisma.likedEvent.deleteMany({
//         where: {
//           userId,
//           eventId
//         }
//       });
      
//       return true;
//     } catch (error) {
//       console.error('Error unliking external event:', error);
//       return false;
//     }
//   }
  
//   /**
//    * Save an external event (MongoDB)
//    * @param userId PostgreSQL User ID
//    * @param eventId MongoDB Event ID
//    * @returns Success status
//    */
//   static async saveExternalEvent(userId: string, eventId: string): Promise<boolean> {
//     try {
//       // Add to MongoDB
//       const result = await ExternalEvent.findByIdAndUpdate(
//         eventId,
//         { $addToSet: { savedBy: userId } },
//         { new: true }
//       );
      
//       if (!result) {
//         console.error(`External event not found: ${eventId}`);
//         return false;
//       }
      
//       // Add to PostgreSQL
//       await prisma.savedPost.upsert({
//         where: {
//           userId_postId: {
//             userId,
//             postId: eventId
//           }
//         },
//         update: {}, // Nothing to update if it exists
//         create: {
//           userId,
//           postId: eventId,
//           savedAt: new Date()
//         }
//       });
      
//       return true;
//     } catch (error) {
//       console.error('Error saving external event:', error);
//       return false;
//     }
//   }
  
//   /**
//    * Unsave an external event (MongoDB)
//    * @param userId PostgreSQL User ID
//    * @param eventId MongoDB Event ID
//    * @returns Success status
//    */
//   static async unsaveExternalEvent(userId: string, eventId: string): Promise<boolean> {
//     try {
//       // Remove from MongoDB
//       const result = await ExternalEvent.findByIdAndUpdate(
//         eventId,
//         { $pull: { savedBy: userId } },
//         { new: true }
//       );
      
//       if (!result) {
//         console.error(`External event not found: ${eventId}`);
//         return false;
//       }
      
//       // Remove from PostgreSQL
//       await prisma.savedPost.deleteMany({
//         where: {
//           userId,
//           postId: eventId
//         }
//       });
      
//       return true;
//     } catch (error) {
//       console.error('Error unsaving external event:', error);
//       return false;
//     }
//   }
  
//   /**
//    * Check if a user has liked an external event
//    * @param userId PostgreSQL User ID
//    * @param eventId MongoDB Event ID
//    * @returns True if liked
//    */
//   static async hasLikedExternalEvent(userId: string, eventId: string): Promise<boolean> {
//     try {
//       const event = await ExternalEvent.findById(eventId);
//       return event?.likedBy?.includes(userId) || false;
//     } catch (error) {
//       console.error('Error checking if user liked external event:', error);
//       return false;
//     }
//   }
  
//   /**
//    * Check if a user has saved an external event
//    * @param userId PostgreSQL User ID
//    * @param eventId MongoDB Event ID
//    * @returns True if saved
//    */
//   static async hasSavedExternalEvent(userId: string, eventId: string): Promise<boolean> {
//     try {
//       const event = await ExternalEvent.findById(eventId);
//       return event?.savedBy?.includes(userId) || false;
//     } catch (error) {
//       console.error('Error checking if user saved external event:', error);
//       return false;
//     }
//   }
// }