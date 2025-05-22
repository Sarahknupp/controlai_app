import nodemailer from 'nodemailer';
import { EmailService, EmailConfig } from '../../services/email.service';
import { AuditService } from '../../services/audit.service';

// Mock dependencies
jest.mock('nodemailer');
jest.mock('../../services/audit.service');

describe('EmailService', () => {
  let emailService: EmailService;
  let mockTransporter: jest.Mocked<nodemailer.Transporter>;
  let auditService: jest.Mocked<AuditService>;

  const mockConfig: EmailConfig = {
    host: 'smtp.example.com',
    port: 587,
    secure: true,
    auth: {
      user: 'test@example.com',
      pass: 'password'
    },
    from: 'noreply@example.com'
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock nodemailer transporter
    mockTransporter = {
      sendMail: jest.fn(),
      verify: jest.fn()
    } as any;

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    // Initialize services
    auditService = new AuditService() as jest.Mocked<AuditService>;
    emailService = new EmailService(mockConfig);
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>'
      };

      mockTransporter.sendMail.mockResolvedValueOnce({
        messageId: 'test123',
        response: 'OK'
      });

      await emailService.sendEmail(emailOptions);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        ...emailOptions,
        from: mockConfig.from
      });
      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'CREATE',
        entityType: 'EMAIL',
        entityId: expect.any(String),
        userId: 'system',
        details: expect.any(String),
        status: 'success'
      });
    });

    it('should handle email sending errors', async () => {
      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>'
      };

      mockTransporter.sendMail.mockRejectedValueOnce(new Error('Send failed'));

      await expect(
        emailService.sendEmail(emailOptions)
      ).rejects.toThrow('Failed to send email: Send failed');

      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'CREATE',
        entityType: 'EMAIL',
        entityId: expect.any(String),
        userId: 'system',
        details: expect.any(String),
        status: 'error'
      });
    });

    it('should send email with attachments', async () => {
      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Email with Attachments',
        html: '<p>Test content</p>',
        attachments: [
          {
            filename: 'test.pdf',
            content: 'test content'
          }
        ]
      };

      mockTransporter.sendMail.mockResolvedValueOnce({
        messageId: 'test123',
        response: 'OK'
      });

      await emailService.sendEmail(emailOptions);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        ...emailOptions,
        from: mockConfig.from
      });
    });
  });

  describe('sendTemplatedEmail', () => {
    it('should send templated email successfully', async () => {
      const template = 'Hello {{name}}, your order #{{orderId}} has been confirmed.';
      const context = {
        name: 'John',
        orderId: '12345'
      };
      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Order Confirmation'
      };

      mockTransporter.sendMail.mockResolvedValueOnce({
        messageId: 'test123',
        response: 'OK'
      });

      await emailService.sendTemplatedEmail({
        ...emailOptions,
        template,
        context
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        ...emailOptions,
        from: mockConfig.from,
        html: 'Hello John, your order #12345 has been confirmed.'
      });
    });

    it('should handle template processing errors', async () => {
      const template = 'Hello {{name}}, your order #{{orderId}} has been confirmed.';
      const context = {
        name: 'John'
        // Missing orderId
      };
      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Order Confirmation'
      };

      await expect(
        emailService.sendTemplatedEmail({
          ...emailOptions,
          template,
          context
        })
      ).rejects.toThrow('Failed to process email template: Missing required variable: orderId');
    });
  });

  describe('verifyConnection', () => {
    it('should verify connection successfully', async () => {
      mockTransporter.verify.mockResolvedValueOnce(true);

      const result = await emailService.verifyConnection();

      expect(result).toBe(true);
      expect(mockTransporter.verify).toHaveBeenCalled();
    });

    it('should handle verification errors', async () => {
      mockTransporter.verify.mockRejectedValueOnce(new Error('Verification failed'));

      await expect(
        emailService.verifyConnection()
      ).rejects.toThrow('Failed to verify email connection: Verification failed');
    });
  });
}); 