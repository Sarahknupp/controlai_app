import { Request, Response } from 'express';
import { ReceiptService } from '../services/receipt.service';
import { BadRequestError } from '../utils/errors';
import logger from '../utils/logger';

export class ReceiptController {
  private receiptService: ReceiptService;

  constructor() {
    this.receiptService = new ReceiptService();
  }

  async generateReceipt(req: Request, res: Response) {
    try {
      const { saleId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError('User not authenticated');
      }

      const pdfBuffer = await this.receiptService.generateReceipt(saleId, userId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=receipt-${saleId}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      logger.error('Error generating receipt:', error);
      throw new BadRequestError('Failed to generate receipt');
    }
  }

  async sendReceipt(req: Request, res: Response) {
    try {
      const { saleId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError('User not authenticated');
      }

      await this.receiptService.sendReceipt(saleId, userId);

      res.json({ message: 'Receipt sent successfully' });
    } catch (error) {
      logger.error('Error sending receipt:', error);
      throw new BadRequestError('Failed to send receipt');
    }
  }

  async getReceiptHistory(req: Request, res: Response) {
    try {
      const { saleId } = req.params;
      const history = await this.receiptService.getReceiptHistory(saleId);

      res.json(history);
    } catch (error) {
      logger.error('Error getting receipt history:', error);
      throw new BadRequestError('Failed to get receipt history');
    }
  }
} 