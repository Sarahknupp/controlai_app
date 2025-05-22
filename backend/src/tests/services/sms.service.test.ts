import twilio from 'twilio';
import { SMSService, SMSConfig } from '../../services/sms.service';
import { AuditService } from '../../services/audit.service';

// Mock dependencies
jest.mock('twilio');
jest.mock('../../services/audit.service');

describe('SMSService', () => {
  let smsService: SMSService;
  let mockTwilioClient: jest.Mocked<twilio.Twilio>;
  let mockMessages: jest.Mocked<twilio.Api.V2010.MessageInstance>;
  let auditService: jest.Mocked<AuditService>;

  const mockConfig: SMSConfig = {
    accountSid: 'test-sid',
    authToken: 'test-token',
    fromNumber: '+1234567890'
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock Twilio client
    mockMessages = {
      create: jest.fn()
    } as any;

    mockTwilioClient = {
      messages: mockMessages,
      lookups: {
        v2: {
          phoneNumbers: jest.fn()
        }
      }
    } as any;

    (twilio as jest.Mock).mockReturnValue(mockTwilioClient);

    // Initialize services
    auditService = new AuditService() as jest.Mocked<AuditService>;
    smsService = new SMSService(mockConfig);
  });

  describe('sendSMS', () => {
    it('should send SMS successfully', async () => {
      const smsOptions = {
        to: '+9876543210',
        message: 'Test SMS message'
      };

      mockMessages.create.mockResolvedValueOnce({
        sid: 'test123',
        status: 'sent'
      });

      await smsService.sendSMS(smsOptions);

      expect(mockMessages.create).toHaveBeenCalledWith({
        to: smsOptions.to,
        from: mockConfig.fromNumber,
        body: smsOptions.message
      });
      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'CREATE',
        entityType: 'SMS',
        entityId: expect.any(String),
        userId: 'system',
        details: expect.any(String),
        status: 'success'
      });
    });

    it('should handle SMS sending errors', async () => {
      const smsOptions = {
        to: '+9876543210',
        message: 'Test SMS message'
      };

      mockMessages.create.mockRejectedValueOnce(new Error('Send failed'));

      await expect(
        smsService.sendSMS(smsOptions)
      ).rejects.toThrow('Failed to send SMS: Send failed');

      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'CREATE',
        entityType: 'SMS',
        entityId: expect.any(String),
        userId: 'system',
        details: expect.any(String),
        status: 'error'
      });
    });
  });

  describe('sendTemplatedSMS', () => {
    it('should send templated SMS successfully', async () => {
      const template = 'Hello {{name}}, your order #{{orderId}} has been confirmed.';
      const context = {
        name: 'John',
        orderId: '12345'
      };
      const smsOptions = {
        to: '+9876543210'
      };

      mockMessages.create.mockResolvedValueOnce({
        sid: 'test123',
        status: 'sent'
      });

      await smsService.sendTemplatedSMS({
        ...smsOptions,
        template,
        context
      });

      expect(mockMessages.create).toHaveBeenCalledWith({
        to: smsOptions.to,
        from: mockConfig.fromNumber,
        body: 'Hello John, your order #12345 has been confirmed.'
      });
    });

    it('should handle template processing errors', async () => {
      const template = 'Hello {{name}}, your order #{{orderId}} has been confirmed.';
      const context = {
        name: 'John'
        // Missing orderId
      };
      const smsOptions = {
        to: '+9876543210'
      };

      await expect(
        smsService.sendTemplatedSMS({
          ...smsOptions,
          template,
          context
        })
      ).rejects.toThrow('Failed to process SMS template: Missing required variable: orderId');
    });
  });

  describe('verifyNumber', () => {
    it('should verify phone number successfully', async () => {
      const phoneNumber = '+9876543210';
      const mockLookup = {
        fetch: jest.fn().mockResolvedValueOnce({
          phoneNumber,
          countryCode: 'US',
          valid: true
        })
      };

      mockTwilioClient.lookups.v2.phoneNumbers.mockReturnValue(mockLookup);

      const result = await smsService.verifyNumber(phoneNumber);

      expect(result).toBe(true);
      expect(mockLookup.fetch).toHaveBeenCalledWith({
        type: ['carrier']
      });
    });

    it('should handle invalid phone numbers', async () => {
      const phoneNumber = 'invalid';
      const mockLookup = {
        fetch: jest.fn().mockRejectedValueOnce(new Error('Invalid number'))
      };

      mockTwilioClient.lookups.v2.phoneNumbers.mockReturnValue(mockLookup);

      const result = await smsService.verifyNumber(phoneNumber);

      expect(result).toBe(false);
    });
  });

  describe('getMessageStatus', () => {
    it('should get message status successfully', async () => {
      const messageId = 'test123';
      const mockMessage = {
        fetch: jest.fn().mockResolvedValueOnce({
          sid: messageId,
          status: 'delivered',
          errorCode: null,
          errorMessage: null
        })
      };

      mockTwilioClient.messages.mockReturnValue(mockMessage);

      const status = await smsService.getMessageStatus(messageId);

      expect(status).toEqual({
        status: 'delivered',
        errorCode: null,
        errorMessage: null
      });
    });

    it('should handle message status errors', async () => {
      const messageId = 'test123';
      const mockMessage = {
        fetch: jest.fn().mockRejectedValueOnce(new Error('Status check failed'))
      };

      mockTwilioClient.messages.mockReturnValue(mockMessage);

      await expect(
        smsService.getMessageStatus(messageId)
      ).rejects.toThrow('Failed to get message status: Status check failed');
    });
  });
}); 