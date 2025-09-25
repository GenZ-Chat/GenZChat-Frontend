import React, { useState } from 'react';
import { 
  Download, 
  Eye, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  Code,
  ExternalLink,
  X,
  Play,
  Pause
} from 'lucide-react';
import { FileAttachment } from '../model/file_attachment_model';
import { FileService } from '../service/file_service';

interface FileViewerProps {
  attachments: FileAttachment[];
  className?: string;
}

interface FileItemProps {
  file: FileAttachment;
  onPreview?: (file: FileAttachment) => void;
  onDownload?: (file: FileAttachment) => void;
}

interface FilePreviewModalProps {
  file: FileAttachment | null;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to get the MIME type from either 'type' or 'mimeType' property
const getMimeType = (file: FileAttachment): string => {
  return file.type || file.mimeType || '';
};

const getFileIcon = (mimeType: string | undefined) => {
  if (!mimeType) return <FileText className="h-4 w-4" />;
  
  if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
  if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
  if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return <Archive className="h-4 w-4" />;
  if (mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('python') || mimeType.includes('java')) return <Code className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
};

const getFileTypeColor = (mimeType: string | undefined): string => {
  if (!mimeType) return 'bg-gray-100 text-gray-600 border-gray-200';
  
  if (mimeType.startsWith('image/')) return 'bg-green-100 text-green-700 border-green-200';
  if (mimeType.startsWith('video/')) return 'bg-purple-100 text-purple-700 border-purple-200';
  if (mimeType.startsWith('audio/')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  if (mimeType.includes('pdf')) return 'bg-red-100 text-red-700 border-red-200';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('python')) return 'bg-gray-100 text-gray-700 border-gray-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
};

function FileItem({ file, onPreview, onDownload }: FileItemProps) {
  const mimeType = getMimeType(file);
  
  const handleDownload = async () => {
    try {
      if (onDownload) {
        onDownload(file);
      } else {
        // Try to download using file ID first, fallback to direct URL download
        if (file.fileId) {
          await FileService.downloadFileById(file.fileId, file.filename);
        } else if (file.url) {
          await FileService.downloadFromUrl(file.url, file.filename);
        } else {
          console.error('No file ID or URL available for download');
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct URL download if endpoint fails
      if (file.url) {
        try {
          await FileService.downloadFromUrl(file.url, file.filename);
        } catch (fallbackError) {
          console.error('Fallback download also failed:', fallbackError);
        }
      }
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(file);
    } else if (FileService.canPreviewFile(mimeType)) {
      // Open in new tab for preview
      window.open(file.url, '_blank');
    }
  };

  const canPreview = FileService.canPreviewFile(mimeType);

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${getFileTypeColor(mimeType)} hover:shadow-sm transition-shadow`}>
      <div className="flex-shrink-0">
        {getFileIcon(mimeType)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate" title={file.filename}>
            {file.filename}
          </span>
          {mimeType.startsWith('image/') && (
            <img 
              src={file.url} 
              alt={file.filename}
              className="w-6 h-6 object-cover rounded border"
              loading="lazy"
            />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs opacity-75">
          <span>{FileService.formatFileSize(file.size)}</span>
          <span>•</span>
          <span>{file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'Unknown date'}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {canPreview && (
          <button
            onClick={handlePreview}
            className="p-1 rounded hover:bg-white/50 transition-colors"
            title="Preview file"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
        
        <button
          onClick={handleDownload}
          className="p-1 rounded hover:bg-white/50 transition-colors"
          title="Download file"
        >
          <Download className="h-4 w-4" />
        </button>
        
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded hover:bg-white/50 transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function FilePreviewModal({ file, isOpen, onClose }: FilePreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !file) return null;

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load file preview');
  };

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const renderPreviewContent = () => {
    const mimeType = getMimeType(file!);
    
    if (error) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-2" />
            <p>{error}</p>
            <a 
              href={file!.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline mt-2 inline-block"
            >
              Open in new tab
            </a>
          </div>
        </div>
      );
    }

    if (mimeType.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center max-h-[70vh] overflow-hidden">
          <img
            src={file!.url}
            alt={file!.filename}
            className="max-w-full max-h-full object-contain"
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      );
    }

    if (mimeType.startsWith('video/')) {
      return (
        <div className="flex items-center justify-center">
          <video
            src={file!.url}
            controls
            className="max-w-full max-h-[70vh]"
            onLoadedMetadata={handleLoad}
            onError={handleError}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (mimeType.startsWith('audio/')) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Music className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-4">{file!.filename}</h3>
            <audio
              src={file!.url}
              controls
              className="w-full max-w-md"
              onLoadedMetadata={handleLoad}
              onError={handleError}
            />
          </div>
        </div>
      );
    }

    if (mimeType === 'application/pdf') {
      return (
        <div className="h-[80vh]">
          <iframe
            src={file!.url}
            className="w-full h-full border-0"
            onLoad={handleLoad}
            onError={handleError}
            title={file!.filename}
          />
        </div>
      );
    }

    if (mimeType.startsWith('text/')) {
      return (
        <div className="p-4">
          <iframe
            src={file!.url}
            className="w-full h-96 border rounded"
            onLoad={handleLoad}
            onError={handleError}
            title={file!.filename}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          {getFileIcon(mimeType)}
          <p className="mt-2">Preview not available for this file type</p>
          <a 
            href={file!.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline mt-2 inline-block"
          >
            Open in new tab
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            {getFileIcon(getMimeType(file))}
            <div>
              <h3 className="font-medium truncate" title={file.filename}>
                {file.filename}
              </h3>
              <p className="text-sm text-gray-500">
                {FileService.formatFileSize(file.size)} • {getMimeType(file)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  if (file.fileId) {
                    await FileService.downloadFileById(file.fileId, file.filename);
                  } else if (file.url) {
                    await FileService.downloadFromUrl(file.url, file.filename);
                  }
                } catch (error) {
                  console.error('Download failed:', error);
                  // Fallback to direct URL download
                  if (file.url) {
                    try {
                      await FileService.downloadFromUrl(file.url, file.filename);
                    } catch (fallbackError) {
                      console.error('Fallback download also failed:', fallbackError);
                    }
                  }
                }
              }}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative overflow-auto">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          )}
          {renderPreviewContent()}
        </div>
      </div>
    </div>
  );
}

export function FileViewer({ attachments, className = '' }: FileViewerProps) {
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (file: FileAttachment) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`space-y-2 ${className}`}>
        {attachments.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onPreview={handlePreview}
          />
        ))}
      </div>
      
      <FilePreviewModal
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </>
  );
}

// Compact version for inline display in messages
export function CompactFileViewer({ attachments, className = '' }: FileViewerProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {attachments.map((file) => {
        const mimeType = getMimeType(file);
        return (
          <div
            key={file.id}
            className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${getFileTypeColor(mimeType)}`}
          >
            {getFileIcon(mimeType)}
            <span className="truncate max-w-24" title={file.filename}>
              {file.filename}
            </span>
            <div className="flex items-center gap-1">
              {FileService.canPreviewFile(mimeType) && (
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-75"
                  title="Preview"
                >
                  <Eye className="h-3 w-3" />
                </a>
              )}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    if (file.fileId) {
                      await FileService.downloadFileById(file.fileId, file.filename);
                    } else if (file.url) {
                      await FileService.downloadFromUrl(file.url, file.filename);
                    }
                  } catch (error) {
                    console.error('Download failed:', error);
                    // Fallback to direct URL download
                    if (file.url) {
                      try {
                        await FileService.downloadFromUrl(file.url, file.filename);
                      } catch (fallbackError) {
                        console.error('Fallback download also failed:', fallbackError);
                      }
                    }
                  }
                }}
                className="hover:opacity-75"
                title="Download"
              >
                <Download className="h-3 w-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}