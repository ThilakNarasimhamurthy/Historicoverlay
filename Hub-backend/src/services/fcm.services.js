// services/fcm.service.js
const admin = require('firebase-admin');

class FCMService {
  constructor() {
    // Initialize Firebase Admin SDK if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      });
    }
  }

  async sendPushNotification({ tokens, title, body, data = {} }) {
    if (!tokens || tokens.length === 0) {
      console.warn('No FCM tokens provided for push notification');
      return { successCount: 0, failureCount: 0, failedTokens: [] };
    }

    try {
      // Format tokens as array if single token provided
      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      
      const message = {
        notification: {
          title,
          body
        },
        data: this.prepareData(data),
        tokens: tokenArray
      };
      
      const response = await admin.messaging().sendMulticast(message);
      
      // Log results
      console.log(`FCM sent: ${response.successCount}/${tokenArray.length} successful`);
      
      // Collect failed tokens for potential cleanup
      const failedTokens = response.responses
        .map((resp, idx) => !resp.success ? tokenArray[idx] : null)
        .filter(Boolean);
      
      // Handle token cleanup if needed
      if (failedTokens.length > 0) {
        this.handleFailedTokens(failedTokens);
      }
      
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens
      };
    } catch (error) {
      console.error('Error sending FCM notification:', error);
      throw error;
    }
  }
  
  // FCM requires all data values to be strings
  prepareData(data) {
    const prepared = {};
    Object.keys(data).forEach(key => {
      prepared[key] = typeof data[key] === 'object' 
        ? JSON.stringify(data[key])
        : String(data[key]);
    });
    return prepared;
  }
  
  // Handle invalid or expired tokens
  async handleFailedTokens(tokens) {
    // TODO: Implement token cleanup in user database
    console.log('Invalid FCM tokens detected:', tokens);
    // This could include updating the user's fcmTokens array in your database
  }
}

module.exports = new FCMService();