import { v4 as uuidv4 } from 'uuid';

// Define FileWithPreview interface (add this if not already defined in your project)
export interface FileWithPreview {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  extension: string;
  preview: string | null;
  status: 'ready' | 'uploading' | 'success' | 'error';
  progress: number;
  url?: string;
}

// Add these helper functions if they're not already in your project
export const isImageUrl = (url: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

export const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi'];
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const getFileIconType = (extension: string): string => {
  const fileTypes: Record<string, string> = {
    pdf: 'pdf',
    doc: 'word',
    docx: 'word',
    xls: 'excel',
    xlsx: 'excel',
    ppt: 'powerpoint',
    pptx: 'powerpoint',
    txt: 'text',
    zip: 'archive',
  };
  
  return fileTypes[extension] || 'generic';
};

// Create file with preview
export const createFileWithPreview = async (file: File): Promise<FileWithPreview> => {
  const extension = getFileExtension(file.name);
  let preview = null;
  
  // Create preview for images
  if (file.type.startsWith('image/')) {
    preview = URL.createObjectURL(file);
  } else if (file.type.startsWith('video/')) {
    preview = URL.createObjectURL(file);
  }
  
  return {
    id: uuidv4(),
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    extension,
    preview,
    status: 'ready',
    progress: 0
  };
};