import { I18nService } from '../../services/i18n.service';
import { AuditService } from '../../services/audit.service';

jest.mock('../../services/audit.service');

describe('I18nService', () => {
  let i18nService: I18nService;
  let mockAuditService: jest.Mocked<AuditService>;

  beforeEach(() => {
    mockAuditService = new AuditService() as jest.Mocked<AuditService>;
    mockAuditService.logAction = jest.fn();

    i18nService = new I18nService(mockAuditService, {
      defaultLocale: 'en',
      fallbackLocale: 'en',
      locales: ['en', 'pt-BR', 'es']
    });
  });

  describe('translate', () => {
    it('should translate a key with parameters', () => {
      const result = i18nService.translate('payment.success', 'en', {
        amount: '100',
        currency: 'USD'
      });

      expect(result).toBe('Your payment of 100 USD has been processed successfully.');
    });

    it('should use fallback locale when translation is missing', () => {
      const result = i18nService.translate('payment.success', 'fr', {
        amount: '100',
        currency: 'USD'
      });

      expect(result).toBe('Your payment of 100 USD has been processed successfully.');
    });

    it('should return the key when translation is missing in both locale and fallback', () => {
      const result = i18nService.translate('nonexistent.key', 'en');

      expect(result).toBe('nonexistent.key');
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'i18n_missing_translation',
          status: 'warning'
        })
      );
    });

    it('should handle nested keys', () => {
      const result = i18nService.translate('order.status', 'en', {
        orderId: '123',
        status: 'shipped'
      });

      expect(result).toBe('Your order #123 status has been updated to shipped.');
    });
  });

  describe('getAvailableLocales', () => {
    it('should return all available locales', () => {
      const locales = i18nService.getAvailableLocales();
      expect(locales).toEqual(['en', 'pt-BR', 'es']);
    });
  });

  describe('getDefaultLocale', () => {
    it('should return the default locale', () => {
      const defaultLocale = i18nService.getDefaultLocale();
      expect(defaultLocale).toBe('en');
    });
  });

  describe('getFallbackLocale', () => {
    it('should return the fallback locale', () => {
      const fallbackLocale = i18nService.getFallbackLocale();
      expect(fallbackLocale).toBe('en');
    });
  });

  describe('reloadTranslations', () => {
    it('should reload translations successfully', () => {
      expect(() => i18nService.reloadTranslations()).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should log error when translation fails', () => {
      const result = i18nService.translate('invalid.key', 'en', {
        invalid: 'param'
      });

      expect(result).toBe('invalid.key');
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'i18n_translation_error',
          status: 'error'
        })
      );
    });
  });
}); 