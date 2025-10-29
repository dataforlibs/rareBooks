import React, { useState } from 'react';
import { X, Copy, Check, Save, AlertCircle } from 'lucide-react';

interface OCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedText: string;
  confidence: number;
  onSave?: (text: string) => void;
  isProcessing?: boolean;
  error?: string | null;
}

const OCRModal: React.FC<OCRModalProps> = ({
  isOpen,
  onClose,
  extractedText,
  confidence,
  onSave,
  isProcessing = false,
  error = null
}) => {
  const [editedText, setEditedText] = useState(extractedText);
  const [copied, setCopied] = useState(false);

  // Update edited text when extracted text changes
  React.useEffect(() => {
    setEditedText(extractedText);
  }, [extractedText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedText);
      onClose();
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (conf >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isProcessing ? 'Extracting Text...' : 'Extracted Text'}
              </h2>
              {!isProcessing && !error && (
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded border ${getConfidenceColor(confidence)}`}>
                    Confidence: {confidence.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">
                    {editedText.length} characters
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-amber-200 rounded-full animate-ping"></div>
                <div className="absolute inset-0 border-4 border-amber-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <p className="text-lg text-gray-700 animate-pulse">
                Analyzing image with OCR...
              </p>
              <p className="text-sm text-gray-500">
                This may take 5-15 seconds depending on image size
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <AlertCircle className="text-red-500" size={48} />
              <p className="text-lg font-semibold text-red-700">OCR Error</p>
              <p className="text-sm text-red-600 text-center max-w-md">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> The text below is editable. Review and correct any errors before saving to your catalog.
                </p>
              </div>

              {/* Editable Text Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extracted Text (editable)
                </label>
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm leading-relaxed focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Extracted text will appear here..."
                />
              </div>

              {/* Quality Notes */}
              {confidence < 80 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Note:</strong> OCR confidence is below 80%. 
                    Please review the extracted text carefully and make corrections as needed.
                    Historical texts often require manual verification.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isProcessing && !error && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Review and edit the text before saving
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy to Clipboard
                  </>
                )}
              </button>
              {onSave && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  Save to Catalog
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OCRModal;
