import { cloudinaryConfig } from './config';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resource_type: string;
}

/**
 * Upload a file to Cloudinary
 * @param file - File to upload
 * @param folder - Cloudinary folder (default: 'rare-books')
 * @returns Upload result with URLs and metadata
 */
export const uploadToCloudinary = async (
  file: File,
  folder: string = 'rare-books'
): Promise<CloudinaryUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  formData.append('folder', folder);
  
  // Add tags for organization
  formData.append('tags', 'rare-book,catalog');
  
  // Add context/metadata
  formData.append('context', `alt=${file.name}|caption=`);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const data: CloudinaryUploadResult = await response.json();
    
    console.log('✅ Cloudinary upload successful:', data.secure_url);
    
    return data;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Generate Cloudinary URL with transformations
 */
export const getCloudinaryUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    quality?: 'auto' | number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
  } = {}
): string => {
  const { cloudName } = cloudinaryConfig;
  const { 
    width, 
    height, 
    crop = 'fit', 
    quality = 'auto', 
    format = 'auto' 
  } = options;
  
  let transformation = `q_${quality},f_${format}`;
  if (width) transformation += `,w_${width}`;
  if (height) transformation += `,h_${height}`;
  if (width || height) transformation += `,c_${crop}`;
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
};

/**
 * Generate multiple image sizes for responsive images
 */
export const getImageSizes = (publicId: string) => ({
  thumbnail: getCloudinaryUrl(publicId, { width: 200, height: 200, crop: 'thumb' }),
  small: getCloudinaryUrl(publicId, { width: 400, quality: 'auto' }),
  medium: getCloudinaryUrl(publicId, { width: 800, quality: 'auto' }),
  large: getCloudinaryUrl(publicId, { width: 1600, quality: 'auto' }),
  original: getCloudinaryUrl(publicId, { quality: 'auto' }),
});

/**
 * Get IIIF Image API URL for Cloudinary
 * Cloudinary supports IIIF out of the box!
 */
export const getIIIFUrl = (publicId: string): string => {
  const { cloudName } = cloudinaryConfig;
  return `https://res.cloudinary.com/${cloudName}/iiif/2/${publicId}`;
};
