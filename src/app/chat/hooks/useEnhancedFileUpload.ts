import { useCallback, useRef, useState } from "react";
import { FileService, FileUploadResponse } from "../service/file_service";
import { 
  FileAttachmentWithPreview, 
  areFilesValid, 
  FileUploadProgress,
  FILE_SIZE_LIMITS 
} from "../model/file_attachment_model";

export interface FileWithPreview extends File {
  preview?: string;
}

export interface UseEnhancedFileUploadReturn {
  selectedFiles: FileAttachmentWithPreview[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  uploadProgress: FileUploadProgress[];
  handleAttachmentClick: () => void;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  uploadFiles: () => Promise<FileUploadResponse[]>;
  getFileSize: (bytes: number) => string;
  hasFiles: boolean;
  validationErrors: string[];
}

export function useEnhancedFileUpload(): UseEnhancedFileUploadReturn {
  const [selectedFiles, setSelectedFiles] = useState<FileAttachmentWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachmentClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const generatePreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(undefined);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validation = areFilesValid([...selectedFiles.map(f => ({ 
      name: f.filename, 
      size: f.size, 
      type: f.type || f.mimeType || '' 
    } as File)), ...files]);
    
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);

    // Process new files
    const newFileAttachments: FileAttachmentWithPreview[] = [];
    
    for (const file of files) {
      const preview = await generatePreview(file);
      const fileAttachment: FileAttachmentWithPreview = {
        id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
        filename: file.name,
        url: '', // Will be populated after upload
        size: file.size,
        type: file.type,
        fileId: '',
        uploadedAt: new Date().toISOString(),
        preview,
        isUploading: false,
        uploadProgress: 0
      };
      
      newFileAttachments.push(fileAttachment);
    }

    setSelectedFiles(prev => [...prev, ...newFileAttachments]);

    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  }, [selectedFiles, generatePreview]);

  const removeFile = useCallback((id: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id));
    setUploadProgress(prev => prev.filter(progress => progress.fileId !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
    setUploadProgress([]);
    setValidationErrors([]);
  }, []);

  const uploadFiles = useCallback(async (): Promise<FileUploadResponse[]> => {
    if (selectedFiles.length === 0) return [];

    setIsUploading(true);
    
    try {
      // Note: This hook is deprecated in favor of useFileUploadWithFiles
      // which properly stores original File objects for upload
      throw new Error("This hook is deprecated. Use useFileUploadWithFiles instead for proper file upload functionality.");
      
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles]);

  const getFileSize = useCallback((bytes: number): string => {
    return FileService.formatFileSize(bytes);
  }, []);

  return {
    selectedFiles,
    fileInputRef,
    isUploading,
    uploadProgress,
    handleAttachmentClick,
    handleFileSelect,
    removeFile,
    clearFiles,
    uploadFiles,
    getFileSize,
    hasFiles: selectedFiles.length > 0,
    validationErrors
  };
}

// Alternative hook that stores original File objects for easier upload
export interface UseFileUploadWithFilesReturn {
  selectedFiles: FileWithPreview[];
  uploadedFiles: FileUploadResponse[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  uploadProgress: Record<string, number>;
  handleAttachmentClick: () => void;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  uploadFiles: () => Promise<FileUploadResponse[]>;
  getFileSize: (bytes: number) => string;
  hasFiles: boolean;
  validationErrors: string[];
}

export function useFileUploadWithFiles(): UseFileUploadWithFilesReturn {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachmentClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const generatePreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(undefined);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    console.log(`[FILE UPLOAD HOOK] Selected ${files.length} new files:`, files.map(f => ({ name: f.name, size: f.size, type: f.type })));

    // Check if adding these files would exceed limits
    const totalFiles = selectedFiles.length + files.length;
    if (totalFiles > FILE_SIZE_LIMITS.maxFileCount) {
      setValidationErrors([`Cannot select more than ${FILE_SIZE_LIMITS.maxFileCount} files total. Currently have ${selectedFiles.length}, trying to add ${files.length}.`]);
      return;
    }

    // Validate files using both custom validation and FileService validation
    const customValidation = areFilesValid([...selectedFiles, ...files]);
    const serviceValidation = files.map(file => FileService.validateFile(file));
    
    const allErrors = [
      ...customValidation.errors,
      ...serviceValidation.flatMap(v => v.errors)
    ];
    
    if (allErrors.length > 0) {
      console.error('[FILE UPLOAD HOOK] File validation failed:', allErrors);
      setValidationErrors(allErrors);
      return;
    }

    setValidationErrors([]);

    // Process new files
    const newFiles: FileWithPreview[] = [];
    
    for (const file of files) {
      console.log(`[FILE UPLOAD HOOK] Processing file: ${file.name}`);
      const preview = await generatePreview(file);
      const fileWithPreview = Object.assign(file, { preview }) as FileWithPreview;
      newFiles.push(fileWithPreview);
    }

    console.log(`[FILE UPLOAD HOOK] Adding ${newFiles.length} files to selection`);
    setSelectedFiles(prev => {
      const updated = [...prev, ...newFiles];
      console.log(`[FILE UPLOAD HOOK] Total files now: ${updated.length}`);
      return updated;
    });

    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  }, [selectedFiles, generatePreview]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
    setUploadedFiles([]);
    setUploadProgress({});
    setValidationErrors([]);
  }, []);

  const uploadFiles = useCallback(async (): Promise<FileUploadResponse[]> => {
    if (selectedFiles.length === 0) return [];

    console.log(`[FILE UPLOAD HOOK] Starting upload of ${selectedFiles.length} files`);
    setIsUploading(true);
    
    try {
      // Initialize progress for all files
      const initialProgress: Record<string, number> = {};
      selectedFiles.forEach(file => {
        const fileKey = `${file.name}-${file.size}`;
        initialProgress[fileKey] = 0;
      });
      setUploadProgress(initialProgress);

      // Use the convenience method that always uses upload-multiple endpoint
      console.log('[FILE UPLOAD HOOK] Calling FileService.uploadFiles...');
      const uploadedResults = await FileService.uploadFiles(selectedFiles);
      console.log(`[FILE UPLOAD HOOK] Upload completed. Got ${uploadedResults.length} results`);
      
      // Update progress for all files to 100%
      const progressUpdate: Record<string, number> = {};
      selectedFiles.forEach(file => {
        const fileKey = `${file.name}-${file.size}`;
        progressUpdate[fileKey] = 100;
      });
      setUploadProgress(progressUpdate);

      setUploadedFiles(prev => [...prev, ...uploadedResults]);
      return uploadedResults;
      
    } catch (error: any) {
      console.error('[FILE UPLOAD HOOK] Upload failed:', {
        error: error.message,
        fileCount: selectedFiles.length,
        files: selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });
      
      // Reset progress on error
      setUploadProgress({});
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles]);

  const getFileSize = useCallback((bytes: number): string => {
    return FileService.formatFileSize(bytes);
  }, []);

  return {
    selectedFiles,
    uploadedFiles,
    fileInputRef,
    isUploading,
    uploadProgress,
    handleAttachmentClick,
    handleFileSelect,
    removeFile,
    clearFiles,
    uploadFiles,
    getFileSize,
    hasFiles: selectedFiles.length > 0,
    validationErrors
  };
}