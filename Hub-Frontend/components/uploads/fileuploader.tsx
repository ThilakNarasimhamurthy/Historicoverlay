// components/uploads/fileuploader.tsx
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, FileType, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import UseFileUploads from '../hooks/UseFileUploads';

interface FileUploaderProps {
  onUploadComplete?: (urls: string[]) => void;
  allowedTypes?: string;
  maxFiles?: number;
  onUploadStarted?: () => void;
  onUploadFinished?: () => void;
  clearAfterUpload?: boolean;
}

interface FileUploaderRef {
  clear: () => void;
}

const FileUploader = React.forwardRef<FileUploaderRef, FileUploaderProps>(
  ({ 
    onUploadComplete, 
    allowedTypes = "image/*,video/*,application/pdf", 
    maxFiles = 5,
    onUploadStarted,
    onUploadFinished,
    clearAfterUpload = true
  }, ref) => {
    const { fileState, handleFileChange, uploadFiles, resetFileState, removeFile } = UseFileUploads();
    const fileInputRef = useRef<HTMLInputElement>(null);
  
    // Expose clear method via ref
    React.useImperativeHandle(ref, () => ({
      clear: () => {
        resetFileState();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }));

    const handleUpload = async () => {
      if (onUploadStarted) onUploadStarted();
      
      const urls = await uploadFiles();
      
      if (urls.length > 0 && onUploadComplete) {
        onUploadComplete(urls);
      }
      
      // Clear files after successful upload if requested
      if (clearAfterUpload && urls.length > 0) {
        resetFileState();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
      
      if (onUploadFinished) onUploadFinished();
    };

    // Helper to format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
      <div className="w-full space-y-4">
        <div 
          className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-1">Drag and drop files here or click to browse</p>
          <p className="text-xs text-muted-foreground">Upload up to {maxFiles} files</p>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept={allowedTypes}
            className="hidden"
            onChange={handleFileChange}
            disabled={fileState.uploading || fileState.files.length >= maxFiles}
          />
        </div>

        {/* Show selected files */}
        {fileState.files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected Files ({fileState.files.length})</p>
            <div className="space-y-2">
              {fileState.files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <FileType className="h-5 w-5 text-muted-foreground" />
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    disabled={fileState.uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress indicator */}
        {fileState.uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Uploading...</span>
              <span>{Math.round(fileState.progress)}%</span>
            </div>
            <Progress value={fileState.progress} className="h-2" />
          </div>
        )}

        {/* Success message */}
        {fileState.success && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Files uploaded successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Error message */}
        {fileState.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {fileState.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Action buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={handleUpload}
            disabled={fileState.uploading || fileState.files.length === 0}
            className="flex-1"
          >
            {fileState.uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
          {fileState.files.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                resetFileState();
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              disabled={fileState.uploading}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
    );
  }
);

FileUploader.displayName = 'FileUploader';

export default FileUploader;