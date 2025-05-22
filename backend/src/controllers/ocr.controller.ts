import { Request, Response } from 'express';
import { OCRService } from '../services/ocr.service';
import { BadRequestError } from '../utils/errors';
import logger from '../utils/logger';
import { auditService } from '../services/audit.service';
import { EntityType, AuditAction } from '../types/audit';

class OCRController {
  private ocrService: OCRService;

  constructor() {
    this.ocrService = new OCRService();
  }

  scanDocument = async (req: Request, res: Response) => {
    try {
      const { image, language, options } = req.body;
      const result = await this.ocrService.scanDocument(image, language, options);
      res.json(result);
    } catch (error) {
      logger.error('Error scanning document:', error);
      throw new BadRequestError('Failed to scan document');
    }
  };

  processImage = async (req: Request, res: Response) => {
    try {
      const { image, type, options } = req.body;
      const result = await this.ocrService.processImage(image, type, options);
      res.json(result);
    } catch (error) {
      logger.error('Error processing image:', error);
      throw new BadRequestError('Failed to process image');
    }
  };

  getStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.ocrService.getStats();
      res.json(stats);
    } catch (error) {
      logger.error('Error getting OCR stats:', error);
      throw new BadRequestError('Failed to get OCR statistics');
    }
  };

  getHistory = async (req: Request, res: Response) => {
    try {
      const { page, limit, type, startDate, endDate, status } = req.query;
      const history = await this.ocrService.getHistory({
        page: Number(page),
        limit: Number(limit),
        type: type as string,
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as string,
      });
      res.json(history);
    } catch (error) {
      logger.error('Error getting OCR history:', error);
      throw new BadRequestError('Failed to get OCR history');
    }
  };

  async importProducts(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        throw new Error('Nenhuma imagem foi enviada');
      }

      const config = req.body.config ? JSON.parse(req.body.config) : undefined;
      const rules = req.body.rules ? JSON.parse(req.body.rules) : undefined;

      const result = await this.ocrService.importProductsFromOCR(req.file, config, rules);

      await auditService.logAction(
        AuditAction.IMPORT,
        EntityType.PRODUCT,
        'ocr-import',
        {
          fileName: req.file.originalname,
          stats: result.stats
        },
        'success'
      );

      res.json(result);
    } catch (error) {
      await auditService.logAction(
        AuditAction.IMPORT,
        EntityType.PRODUCT,
        'ocr-import',
        {
          fileName: req.file?.originalname,
          error: error.message
        },
        'error'
      );
      throw new BadRequestError('Failed to import products');
    }
  }

  async validateProductData(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.ocrService.validateProductData(req.body);
      res.json(result);
    } catch (error) {
      throw new BadRequestError('Failed to validate product data');
    }
  }

  async getSupportedLanguages(req: Request, res: Response): Promise<void> {
    try {
      const languages = await this.ocrService.getSupportedLanguages();
      res.json(languages);
    } catch (error) {
      throw new BadRequestError('Failed to get supported languages');
    }
  }

  async setLanguage(req: Request, res: Response): Promise<void> {
    try {
      const { language } = req.body;
      await this.ocrService.setLanguage(language);
      res.json({ message: 'Idioma atualizado com sucesso' });
    } catch (error) {
      throw new BadRequestError('Failed to set language');
    }
  }

  async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      await this.ocrService.updateConfig(req.body);
      res.json({ message: 'Configurações atualizadas com sucesso' });
    } catch (error) {
      throw new BadRequestError('Failed to update configuration');
    }
  }

  async updateRules(req: Request, res: Response): Promise<void> {
    try {
      await this.ocrService.updateRules(req.body);
      res.json({ message: 'Regras atualizadas com sucesso' });
    } catch (error) {
      throw new BadRequestError('Failed to update rules');
    }
  }

  async getConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = this.ocrService.getConfig();
      res.json(config);
    } catch (error) {
      throw new BadRequestError('Failed to get configuration');
    }
  }

  async getRules(req: Request, res: Response): Promise<void> {
    try {
      const rules = this.ocrService.getRules();
      res.json(rules);
    } catch (error) {
      throw new BadRequestError('Failed to get rules');
    }
  }
}

export const ocrController = new OCRController(); 