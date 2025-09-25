import { api } from '@/app/config/api_config';
import axios from 'axios';

// Create a separate axios instance for file operations with the base URL
const fileApi = api;

export interface FileUploadResponse {
  id: string;
  fileId: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
  updatedAt: string;
}


export class FileService {
  private static readonly DEFAULT_FOLDER = 'genz';

  /**
   * Upload multiple files
   * This is the preferred method for all uploads (even single files) for consistency
   */
  static async uploadMultipleFiles(
    files: File[],
    folder: string = this.DEFAULT_FOLDER
  ): Promise<FileUploadResponse[]> {
    if (files.length === 0) {
      throw new Error('No files provided for upload');
    }

    console.log(`[FILE SERVICE] Starting upload of ${files.length} files`);
    
    // Validate all files first
    const validationResults = files.map(file => this.validateFile(file));
    const allErrors = validationResults.flatMap(result => result.errors);
    
    if (allErrors.length > 0) {
      console.error('[FILE SERVICE] File validation failed:', allErrors);
      throw new Error(`File validation failed: ${allErrors.join(', ')}`);
    }

    const formData = new FormData();
    
    // Sanitize and validate files before upload
    const sanitizedFiles = files.map((file, index) => {
      // Sanitize filename to prevent encoding issues
      const sanitizedName = this.sanitizeFilename(file.name);
      
      // Create a new file with sanitized name if needed
      if (sanitizedName !== file.name) {
        const newFile = new File([file], sanitizedName, {
          type: file.type,
          lastModified: file.lastModified
        });
        console.log(`[FILE SERVICE] File ${index + 1}: Sanitized filename: "${file.name}" -> "${sanitizedName}"`);
        return newFile;
      }
      console.log(`[FILE SERVICE] File ${index + 1}: "${file.name}" (${this.formatFileSize(file.size)})`);
      return file;
    });
    
    // Append each file with a unique field name to avoid conflicts
    sanitizedFiles.forEach((file, index) => {
      formData.append('files', file);
      console.log(`[FILE SERVICE] Added file ${index + 1} to FormData: ${file.name}`);
    });
    formData.append('folder', folder);

    try {
      console.log(`[FILE SERVICE] Uploading to /files/upload-multiple with folder: ${folder}`);
      
      const response = await fileApi.post('/files/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Add timeout for large files
        timeout: 300000, // 5 minutes
      });

      console.log(`[FILE SERVICE] Upload successful. Received ${response.data?.length || 0} file responses`);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from upload endpoint');
      }

      return response.data;
    } catch (error: any) {
      console.error('[FILE SERVICE] Upload failed:', {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        fileCount: files.length,
        files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
        totalSize: files.reduce((sum, f) => sum + f.size, 0)
      });
      
      // Provide more specific error messages
      if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout - files may be too large or connection is slow');
      } else if (error.response?.status === 413) {
        throw new Error('Files are too large for upload');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error during upload - please try again');
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }
  }

  /**
   * Upload files (convenience method that always uses the multiple upload endpoint)
   * This is the recommended method for all file uploads
   */
  static async uploadFiles(
    files: File | File[],
    folder: string = this.DEFAULT_FOLDER
  ): Promise<FileUploadResponse[]> {
    const fileArray = Array.isArray(files) ? files : [files];
    return this.uploadMultipleFiles(fileArray, folder);
  }

  /**
   * Download a file by filename
   */
  static async downloadFile(
    fileName: string,
    folder: string = this.DEFAULT_FOLDER
  ): Promise<Blob> {
    const response = await fileApi.get(`/files/download/${fileName}`, {
      params: { folder },
      responseType: 'blob',
    });

    return response.data;
  }

  /**
   * Download a file by file ID and trigger local download
   */
  static async downloadFileById(
    fileId: string,
    filename: string,
    folder: string = this.DEFAULT_FOLDER
  ): Promise<void> {
    try {
      console.log(`[FILE SERVICE] Starting download for file: ${filename} (ID: ${fileId})`);
      
      const response = await fileApi.get(`/files/download/${fileId}`, {
        params: { folder },
        responseType: 'blob',
      });

      if (!response.data || response.data.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      // Create blob URL and trigger download
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'downloaded_file';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      console.log(`[FILE SERVICE] Download completed for file: ${filename}`);
    } catch (error: any) {
      console.error('[FILE SERVICE] Download failed:', {
        fileId,
        filename,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Download a file from URL and trigger local download
   */
  static async downloadFromUrl(url: string, filename: string): Promise<void> {
    try {
      console.log(`[FILE SERVICE] Starting direct URL download for: ${filename}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename || 'downloaded_file';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      }, 100);
      
      console.log(`[FILE SERVICE] Direct URL download completed for: ${filename}`);
    } catch (error: any) {
      console.error('[FILE SERVICE] Download from URL failed:', {
        url,
        filename,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get file URL for preview/direct access
   */
  static async getFileUrl(
    fileName: string,
    folder: string = this.DEFAULT_FOLDER
  ): Promise<string> {
    const response = await fileApi.get(`/files/url/${fileName}`, {
      params: { folder },
    });

    return response.data.url;
  }

 

  /**
   * Delete a file
   */
  static async deleteFile(
    fileName: string,
    folder: string = this.DEFAULT_FOLDER
  ): Promise<{ success: boolean; message: string }> {
    const response = await fileApi.delete(`/files/${fileName}`, {
      params: { folder },
    });

    return response.data;
  }

  /**
   * View file (for preview in browser)
   */
  static async viewFile(
    fileName: string,
    folder: string = this.DEFAULT_FOLDER
  ): Promise<Blob> {
    const response = await fileApi.get(`/api/files/view/${fileName}`, {
      params: { folder },
      responseType: 'blob',
    });

    return response.data;
  }

  /**
   * Get file type icon based on MIME type
   */
  static getFileTypeIcon(mimeType: string | undefined): string {
    if (!mimeType) return '📁';
    
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return '🗜️';
    if (mimeType.includes('text/')) return '📃';
    if (mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('python')) return '💻';
    return '📁';
  }

  /**
   * Format file size to human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Check if file type can be previewed in browser
   */
  static canPreviewFile(mimeType: string | undefined): boolean {
    if (!mimeType) return false;
    
    const previewableTypes = [
      'image/',
      'text/',
      'application/pdf',
      'video/',
      'audio/'
    ];
    
    return previewableTypes.some(type => mimeType.startsWith(type));
  }

  /**
   * Sanitize filename to prevent Azure Blob Storage authentication issues
   * Removes problematic characters that can cause encoding issues
   */
  private static sanitizeFilename(filename: string): string {
    // Remove problematic Unicode characters and normalize
    let sanitized = filename
      .normalize('NFD') // Normalize Unicode
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-zA-Z0-9.-_\s]/g, '') // Remove special characters except dots, hyphens, underscores, spaces
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
    
    // Ensure we have a valid filename
    if (!sanitized || sanitized.length === 0) {
      const timestamp = Date.now();
      sanitized = `file_${timestamp}`;
    }
    
    // Ensure filename isn't too long (Azure has limits)
    if (sanitized.length > 200) {
      const extension = sanitized.split('.').pop();
      const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
      sanitized = nameWithoutExt.substring(0, 190) + (extension ? `.${extension}` : '');
    }
    
    return sanitized;
  }

  /**
   * Validate file before upload to catch potential issues early
   */
  static validateFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      errors.push('File size exceeds 50MB limit');
    }
    
    // Check filename for problematic characters
    const originalName = file.name;
    const sanitizedName = this.sanitizeFilename(originalName);
    if (originalName !== sanitizedName) {
      console.warn(`[FILE SERVICE] Filename will be sanitized: "${originalName}" -> "${sanitizedName}"`);
    }
    
    // Check for empty filename
    if (!file.name || file.name.trim().length === 0) {
      errors.push('Filename cannot be empty');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

 

}