// Type definitions for the Rare Book Catalog System

export interface CatalogItem {
  // Core Identification
  id: string;
  recordStatus: 'draft' | 'review' | 'published' | 'archived';
  catalogDate: string;
  cataloger: string;
  lastModified: string;
  completenessScore: number; // 0-100%
  
  // Title & Responsibility (DCRMR Chapter 1)
  titleProper: string;
  parallelTitle?: string;
  otherTitleInfo?: string;
  statementOfResponsibility?: string;
  
  // Edition (DCRMR Chapter 2)
  editionStatement?: string;
  statementOfResponsibilityEdition?: string;
  
  // Publication (DCRMR Chapter 4)
  placeOfPublication: string;
  placeOfPublicationHistoricalName?: string;
  publisher: string;
  dateOfPublication: string;
  centuryOfCreation: string; // e.g., "15th", "16th"
  epochOfCreation: Epoch;
  
  // Physical Description (DCRMR Chapter 5)
  extent: string;
  dimensions?: string;
  baseMaterial?: string;
  appliedMaterial?: string;
  productionMethod?: string;
  
  // Series
  seriesStatement?: string;
  
  // Object Classification
  objectType: ObjectType;
  genre?: string[];
  
  // Geographic & Location Context
  locationOfCreation: Location;
  currentPhysicalLocation: Location;
  
  // Creator Information (linked to authority records)
  creators: CreatorReference[];
  
  // Artistic & Production Details
  artisticStyle?: string[];
  schoolOfCreation?: string;
  typographyDetails?: string;
  scriptStyle?: string;
  watermarks?: string;
  decorations?: string;
  layoutDescription?: string;
  folioInformation?: string;
  
  // Collection Context
  collectionId?: string;
  collectionName?: string;
  collectorId?: string;
  accessionNumber?: string;
  acquisitionDate?: string;
  
  // Notes (DCRMR Chapters 7-9)
  noteOnTitle?: string;
  noteOnPublication?: string;
  noteOnPhysicalDescription?: string;
  noteOnProvenance?: string;
  noteOnBinding?: string;
  noteOnCustodialHistory?: string;
  noteOnCondition?: string;
  
  // Curatorial Content
  curatorialNarrative?: string;
  productionTechniquesDetailed?: string;
  bibliography?: string[];
  
  // Identifiers
  fingerprint?: string;
  isbnIssn?: string;
  localCallNumber?: string;
  viafId?: string;
  
  // Language & Subject
  language: string[];
  subjects?: string[];
  
  // Media Assets
  images: ImageReference[];
  videos?: MediaReference[];
  audioDescriptions?: MediaReference[];
  scan3D?: string;
  
  // Access Control
  visibilityLevel: 'public' | 'preview' | 'restricted';
  accessTier: 'free' | 'subscription' | 'purchase' | 'research';
  price?: number;
  
  // Module Linking
  linkedMapLocations?: string[];
  linkedEducationalContent?: string[];
  linkedArtisticTours?: string[];
  linkedBlogPosts?: string[];
  linkedResearchArticles?: string[];
  relatedItems?: string[];
}

export interface CreatorAuthority {
  id: string;
  recordType: 'authority';
  recordStatus: 'draft' | 'published';
  createdDate: string;
  lastModified: string;
  
  // Name Information
  preferredName: string;
  nameVariants?: string[];
  datesOfActivity?: string;
  birthDate?: string;
  deathDate?: string;
  
  // Role & Type
  primaryRole: CreatorRole;
  additionalRoles?: CreatorRole[];
  
  // Biographical
  nationality?: string[];
  placeOfBirth?: string;
  placeOfDeath?: string;
  biography?: string;
  
  // Professional Context
  schoolsAffiliation?: string[];
  workshopsAffiliation?: string[];
  patronage?: string[];
  
  // External Identifiers
  viafId?: string;
  lcnafId?: string;
  wikidata?: string;
  
  // Related Records
  relatedCreators?: string[]; // IDs of related creators
  worksCreated?: string[]; // IDs of catalog items
  
  // Media
  portraitImage?: ImageReference;
  additionalImages?: ImageReference[];
  
  // Notes
  notes?: string;
  sources?: string[];
}

export interface CollectionRecord {
  id: string;
  recordType: 'collection';
  recordStatus: 'draft' | 'published';
  createdDate: string;
  lastModified: string;
  
  // Basic Information
  collectionName: string;
  collectionNameVariants?: string[];
  collectorId?: string; // Link to CreatorAuthority record
  
  // Context
  formationDates?: string;
  numberOfItems?: number;
  scopeAndContent?: string;
  historicalNote?: string;
  
  // Donation/Acquisition
  donationDate?: string;
  acquisitionMethod?: 'donation' | 'purchase' | 'bequest' | 'transfer';
  recipientInstitution?: string;
  
  // Physical Location
  currentLocation: Location;
  
  // Access
  accessConditions?: string;
  visibilityLevel: 'public' | 'restricted';
  
  // Media
  images?: ImageReference[];
  virtualTourUrl?: string;
  
  // Module Linking
  linkedItems?: string[]; // IDs of catalog items in this collection
  linkedArticles?: string[];
  linkedEducationalContent?: string[];
  
  // Administrative
  curator?: string;
  contactInfo?: string;
  notes?: string;
}

export interface ImageMetadata {
  id: string;
  recordType: 'image';
  createdDate: string;
  lastModified: string;
  
  // File Information
  filename: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  mimeType: string;
  dimensions: { width: number; height: number };
  
  // Dublin Core Elements
  dcTitle?: string;
  dcCreator?: string;
  dcSubject?: string[];
  dcDescription?: string;
  dcPublisher?: string;
  dcContributor?: string;
  dcDate?: string;
  dcType: 'Image' | 'StillImage' | 'MovingImage';
  dcFormat: string;
  dcIdentifier?: string;
  dcSource?: string;
  dcLanguage?: string;
  dcRelation?: string;
  dcCoverage?: string;
  dcRights?: string;
  
  // VRA Core Elements (Visual Resources)
  vraWorkType?: string; // e.g., "manuscript illumination", "binding detail"
  vraTechnique?: string;
  vraMaterial?: string;
  vraStylePeriod?: string;
  vraCulture?: string;
  vraSubjectTerms?: string[];
  
  // Image-Specific
  viewType?: 'overall' | 'detail' | 'folio' | 'binding' | 'frontispiece' | 'colophon' | 'marginalia' | 'watermark';
  folioNumber?: string;
  pageNumber?: string;
  caption?: string;
  curatedDescription?: string;
  
  // Technical
  colorSpace?: string;
  resolution?: number; // DPI
  captureDate?: string;
  captureDevice?: string;
  photographer?: string;
  
  // Rights & Access
  copyrightStatus?: string;
  license?: string;
  accessLevel: 'public' | 'preview' | 'restricted';
  watermarked?: boolean;
  
  // Relationships
  parentItemId?: string; // ID of catalog item this image depicts
  relatedImageIds?: string[];
  
  // IIIF Support
  iiifManifest?: string;
  iiifImageService?: string;
}

export interface LocationRecord {
  id: string;
  recordType: 'location';
  
  // Geographic
  country: string;
  countryHistoricalName?: string;
  region?: string;
  city: string;
  cityHistoricalName?: string;
  
  // Institution (for current locations)
  institutionName?: string;
  institutionType?: 'library' | 'museum' | 'archive' | 'private';
  department?: string;
  
  // Coordinates (for mapping)
  latitude?: number;
  longitude?: number;
  
  // Historical Context
  dateRange?: string;
  historicalNotes?: string;
  
  // Administrative
  contactInfo?: string;
  website?: string;
}

export interface MediaReference {
  id: string;
  type: 'video' | 'audio' | '3d-scan';
  title: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  description?: string;
  accessLevel: 'public' | 'subscription';
}

export interface ImageReference {
  imageId: string;
  
  // Cloudinary data (after upload)
  cloudinaryPublicId?: string;
  cloudinaryUrl?: string;
  thumbnailUrl?: string;
  
  // Alternative direct URL
  url?: string;
  
  // Metadata
  caption?: string;
  order: number;
  isPrimary?: boolean;
  
  // Dimensions
  width?: number;
  height?: number;
  
  // File info
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadDate?: string;
}

export interface CreatorReference {
  creatorId: string;
  role: CreatorRole;
  attribution?: string; // As it appears in the work
}

export interface Location {
  locationId?: string;
  country: string;
  countryHistoricalName?: string;
  city: string;
  cityHistoricalName?: string;
  institutionName?: string;
  coordinates?: { latitude: number; longitude: number };
}

// Enums and Type Unions
export type Epoch = 
  | 'Ancient'
  | 'Medieval'
  | 'Renaissance'
  | 'Early Modern'
  | 'Pre-Modern'
  | 'Other';

export type ObjectType = 
  | 'Manuscript'
  | 'Incunable'
  | 'Early Printed Book'
  | 'Map'
  | 'Print'
  | 'Scientific Drawing'
  | 'Artistic Drawing'
  | 'Illustration'
  | 'Handwritten Notebook'
  | 'Broadside'
  | 'Ephemera'
  | 'Other';

export type CreatorRole = 
  | 'Author'
  | 'Writer'
  | 'Scribe'
  | 'Copyist'
  | 'Artist'
  | 'Illuminator'
  | 'Illustrator'
  | 'Printer'
  | 'Publisher'
  | 'Binder'
  | 'Engraver'
  | 'Etcher'
  | 'Cartographer'
  | 'Editor'
  | 'Translator'
  | 'Patron'
  | 'Former Owner'
  | 'Other';

export type ArtisticStyle = 
  | 'Gothic'
  | 'Romanesque'
  | 'Byzantine'
  | 'Coptic'
  | 'Islamic'
  | 'Renaissance'
  | 'Baroque'
  | 'Rococo'
  | 'Neoclassical'
  | 'Other';

// JSON Import Types
export interface ImportResult {
  success: boolean;
  recordsImported: number;
  recordsFailed: number;
  errors: string[];
  importedIds: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
