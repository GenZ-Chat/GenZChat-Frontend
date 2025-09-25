import { Paperclip, X, FileText, Image, Video, Music, Archive, Code, Upload, AlertCircle } from "lucide-react";
import { FileWithPreview } from "../hooks/useFileUpload";

interface FileAttachmentProps {
  selectedFiles: FileWithPreview[];
  onAttachmentClick: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  getFileSize: (bytes: number) => string;
  isUploading?: boolean;
  uploadProgress?: Record<string, number>;
  validationErrors?: string[];
  onUpload?: () => Promise<void>;
}

interface AttachmentButtonProps {
  onAttachmentClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading?: boolean;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
  if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
  if (fileType.startsWith('audio/')) return <Music className="h-4 w-4" />;
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) return <Archive className="h-4 w-4" />;
  if (fileType.includes('javascript') || fileType.includes('typescript') || fileType.includes('python') || fileType.includes('java')) return <Code className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
};

export function FileAttachment({
  selectedFiles,
  onRemoveFile,
  getFileSize,
  isUploading = false,
  uploadProgress = {},
  validationErrors = [],
  onUpload
}: Omit<FileAttachmentProps, 'onAttachmentClick' | 'onFileSelect' | 'fileInputRef'>) {
  
  const getFileProgress = (file: FileWithPreview) => {
    const fileKey = `${file.name}-${file.size}`;
    return uploadProgress[fileKey] || 0;
  };

  return (
    <>
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">File validation errors:</span>
          </div>
          <ul className="mt-1 text-red-600 text-xs list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto mb-2">
            {selectedFiles.map((file, index) => {
              const progress = getFileProgress(file);
              return (
                <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm relative overflow-hidden">
                  {/* Upload progress background */}
                  {isUploading && progress > 0 && (
                    <div 
                      className="absolute inset-0 bg-blue-100 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  
                  <div className="relative z-10 flex items-center gap-2">
                    <div className="text-gray-600">
                      {getFileIcon(file.type)}
                    </div>
                    {file.preview && file.type.startsWith('image/') ? (
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : null}
                    <div className="flex flex-col">
                      <span className="truncate max-w-32 font-medium">{file.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">
                          {getFileSize(file.size)}
                        </span>
                        {isUploading && progress > 0 && (
                          <span className="text-blue-600 text-xs">
                            {progress}%
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveFile(index)}
                      className="text-red-500 hover:text-red-700 transition-colors ml-2"
                      title="Remove file"
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Upload Button */}
          {onUpload && !isUploading && (
            <button
              onClick={onUpload}
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
            </button>
          )}
          
          {isUploading && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              Uploading files...
            </div>
          )}
        </div>
      )}
    </>
  );
}

export function AttachmentButton({
  onAttachmentClick,
  fileInputRef,
  onFileSelect,
  isUploading = false
}: AttachmentButtonProps) {
  return (
    <>
      <button
        onClick={onAttachmentClick}
        disabled={isUploading}
        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer z-10 disabled:opacity-50 disabled:cursor-not-allowed"
        title={isUploading ? "Uploading files..." : "Attach files"}
      >
        {isUploading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-muted-foreground border-t-transparent"></div>
        ) : (
          <Paperclip className="h-5 w-5" />
        )}
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onFileSelect}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar,.py,.js,.ts,.json"
      />
    </>
  );
}