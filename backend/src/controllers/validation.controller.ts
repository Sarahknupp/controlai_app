import { Request, Response } from 'express';
import { ValidationService } from '../services/validation.service';
import { BadRequestError } from '../errors/bad-request.error';
import logger from '../utils/logger';

export class ValidationController {
  private validationService: ValidationService;

  constructor() {
    this.validationService = new ValidationService();
  }

  async validateData(req: Request, res: Response): Promise<void> {
    try {
      const { type, filters } = req.body;
      const userId = req.user?.id;

      const result = await this.validationService.validateData({
        type,
        userId,
        filters
      });

      res.json(result);
    } catch (error) {
      logger.error('Error validating data:', error);
      throw new BadRequestError('Failed to validate data');
    }
  }

  async getValidationStatus(req: Request, res: Response): Promise<void> {
    try {
      const inProgress = this.validationService.isValidationInProgress();
      res.json({ inProgress });
    } catch (error) {
      logger.error('Error getting validation status:', error);
      throw new BadRequestError('Failed to get validation status');
    }
  }
} 