import { useRef, useState } from "react";

export interface FileWithPreview extends File {
  preview?: string;
}

export function useFileUpload() {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const newFiles = files.map(file => file as FileWithPreview);
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
      processSelectedFiles(newFiles);
    }
    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const processSelectedFiles = (files: FileWithPreview[]) => {
    // Process the selected files (validation, preview generation, etc.)
    files.forEach(file => {
      console.log(`Processing file: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
      
      // Example file validation
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        console.warn(`File ${file.name} is too large (${file.size} bytes)`);
        // You could show a toast notification here
        return;
      }

      // For images, generate thumbnails
      if (file.type.startsWith('image/')) {
        generateImagePreview(file);
      }
    });
  };

  const generateImagePreview = (file: FileWithPreview) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log(`Generated preview for ${file.name}`);
      
      // Update the file with preview URL
      setSelectedFiles(prevFiles => 
        prevFiles.map(f => 
          f.name === file.name && f.size === file.size 
            ? { ...f, preview: result }
            : f
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(prevFiles => 
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  const getFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return {
    selectedFiles,
    fileInputRef,
    handleAttachmentClick,
    handleFileSelect,
    removeFile,
    clearFiles,
    getFileSize,
    hasFiles: selectedFiles.length > 0
  };
}