import React, { useState } from 'react';
import { MARCExporter } from '../../utils/MARCExporter';

interface MARCExportButtonProps {
  record: any; // Your catalog record type
  recordId?: string;
}

export const MARCExportButton: React.FC<MARCExportButtonProps> = ({ record, recordId }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [marcPreview, setMarcPreview] = useState('');
  const [exportFormat, setExportFormat] = useState<'marc' | 'marcxml' | 'readable'>('readable');

  const exporter = new MARCExporter();

  const handlePreview = () => {
    let preview = '';
    switch (exportFormat) {
      case 'marc':
        preview = 'Binary MARC format (use download to view)';
        break;
      case 'marcxml':
        preview = exporter.exportToMARCXML(record);
        break;
      case 'readable':
        preview = exporter.exportToMARCReadable(record);
        break;
    }
    setMarcPreview(preview);
    setShowPreview(true);
  };

  const handleDownload = () => {
    const filename = recordId ? `${recordId}` : 'catalog';
    
    switch (exportFormat) {
      case 'marc':
        exporter.downloadMARCFile(record, `${filename}.mrc`);
        break;
      case 'marcxml':
        exporter.downloadMARCXMLFile(record, `${filename}.xml`);
        break;
      case 'readable':
        const readableData = exporter.exportToMARCReadable(record);
        const blob = new Blob([readableData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.txt`;
        link.click();
        URL.revokeObjectURL(url);
        break;
    }
  };

  return (
    <div className="marc-export-container">
      <div className="export-controls">
        <h3>Export to MARC</h3>
        
        <div className="format-selector">
          <label>
            <input
              type="radio"
              value="readable"
              checked={exportFormat === 'readable'}
              onChange={(e) => setExportFormat(e.target.value as any)}
            />
            Human-Readable MARC
          </label>
          
          <label>
            <input
              type="radio"
              value="marc"
              checked={exportFormat === 'marc'}
              onChange={(e) => setExportFormat(e.target.value as any)}
            />
            MARC21 Binary (.mrc)
          </label>
          
          <label>
            <input
              type="radio"
              value="marcxml"
              checked={exportFormat === 'marcxml'}
              onChange={(e) => setExportFormat(e.target.value as any)}
            />
            MARCXML (.xml)
          </label>
        </div>

        <div className="action-buttons">
          <button onClick={handlePreview} className="btn-preview">
            Preview
          </button>
          <button onClick={handleDownload} className="btn-download">
            Download
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="marc-preview">
          <div className="preview-header">
            <h4>MARC Preview</h4>
            <button onClick={() => setShowPreview(false)} className="btn-close">
              ×
            </button>
          </div>
          <pre className="preview-content">{marcPreview}</pre>
        </div>
      )}

      <style>{`
        .marc-export-container {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          background: #f9f9f9;
        }

        .export-controls h3 {
          margin-top: 0;
          color: #333;
        }

        .format-selector {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 15px 0;
        }

        .format-selector label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .format-selector label:hover {
          background: #fff;
        }

        .format-selector input[type="radio"] {
          cursor: pointer;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .btn-preview,
        .btn-download {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-preview {
          background: #007bff;
          color: white;
        }

        .btn-preview:hover {
          background: #0056b3;
        }

        .btn-download {
          background: #28a745;
          color: white;
        }

        .btn-download:hover {
          background: #218838;
        }

        .marc-preview {
          margin-top: 20px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          border-bottom: 1px solid #ddd;
          background: #f5f5f5;
        }

        .preview-header h4 {
          margin: 0;
          font-size: 16px;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 30px;
          height: 30px;
          line-height: 1;
        }

        .btn-close:hover {
          color: #000;
        }

        .preview-content {
          padding: 15px;
          margin: 0;
          max-height: 400px;
          overflow-y: auto;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      `}</style>
    </div>
  );
};

export default MARCExportButton;
