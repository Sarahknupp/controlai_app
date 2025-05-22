import { auditConfig, AuditConfig } from '../audit.config';

describe('AuditConfig', () => {
  describe('retention settings', () => {
    it('should have valid retention configuration', () => {
      expect(auditConfig.retention).toBeDefined();
      expect(auditConfig.retention.enabled).toBeDefined();
      expect(auditConfig.retention.duration).toBeGreaterThan(0);
      expect(auditConfig.retention.maxSize).toBeGreaterThan(0);
    });

    it('should have reasonable retention duration', () => {
      // Duration should be between 30 and 3650 days (10 years)
      expect(auditConfig.retention.duration).toBeGreaterThanOrEqual(30);
      expect(auditConfig.retention.duration).toBeLessThanOrEqual(3650);
    });

    it('should have reasonable max size', () => {
      // Max size should be between 100MB and 10GB
      expect(auditConfig.retention.maxSize).toBeGreaterThanOrEqual(100);
      expect(auditConfig.retention.maxSize).toBeLessThanOrEqual(10240);
    });
  });

  describe('storage settings', () => {
    it('should have valid storage configuration', () => {
      expect(auditConfig.storage).toBeDefined();
      expect(auditConfig.storage.type).toBeDefined();
      expect(['local', 's3', 'database']).toContain(auditConfig.storage.type);
    });

    it('should have appropriate storage type', () => {
      expect(auditConfig.storage.type).toBe('database');
    });
  });

  describe('export settings', () => {
    it('should have valid export configuration', () => {
      expect(auditConfig.export).toBeDefined();
      expect(auditConfig.export.maxRecords).toBeGreaterThan(0);
    });

    it('should have reasonable max records limit', () => {
      // Max records should be between 1000 and 100000
      expect(auditConfig.export.maxRecords).toBeGreaterThanOrEqual(1000);
      expect(auditConfig.export.maxRecords).toBeLessThanOrEqual(100000);
    });
  });

  describe('type safety', () => {
    it('should enforce type safety for retention settings', () => {
      const config: AuditConfig = {
        retention: {
          enabled: true,
          duration: 365,
          maxSize: 1024
        },
        storage: {
          type: 'database'
        },
        export: {
          maxRecords: 10000
        }
      };

      // TypeScript should enforce these types
      expect(typeof config.retention.enabled).toBe('boolean');
      expect(typeof config.retention.duration).toBe('number');
      expect(typeof config.retention.maxSize).toBe('number');
    });

    it('should enforce type safety for storage settings', () => {
      const config: AuditConfig = {
        retention: auditConfig.retention,
        storage: {
          type: 's3',
          bucket: 'my-bucket'
        },
        export: auditConfig.export
      };

      // TypeScript should enforce these types
      expect(['local', 's3', 'database']).toContain(config.storage.type);
      if (config.storage.type === 's3') {
        expect(typeof config.storage.bucket).toBe('string');
      }
    });

    it('should enforce type safety for export settings', () => {
      const config: AuditConfig = {
        retention: auditConfig.retention,
        storage: auditConfig.storage,
        export: {
          maxRecords: 10000
        }
      };

      // TypeScript should enforce these types
      expect(typeof config.export.maxRecords).toBe('number');
    });
  });

  describe('default values', () => {
    it('should have sensible default values', () => {
      expect(auditConfig.retention.enabled).toBe(true);
      expect(auditConfig.retention.duration).toBe(365);
      expect(auditConfig.retention.maxSize).toBe(1024);
      expect(auditConfig.storage.type).toBe('database');
      expect(auditConfig.export.maxRecords).toBe(10000);
    });
  });
}); 