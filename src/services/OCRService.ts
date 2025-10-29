import { createWorker } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
  }>;
}

export interface OCRProgress {
  status: string;
  progress: number;
}

class OCRService {
  private worker: any = null;

  async initialize(onProgress?: (progress: OCRProgress) => void): Promise<void> {
    if (this.worker) return;

    console.log('🔧 Initializing OCR worker...');
    
    try {
      this.worker = await createWorker('lat', 1, {
        logger: (m) => {
          if (onProgress) {
            onProgress({
              status: m.status,
              progress: m.progress || 0
            });
          }
          console.log('OCR Progress:', m);
        }
      });

      console.log('✅ OCR worker initialized');
    } catch (error) {
      console.error('❌ Failed to initialize OCR worker:', error);
      throw new Error('Failed to initialize OCR. Please check your internet connection.');
    }
  }

  async extractText(
    imageUrl: string,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<OCRResult> {
    try {
      // Initialize if not already done
      await this.initialize(onProgress);

      console.log('📖 Starting text extraction from:', imageUrl);

      // Perform OCR
      const { data } = await this.worker.recognize(imageUrl);

      console.log('✅ Text extraction complete');
      console.log('Confidence:', data.confidence);
      console.log('Text length:', data.text?.length || 0);

      return {
        text: data.text || '',
        confidence: data.confidence || 0,
        words: Array.isArray(data.words) 
          ? data.words.map((word: any) => ({
              text: word.text || '',
              confidence: word.confidence || 0
            }))
          : []
      };
    } catch (error) {
      console.error('❌ OCR extraction failed:', error);
      
      // Provide more helpful error messages
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          throw new Error('Failed to load image. Check that the URL is accessible.');
        }
        throw error;
      }
      
      throw new Error('Failed to extract text from image. Please try again.');
    }
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      try {
        await this.worker.terminate();
        this.worker = null;
        console.log('🛑 OCR worker terminated');
      } catch (error) {
        console.warn('⚠️ Error terminating worker:', error);
        this.worker = null;
      }
    }
  }
}

// Export singleton instance
export const ocrService = new OCRService();