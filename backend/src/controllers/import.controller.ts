import { Request, Response } from 'express';
import { ImportService } from '../services/import.service';
import { BadRequestError } from '../errors/bad-request.error';
import logger from '../utils/logger';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { pipeline } from 'stream/promises';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export class ImportController {
  private importService: ImportService;
  private importDir: string;

  constructor() {
    this.importService = new ImportService();
    this.importDir = path.join(process.cwd(), 'imports');
    this.ensureImportDirectory();
  }

  private ensureImportDirectory(): void {
    if (!fs.existsSync(this.importDir)) {
      fs.mkdirSync(this.importDir, { recursive: true });
    }
  }

  async importData(req: Request, res: Response): Promise<void> {
    try {
      const { type, format, options } = req.body;
      const userId = req.user?.id;

      if (!req.file) {
        throw new BadRequestError('No file uploaded');
      }

      const filePath = path.join(this.importDir, req.file.filename);

      const result = await this.importService.importData({
        type,
        format,
        filePath,
        userId,
        options
      });

      // Clean up the uploaded file
      await unlink(filePath);

      res.json(result);
    } catch (error) {
      logger.error('Error importing data:', error);
      throw new BadRequestError('Failed to import data');
    }
  }

  async getImportStatus(req: Request, res: Response): Promise<void> {
    try {
      const { importId } = req.params;
      const result = await this.importService.getImportStatus(importId);
      res.json(result);
    } catch (error) {
      logger.error('Error getting import status:', error);
      throw new BadRequestError('Failed to get import status');
    }
  }

  async deleteImport(req: Request, res: Response): Promise<void> {
    try {
      const { importId } = req.params;
      const userId = req.user?.id;

      await this.importService.deleteImport(importId, userId);
      res.json({ message: 'Import deleted successfully' });
    } catch (error) {
      logger.error('Error deleting import:', error);
      throw new BadRequestError('Failed to delete import');
    }
  }
} 