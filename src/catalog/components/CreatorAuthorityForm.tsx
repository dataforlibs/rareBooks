import React, { useState } from 'react';
import { Save, RotateCcw, User, FileDown } from 'lucide-react';
import FormSection from './shared/FormSection';
import FileUploader from './shared/FileUploader';
import JSONImporter from './shared/JSONImporter';
import { CreatorAuthority, CreatorRole, ImportResult } from '../types';
import { validateCreatorAuthority, exampleCreatorAuthorityJSON } from '../schemas';

const CreatorAuthorityForm: React.FC = () => {
  const [formData, setFormData] = useState<Partial<CreatorAuthority>>({
    recordType: 'authority',
    recordStatus: 'draft',
    preferredName: '',
    nameVariants: [],
    datesOfActivity: '',
    birthDate: '',
    deathDate: '',
    primaryRole: undefined,
    additionalRoles: [],
    nationality: [],
    placeOfBirth: '',
    placeOfDeath: '',
    biography: '',
    schoolsAffiliation: [],
    workshopsAffiliation: [],
    patronage: [],
    viafId: '',
    lcnafId: '',
    wikidata: '',
    relatedCreators: [],
    worksCreated: [],
    portraitImage: undefined,
    additionalImages: [],
    notes: '',
    sources: []
  });

  const [savedMessage, setSavedMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showImporter, setShowImporter] = useState(false);

  const roles: CreatorRole[] = [
    'Author', 'Writer', 'Scribe', 'Copyist', 'Artist', 'Illuminator',
    'Illustrator', 'Printer', 'Publisher', 'Binder', 'Engraver',
    'Etcher', 'Cartographer', 'Editor', 'Translator', 'Patron',
    'Former Owner', 'Other'
  ];

  const handleChange = (field: keyof CreatorAuthority, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleArrayInput = (field: keyof CreatorAuthority, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean);
    handleChange(field, array);
  };

  const validateForm = (): boolean => {
    const validation = validateCreatorAuthority(formData);
    if (!validation.isValid) {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach(error => {
        const field = error.split(' ')[0].toLowerCase();
        newErrors[field] = error;
      });
      setErrors(newErrors);
    }
    return validation.isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      setSavedMessage('❌ Please fill in all required fields');
      setTimeout(() => setSavedMessage(''), 3000);
      return;
    }

    const creatorRecord: CreatorAuthority = {
      ...formData as CreatorAuthority,
      id: formData.id || `creator-${Date.now()}`,
      createdDate: formData.createdDate || new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    console.log('Would save to database:', creatorRecord);
    setSavedMessage('✓ Creator record saved successfully!');
    setTimeout(() => setSavedMessage(''), 4000);
  };

  const handleReset = () => {
    setFormData({
      recordType: 'authority',
      recordStatus: 'draft',
      preferredName: '',
      primaryRole: undefined
    });
    setErrors({});
    setSavedMessage('');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creator-${formData.preferredName?.replace(/\s+/g, '-') || 'record'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (data: any[]): Promise<ImportResult> => {
    // Simulate import - in real app, this would save to database
    return {
      success: true,
      recordsImported: data.length,
      recordsFailed: 0,
      errors: [],
      importedIds: data.map((_, i) => `creator-${Date.now()}-${i}`)
    };
  };

  const handleImageUpload = (files: { id: string; file: File; url: string }[]) => {
    if (files.length > 0 && !formData.portraitImage) {
      handleChange('portraitImage', {
        imageId: files[0].id,
        caption: 'Portrait',
        order: 0,
        isPrimary: true
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <User className="text-amber-900" size={40} />
            <h1 className="text-4xl font-bold text-amber-900">Creator Authority Record</h1>
          </div>
          <p className="text-amber-700 font-medium">Following VIAF/LCNAF Authority Standards</p>
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

        <div className="space-y-6">
          {/* JSON Import Section */}
          {showImporter && (
            <JSONImporter
              entityType="creator"
              onImport={handleImport}
              validateFn={validateCreatorAuthority}
              exampleJSON={exampleCreatorAuthorityJSON}
            />
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setShowImporter(!showImporter)}
              className="text-sm text-amber-700 hover:text-amber-900 underline"
            >
              {showImporter ? 'Hide' : 'Show'} JSON Import
            </button>
          </div>

          {/* Basic Information */}
          <FormSection
            title="Basic Information"
            description="Core identification for the creator"
            standard="Authority Control Standards"
            required
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.preferredName}
                  onChange={(e) => handleChange('preferredName', e.target.value)}
                  placeholder="Last name, First name (birth-death)"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 ${
                    errors.preferredname ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.preferredname && (
                  <p className="text-red-600 text-xs mt-1">{errors.preferredname}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name Variants
                </label>
                <input
                  type="text"
                  value={formData.nameVariants?.join(', ')}
                  onChange={(e) => handleArrayInput('nameVariants', e.target.value)}
                  placeholder="Alternative names, separated by commas"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date
                  </label>
                  <input
                    type="text"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    placeholder="YYYY or YYYY-MM-DD"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Death Date
                  </label>
                  <input
                    type="text"
                    value={formData.deathDate}
                    onChange={(e) => handleChange('deathDate', e.target.value)}
                    placeholder="YYYY or YYYY-MM-DD"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dates of Activity
                  </label>
                  <input
                    type="text"
                    value={formData.datesOfActivity}
                    onChange={(e) => handleChange('datesOfActivity', e.target.value)}
                    placeholder="e.g., 1450-1520"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </FormSection>

          {/* Roles */}
          <FormSection
            title="Roles and Occupation"
            description="Primary and additional roles"
            required
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Role <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.primaryRole || ''}
                  onChange={(e) => handleChange('primaryRole', e.target.value as CreatorRole)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 ${
                    errors.primaryrole ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select primary role...</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {errors.primaryrole && (
                  <p className="text-red-600 text-xs mt-1">{errors.primaryrole}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Roles
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {roles.filter(r => r !== formData.primaryRole).map(role => (
                    <label key={role} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.additionalRoles?.includes(role)}
                        onChange={(e) => {
                          const current = formData.additionalRoles || [];
                          handleChange(
                            'additionalRoles',
                            e.target.checked
                              ? [...current, role]
                              : current.filter(r => r !== role)
                          );
                        }}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </FormSection>

          {/* Geographic & Biographical */}
          <FormSection
            title="Geographic and Biographical Information"
            collapsible
            defaultOpen={true}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality?.join(', ')}
                  onChange={(e) => handleArrayInput('nationality', e.target.value)}
                  placeholder="e.g., German, Italian (separated by commas)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    value={formData.placeOfBirth}
                    onChange={(e) => handleChange('placeOfBirth', e.target.value)}
                    placeholder="City, Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Place of Death
                  </label>
                  <input
                    type="text"
                    value={formData.placeOfDeath}
                    onChange={(e) => handleChange('placeOfDeath', e.target.value)}
                    placeholder="City, Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biography
                </label>
                <textarea
                  value={formData.biography}
                  onChange={(e) => handleChange('biography', e.target.value)}
                  rows={6}
                  placeholder="Biographical narrative..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </FormSection>

          {/* Professional Context */}
          <FormSection
            title="Professional Context"
            description="Affiliations and professional relationships"
            collapsible
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schools Affiliation
                </label>
                <input
                  type="text"
                  value={formData.schoolsAffiliation?.join(', ')}
                  onChange={(e) => handleArrayInput('schoolsAffiliation', e.target.value)}
                  placeholder="Art schools, monasteries, universities (separated by commas)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workshops Affiliation
                </label>
                <input
                  type="text"
                  value={formData.workshopsAffiliation?.join(', ')}
                  onChange={(e) => handleArrayInput('workshopsAffiliation', e.target.value)}
                  placeholder="Printing houses, binderies, ateliers (separated by commas)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patronage
                </label>
                <input
                  type="text"
                  value={formData.patronage?.join(', ')}
                  onChange={(e) => handleArrayInput('patronage', e.target.value)}
                  placeholder="Patrons or commissioners (separated by commas)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </FormSection>

          {/* External Identifiers */}
          <FormSection
            title="External Identifiers"
            description="Links to authority files and databases"
            collapsible
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VIAF ID
                </label>
                <input
                  type="text"
                  value={formData.viafId}
                  onChange={(e) => handleChange('viafId', e.target.value)}
                  placeholder="Virtual International Authority File ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LCNAF ID
                </label>
                <input
                  type="text"
                  value={formData.lcnafId}
                  onChange={(e) => handleChange('lcnafId', e.target.value)}
                  placeholder="Library of Congress Name Authority File"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wikidata ID
                </label>
                <input
                  type="text"
                  value={formData.wikidata}
                  onChange={(e) => handleChange('wikidata', e.target.value)}
                  placeholder="Wikidata identifier"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </FormSection>

          {/* Images */}
          <FormSection
            title="Portrait and Images"
            description="Upload portrait and related images"
            collapsible
          >
            <FileUploader
              accept="image/*"
              multiple={true}
              maxFiles={5}
              onFilesUploaded={handleImageUpload}
              label="Upload Portrait"
              description="Portrait of the creator or related imagery"
            />
          </FormSection>

          {/* Notes and Sources */}
          <FormSection
            title="Notes and Sources"
            collapsible
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={4}
                  placeholder="Additional notes or observations..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sources
                </label>
                <textarea
                  value={formData.sources?.join('\n')}
                  onChange={(e) => handleChange('sources', e.target.value.split('\n').filter(Boolean))}
                  rows={4}
                  placeholder="Bibliographic sources (one per line)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </FormSection>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow"
            >
              <FileDown size={18} />
              Export JSON
            </button>
            <button
              onClick={handleReset}
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
              Save Creator Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorAuthorityForm;
