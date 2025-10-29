import React, { useState, useRef } from 'react';
import { Upload, FileJson, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ImportResult, ValidationResult } from '../../types';

interface JSONImporterProps {
  entityType: 'catalogItem' | 'creator' | 'collection' | 'image';
  onImport: (data: any[]) => Promise<ImportResult>;
  validateFn: (data: any) => ValidationResult;
  exampleJSON?: any;
}

const JSONImporter: React.FC<JSONImporterProps> = ({ 
  entityType, 
  onImport, 
  validateFn,
  exampleJSON 
}) => {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [showExample, setShowExample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Handle both single object and array of objects
      const dataArray = Array.isArray(data) ? data : [data];
      
      // Validate all records
      const validations = dataArray.map(item => validateFn(item));
      setValidationResults(validations);
      
      // Check if any have errors
      const hasErrors = validations.some(v => !v.isValid);
      
      if (hasErrors) {
        setResult({
          success: false,
          recordsImported: 0,
          recordsFailed: dataArray.length,
          errors: validations.flatMap(v => v.errors),
          importedIds: []
        });
        return;
      }
      
      // Import if validation passed
      setImporting(true);
      const importResult = await onImport(dataArray);
      setResult(importResult);
      setImporting(false);
      
    } catch (error) {
      setResult({
        success: false,
        recordsImported: 0,
        recordsFailed: 1,
        errors: [`Invalid JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        importedIds: []
      });
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadExample = () => {
    if (!exampleJSON) return;
    
    const blob = new Blob([JSON.stringify(exampleJSON, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `example-${entityType}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const entityTypeLabels = {
    catalogItem: 'Catalog Item',
    creator: 'Creator/Authority',
    collection: 'Collection',
    image: 'Image Metadata'
  };

  return (
    <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 bg-amber-50">
      <div className="flex items-center gap-3 mb-4">
        <FileJson className="text-amber-600" size={24} />
        <h3 className="text-lg font-semibold text-amber-900">
          Import {entityTypeLabels[entityType]} from JSON
        </h3>
      </div>
      
      <p className="text-sm text-amber-700 mb-4">
        Upload a JSON file containing one or more {entityTypeLabels[entityType].toLowerCase()} records.
        The file will be validated before import.
      </p>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload size={18} />
          {importing ? 'Importing...' : 'Select JSON File'}
        </button>
        
        {exampleJSON && (
          <>
            <button
              onClick={downloadExample}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <FileJson size={18} />
              Download Example
            </button>
            
            <button
              onClick={() => setShowExample(!showExample)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
            >
              {showExample ? 'Hide' : 'Show'} Example Format
            </button>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {showExample && exampleJSON && (
        <div className="mb-4 p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-xs text-green-400 font-mono">
            {JSON.stringify(exampleJSON, null, 2)}
          </pre>
        </div>
      )}

      {/* Validation Results */}
      {validationResults.length > 0 && (
        <div className="space-y-2 mb-4">
          {validationResults.map((validation, index) => (
            <div key={index} className="p-3 bg-white rounded-lg border">
              <div className="flex items-start gap-2 mb-2">
                {validation.isValid ? (
                  <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                ) : (
                  <XCircle className="text-red-600 flex-shrink-0" size={18} />
                )}
                <span className="font-medium text-sm">
                  Record {index + 1}: {validation.isValid ? 'Valid' : 'Invalid'}
                </span>
              </div>
              
              {validation.errors.length > 0 && (
                <div className="ml-6 mb-2">
                  <p className="text-xs font-medium text-red-700 mb-1">Errors:</p>
                  <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
                    {validation.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validation.warnings.length > 0 && (
                <div className="ml-6">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="text-yellow-600" size={14} />
                    <p className="text-xs font-medium text-yellow-700">Warnings:</p>
                  </div>
                  <ul className="list-disc list-inside text-xs text-yellow-600 space-y-1">
                    {validation.warnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Import Result */}
      {result && (
        <div className={`p-4 rounded-lg border-2 ${
          result.success 
            ? 'bg-green-50 border-green-400' 
            : 'bg-red-50 border-red-400'
        }`}>
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            ) : (
              <XCircle className="text-red-600 flex-shrink-0" size={20} />
            )}
            <div className="flex-1">
              <p className={`font-semibold ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? 'Import Successful!' : 'Import Failed'}
              </p>
              <div className="mt-2 text-sm space-y-1">
                <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                  Records imported: {result.recordsImported}
                </p>
                {result.recordsFailed > 0 && (
                  <p className="text-red-700">
                    Records failed: {result.recordsFailed}
                  </p>
                )}
              </div>
              
              {result.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-red-700 mb-1">Errors:</p>
                  <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
                    {result.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {result.success && result.importedIds.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-green-700 mb-1">
                    Imported IDs:
                  </p>
                  <div className="text-xs text-green-600 font-mono bg-green-100 p-2 rounded">
                    {result.importedIds.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> JSON files should follow the schema for {entityTypeLabels[entityType].toLowerCase()} records. 
          You can import a single object or an array of objects. All records will be validated before import.
        </p>
      </div>
    </div>
  );
};

export default JSONImporter;
