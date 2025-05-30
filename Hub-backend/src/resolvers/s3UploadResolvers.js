// resolvers/fileUploadResolvers.js
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const s3Client = require('../config/s3Client');

// Use the bucket name from your env file or default
const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'studenthubblob';

// Helper functions from your code
const generateUniqueFilename = (originalFilename) => {
  const timestamp = Date.now();
  const randomString = uuidv4().substring(0, 8);
  const extension = path.extname(originalFilename);
  const basename = path.basename(originalFilename, extension);
  const sanitizedBasename = basename.replace(/[^a-zA-Z0-9]/g, '-');
  return `${sanitizedBasename}-${timestamp}-${randomString}${extension}`;
};

const getFolderPath = (contentType) => {
  if (contentType.startsWith('image/') || contentType.startsWith('video/')) {
    return 'Post/';
  } else if (['application/pdf', 'text/plain'].includes(contentType)) {
    return 'events/';
  }
  return 'others/';
};

const fileUploadResolvers = {
  Mutation: {
    getPresignedUrl: async (_, { filename, contentType }) => {
      try {
        console.log(`Generating presigned URL for: ${filename} (${contentType})`);
        
        // Generate a unique filename
        const uniqueFilename = generateUniqueFilename(filename);
        
        // Determine folder path based on content type
        const folderPath = getFolderPath(contentType);
        
        // Create the full key (path + filename)
        const key = `${folderPath}${uniqueFilename}`;
        
        // Create the command for the presigned URL
        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          ContentType: contentType
        });
        
        // Generate the presigned URL
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
        const fileUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
        
        console.log(`Generated presigned URL for key: ${key}`);
        
        return {
          uploadUrl,
          fileUrl,
          key
        };
      } catch (error) {
        console.error('Error generating presigned URL:', error);
        throw new Error('Failed to generate upload URL');
      }
    },
    
    completeFileUpload: async (_, { input }) => {
      try {
        const { key, originalFilename, fileSize, fileType, fileUrl } = input;
        
        console.log(`Completing file upload for key: ${key}`);
        console.log(`Original filename: ${originalFilename}`);
        console.log(`File size: ${fileSize} bytes`);
        
        // Here you could save file metadata to your database if needed
        
        return {
          success: true,
          fileUrl
        };
      } catch (error) {
        console.error('Error completing file upload:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
  }
};

module.exports = fileUploadResolvers;