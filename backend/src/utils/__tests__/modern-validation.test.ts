import { ValidatorBuilder, validator } from '../modern-validation';

describe('Modern Validation Utilities', () => {
  describe('ValidatorBuilder', () => {
    describe('required validation', () => {
      it('should fail for undefined values', () => {
        const result = validator.for('test').required().validate(undefined);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors).toHaveLength(1);
          expect(result.errors[0].code).toBe('REQUIRED');
          expect(result.errors[0].field).toBe('test');
          expect(result.errors[0].severity).toBe('error');
        }
      });

      it('should fail for null values', () => {
        const result = validator.for('test').required().validate(null);
        expect(result.success).toBe(false);
      });

      it('should fail for empty string', () => {
        const result = validator.for('test').required().validate('');
        expect(result.success).toBe(false);
      });

      it('should pass for valid values', () => {
        const result = validator.for('test').required().validate('valid value');
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('valid value');
        }
      });
    });

    describe('CPF validation', () => {
      const validCPFs = [
        '529.982.247-25',
        '52998224725',
        '111.444.777-35'
      ];

      const invalidCPFs = [
        '123.456.789-00',
        '000.000.000-00',
        '111.111.111-11',
        '123456789',
        'invalid',
        '52998224726' // Wrong check digit
      ];

      validCPFs.forEach(cpf => {
        it(`should validate correct CPF: ${cpf}`, () => {
          const result = validator.for('cpf').required().cpf().validate(cpf);
          expect(result.success).toBe(true);
        });
      });

      invalidCPFs.forEach(cpf => {
        it(`should reject invalid CPF: ${cpf}`, () => {
          const result = validator.for('cpf').required().cpf().validate(cpf);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.errors).toContainEqual(
              expect.objectContaining({
                code: 'INVALID_CPF',
                field: 'cpf'
              })
            );
          }
        });
      });

      it('should allow empty values when not required', () => {
        const result = validator.for('cpf').cpf().validate('');
        expect(result.success).toBe(true);
      });

      it('should reject empty values when required', () => {
        const result = validator.for('cpf').required().cpf().validate('');
        expect(result.success).toBe(false);
      });
    });

    describe('method chaining', () => {
      it('should allow chaining multiple validation rules', () => {
        const builder = validator.for<string>('email')
          .required()
          .email()
          .custom((value) => {
            if (value.includes('spam')) {
              return [{
                field: 'email',
                code: 'SPAM_DETECTED',
                message: 'Email contains spam',
                severity: 'error'
              }];
            }
            return [];
          });

        const validResult = builder.validate('test@example.com');
        expect(validResult.success).toBe(true);

        const invalidResult = builder.validate('spam@example.com');
        expect(invalidResult.success).toBe(false);
      });

      it('should accumulate all validation errors', () => {
        const result = validator.for('field')
          .required()
          .minLength(5)
          .validate('ab');

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors).toHaveLength(1); // Only minLength error since required passes
          expect(result.errors[0].code).toBe('MIN_LENGTH');
        }
      });
    });

    describe('custom validators', () => {
      it('should support custom validation functions', () => {
        const customValidator = validator.for<string>('password')
          .required()
          .custom((value) => {
            const errors = [];
            if (!/[A-Z]/.test(value)) {
              errors.push({
                field: 'password',
                code: 'MISSING_UPPERCASE',
                message: 'Password must contain uppercase letter',
                severity: 'error' as const
              });
            }
            if (!/[0-9]/.test(value)) {
              errors.push({
                field: 'password',
                code: 'MISSING_NUMBER',
                message: 'Password must contain number',
                severity: 'error' as const
              });
            }
            return errors;
          });

        const weakResult = customValidator.validate('password');
        expect(weakResult.success).toBe(false);
        if (!weakResult.success) {
          expect(weakResult.errors).toHaveLength(2);
          expect(weakResult.errors.map(e => e.code)).toContain('MISSING_UPPERCASE');
          expect(weakResult.errors.map(e => e.code)).toContain('MISSING_NUMBER');
        }

        const strongResult = customValidator.validate('Password123');
        expect(strongResult.success).toBe(true);
      });
    });
  });

  describe('batch validation', () => {
    it('should validate multiple fields simultaneously', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        cpf: '529.982.247-25',
        age: 30
      };

      const schema = {
        name: validator.for<string>('name').required().minLength(2),
        email: validator.for<string>('email').required().email(),
        cpf: validator.for<string>('cpf').required().cpf(),
        age: validator.for<number>('age').required().min(18).max(120)
      };

      const result = await validator.validateAll(userData, schema);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(userData);
      }
    });

    it('should collect errors from all fields', async () => {
      const invalidUserData = {
        name: '',
        email: 'invalid-email',
        cpf: '123.456.789-00',
        age: 15
      };

      const schema = {
        name: validator.for<string>('name').required().minLength(2),
        email: validator.for<string>('email').required().email(),
        cpf: validator.for<string>('cpf').required().cpf(),
        age: validator.for<number>('age').required().min(18).max(120)
      };

      const result = await validator.validateAll(invalidUserData, schema);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
        
        const fieldErrors = result.errors.reduce((acc, error) => {
          acc[error.field] = acc[error.field] || [];
          acc[error.field].push(error);
          return acc;
        }, {} as Record<string, any>);

        expect(Object.keys(fieldErrors)).toContain('name');
        expect(Object.keys(fieldErrors)).toContain('email');
        expect(Object.keys(fieldErrors)).toContain('cpf');
        expect(Object.keys(fieldErrors)).toContain('age');
      }
    });

    it('should handle async validation efficiently', async () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        [`field${i}`]: `value${i}`
      })).reduce((acc, obj) => ({ ...acc, ...obj }), {});

      const largeSchema = Array.from({ length: 100 }, (_, i) => ({
        [`field${i}`]: validator.for<string>(`field${i}`).required().minLength(5)
      })).reduce((acc, obj) => ({ ...acc, ...obj }), {});

      const start = performance.now();
      const result = await validator.validateAll(largeDataset, largeSchema);
      const end = performance.now();

      expect(result.success).toBe(true);
      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('validation performance', () => {
    it('should handle repeated validations efficiently', () => {
      const cpfValidator = validator.for('cpf').required().cpf();
      const validCpf = '529.982.247-25';

      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        cpfValidator.validate(validCpf);
      }
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });

    it('should validate large datasets efficiently', async () => {
      const dataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        email: `user${i}@example.com`,
        name: `User ${i}`
      }));

      const schema = {
        id: validator.for<number>('id').required().min(0),
        email: validator.for<string>('email').required().email(),
        name: validator.for<string>('name').required().minLength(1)
      };

      const start = performance.now();
      const results = await Promise.all(
        dataset.map(data => validator.validateAll(data, schema))
      );
      const end = performance.now();

      expect(results).toHaveLength(1000);
      expect(results.every(r => r.success)).toBe(true);
      expect(end - start).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('error handling', () => {
    it('should provide detailed error information', () => {
      const result = validator.for('test').required().validate('');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.errors[0];
        expect(error).toHaveProperty('field');
        expect(error).toHaveProperty('code');
        expect(error).toHaveProperty('message');
        expect(error).toHaveProperty('severity');
        expect(['error', 'warning']).toContain(error.severity);
      }
    });

    it('should handle validation exceptions gracefully', () => {
      const faultyValidator = validator.for<string>('test')
        .custom(() => {
          throw new Error('Validation error');
        });

      expect(() => faultyValidator.validate('test')).not.toThrow();
      const result = faultyValidator.validate('test');
      expect(result.success).toBe(false);
    });
  });

  describe('TypeScript integration', () => {
    it('should provide proper type inference', () => {
      const stringResult = validator.for<string>('test').required().validate('hello');
      if (stringResult.success) {
        // TypeScript should infer this as string
        expect(typeof stringResult.data).toBe('string');
      }

      const numberResult = validator.for<number>('test').required().validate(42);
      if (numberResult.success) {
        // TypeScript should infer this as number
        expect(typeof numberResult.data).toBe('number');
      }
    });
  });
});