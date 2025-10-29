/**
 * MARC21 Format Exporter for Rare Books Catalog
 * Converts catalog records to MARC21 bibliographic format
 */

interface MARCField {
  tag: string;
  indicator1?: string;
  indicator2?: string;
  subfields?: { code: string; value: string }[];
  value?: string; // For control fields
}

interface CatalogRecord {
  id?: string;
  title?: string;
  author?: string;
  publisher?: string;
  publicationPlace?: string;
  publicationDate?: string;
  edition?: string;
  physicalDescription?: string;
  isbn?: string;
  language?: string;
  subjects?: string[];
  notes?: string[];
  collectionName?: string;
  callNumber?: string;
  location?: string;
  dimensions?: string;
  pages?: string;
  binding?: string;
  condition?: string;
  provenance?: string;
}

export class MARCExporter {
  private readonly FIELD_TERMINATOR = '\x1E';
  private readonly RECORD_TERMINATOR = '\x1D';
  private readonly SUBFIELD_DELIMITER = '\x1F';

  /**
   * Convert a catalog record to MARC21 format
   */
  public exportToMARC(record: CatalogRecord): string {
    const fields = this.buildMARCFields(record);
    return this.formatMARC(fields);
  }

  /**
   * Export multiple records to MARC21 format
   */
  public exportMultipleToMARC(records: CatalogRecord[]): string {
    return records.map(record => this.exportToMARC(record)).join('');
  }

  /**
   * Export to human-readable MARC format
   */
  public exportToMARCReadable(record: CatalogRecord): string {
    const fields = this.buildMARCFields(record);
    return this.formatMARCReadable(fields);
  }

  /**
   * Build MARC fields from catalog record
   */
  private buildMARCFields(record: CatalogRecord): MARCField[] {
    const fields: MARCField[] = [];

    // Leader (will be calculated later)
    fields.push({ tag: 'LDR', value: '00000nam a2200000 i 4500' });

    // 001 - Control Number
    if (record.id) {
      fields.push({ tag: '001', value: record.id });
    }

    // 008 - Fixed-Length Data Elements
    fields.push({
      tag: '008',
      value: this.generateField008(record)
    });

    // 020 - ISBN
    if (record.isbn) {
      fields.push({
        tag: '020',
        indicator1: ' ',
        indicator2: ' ',
        subfields: [{ code: 'a', value: record.isbn }]
      });
    }

    // 040 - Cataloging Source
    fields.push({
      tag: '040',
      indicator1: ' ',
      indicator2: ' ',
      subfields: [
        { code: 'a', value: 'RareBks' },
        { code: 'b', value: 'eng' },
        { code: 'c', value: 'RareBks' }
      ]
    });

    // 041 - Language Code
    if (record.language) {
      fields.push({
        tag: '041',
        indicator1: '0',
        indicator2: ' ',
        subfields: [{ code: 'a', value: this.getLanguageCode(record.language) }]
      });
    }

    // 100 - Main Entry - Personal Name (Author)
    if (record.author) {
      fields.push({
        tag: '100',
        indicator1: '1',
        indicator2: ' ',
        subfields: [{ code: 'a', value: record.author }]
      });
    }

    // 245 - Title Statement
    if (record.title) {
      const indicator2 = this.calculateNonFilingCharacters(record.title);
      fields.push({
        tag: '245',
        indicator1: record.author ? '1' : '0',
        indicator2: indicator2,
        subfields: [{ code: 'a', value: record.title }]
      });
    }

    // 250 - Edition Statement
    if (record.edition) {
      fields.push({
        tag: '250',
        indicator1: ' ',
        indicator2: ' ',
        subfields: [{ code: 'a', value: record.edition }]
      });
    }

    // 260 - Publication, Distribution, etc.
    if (record.publicationPlace || record.publisher || record.publicationDate) {
      const subfields = [];
      if (record.publicationPlace) {
        subfields.push({ code: 'a', value: record.publicationPlace });
      }
      if (record.publisher) {
        subfields.push({ code: 'b', value: record.publisher });
      }
      if (record.publicationDate) {
        subfields.push({ code: 'c', value: record.publicationDate });
      }
      fields.push({
        tag: '260',
        indicator1: ' ',
        indicator2: ' ',
        subfields
      });
    }

    // 300 - Physical Description
    const physicalSubfields = [];
    if (record.pages) {
      physicalSubfields.push({ code: 'a', value: record.pages });
    }
    if (record.dimensions) {
      physicalSubfields.push({ code: 'c', value: record.dimensions });
    }
    if (physicalSubfields.length > 0) {
      fields.push({
        tag: '300',
        indicator1: ' ',
        indicator2: ' ',
        subfields: physicalSubfields
      });
    }

    // 500 - General Notes
    if (record.notes && record.notes.length > 0) {
      record.notes.forEach(note => {
        fields.push({
          tag: '500',
          indicator1: ' ',
          indicator2: ' ',
          subfields: [{ code: 'a', value: note }]
        });
      });
    }

    // 561 - Ownership and Custodial History (Provenance)
    if (record.provenance) {
      fields.push({
        tag: '561',
        indicator1: ' ',
        indicator2: ' ',
        subfields: [{ code: 'a', value: record.provenance }]
      });
    }

    // 563 - Binding Information
    if (record.binding) {
      fields.push({
        tag: '563',
        indicator1: ' ',
        indicator2: ' ',
        subfields: [{ code: 'a', value: record.binding }]
      });
    }

    // 583 - Action Note (Condition)
    if (record.condition) {
      fields.push({
        tag: '583',
        indicator1: ' ',
        indicator2: ' ',
        subfields: [
          { code: 'a', value: 'Condition' },
          { code: 'n', value: record.condition }
        ]
      });
    }

    // 650 - Subject Added Entry - Topical Term
    if (record.subjects && record.subjects.length > 0) {
      record.subjects.forEach(subject => {
        fields.push({
          tag: '650',
          indicator1: ' ',
          indicator2: '0',
          subfields: [{ code: 'a', value: subject }]
        });
      });
    }

    // 852 - Location
    if (record.location || record.callNumber || record.collectionName) {
      const locationSubfields = [];
      if (record.callNumber) {
        locationSubfields.push({ code: 'h', value: record.callNumber });
      }
      if (record.location) {
        locationSubfields.push({ code: 'b', value: record.location });
      }
      if (record.collectionName) {
        locationSubfields.push({ code: 'c', value: record.collectionName });
      }
      fields.push({
        tag: '852',
        indicator1: ' ',
        indicator2: ' ',
        subfields: locationSubfields
      });
    }

    return fields;
  }

  /**
   * Format MARC fields into MARC21 binary format
   */
  private formatMARC(fields: MARCField[]): string {
    // This is a simplified version - full implementation would calculate exact positions
    let record = '';
    
    fields.forEach(field => {
      if (field.tag === 'LDR') {
        record += field.value;
      } else if (!field.subfields) {
        // Control field
        record += field.tag + field.value + this.FIELD_TERMINATOR;
      } else {
        // Data field
        let fieldData = field.tag;
        fieldData += (field.indicator1 || ' ');
        fieldData += (field.indicator2 || ' ');
        field.subfields.forEach(subfield => {
          fieldData += this.SUBFIELD_DELIMITER + subfield.code + subfield.value;
        });
        fieldData += this.FIELD_TERMINATOR;
        record += fieldData;
      }
    });

    record += this.RECORD_TERMINATOR;
    return record;
  }

  /**
   * Format MARC fields into human-readable format
   */
  private formatMARCReadable(fields: MARCField[]): string {
    let output = '';

    fields.forEach(field => {
      if (field.tag === 'LDR') {
        output += `${field.tag}     ${field.value}\n`;
      } else if (!field.subfields) {
        // Control field
        output += `${field.tag}    ${field.value}\n`;
      } else {
        // Data field
        const ind1 = field.indicator1 || ' ';
        const ind2 = field.indicator2 || ' ';
        output += `${field.tag} ${ind1}${ind2} `;
        
        const subfieldStr = field.subfields
          .map(sf => `$${sf.code} ${sf.value}`)
          .join(' ');
        output += subfieldStr + '\n';
      }
    });

    return output;
  }

  /**
   * Generate Field 008 (Fixed-Length Data Elements)
   */
  private generateField008(record: CatalogRecord): string {
    const today = new Date();
    const dateEntered = today.toISOString().slice(2, 10).replace(/-/g, '');
    
    let dateType = 's';
    let date1 = record.publicationDate?.slice(0, 4) || '    ';
    while (date1.length < 4) date1 += ' ';
    
    const date2 = '    ';
    const placeCode = '   '; // Would need lookup table for real implementation
    const language = this.getLanguageCode(record.language);
    
    // Build 008 field (40 characters)
    let field008 = dateEntered; // 00-05: Date entered
    field008 += dateType;        // 06: Type of date
    field008 += date1;           // 07-10: Date 1
    field008 += date2;           // 11-14: Date 2
    field008 += placeCode;       // 15-17: Place of publication
    field008 += '     ';         // 18-22: Illustration codes
    field008 += ' ';             // 23: Target audience
    field008 += ' ';             // 24: Form of item
    field008 += '    ';          // 25-28: Nature of contents
    field008 += ' ';             // 29: Government publication
    field008 += ' ';             // 30: Conference publication
    field008 += '0';             // 31: Festschrift
    field008 += '0';             // 32: Index
    field008 += ' ';             // 33: Undefined
    field008 += '0';             // 34: Literary form
    field008 += ' ';             // 35: Biography
    field008 += language;        // 36-38: Language
    field008 += ' ';             // 39: Modified record

    return field008;
  }

  /**
   * Calculate non-filing characters for title
   */
  private calculateNonFilingCharacters(title?: string | null): string {
    if (!title || typeof title !== 'string') {
      return '0';
    }
    
    const articles = ['The ', 'A ', 'An ', 'Le ', 'La ', 'Les ', 'Un ', 'Une ', 'Der ', 'Die ', 'Das ', 'El ', 'Los ', 'Las '];
    for (const article of articles) {
      if (title.startsWith(article)) {
        return article.length.toString();
      }
    }
    return '0';
  }

  /**
   * Get ISO 639-2 language code
   */
  private getLanguageCode(language?: string | null): string {
    // Handle undefined, null, or empty string
    if (!language || typeof language !== 'string') {
      return 'eng'; // Default to English
    }

    const languageCodes: { [key: string]: string } = {
      'english': 'eng',
      'french': 'fre',
      'german': 'ger',
      'spanish': 'spa',
      'italian': 'ita',
      'latin': 'lat',
      'greek': 'gre',
      'hebrew': 'heb',
      'russian': 'rus',
      'chinese': 'chi',
      'japanese': 'jpn',
      'arabic': 'ara'
    };

    const normalized = language.toLowerCase().trim();
    return languageCodes[normalized] || (language.length >= 3 ? language.slice(0, 3).toLowerCase() : 'eng');
  }

  /**
   * Export to MARCXML format
   */
  public exportToMARCXML(record: CatalogRecord): string {
    const fields = this.buildMARCFields(record);
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<record xmlns="http://www.loc.gov/MARC21/slim">\n';

    fields.forEach(field => {
      if (field.tag === 'LDR') {
        xml += `  <leader>${field.value}</leader>\n`;
      } else if (!field.subfields) {
        xml += `  <controlfield tag="${field.tag}">${field.value}</controlfield>\n`;
      } else {
        const ind1 = field.indicator1 || ' ';
        const ind2 = field.indicator2 || ' ';
        xml += `  <datafield tag="${field.tag}" ind1="${ind1}" ind2="${ind2}">\n`;
        field.subfields.forEach(sf => {
          xml += `    <subfield code="${sf.code}">${this.escapeXML(sf.value)}</subfield>\n`;
        });
        xml += `  </datafield>\n`;
      }
    });

    xml += '</record>\n';
    return xml;
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Download MARC file
   */
  public downloadMARCFile(record: CatalogRecord, filename: string = 'catalog.mrc'): void {
    const marcData = this.exportToMARC(record);
    const blob = new Blob([marcData], { type: 'application/marc' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Download MARCXML file
   */
  public downloadMARCXMLFile(record: CatalogRecord, filename: string = 'catalog.xml'): void {
    const marcXML = this.exportToMARCXML(record);
    const blob = new Blob([marcXML], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  }
}

// Usage example
export const marcExporter = new MARCExporter();
