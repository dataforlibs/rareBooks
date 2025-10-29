// Cloudinary Configuration
// Make sure to create .env.local with your credentials

export const cloudinaryConfig = {
  cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dsartistrylabs',
  uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'rare_books_unsigned',
};

// To use:
// 1. Create .env.local in project root
// 2. Add:
//    REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
//    REACT_APP_CLOUDINARY_UPLOAD_PRESET=rare_books_unsigned
// 3. Restart dev server (npm start)
