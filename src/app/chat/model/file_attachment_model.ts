// File attachment model based on the API response
export interface FileAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string; // API returns 'type' instead of 'mimeType'
  fileId: string;
  uploadedAt?: string; // Optional since some API responses might not include this
  mimeType?: string; // Keep for backward compatibility
}

// Extended file model with additional UI properties
export interface FileAttachmentWithPreview extends FileAttachment {
  preview?: string; // For image previews
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string;
}

// File upload request model
export interface FileUploadRequest {
  folder?: string;
  customFileName?: string;
}

// File metadata model
export interface FileMetadata {
  name: string;
  size: number;
  contentType: string;
  lastModified: string;
}

// File list response model
export interface FileListResponse {
  files: FileAttachment[];
  total: number;
  folder: string;
}

// File delete response model
export interface FileDeleteResponse {
  success: boolean;
  message: string;
}

// File upload progress model
export interface FileUploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

// Supported file types for validation
export const SUPPORTED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  videos: ['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/wmv'],
  audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ],
  text: ['text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript'],
  code: [
    'application/javascript',
    'application/typescript',
    'text/x-python',
    'text/x-java-source',
    'text/x-c',
    'text/x-c++',
    'application/json',
    'application/xml'
  ],
  archives: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip'
  ]
};

// Get all supported file types as a flat array
export const ALL_SUPPORTED_TYPES = [
  ...SUPPORTED_FILE_TYPES.images,
  ...SUPPORTED_FILE_TYPES.videos,
  ...SUPPORTED_FILE_TYPES.audio,
  ...SUPPORTED_FILE_TYPES.documents,
  ...SUPPORTED_FILE_TYPES.text,
  ...SUPPORTED_FILE_TYPES.code,
  ...SUPPORTED_FILE_TYPES.archives
];

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxTotalSize: 100 * 1024 * 1024, // 100MB for multiple files
  maxFileCount: 10
};

// File type categories for UI grouping
export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'text' | 'code' | 'archive' | 'other';

export function getFileCategory(mimeType: string | undefined): FileCategory {
  if (!mimeType) return 'other';
  
  if (SUPPORTED_FILE_TYPES.images.includes(mimeType)) return 'image';
  if (SUPPORTED_FILE_TYPES.videos.includes(mimeType)) return 'video';
  if (SUPPORTED_FILE_TYPES.audio.includes(mimeType)) return 'audio';
  if (SUPPORTED_FILE_TYPES.documents.includes(mimeType)) return 'document';
  if (SUPPORTED_FILE_TYPES.text.includes(mimeType)) return 'text';
  if (SUPPORTED_FILE_TYPES.code.includes(mimeType)) return 'code';
  if (SUPPORTED_FILE_TYPES.archives.includes(mimeType)) return 'archive';
  return 'other';
}

// Validate file type
export function isFileTypeSupported(mimeType: string | undefined): boolean {
  if (!mimeType) return false;
  return ALL_SUPPORTED_TYPES.includes(mimeType);
}

// Validate file size
export function isFileSizeValid(size: number): boolean {
  return size <= FILE_SIZE_LIMITS.maxFileSize;
}

// Validate multiple files
export function areFilesValid(files: File[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (files.length > FILE_SIZE_LIMITS.maxFileCount) {
    errors.push(`Maximum ${FILE_SIZE_LIMITS.maxFileCount} files allowed`);
  }
  
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > FILE_SIZE_LIMITS.maxTotalSize) {
    errors.push(`Total file size exceeds ${FILE_SIZE_LIMITS.maxTotalSize / (1024 * 1024)}MB limit`);
  }
  
  files.forEach((file, index) => {
    if (!isFileTypeSupported(file.type)) {
      errors.push(`File ${index + 1} (${file.name}): Unsupported file type`);
    }
    
    if (!isFileSizeValid(file.size)) {
      errors.push(`File ${index + 1} (${file.name}): File size exceeds ${FILE_SIZE_LIMITS.maxFileSize / (1024 * 1024)}MB limit`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}