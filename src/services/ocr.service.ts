import BaseService from './base.service';
import { handleError } from '../utils/error';
import { auditService } from './audit.service';
import { Product } from '../types/product';

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface OCRConfig {
  language: string;
  minConfidence: number;
  autoCorrect: boolean;
  validateData: boolean;
}

export interface ImportRule {
  codeFormat: string;
  defaultCategories: string[];
  defaultBrand: string;
  createCategories: boolean;
}

export interface ProductImportResult {
  success: boolean;
  products: Product[];
  errors: string[];
  stats: {
    total: number;
    successful: number;
    failed: number;
    confidence: number;
  };
}

export interface OCRStats {
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  averageConfidence: number;
  lastScanDate: string;
  commonErrors: Array<{
    error: string;
    count: number;
  }>;
}

class OCRService extends BaseService {
  private readonly basePath = '/ocr';
  private config: OCRConfig = {
    language: 'pt-BR',
    minConfidence: 80,
    autoCorrect: true,
    validateData: true,
  };

  private rules: ImportRule = {
    codeFormat: 'PROD-{NUMBER}',
    defaultCategories: [],
    defaultBrand: '',
    createCategories: true,
  };

  constructor() {
    super();
  }

  async scanImage(file: File): Promise<OCRResult[]> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await this.post(`${this.basePath}/scan`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await auditService.logAction(
        'import',
        'product',
        'ocr-scan',
        { fileName: file.name, results: response.length },
        'success'
      );

      return response;
    } catch (error: any) {
      await auditService.logAction(
        'import',
        'product',
        'ocr-scan',
        { fileName: file.name, error: error.message },
        'error'
      );
      handleError(error);
      throw error;
    }
  }

  async importProductsFromOCR(image: File): Promise<ProductImportResult> {
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('config', JSON.stringify(this.config));
      formData.append('rules', JSON.stringify(this.rules));

      const response = await this.post('/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await auditService.logAction(
        'import',
        'product',
        'ocr-import',
        {
          fileName: image.name,
          stats: response.stats
        },
        'success'
      );

      return response;
    } catch (error: any) {
      await auditService.logAction(
        'import',
        'product',
        'ocr-import',
        {
          fileName: image.name,
          error: error.message
        },
        'error'
      );
      handleError(error);
      throw error;
    }
  }

  async validateProductData(data: any): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    try {
      const response = await this.post(`${this.basePath}/validate-product`, data);
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getSupportedLanguages(): Promise<string[]> {
    try {
      return this.get(`${this.basePath}/languages`);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async setLanguage(language: string): Promise<void> {
    try {
      await this.post(`${this.basePath}/language`, { language });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getStats(): Promise<OCRStats> {
    try {
      const response = await this.get('/stats');
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async updateConfig(config: Partial<OCRConfig>): Promise<void> {
    try {
      await this.put('/config', { ...this.config, ...config });
      this.config = { ...this.config, ...config };
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async updateRules(rules: Partial<ImportRule>): Promise<void> {
    try {
      await this.put('/rules', { ...this.rules, ...rules });
      this.rules = { ...this.rules, ...rules };
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  getConfig(): OCRConfig {
    return { ...this.config };
  }

  getRules(): ImportRule {
    return { ...this.rules };
  }
}

export const ocrService = new OCRService(); 