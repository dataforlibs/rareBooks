import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Eye, FileText } from 'lucide-react';
import OCRModal from './OCRModal';
import { ocrService, OCRResult } from '../../services/OCRService';

interface SimpleIIIFViewerProps {
  images: Array<{
    url: string;
    caption?: string;
    width?: number;
    height?: number;
  }>;
  title: string;
  onTranscriptionSave?: (imageIndex: number, text: string) => void;
}

const SimpleIIIFViewer: React.FC<SimpleIIIFViewerProps> = ({ 
  images, 
  title,
  onTranscriptionSave 
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const osdViewerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // OCR State
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

  useEffect(() => {
    // Check if OpenSeadragon is available
    const checkOSD = setInterval(() => {
      if ((window as any).OpenSeadragon) {
        setIsReady(true);
        clearInterval(checkOSD);
      }
    }, 100);

    setTimeout(() => {
      if (!(window as any).OpenSeadragon) {
        clearInterval(checkOSD);
        setError('OpenSeadragon library not loaded');
      }
    }, 5000);

    return () => clearInterval(checkOSD);
  }, []);

  useEffect(() => {
    if (!isReady || !viewerRef.current || images.length === 0) return;

    try {
      if (osdViewerRef.current) {
        osdViewerRef.current.destroy();
        osdViewerRef.current = null;
      }

      const currentImage = images[currentIndex];
      
      console.log('📊 Initializing OpenSeadragon for:', currentImage.url);

      osdViewerRef.current = (window as any).OpenSeadragon({
        element: viewerRef.current,
        prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
        tileSources: {
          type: 'image',
          url: currentImage.url,
          buildPyramid: false
        },
        showNavigator: true,
        navigatorPosition: 'BOTTOM_RIGHT',
        showRotationControl: true,
        showHomeControl: true,
        showFullPageControl: true,
        showZoomControl: true,
        minZoomImageRatio: 0.5,
        maxZoomPixelRatio: 3,
        visibilityRatio: 0.5,
        constrainDuringPan: false,
        animationTime: 1.2,
        blendTime: 0.5,
        defaultZoomLevel: 0,
        gestureSettingsMouse: {
          clickToZoom: false,
          dblClickToZoom: true
        }
      });

      console.log('✅ OpenSeadragon viewer initialized successfully');

    } catch (err) {
      console.error('❌ Error initializing viewer:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize viewer');
    }

    return () => {
      if (osdViewerRef.current) {
        try {
          osdViewerRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying viewer:', e);
        }
        osdViewerRef.current = null;
      }
    };
  }, [isReady, images, currentIndex]);

  const goToImage = (index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  };

  const handleExtractText = async () => {
    setShowOCRModal(true);
    setIsProcessingOCR(true);
    setOcrError(null);
    setOcrResult(null);

    try {
      const currentImage = images[currentIndex];
      console.log('🔍 Starting OCR for:', currentImage.url);

      const result = await ocrService.extractText(currentImage.url);
      
      setOcrResult(result);
      setIsProcessingOCR(false);
      
      console.log('✅ OCR completed successfully');
      console.log('Extracted', result.text.length, 'characters');
      console.log('Confidence:', result.confidence.toFixed(1) + '%');

    } catch (err) {
      console.error('❌ OCR failed:', err);
      setOcrError(err instanceof Error ? err.message : 'Failed to extract text');
      setIsProcessingOCR(false);
    }
  };

  const handleSaveTranscription = (text: string) => {
    if (onTranscriptionSave) {
      onTranscriptionSave(currentIndex, text);
      console.log('💾 Transcription saved for image', currentIndex);
    }
  };

  if (images.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <Eye className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600">No images to display</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-red-300 rounded-lg p-8 text-center bg-red-50">
        <p className="text-red-600 font-semibold mb-2">Viewer Error</p>
        <p className="text-sm text-red-500">{error}</p>
        <p className="text-xs text-gray-500 mt-4">
          Make sure OpenSeadragon is loaded in index.html
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Bar with OCR Button */}
      <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
              <BookOpen size={20} />
              {title}
            </h3>
            <p className="text-sm text-amber-700">
              Image {currentIndex + 1} of {images.length}
              {images[currentIndex].caption && `: ${images[currentIndex].caption}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExtractText}
              disabled={isProcessingOCR}
              className="px-4 py-2 bg-white border-2 border-amber-600 text-amber-900 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-2 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText size={18} />
              Extract Text (OCR)
            </button>
            <div className="text-sm text-amber-800 text-right">
              <p>✓ Deep zoom enabled</p>
              <p>✓ Click and drag to pan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Viewer Container */}
      {isReady ? (
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg">
          <div 
            ref={viewerRef}
            className="w-full bg-gray-900"
            style={{ height: '700px' }}
          />
        </div>
      ) : (
        <div className="border-2 border-gray-200 rounded-lg p-12 text-center">
          <div className="animate-pulse">
            <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600">Loading viewer...</p>
          </div>
        </div>
      )}

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-3">Pages</p>
          <div className="grid grid-cols-6 gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => goToImage(idx)}
                className={`
                  relative aspect-square rounded overflow-hidden border-2 transition-all
                  ${idx === currentIndex 
                    ? 'border-amber-500 ring-2 ring-amber-300' 
                    : 'border-gray-300 hover:border-amber-400'
                  }
                `}
              >
                <img
                  src={img.url}
                  alt={img.caption || `Page ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 text-center">
                  {idx + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 mb-2">
          <strong>Viewer Controls:</strong>
        </p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Click and drag to pan around the image</li>
          <li>Double-click or use mouse wheel to zoom in/out</li>
          <li>Use the controls in the top-left for zoom, rotate, and fullscreen</li>
          <li>Click "Extract Text" to automatically transcribe visible text using OCR</li>
          {images.length > 1 && <li>Click thumbnails to switch between pages</li>}
        </ul>
      </div>

      {/* OCR Modal */}
      <OCRModal
        isOpen={showOCRModal}
        onClose={() => setShowOCRModal(false)}
        extractedText={ocrResult?.text || ''}
        confidence={ocrResult?.confidence || 0}
        onSave={onTranscriptionSave ? handleSaveTranscription : undefined}
        isProcessing={isProcessingOCR}
        error={ocrError}
      />
    </div>
  );
};

export default SimpleIIIFViewer;
