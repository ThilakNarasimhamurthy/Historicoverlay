// hooks/UseFileUploads.tsx
import { useState } from 'react';
import axios from 'axios';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

// GraphQL mutations
const GET_PRESIGNED_URL = gql`
  mutation GetPresignedUrl($filename: String!, $contentType: String!) {
    getPresignedUrl(filename: $filename, contentType: $contentType) {
      uploadUrl
      fileUrl
      key
    }
  }
`;

const COMPLETE_FILE_UPLOAD = gql`
  mutation CompleteFileUpload($input: CompleteFileUploadInput!) {
    completeFileUpload(input: $input) {
      success
      fileUrl
      error
    }
  }
`;

const UseFileUploads = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GraphQL mutations
  const [getPresignedUrl] = useMutation(GET_PRESIGNED_URL);
  const [completeFileUpload] = useMutation(COMPLETE_FILE_UPLOAD);

  const fileState = {
    files,
    uploading,
    progress,
    success,
    error
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      setSuccess(false);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const resetFileState = () => {
    setFiles([]);
    setProgress(0);
    setSuccess(false);
    setError(null);
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (files.length === 0) return [];

    setUploading(true);
    setProgress(0);
    setError(null);
    
    const urls: string[] = [];
    
    try {
      // Calculate progress increment per file
      const progressIncrement = 100 / files.length;
      
      // Process all files in parallel with Promise.all
      const uploadPromises = files.map(async (file, index) => {
        try {
          
          // Step 1: Get presigned URL from GraphQL backend
          const { data } = await getPresignedUrl({
            variables: {
              filename: file.name,
              contentType: file.type
            }
          });
          
          if (!data || !data.getPresignedUrl) {
            console.error(`Failed to get presigned URL for file: ${file.name}`);
            throw new Error(`Failed to get presigned URL for file: ${file.name}`);
          }
          
          const { uploadUrl, fileUrl, key } = data.getPresignedUrl;
          
          // Step 2: Upload file to S3 using presigned URL
          const uploadResponse = await axios.put(uploadUrl, file, {
            headers: {
              'Content-Type': file.type
            },
            onUploadProgress: (progressEvent) => {
              // Calculate individual file progress
              const fileProgress = progressEvent.loaded / (progressEvent.total || file.size);
              // Update overall progress - this is approximate since files upload in parallel
              setProgress(prevProgress => {
                const contribution = fileProgress * progressIncrement / files.length;
                return Math.min(prevProgress + contribution, (index + 1) * progressIncrement);
              });
            }
          });
          
          console.log(`File ${index + 1} uploaded to S3 with status: ${uploadResponse.status}`);
          
          // Step 3: Complete the upload process in your backend
          const { data: completeData } = await completeFileUpload({
            variables: {
              input: {
                key,
                originalFilename: file.name,
                fileSize: file.size,
                fileType: file.type,
                fileUrl
              }
            }
          });
          
          if (completeData?.completeFileUpload?.success) {
            return fileUrl;
          } else {
            console.error(`Failed to complete file ${index + 1}: ${completeData?.completeFileUpload?.error || 'Unknown error'}`);
            throw new Error(`Failed to complete file upload: ${completeData?.completeFileUpload?.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          throw error;
        }
      });
      
      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises.map(p => p.catch(e => null)));
      const successfulUrls = results.filter(Boolean) as string[];
      
      // console.log(`Successfully uploaded ${successfulUrls.length}/${files.length} files`);
      setSuccess(true);
      setProgress(100);
      
      // Clear files after successful upload
      setFiles([]);
      
      return successfulUrls;
      
    } catch (err: any) {
      console.error('Error during upload process:', err);
      setError(err.message || 'An error occurred during upload');
      return urls;
    } finally {
      setUploading(false);
    }
  };

  return {
    fileState,
    handleFileChange,
    uploadFiles,
    resetFileState,
    removeFile
  };
};

export default UseFileUploads;