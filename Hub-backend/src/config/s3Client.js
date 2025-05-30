// s3Client.js (../config/s3Client)
const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Get AWS credentials from environment variables
const REGION = process.env.AWS_REGION || 'us-east-1'; // Default region if not specified
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Validate required credentials
if (!ACCESS_KEY || !SECRET_KEY) {
  console.error('AWS credentials not found in environment variables!');
  console.error('Make sure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set.');
  // We're not throwing an error here to allow the app to start,
  // but S3 operations will fail later
}

// Create and export the S3 client
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
  // For local development with endpoint override (e.g., MinIO or LocalStack)
  // Uncomment the line below if using a local S3 implementation
  // endpoint: process.env.AWS_S3_ENDPOINT,
});

// Test the client on module load if in development
if (process.env.NODE_ENV === 'development') {
  // We'll log connection info but delay actual testing to when it's needed
  console.log(`S3 client created for region: ${REGION}`);
  console.log(`Using credentials: ${ACCESS_KEY ? 'Set' : 'Missing'} / ${SECRET_KEY ? 'Set' : 'Missing'}`);
}

module.exports = s3Client;