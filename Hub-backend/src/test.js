// const { 
//   S3Client, 
//   PutObjectCommand, 
//   GetObjectCommand,
//   ListObjectsV2Command,
//   DeleteObjectCommand
// } = require('@aws-sdk/client-s3');
// const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
// const path = require('path');
// const dotenv = require('dotenv');

// // Load the environment variables
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

// // Use the bucket name from your env file or default
// const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'studenthubblob';

// // Initialize S3 client
// const s3Client = new S3Client({
//   region: process.env.AWS_REGION || 'us-east-2',
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//   }
// });

// // Test S3 operations including folder structure and presigned URLs
// async function testS3Operations() {
//   try {
//     console.log(`Testing S3 operations on bucket: ${BUCKET_NAME}`);
    
//     // 1. Test: Upload a file to a specific folder
//     console.log('\n1. Testing file upload to folder...');
//     const folderPath = 'posts/';
//     const testContent = 'This is a test file created at ' + new Date().toISOString();
//     const filename = 'test-file-' + Date.now() + '.txt';
//     const testKey = folderPath + filename; // This creates a folder structure in S3
    
//     const putCommand = new PutObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: testKey,
//       Body: testContent,
//       ContentType: 'text/plain'
//     });
    
//     await s3Client.send(putCommand);
//     console.log(`Successfully uploaded file to: ${testKey}`);
    
//     // 2. Test: Download the file from the folder
//     console.log('\n2. Testing file download from folder...');
//     const getCommand = new GetObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: testKey
//     });
    
//     const getResponse = await s3Client.send(getCommand);
    
//     // Convert the stream to text
//     const chunks = [];
//     for await (const chunk of getResponse.Body) {
//       chunks.push(chunk);
//     }
//     const fileContent = Buffer.concat(chunks).toString('utf8');
    
//     console.log('File content:', fileContent);
    
//     // 3. Test: Generate a presigned URL for the file (for time-limited access)
//     console.log('\n3. Generating presigned URL...');
//     const presignedGetCommand = new GetObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: testKey
//     });
    
//     // Generate URL that expires in 15 minutes (900 seconds)
//     const presignedUrl = await getSignedUrl(s3Client, presignedGetCommand, { 
//       expiresIn: 900 
//     });
    
//     console
//       .log('Presigned URL (valid for 15 minutes):');
//     console.log(presignedUrl);
    
//     // 4. Test: Generate a presigned URL for uploading a new file
//     console.log('\n4. Generating presigned URL for uploading...');
//     const newFileKey = `${folderPath}upload-${Date.now()}.txt`;
//     const presignedPutCommand = new PutObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: newFileKey,
//       ContentType: 'text/plain'
//     });
    
//     const presignedUploadUrl = await getSignedUrl(s3Client, presignedPutCommand, { 
//       expiresIn: 900 
//     });
    
//     console.log('Presigned Upload URL (valid for 15 minutes):');
//     console.log(presignedUploadUrl);
//     console.log('You can use this URL to upload a file without AWS credentials.');
    
//     // 5. Test: List files in a specific folder
//     console.log('\n5. Listing files in folder...');
//     const listCommand = new ListObjectsV2Command({
//       Bucket: BUCKET_NAME,
//       Prefix: folderPath,
//       MaxKeys: 10
//     });
    
//     const listResponse = await s3Client.send(listCommand);
    
//     if (listResponse.Contents && listResponse.Contents.length > 0) {
//       console.log(`Found ${listResponse.Contents.length} files in ${folderPath}:`);
//       listResponse.Contents.forEach(item => {
//         console.log(` - ${item.Key} (${item.Size} bytes, Last modified: ${item.LastModified})`);
//       });
//     } else {
//       console.log(`No files found in ${folderPath}`);
//     }
    
//     console.log('\nS3 operations test completed successfully!');
    
//     return true;
    
//   } catch (error) {
//     console.error('\nOperation failed:');
//     console.error('Error:', error.message);
//     console.error('Error Code:', error.Code || error.name);
    
//     console.log('\nTroubleshooting:');
//     if (error.Code === 'AccessDenied' || error.name === 'AccessDenied') {
//       console.log('Your IAM user lacks permissions for this operation.');
//       console.log('You need to update your IAM policy to include:');
//       console.log('- s3:PutObject');
//       console.log('- s3:GetObject');
//       console.log('- s3:ListBucket (for listing objects)');
//       console.log('- s3:DeleteObject (if you need to delete objects)');
//     }
    
//     return false;
//   }
// }

// // Function to demonstrate how S3 folders work
// function explainS3FolderStructure() {
//   console.log('\n=== Understanding S3 Folder Structure ===');
//   console.log('S3 doesn\'t actually have folders/directories like a traditional file system.');
//   console.log('Instead, S3 uses a flat structure where:');
//   console.log('1. Objects (files) have keys (paths) like "folder1/folder2/filename.txt"');
//   console.log('2. The "/" character in keys creates the illusion of folders');
//   console.log('3. When you "create a folder" in S3, it\'s actually creating a 0-byte object with a key ending in "/"');
//   console.log('4. When uploading files, you simply include the full path in the key.');
//   console.log('Example: To upload to "images/users/avatar.png", just set the key to "images/users/avatar.png"');
// }

// // Run the tests
// async function runTests() {
//   explainS3FolderStructure();
//   await testS3Operations();
// }

// runTests();