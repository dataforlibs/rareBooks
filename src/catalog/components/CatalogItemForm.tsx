import React, { useState } from 'react';
import { Save, RotateCcw, BookOpen, FileDown, Layers } from 'lucide-react';
import FormSection from './shared/FormSection';
import FileUploader from './shared/FileUploader';
import JSONImporter from './shared/JSONImporter';
import { CatalogItem, Epoch, ObjectType, CreatorRole, ImportResult, CreatorReference } from '../types';
import { validateCatalogItem, calculateCompletenessScore, exampleCatalogItemJSON } from '../schemas';
import MARCExportButton from '../components/MARCExportButton';
import SimpleIIIFViewer from './SimpleIIIFViewer';
import { Eye} from 'lucide-react'; // Make sure Eye is imported
import { catalogService } from '../../services/catalogService';


type TabType = 'basic' | 'description' | 'creators' | 'location' | 'artistic' | 'collection' | 'curatorial' | 'images' | 'access' | 'marc' | 'viewer';

const CatalogItemForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [formData, setFormData] = useState<Partial<CatalogItem>>({
    recordStatus: 'draft',
    titleProper: '',
    placeOfPublication: '',
    publisher: '',
    dateOfPublication: '',
    extent: '',
    objectType: undefined,
    centuryOfCreation: '',
    epochOfCreation: undefined,
    creators: [],
    images: [],
    language: [],
    visibilityLevel: 'public',
    accessTier: 'free'
  });

  const [savedMessage, setSavedMessage] = useState('');
  const [showImporter, setShowImporter] = useState(false);
  const [completeness, setCompleteness] = useState(0);

  const epochs: Epoch[] = ['Ancient', 'Medieval', 'Renaissance', 'Early Modern', 'Pre-Modern', 'Other'];
  const objectTypes: ObjectType[] = [
    'Manuscript', 'Incunable', 'Early Printed Book', 'Map', 'Print',
    'Scientific Drawing', 'Artistic Drawing', 'Illustration',
    'Handwritten Notebook', 'Broadside', 'Ephemera', 'Other'
  ];

  const roles: CreatorRole[] = [
    'Author', 'Writer', 'Scribe', 'Copyist', 'Artist', 'Illuminator',
    'Illustrator', 'Printer', 'Publisher', 'Binder', 'Engraver',
    'Etcher', 'Cartographer', 'Editor', 'Translator', 'Patron',
    'Former Owner', 'Other'
  ];

  const artisticStyles = [
    'Gothic', 'Romanesque', 'Byzantine', 'Coptic', 'Islamic',
    'Renaissance', 'Baroque', 'Rococo', 'Neoclassical', 'Other'
  ];

  const tabs = [
    { id: 'basic' as TabType, label: 'Basic Info', icon: BookOpen },
    { id: 'description' as TabType, label: 'Physical Description', icon: Layers },
    { id: 'creators' as TabType, label: 'Creators', icon: Layers },
    { id: 'location' as TabType, label: 'Location & Context', icon: Layers },
    { id: 'artistic' as TabType, label: 'Artistic Details', icon: Layers },
    { id: 'collection' as TabType, label: 'Collection', icon: Layers },
    { id: 'curatorial' as TabType, label: 'Curatorial', icon: Layers },
    { id: 'images' as TabType, label: 'Images & Media', icon: Layers },
    { id: 'access' as TabType, label: 'Access Control', icon: Layers },
    { id: 'marc' as TabType, label: 'MARC Export', icon: MARCExportButton }  // ← Add this
  ];

  const handleChange = (field: keyof CatalogItem, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    setCompleteness(calculateCompletenessScore(newData));
  };

  const handleArrayInput = (field: keyof CatalogItem, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean);
    handleChange(field, array);
  };

  const handleSubmit = async () => {  // ← Add 'async' here
    const validation = validateCatalogItem(formData);
    
    if (!validation.isValid) {
      setSavedMessage('❌ ' + validation.errors.join('; '));
      setTimeout(() => setSavedMessage(''), 5000);
      return;
    }
  
    try {
      const catalogRecord: CatalogItem = {
        ...formData as CatalogItem,
        id: formData.id || `item-${Date.now()}`,
        catalogDate: formData.catalogDate || new Date().toISOString(),
        cataloger: formData.cataloger || 'Current User',
        lastModified: new Date().toISOString(),
        completenessScore: completeness
      };
  
      // This needs 'async' above ↑
      const savedId = await catalogService.saveCatalogItem(catalogRecord);
      
      setFormData({ ...catalogRecord, id: savedId });
      console.log('✅ Saved to Firebase:', savedId);
      setSavedMessage('✓ Catalog entry saved successfully to database!');
      setTimeout(() => setSavedMessage(''), 4000);
      
    } catch (error) {
      console.error('❌ Save failed:', error);
      setSavedMessage('❌ Failed to save: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setTimeout(() => setSavedMessage(''), 5000);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalog-${formData.titleProper?.replace(/\s+/g, '-') || 'item'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (data: any[]): Promise<ImportResult> => {
    try {
      // Take the first record from the array
      const importedData = data[0];
      
      // Merge imported data with form, preserving required structure
      const mergedData: Partial<CatalogItem> = {
        ...formData,  // Keep existing form structure
        ...importedData,  // Override with imported values
        
        // Ensure arrays are properly initialized
        creators: importedData.creators || [],
        images: importedData.images || [],
        language: importedData.language || [],
        
        // Generate ID if not present
        id: importedData.id || `item-${Date.now()}`,
        
        // Set timestamps
        catalogDate: importedData.catalogDate || new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
      
      // Update the form with imported data
      setFormData(mergedData);
      
      // Recalculate completeness
      setCompleteness(calculateCompletenessScore(mergedData));
      
      // Hide the importer
      setShowImporter(false);
      
      // Show success message
      setSavedMessage('✓ JSON imported successfully! Review and save when ready.');
      setTimeout(() => setSavedMessage(''), 5000);
      
      console.log('✅ JSON imported and form populated:', mergedData);
      
      return {
        success: true,
        recordsImported: 1,
        recordsFailed: 0,
        errors: [],
        importedIds: [mergedData.id!]
      };
      
    } catch (error) {
      console.error('❌ Import failed:', error);
      return {
        success: false,
        recordsImported: 0,
        recordsFailed: data.length,
        errors: [error instanceof Error ? error.message : 'Unknown import error'],
        importedIds: []
      };
    }
  };
  

  const addCreator = () => {
    const newCreator: CreatorReference = {
      creatorId: '',
      role: 'Author',
      attribution: ''
    };
    handleChange('creators', [...(formData.creators || []), newCreator]);
  };

  const updateCreator = (index: number, field: keyof CreatorReference, value: any) => {
    const updated = [...(formData.creators || [])];
    updated[index] = { ...updated[index], [field]: value };
    handleChange('creators', updated);
  };

  const removeCreator = (index: number) => {
    handleChange('creators', formData.creators?.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BookOpen className="text-amber-900" size={40} />
            <h1 className="text-4xl font-bold text-amber-900">Rare Book Catalog Entry</h1>
          </div>
          <p className="text-amber-700 font-medium">DCRMR + RDA + Archival Standards</p>
          
          {/* Completeness Indicator */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm text-amber-700 mb-1">
              <span>Completeness</span>
              <span className="font-semibold">{completeness}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </header>

        {savedMessage && (
          <div className={`mb-6 p-4 rounded-lg border ${
            savedMessage.includes('✓') 
              ? 'bg-green-100 border-green-400 text-green-800' 
              : 'bg-red-100 border-red-400 text-red-800'
          }`}>
            {savedMessage}
          </div>
        )}

        {/* JSON Import */}
        {showImporter && (
          <div className="mb-6">
            <JSONImporter
              entityType="catalogItem"
              onImport={handleImport}
              validateFn={validateCatalogItem}
              exampleJSON={exampleCatalogItemJSON}
            />
          </div>
        )}

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowImporter(!showImporter)}
            className="text-sm text-amber-700 hover:text-amber-900 underline"
          >
            {showImporter ? 'Hide' : 'Show'} JSON Import
          </button>
        </div>

        <button onClick={() => setActiveTab('viewer')}>
  <Eye size={20} /> Viewer
</button>

        {/* Tabs */}
        <div className="bg-white rounded-t-lg border-2 border-amber-200 overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-amber-600 text-amber-900 bg-amber-50'
                    : 'border-transparent text-gray-600 hover:text-amber-700 hover:bg-amber-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white border-2 border-t-0 border-amber-200 rounded-b-lg p-6">
          {/* BASIC INFO TAB */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <FormSection
                title="Title and Statement of Responsibility"
                standard="DCRMR Chapter 1"
                required
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title Proper <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.titleProper}
                      onChange={(e) => handleChange('titleProper', e.target.value)}
                      placeholder="Title as it appears on the title page"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parallel Title
                      </label>
                      <input
                        type="text"
                        value={formData.parallelTitle}
                        onChange={(e) => handleChange('parallelTitle', e.target.value)}
                        placeholder="Title in another language"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Other Title Information
                      </label>
                      <input
                        type="text"
                        value={formData.otherTitleInfo}
                        onChange={(e) => handleChange('otherTitleInfo', e.target.value)}
                        placeholder="Subtitle or additional title info"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statement of Responsibility
                    </label>
                    <input
                      type="text"
                      value={formData.statementOfResponsibility}
                      onChange={(e) => handleChange('statementOfResponsibility', e.target.value)}
                      placeholder="As it appears on the item"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Edition Statement"
                standard="DCRMR Chapter 2"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation of Edition
                    </label>
                    <input
                      type="text"
                      value={formData.editionStatement}
                      onChange={(e) => handleChange('editionStatement', e.target.value)}
                      placeholder="e.g., 'First edition', 'Second edition, corrected'"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statement of Responsibility for Edition
                    </label>
                    <input
                      type="text"
                      value={formData.statementOfResponsibilityEdition}
                      onChange={(e) => handleChange('statementOfResponsibilityEdition', e.target.value)}
                      placeholder="e.g., 'revised by John Smith'"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Publication Statement"
                standard="DCRMR Chapter 4"
                required
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Place of Publication <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.placeOfPublication}
                        onChange={(e) => handleChange('placeOfPublication', e.target.value)}
                        placeholder="City, State, Country"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Historical Name
                      </label>
                      <input
                        type="text"
                        value={formData.placeOfPublicationHistoricalName}
                        onChange={(e) => handleChange('placeOfPublicationHistoricalName', e.target.value)}
                        placeholder="Historical name of place"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Publisher <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.publisher}
                      onChange={(e) => handleChange('publisher', e.target.value)}
                      placeholder="Publisher name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Publication <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.dateOfPublication}
                        onChange={(e) => handleChange('dateOfPublication', e.target.value)}
                        placeholder="YYYY or [circa YYYY]"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Century <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.centuryOfCreation}
                        onChange={(e) => handleChange('centuryOfCreation', e.target.value)}
                        placeholder="e.g., 15th, 16th"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Epoch <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={formData.epochOfCreation || ''}
                        onChange={(e) => handleChange('epochOfCreation', e.target.value as Epoch)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">Select...</option>
                        {epochs.map(epoch => (
                          <option key={epoch} value={epoch}>{epoch}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Object Classification"
                required
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Object Type <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.objectType || ''}
                      onChange={(e) => handleChange('objectType', e.target.value as ObjectType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select type...</option>
                      {objectTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre/Form Terms
                    </label>
                    <input
                      type="text"
                      value={formData.genre?.join(', ')}
                      onChange={(e) => handleArrayInput('genre', e.target.value)}
                      placeholder="Comma-separated terms"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Language and Subjects"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language(s)
                    </label>
                    <input
                      type="text"
                      value={formData.language?.join(', ')}
                      onChange={(e) => handleArrayInput('language', e.target.value)}
                      placeholder="e.g., Latin, English, French (comma-separated)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Headings
                    </label>
                    <textarea
                      value={formData.subjects?.join('; ')}
                      onChange={(e) => handleArrayInput('subjects', e.target.value)}
                      rows={2}
                      placeholder="Subject headings (semicolon-separated)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </FormSection>
            </div>
          )}

          {/* PHYSICAL DESCRIPTION TAB */}
          {activeTab === 'description' && (
            <div className="space-y-6">
              <FormSection
                title="Physical Description"
                standard="DCRMR Chapter 5"
                required
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Extent of Manifestation <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.extent}
                      onChange={(e) => handleChange('extent', e.target.value)}
                      placeholder="e.g., '[8], 234, [2] pages', '2 volumes'"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      value={formData.dimensions}
                      onChange={(e) => handleChange('dimensions', e.target.value)}
                      placeholder="e.g., '22 cm (8vo)', '35 cm (fol.)'"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base Material
                      </label>
                      <input
                        type="text"
                        value={formData.baseMaterial}
                        onChange={(e) => handleChange('baseMaterial', e.target.value)}
                        placeholder="e.g., paper, vellum, parchment"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Applied Material
                      </label>
                      <input
                        type="text"
                        value={formData.appliedMaterial}
                        onChange={(e) => handleChange('appliedMaterial', e.target.value)}
                        placeholder="e.g., ink, gold leaf, pigments"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Production Method
                      </label>
                      <input
                        type="text"
                        value={formData.productionMethod}
                        onChange={(e) => handleChange('productionMethod', e.target.value)}
                        placeholder="e.g., letterpress, woodblock"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Notes on Physical Description"
                standard="DCRMR Chapters 7-9"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note on Physical Description
                    </label>
                    <textarea
                      value={formData.noteOnPhysicalDescription}
                      onChange={(e) => handleChange('noteOnPhysicalDescription', e.target.value)}
                      rows={3}
                      placeholder="Illustrations, watermarks, paper quality, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note on Binding
                    </label>
                    <textarea
                      value={formData.noteOnBinding}
                      onChange={(e) => handleChange('noteOnBinding', e.target.value)}
                      rows={3}
                      placeholder="Description of binding, binder, rebinding history, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note on Condition
                    </label>
                    <textarea
                      value={formData.noteOnCondition}
                      onChange={(e) => handleChange('noteOnCondition', e.target.value)}
                      rows={3}
                      placeholder="Current condition, damage, repairs, conservation, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note on Provenance
                    </label>
                    <textarea
                      value={formData.noteOnProvenance}
                      onChange={(e) => handleChange('noteOnProvenance', e.target.value)}
                      rows={3}
                      placeholder="Ownership marks, inscriptions, bookplates, stamps, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note on Custodial History
                    </label>
                    <textarea
                      value={formData.noteOnCustodialHistory}
                      onChange={(e) => handleChange('noteOnCustodialHistory', e.target.value)}
                      rows={3}
                      placeholder="History of ownership, acquisition, transfers, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </FormSection>
            </div>
          )}

          {/* CREATORS TAB */}
          {activeTab === 'creators' && (
            <div className="space-y-6">
              <FormSection
                title="Creators and Contributors"
                description="Link to authority records for creators"
              >
                <div className="space-y-4">
                  {formData.creators && formData.creators.length > 0 ? (
                    formData.creators.map((creator, index) => (
                      <div key={index} className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Creator ID/Name
                            </label>
                            <input
                              type="text"
                              value={creator.creatorId}
                              onChange={(e) => updateCreator(index, 'creatorId', e.target.value)}
                              placeholder="Authority record ID"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Role
                            </label>
                            <select
                              value={creator.role}
                              onChange={(e) => updateCreator(index, 'role', e.target.value as CreatorRole)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                            >
                              {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Attribution (as appears)
                            </label>
                            <input
                              type="text"
                              value={creator.attribution}
                              onChange={(e) => updateCreator(index, 'attribution', e.target.value)}
                              placeholder="Name as it appears"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => removeCreator(index)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove Creator
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No creators added yet</p>
                  )}

                  <button
                    onClick={addCreator}
                    className="w-full px-4 py-2 border-2 border-dashed border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    + Add Creator
                  </button>
                </div>
              </FormSection>
            </div>
          )}

          {/* LOCATION TAB */}
          {activeTab === 'location' && (
            <div className="space-y-6">
              <FormSection
                title="Location of Creation"
                description="Where the item was created or printed"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.locationOfCreation?.country}
                      onChange={(e) => handleChange('locationOfCreation', {
                        ...formData.locationOfCreation,
                        country: e.target.value
                      })}
                      placeholder="Country of creation"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Historical Country Name
                    </label>
                    <input
                      type="text"
                      value={formData.locationOfCreation?.countryHistoricalName}
                      onChange={(e) => handleChange('locationOfCreation', {
                        ...formData.locationOfCreation,
                        countryHistoricalName: e.target.value
                      })}
                      placeholder="e.g., Holy Roman Empire"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.locationOfCreation?.city}
                      onChange={(e) => handleChange('locationOfCreation', {
                        ...formData.locationOfCreation,
                        city: e.target.value
                      })}
                      placeholder="City of creation"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Historical City Name
                    </label>
                    <input
                      type="text"
                      value={formData.locationOfCreation?.cityHistoricalName}
                      onChange={(e) => handleChange('locationOfCreation', {
                        ...formData.locationOfCreation,
                        cityHistoricalName: e.target.value
                      })}
                      placeholder="e.g., Constantinople"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Current Physical Location"
                description="Where the item is currently held"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institution Name
                    </label>
                    <input
                      type="text"
                      value={formData.currentPhysicalLocation?.institutionName}
                      onChange={(e) => handleChange('currentPhysicalLocation', {
                        ...formData.currentPhysicalLocation,
                        institutionName: e.target.value
                      })}
                      placeholder="Library, museum, or archive name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.currentPhysicalLocation?.city}
                      onChange={(e) => handleChange('currentPhysicalLocation', {
                        ...formData.currentPhysicalLocation,
                        city: e.target.value
                      })}
                      placeholder="City"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.currentPhysicalLocation?.country}
                      onChange={(e) => handleChange('currentPhysicalLocation', {
                        ...formData.currentPhysicalLocation,
                        country: e.target.value
                      })}
                      placeholder="Country"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Local Call Number
                    </label>
                    <input
                      type="text"
                      value={formData.localCallNumber}
                      onChange={(e) => handleChange('localCallNumber', e.target.value)}
                      placeholder="Shelf mark or call number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </FormSection>
            </div>
          )}

          {/* Continue in next part due to length... */}
          {/* ARTISTIC TAB */}
          {activeTab === 'artistic' && (
            <div className="space-y-6">
              <FormSection
                title="Artistic and Production Details"
                description="Detailed artistic characteristics"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Artistic Style(s)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {artisticStyles.map(style => (
                        <label key={style} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.artisticStyle?.includes(style)}
                            onChange={(e) => {
                              const current = formData.artisticStyle || [];
                              handleChange(
                                'artisticStyle',
                                e.target.checked
                                  ? [...current, style]
                                  : current.filter(s => s !== style)
                              );
                            }}
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-gray-700">{style}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School of Creation
                    </label>
                    <input
                      type="text"
                      value={formData.schoolOfCreation}
                      onChange={(e) => handleChange('schoolOfCreation', e.target.value)}
                      placeholder="Monastery, printing house, atelier, workshop"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Typography Details
                    </label>
                    <textarea
                      value={formData.typographyDetails}
                      onChange={(e) => handleChange('typographyDetails', e.target.value)}
                      rows={3}
                      placeholder="Font types, sizes, characteristics..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Script Style
                    </label>
                    <input
                      type="text"
                      value={formData.scriptStyle}
                      onChange={(e) => handleChange('scriptStyle', e.target.value)}
                      placeholder="e.g., Gothic textura, Carolingian minuscule"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Watermarks
                      </label>
                      <input
                        type="text"
                        value={formData.watermarks}
                        onChange={(e) => handleChange('watermarks', e.target.value)}
                        placeholder="Description of watermarks"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Decorations
                      </label>
                      <input
                        type="text"
                        value={formData.decorations}
                        onChange={(e) => handleChange('decorations', e.target.value)}
                        placeholder="Illuminations, borders, initials"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Folio Information
                      </label>
                      <input
                        type="text"
                        value={formData.folioInformation}
                        onChange={(e) => handleChange('folioInformation', e.target.value)}
                        placeholder="Folio numbering, structure"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Layout Description
                    </label>
                    <textarea
                      value={formData.layoutDescription}
                      onChange={(e) => handleChange('layoutDescription', e.target.value)}
                      rows={3}
                      placeholder="Columns, margins, mise-en-page..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Production Techniques (Detailed)
                    </label>
                    <textarea
                      value={formData.productionTechniquesDetailed}
                      onChange={(e) => handleChange('productionTechniquesDetailed', e.target.value)}
                      rows={4}
                      placeholder="Detailed description of production methods, techniques, materials..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </FormSection>
            </div>
          )}

          {/* COLLECTION TAB */}
          {activeTab === 'collection' && (
            <div className="space-y-6">
              <FormSection
                title="Collection Context"
                description="Link to collection and collector records"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Collection ID
                      </label>
                      <input
                        type="text"
                        value={formData.collectionId}
                        onChange={(e) => handleChange('collectionId', e.target.value)}
                        placeholder="Link to collection record"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Collection Name
                      </label>
                      <input
                        type="text"
                        value={formData.collectionName}
                        onChange={(e) => handleChange('collectionName', e.target.value)}
                        placeholder="Name of collection"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Collector ID
                      </label>
                      <input
                        type="text"
                        value={formData.collectorId}
                        onChange={(e) => handleChange('collectorId', e.target.value)}
                        placeholder="Link to collector authority record"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Accession Number
                      </label>
                      <input
                        type="text"
                        value={formData.accessionNumber}
                        onChange={(e) => handleChange('accessionNumber', e.target.value)}
                        placeholder="Institutional accession number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Acquisition Date
                      </label>
                      <input
                        type="text"
                        value={formData.acquisitionDate}
                        onChange={(e) => handleChange('acquisitionDate', e.target.value)}
                        placeholder="YYYY-MM-DD"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Identifiers (ISBN/ISSN/Fingerprint)
                      </label>
                      <input
                        type="text"
                        value={formData.fingerprint || formData.isbnIssn}
                        onChange={(e) => handleChange('fingerprint', e.target.value)}
                        placeholder="Bibliographic identifiers"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </FormSection>
            </div>
          )}

          {/* CURATORIAL TAB */}
          {activeTab === 'curatorial' && (
            <div className="space-y-6">
              <FormSection
                title="Curatorial Narrative"
                description="Interpretive content about the item"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Curatorial Narrative
                  </label>
                  <textarea
                    value={formData.curatorialNarrative}
                    onChange={(e) => handleChange('curatorialNarrative', e.target.value)}
                    rows={10}
                    placeholder="Tell the story of this item: its significance, context, unique features, and why it matters..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 font-serif"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This narrative will be displayed prominently to engage visitors
                  </p>
                </div>
              </FormSection>

              <FormSection
                title="Bibliography and Sources"
                description="Research sources and references"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bibliography
                  </label>
                  <textarea
                    value={formData.bibliography?.join('\n')}
                    onChange={(e) => handleChange('bibliography', e.target.value.split('\n').filter(Boolean))}
                    rows={6}
                    placeholder="Bibliographic references (one per line)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 font-mono text-sm"
                  />
                </div>
              </FormSection>

              <FormSection
                title="Module Linking"
                description="Connect to educational content and tours"
                collapsible
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Linked Educational Content (IDs)
                    </label>
                    <input
                      type="text"
                      value={formData.linkedEducationalContent?.join(', ')}
                      onChange={(e) => handleArrayInput('linkedEducationalContent', e.target.value)}
                      placeholder="Comma-separated IDs of lectures, courses"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Linked Artistic Tours (IDs)
                    </label>
                    <input
                      type="text"
                      value={formData.linkedArtisticTours?.join(', ')}
                      onChange={(e) => handleArrayInput('linkedArtisticTours', e.target.value)}
                      placeholder="Comma-separated IDs of virtual tours"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Linked Research Articles (IDs)
                    </label>
                    <input
                      type="text"
                      value={formData.linkedResearchArticles?.join(', ')}
                      onChange={(e) => handleArrayInput('linkedResearchArticles', e.target.value)}
                      placeholder="Comma-separated IDs of research articles"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Related Items (IDs)
                    </label>
                    <input
                      type="text"
                      value={formData.relatedItems?.join(', ')}
                      onChange={(e) => handleArrayInput('relatedItems', e.target.value)}
                      placeholder="Comma-separated IDs of related catalog items"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </FormSection>
            </div>
          )}

          {/* IMAGES TAB */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              <FormSection
                title="Images and Media"
                description="Upload visual documentation following Dublin Core & VRA Core"
              >
             <FileUploader
  accept="image/*"
  multiple={true}
  maxFiles={20}
  onFilesUploaded={(files) => {
    console.log('📥 Files uploaded with Cloudinary data:', files);
    
    const newImages = files.map((f, i) => ({
      imageId: f.id,
      cloudinaryPublicId: f.cloudinaryPublicId || '',
      cloudinaryUrl: f.url,
      thumbnailUrl: f.thumbnailUrl || f.url,
      url: f.url,
      caption: '',
      order: (formData.images?.length || 0) + i,
      isPrimary: i === 0 && (!formData.images || formData.images.length === 0),
      width: f.width,
      height: f.height,
      fileName: f.file.name,
      fileSize: f.file.size,
      mimeType: f.file.type,
      uploadDate: new Date().toISOString()
    }));
    
    console.log('💾 Saving images to form:', newImages);
    
    handleChange('images', [...(formData.images || []), ...newImages]);
  }}
  label="Upload Book Images"
  description="JPG, PNG, WebP - Max 20 files, 10MB each"
/>

                {formData.images && formData.images.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Attached Images ({formData.images.length})
                    </h3>
                    <div className="space-y-2">
                      {(formData.images || []).map((img, index) => (
                        <div key={img.imageId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-mono text-gray-600">
                            {img.imageId}
                          </span>
                          <input
                            type="text"
                            value={img.caption}
                            onChange={(e) => {
                              const updated = [...(formData.images || [])];
                              updated[index].caption = e.target.value;
                              handleChange('images', updated);
                            }}
                            placeholder="Add caption..."
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                          <label className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={img.isPrimary}
                              onChange={(e) => {
                                const updated = (formData.images || []).map((im, i) => ({
                                  ...im,
                                  isPrimary: i === index ? e.target.checked : false
                                }));
                                handleChange('images', updated);
                              }}
                              className="rounded border-gray-300 text-amber-600"
                            />
                            Primary
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </FormSection>

              <FormSection
                title="Video and 3D Content"
                description="Links to video lectures and 3D scans"
                collapsible
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video URLs (JSON format)
                    </label>
                    <textarea
                      rows={4}
                      placeholder='[{"id":"vid1","type":"video","title":"...","url":"https://..."}]'
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      3D Scan URL
                    </label>
                    <input
                      type="text"
                      value={formData.scan3D}
                      onChange={(e) => handleChange('scan3D', e.target.value)}
                      placeholder="URL to 3D model viewer"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </FormSection>
            </div>
          )}

          {/* ACCESS CONTROL TAB */}
          {activeTab === 'access' && (
            <div className="space-y-6">
              <FormSection
                title="Access Control and Monetization"
                description="Control visibility and access tiers"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visibility Level
                      </label>
                      <select
                        value={formData.visibilityLevel}
                        onChange={(e) => handleChange('visibilityLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="public">Public - Full access</option>
                        <option value="preview">Preview - Limited access</option>
                        <option value="restricted">Restricted - No public access</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Access Tier
                      </label>
                      <select
                        value={formData.accessTier}
                        onChange={(e) => handleChange('accessTier', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="free">Free Access</option>
                        <option value="subscription">Subscription Required</option>
                        <option value="purchase">Single Purchase</option>
                        <option value="research">Research Request Only</option>
                      </select>
                    </div>
                  </div>

                  {formData.accessTier === 'purchase' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Access Control Features:</strong>
                    </p>
                    <ul className="mt-2 text-xs text-blue-700 space-y-1 list-disc list-inside">
                      <li>Preview mode shows blurred full descriptions</li>
                      <li>Pages cannot be printed or saved as PDF</li>
                      <li>Videos cannot be downloaded</li>
                      <li>Screen recording protection enabled</li>
                      <li>Share and embed buttons available</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Record Status
                    </label>
                    <select
                      value={formData.recordStatus}
                      onChange={(e) => handleChange('recordStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="review">Under Review</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </FormSection>
            </div>
          )}
 </div>
 {/* MARC TAB */}
{activeTab === 'marc' && (
  <MARCExportButton 
    record={formData} 
    recordId={formData.id}
  />
)}
{/* viewer TAB */}
{activeTab === 'viewer' && (
  <div className="space-y-6">
    <FormSection 
      title="IIIF Viewer" 
      description="Interactive image viewer with deep zoom"
    >
      {formData.images && formData.images.length > 0 ? (
        formData.images.some(img => img.cloudinaryUrl || img.url) ? (
          <SimpleIIIFViewer
            images={(formData.images || [])
              .filter(img => img.cloudinaryUrl || img.url)
              .map(img => ({
                url: img.cloudinaryUrl || img.url || '',
                caption: img.caption,
                width: img.width,
                height: img.height
              }))}
            title={formData.titleProper || 'Catalog Item'}
          />
        ) : (
          <div className="p-8 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center">
            <BookOpen className="mx-auto mb-4 text-yellow-600" size={48} />
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Images Need Cloudinary URLs
            </h3>
            <p className="text-yellow-700 mb-4">
              Your {formData.images?.length || 0} image(s) are attached but don't have Cloudinary URLs yet.
            </p>
            <p className="text-sm text-yellow-600">
              Delete them and re-upload to generate Cloudinary URLs.
            </p>
          </div>
        )
      ) : (
        <div className="p-8 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
          <Eye className="mx-auto mb-4 text-blue-600" size={48} />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            No Images Yet
          </h3>
          <p className="text-blue-700">
            Upload images in the Images & Media tab to use the viewer.
          </p>
        </div>
      )}
    </FormSection>
  </div>
)}

       

        {/* Form Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow"
          >
            <FileDown size={18} />
            Export JSON
          </button>
          <button
            onClick={() => {
              setFormData({
                recordStatus: 'draft',
                titleProper: '',
                visibilityLevel: 'public',
                accessTier: 'free'
              });
              setCompleteness(0);
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium shadow"
          >
            <RotateCcw size={18} />
            Reset Form
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-lg"
          >
            <Save size={18} />
            Save Catalog Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatalogItemForm;
