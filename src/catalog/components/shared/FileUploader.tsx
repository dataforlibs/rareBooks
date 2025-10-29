import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
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
  uploadFunction?: (file: File) => Promise<string>;
  label?: string;
  description?: string;
  existingFiles?: Array<{ url: string; fileName?: string }>;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  accept = 'image/*',
  multiple = true,
  maxFiles = 10,
  maxSizeMB = 10,
  onFilesUploaded,
  uploadFunction,
  label = 'Upload Files',
  description = 'Drag and drop files here, or click to select',
  existingFiles = []
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(undefined);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  }, []);

  const isDuplicate = useCallback((file: File): boolean => {
    const isDuplicateInSession = files.some(
      f => f.file.name === file.name && f.file.size === file.size
    );

    const isDuplicateInExisting = existingFiles.some(
      ef => ef.fileName === file.name
    );

    return isDuplicateInSession || isDuplicateInExisting;
  }, [files, existingFiles]);

  const uploadFiles = useCallback(async (filesToUpload: UploadedFile[]) => {
    const successfulUploads: Array<{
      id: string;
      file: File;
      url: string;
      cloudinaryPublicId?: string;
      thumbnailUrl?: string;
      width?: number;
      height?: number;
    }> = [];

    for (const uploadedFile of filesToUpload) {
      try {
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id ? { ...f, progress: 30 } : f
        ));
  
        console.log('📤 Uploading to Cloudinary:', uploadedFile.file.name);
        const result = await uploadToCloudinary(uploadedFile.file, 'catalog-items');
        console.log('✅ Upload successful!', result.secure_url);
  
        const sizes = getImageSizes(result.public_id);
  
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
  
        successfulUploads.push({ 
          id: uploadedFile.id, 
          file: uploadedFile.file, 
          url: result.secure_url,
          cloudinaryPublicId: result.public_id,
          thumbnailUrl: sizes.thumbnail,
          width: result.width,
          height: result.height
        });
        
      } catch (error) {
        console.error('❌ Cloudinary upload failed:', error);
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, error: error instanceof Error ? error.message : 'Upload failed', progress: 0 } 
            : f
        ));
      }
    }

    if (successfulUploads.length > 0) {
      console.log(`📦 Batch upload complete: ${successfulUploads.length} files`);
      onFilesUploaded(successfulUploads);
    }
  }, [onFilesUploaded]);

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    
    if (files.length + newFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const duplicates = newFiles.filter(isDuplicate);
    if (duplicates.length > 0) {
      alert(`${duplicates.length} duplicate file(s) detected and skipped:\n${duplicates.map(f => f.name).join('\n')}`);
    }

    const uniqueFiles = newFiles.filter(f => !isDuplicate(f));
    if (uniqueFiles.length === 0) return;

    const oversizedFiles = uniqueFiles.filter(
      file => file.size > maxSizeMB * 1024 * 1024
    );
    
    if (oversizedFiles.length > 0) {
      alert(`${oversizedFiles.length} file(s) exceed the ${maxSizeMB}MB size limit`);
      return;
    }

    const processedFiles: UploadedFile[] = await Promise.all(
      uniqueFiles.map(async (file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: await createPreview(file),
        progress: 0,
        uploaded: false
      }))
    );

    setFiles(prev => [...prev, ...processedFiles]);
    uploadFiles(processedFiles);
  }, [files.length, maxFiles, maxSizeMB, isDuplicate, createPreview, uploadFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

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

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

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
          Max {maxFiles} files, {maxSizeMB}MB each · Duplicates auto-detected
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

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>

                    {uploadedFile.error ? (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="text-red-600" size={14} />
                        <span className="text-xs text-red-600">{uploadedFile.error}</span>
                      </div>
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
