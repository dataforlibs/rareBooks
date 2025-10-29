import { MARCExporter } from './MARCExporter';

interface CatalogRecord {
  id?: string;
  title?: string;
  author?: string;
  publisher?: string;
  publicationPlace?: string;
  publicationDate?: string;
  isbn?: string;
  subjects?: string[];
  // ... other fields
}

export class BatchMARCExporter {
  private exporter: MARCExporter;

  constructor() {
    this.exporter = new MARCExporter();
  }

  /**
   * Export multiple records to a single MARC file
   */
  public exportBatch(records: CatalogRecord[], filename: string = 'catalog_batch.mrc'): void {
    const marcData = this.exporter.exportMultipleToMARC(records);
    const blob = new Blob([marcData], { type: 'application/marc' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Export multiple records to MARCXML format
   */
  public exportBatchToMARCXML(records: CatalogRecord[], filename: string = 'catalog_batch.xml'): void {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<collection xmlns="http://www.loc.gov/MARC21/slim">\n';
    
    records.forEach(record => {
      const recordXML = this.exporter.exportToMARCXML(record);
      // Remove XML declaration from individual records
      const cleanedXML = recordXML.replace(/<\?xml[^?]*\?>\n?/, '');
      xml += cleanedXML;
    });
    
    xml += '</collection>\n';
    
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Export batch with progress callback
   */
  public async exportBatchWithProgress(
    records: CatalogRecord[],
    format: 'marc' | 'marcxml',
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    const filename = `catalog_batch_${Date.now()}.${format === 'marc' ? 'mrc' : 'xml'}`;
    
    if (format === 'marc') {
      let marcData = '';
      for (let i = 0; i < records.length; i++) {
        marcData += this.exporter.exportToMARC(records[i]);
        if (onProgress) {
          onProgress(i + 1, records.length);
        }
        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      const blob = new Blob([marcData], { type: 'application/marc' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<collection xmlns="http://www.loc.gov/MARC21/slim">\n';
      
      for (let i = 0; i < records.length; i++) {
        const recordXML = this.exporter.exportToMARCXML(records[i]);
        const cleanedXML = recordXML.replace(/<\?xml[^?]*\?>\n?/, '');
        xml += cleanedXML;
        
        if (onProgress) {
          onProgress(i + 1, records.length);
        }
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      xml += '</collection>\n';
      
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Generate MARC records summary report
   */
  public generateSummaryReport(records: CatalogRecord[]): string {
    let report = 'MARC Export Summary Report\n';
    report += '='.repeat(50) + '\n\n';
    report += `Total Records: ${records.length}\n`;
    report += `Export Date: ${new Date().toISOString()}\n\n`;
    
    report += 'Records by Type:\n';
    const authors = records.filter(r => r.author).length;
    const withISBN = records.filter(r => r.isbn).length;
    const withSubjects = records.filter(r => r.subjects && r.subjects.length > 0).length;
    
    report += `- With Author: ${authors}\n`;
    report += `- With ISBN: ${withISBN}\n`;
    report += `- With Subjects: ${withSubjects}\n\n`;
    
    report += 'Record List:\n';
    report += '-'.repeat(50) + '\n';
    records.forEach((record, index) => {
      report += `${index + 1}. ${record.title || 'Untitled'}\n`;
      if (record.author) report += `   Author: ${record.author}\n`;
      if (record.id) report += `   ID: ${record.id}\n`;
      report += '\n';
    });
    
    return report;
  }

  /**
   * Download summary report
   */
  public downloadSummaryReport(records: CatalogRecord[], filename: string = 'marc_export_summary.txt'): void {
    const report = this.generateSummaryReport(records);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  }
}

export const batchMARCExporter = new BatchMARCExporter();
