/**
 * MARC Export Integration Examples
 * 
 * This file demonstrates how to use the MARC export functionality
 * in your Rare Books Catalog System
 */

import { MARCExporter } from './MARCExporter';
import { BatchMARCExporter } from './BatchMARCExporter';

// ============================================================================
// EXAMPLE 1: Basic Single Record Export
// ============================================================================

const exampleRecord = {
  id: 'RB001',
  title: 'The Canterbury Tales',
  author: 'Chaucer, Geoffrey',
  publisher: 'William Caxton',
  publicationPlace: 'Westminster',
  publicationDate: '1478',
  language: 'English',
  pages: '374 p.',
  dimensions: '30 cm',
  binding: 'Original leather binding with gold tooling',
  condition: 'Good. Minor foxing on pages 23-45.',
  provenance: 'From the library of Sir Thomas More',
  subjects: ['English literature', 'Medieval poetry', 'Pilgrims and pilgrimages'],
  callNumber: 'PR1850 .A1 1478',
  location: 'Rare Books Room',
  collectionName: 'Medieval Literature Collection',
  notes: [
    'First edition printed in England',
    'One of only 12 known copies'
  ]
};

// Create exporter instance
const marcExporter = new MARCExporter();

// Export to human-readable format
const readableMARC = marcExporter.exportToMARCReadable(exampleRecord);
console.log(readableMARC);

// Export to MARCXML
const marcXML = marcExporter.exportToMARCXML(exampleRecord);
console.log(marcXML);

// Download MARC file
marcExporter.downloadMARCFile(exampleRecord, 'canterbury_tales.mrc');

// Download MARCXML file
marcExporter.downloadMARCXMLFile(exampleRecord, 'canterbury_tales.xml');

// ============================================================================
// EXAMPLE 2: Batch Export Multiple Records
// ============================================================================

const catalogRecords = [
  {
    id: 'RB001',
    title: 'The Canterbury Tales',
    author: 'Chaucer, Geoffrey',
    publicationDate: '1478',
    // ... other fields
  },
  {
    id: 'RB002',
    title: 'Paradise Lost',
    author: 'Milton, John',
    publicationDate: '1667',
    // ... other fields
  },
  {
    id: 'RB003',
    title: 'Don Quixote',
    author: 'Cervantes, Miguel de',
    publicationDate: '1605',
    // ... other fields
  }
];

const batchExporter = new BatchMARCExporter();

// Export all records to single MARC file
batchExporter.exportBatch(catalogRecords, 'catalog_collection.mrc');

// Export to MARCXML collection
batchExporter.exportBatchToMARCXML(catalogRecords, 'catalog_collection.xml');

// Export with progress tracking
batchExporter.exportBatchWithProgress(
  catalogRecords,
  'marcxml',
  (current: number, total: number) => {
    console.log(`Exporting record ${current} of ${total}`);
  }
);

// Generate and download summary report
batchExporter.downloadSummaryReport(catalogRecords);

// ============================================================================
// EXAMPLE 3: Integration with React Component
// ============================================================================

/*
// In your catalog detail page component:
import React from 'react';
import MARCExportButton from '../components/MARCExportButton';

function CatalogItemDetailPage({ record }: { record: any }) {
  return (
    <div className="catalog-detail">
      <h1>{record.title}</h1>
      <p>Author: {record.author}</p>
      
      {/* Add MARC export button *\/}
      <MARCExportButton record={record} recordId={record.id} />
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 4: Integration with Firebase/Firestore
// ============================================================================

// Uncomment when using with Firebase:
/*
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

async function exportAllCatalogItems() {
  try {
    // Fetch all catalog items from Firestore
    const catalogRef = collection(db, 'catalogItems');
    const snapshot = await getDocs(catalogRef);
    
    const records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Export to MARC
    const batchExporter = new BatchMARCExporter();
    await batchExporter.exportBatchWithProgress(
      records,
      'marcxml',
      (current: number, total: number) => {
        console.log(`Progress: ${Math.round((current / total) * 100)}%`);
      }
    );
    
    console.log('Export completed!');
  } catch (error) {
    console.error('Export failed:', error);
  }
}
*/

// ============================================================================
// EXAMPLE 5: Export Selected Records from Dashboard
// ============================================================================

/*
// React component example for dashboard with batch export
import React, { useState } from 'react';
import { BatchMARCExporter } from '../utils/BatchMARCExporter';

function CatalogDashboard() {
  const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleExportSelected = async () => {
    if (selectedRecords.length === 0) {
      alert('Please select at least one record to export');
      return;
    }

    setIsExporting(true);
    const batchExporter = new BatchMARCExporter();
    
    try {
      await batchExporter.exportBatchWithProgress(
        selectedRecords,
        'marcxml',
        (current: number, total: number) => {
          setExportProgress(Math.round((current / total) * 100));
        }
      );
      alert('Export completed successfully!');
    } catch (error: any) {
      alert('Export failed: ' + error.message);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div>
      {/* ... table with selectable records ... *\/}
      
      <button 
        onClick={handleExportSelected} 
        disabled={isExporting || selectedRecords.length === 0}
      >
        {isExporting ? `Exporting... ${exportProgress}%` : 'Export Selected to MARC'}
      </button>
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 6: Custom MARC Field Mapping
// ============================================================================

// If you need to customize MARC fields for your specific needs,
// you can extend the MARCExporter class:

class CustomMARCExporter extends MARCExporter {
  // Override or add custom methods here
  
  // Example: Add custom local fields (9XX fields)
  public addLocalFields(record: any): any {
    // Access protected method via type assertion
    const fields = (this as any).buildMARCFields(record);
    
    // Add custom field 949 for local processing information
    if (record.customField) {
      fields.push({
        tag: '949',
        indicator1: ' ',
        indicator2: ' ',
        subfields: [{ code: 'a', value: record.customField }]
      });
    }
    
    return fields;
  }
}

// ============================================================================
// EXAMPLE 7: Validation Before Export
// ============================================================================

function validateRecordForMARC(record: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (!record.title) {
    errors.push('Title is required');
  }
  
  if (!record.author && !record.title) {
    errors.push('Either author or title must be present');
  }
  
  // Validate ISBN format if present
  if (record.isbn && !/^[\d-]{10,17}$/.test(record.isbn.replace(/\s/g, ''))) {
    errors.push('Invalid ISBN format');
  }
  
  // Check date format
  if (record.publicationDate && !/^\d{4}(-\d{2})?(-\d{2})?$/.test(record.publicationDate)) {
    errors.push('Publication date should be in YYYY, YYYY-MM, or YYYY-MM-DD format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Use validation before export
function exportWithValidation(record: any) {
  const validation = validateRecordForMARC(record);
  
  if (!validation.isValid) {
    console.error('Validation errors:', validation.errors);
    alert('Cannot export: ' + validation.errors.join(', '));
    return;
  }
  
  const exporter = new MARCExporter();
  exporter.downloadMARCFile(record);
}

// ============================================================================
// EXAMPLE 8: API Endpoint for MARC Export (Backend Example)
// ============================================================================

/*
// Example Express.js endpoint
import express from 'express';
import { MARCExporter } from './utils/MARCExporter';

const router = express.Router();

router.get('/api/catalog/:id/export/marc', async (req, res) => {
  try {
    const recordId = req.params.id;
    const format = req.query.format || 'marc'; // marc, marcxml, or readable
    
    // Fetch record from database
    const record = await fetchRecordFromDatabase(recordId);
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    const exporter = new MARCExporter();
    
    let data, contentType, filename;
    
    switch (format) {
      case 'marcxml':
        data = exporter.exportToMARCXML(record);
        contentType = 'application/xml';
        filename = `${recordId}.xml`;
        break;
      case 'readable':
        data = exporter.exportToMARCReadable(record);
        contentType = 'text/plain';
        filename = `${recordId}.txt`;
        break;
      default:
        data = exporter.exportToMARC(record);
        contentType = 'application/marc';
        filename = `${recordId}.mrc`;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(data);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

export default router;
*/

// ============================================================================

export {
  exampleRecord,
  catalogRecords,
  validateRecordForMARC,
  exportWithValidation,
  CustomMARCExporter
};
