import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, CheckCircle } from 'lucide-react';
import { uploadToCloudinary, getImageSizes } from '../../../cloudinary/uploadService';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  uploaded: boolean;
  url?: string;
  error?: string;
}

interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  onFilesUploaded: (files: Array<{ 
    id: string; 
    file: File; 
    url: string;
    cloudinaryPublicId?: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
  }>) => void;
  uploadFunction?: (file: File) => Promise<string>; // Returns URL
  label?: string;
  description?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  accept = 'image/*',
  multiple = true,
  maxFiles = 10,
  maxSizeMB = 10,
  onFilesUploaded,
  uploadFunction,
  label = 'Upload Files',
  description = 'Drag and drop files here, or click to select'
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImage = (file: File) => file.type.startsWith('image/');

  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!isImage(file)) {
        resolve(undefined);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    
    // Check file count limit
    if (files.length + newFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Check file sizes
    const oversizedFiles = newFiles.filter(
      file => file.size > maxSizeMB * 1024 * 1024
    );
    
    if (oversizedFiles.length > 0) {
      alert(`Some files exceed the ${maxSizeMB}MB size limit`);
      return;
    }

    // Process files
    const processedFiles: UploadedFile[] = await Promise.all(
      newFiles.map(async (file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: await createPreview(file),
        progress: 0,
        uploaded: false
      }))
    );

    setFiles(prev => [...prev, ...processedFiles]);

    // Upload files to Cloudinary
    uploadFiles(processedFiles);
  }, [files.length, maxFiles, maxSizeMB]);

  const uploadFiles = async (filesToUpload: UploadedFile[]) => {
    for (const uploadedFile of filesToUpload) {
      try {
        // Show progress
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id ? { ...f, progress: 30 } : f
        ));
  
        console.log('📤 Uploading to Cloudinary:', uploadedFile.file.name);
  
        // Upload to Cloudinary
        const result = await uploadToCloudinary(uploadedFile.file, 'catalog-items');
        
        console.log('✅ Upload successful!', result.secure_url);
  
        // Generate different sizes
        const sizes = getImageSizes(result.public_id);
  
        // Update with real URLs
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { 
                ...f, 
                progress: 100, 
                uploaded: true, 
                url: result.secure_url,
                preview: sizes.thumbnail
              } 
            : f
        ));
  
        // Send Cloudinary data to parent
        onFilesUploaded([{ 
          id: uploadedFile.id, 
          file: uploadedFile.file, 
          url: result.secure_url,
          cloudinaryPublicId: result.public_id,
          thumbnailUrl: sizes.thumbnail,
          width: result.width,
          height: result.height
        }]);
        
      } catch (error) {
        console.error('❌ Cloudinary upload failed:', error);
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, error: error instanceof Error ? error.message : 'Upload failed', progress: 0 } 
            : f
        ));
      }
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging 
            ? 'border-amber-500 bg-amber-50' 
            : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50'
          }
        `}
      >
        <Upload className="mx-auto mb-4 text-amber-600" size={48} />
        <p className="text-lg font-medium text-gray-700 mb-2">{label}</p>
        <p className="text-sm text-gray-500 mb-2">{description}</p>
        <p className="text-xs text-gray-400">
          Max {maxFiles} files, {maxSizeMB}MB each
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Uploaded Files ({files.length}/{maxFiles})
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {files.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="border border-gray-200 rounded-lg p-3 bg-white"
              >
                <div className="flex items-start gap-3">
                  {/* Preview or Icon */}
                  <div className="flex-shrink-0">
                    {uploadedFile.preview ? (
                      <img
                        src={uploadedFile.preview}
                        alt={uploadedFile.file.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <File className="text-gray-400" size={32} />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>

                    {/* Progress or Status */}
                    {uploadedFile.error ? (
                      <p className="text-xs text-red-600 mt-1">
                        {uploadedFile.error}
                      </p>
                    ) : uploadedFile.uploaded ? (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle className="text-green-600" size={14} />
                        <span className="text-xs text-green-600">Uploaded</span>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-amber-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadedFile.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(uploadedFile.id);
                    }}
                    className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
