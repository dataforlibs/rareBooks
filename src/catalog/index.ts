// Main entry point for the Rare Book Catalog System
// Exports all components for easy importing

export { default as CatalogItemForm } from './components/CatalogItemForm';
export { default as CreatorAuthorityForm } from './components/CreatorAuthorityForm';
// TODO: Uncomment when component files are created
// export { default as CollectionRecordForm } from './components/CollectionRecordForm';
// export { default as ImageMetadataForm } from './components/ImageMetadataForm';
// export { default as LocationRecordForm } from './components/LocationRecordForm';
// export { default as CatalogDashboard } from './components/CatalogDashboard';

// Shared utilities
export { default as JSONImporter } from './components/shared/JSONImporter';
export { default as FileUploader } from './components/shared/FileUploader';
export { default as FormSection } from './components/shared/FormSection';

// Type definitions
export * from './types';

// Data models and schemas
export * from './schemas';