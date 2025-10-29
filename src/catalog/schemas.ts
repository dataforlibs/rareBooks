// JSON Schemas for validation and documentation
// These can be used for runtime validation and to generate documentation

import { ValidationResult } from './types';

export const CatalogItemSchema = {
  "titleProper": "Speculum aureum decem praeceptorum dei",
  "parallelTitle": "Golden Mirror of the Ten Commandments of God",
  "placeOfPublication": "Strassburg",
  "publisher": "Johann Mentelin (or Peter Schoeffer press)",
  "dateOfPublication": "circa 1474",
  "centuryOfCreation": "15th",
  "epochOfCreation": "Renaissance",
  "extent": "[approximately 200] leaves",
  "dimensions": "folio (approximately 30-35 cm)",
  "baseMaterial": "paper",
  "productionMethod": "letterpress",
  "objectType": "Incunable",
  
  "creators": [
    {
      "creatorId": "creator-herp-001",
      "role": "Author",
      "attribution": "Henricus Herp (Henry Herp of Erp)"
    },
    {
      "creatorId": "creator-schoeffer-001",
      "role": "Printer",
      "attribution": "Peter Schoeffer"
    }
  ],
  
  "locationOfCreation": {
    "country": "Holy Roman Empire (Germany)",
    "city": "Mainz or Strassburg"
  },
  
  "language": ["Latin"],
  "artisticStyle": ["Gothic", "Renaissance"],
  
  "curatorialNarrative": "This incunabula represents an important early printed edition of Henry Herp's spiritual writings.",
  
  "collectionName": "Rare Books and Manuscripts Collection",
  "recordStatus": "draft",
  "visibilityLevel": "public",
  
  "images": [
    {
      "imageId": "img-001",
      "caption": "Binding and text spread showing two-column Gothic layout with red rubrication",
      "isPrimary": true,
      "order": 0,
      "url": "https://res.cloudinary.com/demo/image/upload/v1/sample",
      "cloudinaryUrl": "https://res.cloudinary.com/demo/image/upload/v1/sample",
      "thumbnailUrl": "https://res.cloudinary.com/demo/image/upload/w_200,h_300,c_fit/v1/sample",
      "width": 1920,
      "height": 1080,
      "cloudinaryPublicId": "sample"
    },
    {
      "imageId": "img-002",
      "caption": "Front flyleaf inscription by Valentin Wolff and watermark detail",
      "isPrimary": false,
      "order": 1,
      "url": "https://res.cloudinary.com/demo/image/upload/v1/coffee",
      "cloudinaryUrl": "https://res.cloudinary.com/demo/image/upload/v1/coffee",
      "thumbnailUrl": "https://res.cloudinary.com/demo/image/upload/w_200,h_300,c_fit/v1/coffee",
      "width": 1920,
      "height": 1080,
      "cloudinaryPublicId": "coffee"
    },
    {
      "imageId": "img-003",
      "caption": "Colophon with Peter Schoeffer printer's mark",
      "isPrimary": false,
      "order": 2,
      "url": "https://res.cloudinary.com/demo/image/upload/v1/cld-sample",
      "cloudinaryUrl": "https://res.cloudinary.com/demo/image/upload/v1/cld-sample",
      "thumbnailUrl": "https://res.cloudinary.com/demo/image/upload/w_200,h_300,c_fit/v1/cld-sample",
      "width": 1920,
      "height": 1080,
      "cloudinaryPublicId": "cld-sample"
    }
  ],
  
  "notes": [
    "This is a DEMO version with placeholder Cloudinary images",
    "Replace these URLs with your actual uploaded images",
    "The viewer will work with these sample URLs for testing"
  ]
};

export const CreatorAuthoritySchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Creator Authority Record",
  description: "Authority record for creators following VIAF/LCNAF patterns",
  type: "object",
  required: ["preferredName", "primaryRole"],
  properties: {
    id: { type: "string" },
    preferredName: { type: "string", minLength: 1 },
    primaryRole: { 
      type: "string",
      enum: [
        "Author", "Writer", "Scribe", "Copyist", "Artist", "Illuminator",
        "Illustrator", "Printer", "Publisher", "Binder", "Engraver",
        "Etcher", "Cartographer", "Editor", "Translator", "Patron",
        "Former Owner", "Other"
      ]
    },
    // ... additional properties
  }
};

export const CollectionRecordSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Collection Record",
  description: "Record for a collection of rare materials",
  type: "object",
  required: ["collectionName"],
  properties: {
    id: { type: "string" },
    collectionName: { type: "string", minLength: 1 },
    // ... additional properties
  }
};

export const ImageMetadataSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Image Metadata",
  description: "Metadata following Dublin Core and VRA Core standards",
  type: "object",
  required: ["filename", "fileUrl", "dcType", "dcFormat"],
  properties: {
    id: { type: "string" },
    filename: { type: "string" },
    fileUrl: { type: "string", format: "uri" },
    dcType: { 
      type: "string",
      enum: ["Image", "StillImage", "MovingImage"]
    },
    // ... additional properties
  }
};

// Validation helper functions
export function validateCatalogItem(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  if (!data.titleProper || data.titleProper.trim().length === 0) {
    errors.push("Title Proper is required");
  }
  
  if (!data.placeOfPublication || data.placeOfPublication.trim().length === 0) {
    errors.push("Place of Publication is required");
  }
  
  if (!data.publisher || data.publisher.trim().length === 0) {
    errors.push("Publisher is required");
  }
  
  if (!data.dateOfPublication || data.dateOfPublication.trim().length === 0) {
    errors.push("Date of Publication is required");
  }
  
  if (!data.extent || data.extent.trim().length === 0) {
    errors.push("Extent is required");
  }
  
  if (!data.objectType) {
    errors.push("Object Type is required");
  }
  
  if (!data.centuryOfCreation) {
    errors.push("Century of Creation is required");
  }
  
  if (!data.epochOfCreation) {
    errors.push("Epoch of Creation is required");
  }
  
  // Warnings for recommended fields
  if (!data.creators || data.creators.length === 0) {
    warnings.push("No creators specified - consider adding creator information");
  }
  
  if (!data.images || data.images.length === 0) {
    warnings.push("No images attached - consider adding visual documentation");
  }
  
  if (!data.language || data.language.length === 0) {
    warnings.push("Language not specified");
  }
  
  if (!data.curatorialNarrative) {
    warnings.push("No curatorial narrative - consider adding interpretive content");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateCreatorAuthority(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!data.preferredName || data.preferredName.trim().length === 0) {
    errors.push("Preferred Name is required");
  }
  
  if (!data.primaryRole) {
    errors.push("Primary Role is required");
  }
  
  if (!data.biography) {
    warnings.push("Biography not provided - consider adding biographical information");
  }
  
  if (!data.datesOfActivity && !data.birthDate && !data.deathDate) {
    warnings.push("No date information provided");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateCollectionRecord(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!data.collectionName || data.collectionName.trim().length === 0) {
    errors.push("Collection Name is required");
  }
  
  if (!data.scopeAndContent) {
    warnings.push("Scope and Content not provided - consider adding a description");
  }
  
  if (!data.currentLocation) {
    warnings.push("Current location not specified");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateImageMetadata(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!data.filename || data.filename.trim().length === 0) {
    errors.push("Filename is required");
  }
  
  if (!data.fileUrl || data.fileUrl.trim().length === 0) {
    errors.push("File URL is required");
  }
  
  if (!data.dcType) {
    errors.push("DC Type is required");
  }
  
  if (!data.dcFormat) {
    errors.push("DC Format is required");
  }
  
  if (!data.dcTitle) {
    warnings.push("Title not provided");
  }
  
  if (!data.dcDescription) {
    warnings.push("Description not provided - consider adding context");
  }
  
  if (!data.parentItemId) {
    warnings.push("Image not linked to a parent catalog item");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Calculate completeness score for catalog items
export function calculateCompletenessScore(data: any): number {
  const fields = {
    // Essential fields (10 points each)
    essential: [
      'titleProper', 'placeOfPublication', 'publisher', 'dateOfPublication',
      'extent', 'objectType', 'centuryOfCreation', 'epochOfCreation'
    ],
    // Important fields (5 points each)
    important: [
      'creators', 'language', 'locationOfCreation', 'currentPhysicalLocation',
      'artisticStyle', 'images', 'subjects'
    ],
    // Recommended fields (2 points each)
    recommended: [
      'curatorialNarrative', 'noteOnProvenance', 'noteOnBinding',
      'noteOnCondition', 'productionTechniquesDetailed', 'collectionId'
    ],
    // Optional fields (1 point each)
    optional: [
      'parallelTitle', 'otherTitleInfo', 'editionStatement', 'dimensions',
      'watermarks', 'decorations', 'bibliography', 'videos'
    ]
  };
  
  let score = 0;
  let maxScore = 0;
  
  // Calculate scores
  fields.essential.forEach(field => {
    maxScore += 10;
    if (data[field] && (Array.isArray(data[field]) ? data[field].length > 0 : data[field].toString().trim().length > 0)) {
      score += 10;
    }
  });
  
  fields.important.forEach(field => {
    maxScore += 5;
    if (data[field] && (Array.isArray(data[field]) ? data[field].length > 0 : data[field].toString().trim().length > 0)) {
      score += 5;
    }
  });
  
  fields.recommended.forEach(field => {
    maxScore += 2;
    if (data[field] && (Array.isArray(data[field]) ? data[field].length > 0 : data[field].toString().trim().length > 0)) {
      score += 2;
    }
  });
  
  fields.optional.forEach(field => {
    maxScore += 1;
    if (data[field] && (Array.isArray(data[field]) ? data[field].length > 0 : data[field].toString().trim().length > 0)) {
      score += 1;
    }
  });
  
  return Math.round((score / maxScore) * 100);
}

// Example JSON templates for import
export const exampleCatalogItemJSON = {
  "titleProper": "Nuremberg Chronicle",
  "parallelTitle": "Liber Chronicarum",
  "placeOfPublication": "Nuremberg",
  "publisher": "Anton Koberger",
  "dateOfPublication": "1493",
  "centuryOfCreation": "15th",
  "epochOfCreation": "Renaissance",
  "extent": "[12], CCXCIX, [13] leaves",
  "dimensions": "47 cm (folio)",
  "baseMaterial": "paper",
  "productionMethod": "letterpress",
  "objectType": "Incunable",
  "creators": [
    {
      "creatorId": "creator-001",
      "role": "Author",
      "attribution": "Hartmann Schedel"
    },
    {
      "creatorId": "creator-002",
      "role": "Printer",
      "attribution": "Anton Koberger"
    }
  ],
  "locationOfCreation": {
    "country": "Germany",
    "city": "Nuremberg"
  },
  "language": ["Latin"],
  "artisticStyle": ["Renaissance"],
  "curatorialNarrative": "One of the most extensively illustrated books of the 15th century...",
  "visibilityLevel": "public",
  "accessTier": "free"
};

export const exampleCreatorAuthorityJSON = {
  "preferredName": "Schedel, Hartmann",
  "nameVariants": ["Hartmann Schedel", "Hartmannus Schedel"],
  "birthDate": "1440",
  "deathDate": "1514",
  "primaryRole": "Author",
  "additionalRoles": ["Physician", "Humanist"],
  "nationality": ["German"],
  "placeOfBirth": "Nuremberg",
  "biography": "German physician, humanist, and historian...",
  "viafId": "100161068"
};

export const exampleCollectionJSON = {
  "collectionName": "J.D. Barnett Collection",
  "formationDates": "1870-1925",
  "numberOfItems": 40000,
  "scopeAndContent": "Collection of rare books focusing on early printed works...",
  "historicalNote": "John Davis Barnett was a Grand Trunk Railway engineer...",
  "donationDate": "1925",
  "acquisitionMethod": "donation",
  "recipientInstitution": "Western Libraries",
  "visibilityLevel": "public"
};

export const exampleImageJSON = {
  "filename": "nuremberg-chronicle-frontispiece.jpg",
  "fileUrl": "https://example.com/images/nuremberg-chronicle-frontispiece.jpg",
  "dcTitle": "Frontispiece of Nuremberg Chronicle",
  "dcType": "StillImage",
  "dcFormat": "image/jpeg",
  "dcDescription": "Woodcut frontispiece depicting the creation",
  "vraWorkType": "woodcut illustration",
  "viewType": "frontispiece",
  "caption": "The Creation of the World - Woodcut frontispiece",
  "accessLevel": "public",
  "parentItemId": "item-001"
};
