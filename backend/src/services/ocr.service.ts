import { BaseService } from './base.service';
import { handleError } from '../utils/error';
import { auditService } from './audit.service';
import { EntityType, AuditAction } from '../types/audit';
import { Product } from '../types/product';
import Tesseract from 'tesseract.js';
import { validateProduct } from '../validations/product.validation';
import { BadRequestError } from '../utils/errors';
import logger from '../utils/logger';

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

interface OCROptions {
  detectOrientation?: boolean;
  detectTables?: boolean;
  detectText?: boolean;
  extractFields?: string[];
  validateData?: boolean;
  autoCorrect?: boolean;
}

interface HistoryOptions {
  page: number;
  limit: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export class OCRService extends BaseService {
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

  private stats: OCRStats = {
    totalScans: 0,
    successfulScans: 0,
    failedScans: 0,
    averageConfidence: 0,
    lastScanDate: '',
    commonErrors: [],
  };

  private worker: Tesseract.Worker | null = null;

  constructor() {
    super('ocr');
    this.initializeWorker();
  }

  private async initializeWorker() {
    try {
      this.worker = await Tesseract.createWorker('por');
      await this.worker.loadLanguage('por');
      await this.worker.initialize('por');
    } catch (error) {
      logger.error('Error initializing OCR worker:', error);
      throw new BadRequestError('Failed to initialize OCR service');
    }
  }

  async scanImage(file: Express.Multer.File): Promise<OCRResult[]> {
    try {
      const worker = await Tesseract.createWorker(this.config.language);
      const result = await worker.recognize(file.buffer);
      await worker.terminate();

      const results: OCRResult[] = result.data.words.map((word) => ({
        text: word.text,
        confidence: word.confidence,
        boundingBox: {
          x: word.bbox.x0,
          y: word.bbox.y0,
          width: word.bbox.x1 - word.bbox.x0,
          height: word.bbox.y1 - word.bbox.y0,
        },
      }));

      this.updateStats(true, results.reduce((acc, curr) => acc + curr.confidence, 0) / results.length);

      return results;
    } catch (error) {
      this.updateStats(false, 0);
      handleError(error);
      throw error;
    }
  }

  async importProductsFromOCR(
    file: Express.Multer.File,
    config?: Partial<OCRConfig>,
    rules?: Partial<ImportRule>
  ): Promise<ProductImportResult> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }
      if (rules) {
        this.rules = { ...this.rules, ...rules };
      }

      const results = await this.scanImage(file);
      const products: Product[] = [];
      const errors: string[] = [];

      // Processa os resultados do OCR para extrair informações dos produtos
      for (const result of results) {
        if (result.confidence >= this.config.minConfidence) {
          try {
            const product = this.parseProductFromText(result.text);
            if (this.config.validateData) {
              const validation = validateProduct(product);
              if (validation.isValid) {
                products.push(product);
              } else {
                errors.push(...validation.errors);
              }
            } else {
              products.push(product);
            }
          } catch (error) {
            errors.push(`Erro ao processar texto: ${result.text}`);
          }
        } else {
          errors.push(`Confiança muito baixa para o texto: ${result.text}`);
        }
      }

      const stats = {
        total: results.length,
        successful: products.length,
        failed: errors.length,
        confidence: results.reduce((acc, curr) => acc + curr.confidence, 0) / results.length,
      };

      return {
        success: products.length > 0,
        products,
        errors,
        stats,
      };
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  private parseProductFromText(text: string): Product {
    // Implementar lógica de parsing do texto para produto
    // Este é um exemplo simplificado
    const lines = text.split('\n');
    const product: Product = {
      code: this.generateProductCode(),
      name: lines[0] || 'Produto sem nome',
      price: parseFloat(lines[1]) || 0,
      quantity: parseInt(lines[2]) || 0,
      category: this.rules.defaultCategories[0],
      brand: this.rules.defaultBrand,
    };

    return product;
  }

  private generateProductCode(): string {
    const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return this.rules.codeFormat.replace('{NUMBER}', number);
  }

  async validateProductData(data: any): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    try {
      const validation = validateProduct(data);
      return {
        isValid: validation.isValid,
        errors: validation.errors,
      };
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getSupportedLanguages(): Promise<string[]> {
    try {
      const worker = await Tesseract.createWorker();
      const languages = await worker.getLanguages();
      await worker.terminate();
      return languages;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async setLanguage(language: string): Promise<void> {
    try {
      this.config.language = language;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getStats(): Promise<OCRStats> {
    return this.stats;
  }

  async updateConfig(config: Partial<OCRConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...config };
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async updateRules(rules: Partial<ImportRule>): Promise<void> {
    try {
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

  private updateStats(success: boolean, confidence: number): void {
    this.stats.totalScans++;
    if (success) {
      this.stats.successfulScans++;
    } else {
      this.stats.failedScans++;
    }
    this.stats.averageConfidence = (this.stats.averageConfidence * (this.stats.totalScans - 1) + confidence) / this.stats.totalScans;
    this.stats.lastScanDate = new Date().toISOString();
  }

  async scanDocument(image: string, language: string = 'por', options: OCROptions = {}) {
    try {
      if (!this.worker) {
        await this.initializeWorker();
      }

      const result = await this.worker!.recognize(image);
      return {
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words,
        lines: result.data.lines,
        paragraphs: result.data.paragraphs,
        blocks: result.data.blocks,
      };
    } catch (error) {
      logger.error('Error scanning document:', error);
      throw new BadRequestError('Failed to scan document');
    }
  }

  async processImage(image: string, type: string, options: OCROptions = {}) {
    try {
      const scanResult = await this.scanDocument(image, 'por', options);
      
      // Process based on type
      switch (type) {
        case 'product':
          return this.processProductImage(scanResult, options);
        case 'document':
          return this.processDocumentImage(scanResult, options);
        case 'receipt':
          return this.processReceiptImage(scanResult, options);
        default:
          throw new BadRequestError('Invalid image type');
      }
    } catch (error) {
      logger.error('Error processing image:', error);
      throw new BadRequestError('Failed to process image');
    }
  }

  private processProductImage(scanResult: any, options: OCROptions) {
    // Implement product-specific processing
    return {
      type: 'product',
      data: scanResult,
      extractedFields: options.extractFields?.reduce((acc, field) => ({
        ...acc,
        [field]: this.extractField(scanResult, field),
      }), {}),
    };
  }

  private processDocumentImage(scanResult: any, options: OCROptions) {
    // Implement document-specific processing
    return {
      type: 'document',
      data: scanResult,
      extractedFields: options.extractFields?.reduce((acc, field) => ({
        ...acc,
        [field]: this.extractField(scanResult, field),
      }), {}),
    };
  }

  private processReceiptImage(scanResult: any, options: OCROptions) {
    // Implement receipt-specific processing
    return {
      type: 'receipt',
      data: scanResult,
      extractedFields: options.extractFields?.reduce((acc, field) => ({
        ...acc,
        [field]: this.extractField(scanResult, field),
      }), {}),
    };
  }

  private extractField(scanResult: any, field: string) {
    // Implement field extraction logic
    return scanResult.text;
  }

  async getHistory(options: HistoryOptions) {
    try {
      // Implement history retrieval
      return {
        items: [],
        total: 0,
        page: options.page,
        limit: options.limit,
      };
    } catch (error) {
      logger.error('Error getting OCR history:', error);
      throw new BadRequestError('Failed to get OCR history');
    }
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
} 