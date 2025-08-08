/**
 * Modern validation utilities with Result pattern and better error handling
 */

export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  errors: ValidationError[];
};

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Modern validation class with builder pattern
 */
export class ValidatorBuilder<T> {
  private rules: Array<(value: T) => ValidationError[]> = [];
  private fieldName: string;

  constructor(fieldName: string) {
    this.fieldName = fieldName;
  }

  required() {
    this.rules.push((value) => {
      if (value === undefined || value === null || value === '') {
        return [{ 
          field: this.fieldName, 
          code: 'REQUIRED', 
          message: `O campo ${this.fieldName} é obrigatório`,
          severity: 'error' 
        }];
      }
      return [];
    });
    return this;
  }

  minLength(min: number) {
    this.rules.push((value) => {
      if (typeof value === 'string' && value.length < min) {
        return [{ 
          field: this.fieldName, 
          code: 'MIN_LENGTH', 
          message: `O campo ${this.fieldName} deve ter no mínimo ${min} caracteres`,
          severity: 'error' 
        }];
      }
      return [];
    });
    return this;
  }

  email() {
    this.rules.push((value) => {
      if (!value) return [];
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        return [{ 
          field: this.fieldName, 
          code: 'INVALID_EMAIL', 
          message: `O campo ${this.fieldName} deve ser um email válido`,
          severity: 'error' 
        }];
      }
      return [];
    });
    return this;
  }

  min(min: number) {
    this.rules.push((value) => {
      if (typeof value === 'number' && value < min) {
        return [{ 
          field: this.fieldName, 
          code: 'MIN_VALUE', 
          message: `O campo ${this.fieldName} deve ser maior ou igual a ${min}`,
          severity: 'error' 
        }];
      }
      return [];
    });
    return this;
  }

  max(max: number) {
    this.rules.push((value) => {
      if (typeof value === 'number' && value > max) {
        return [{ 
          field: this.fieldName, 
          code: 'MAX_VALUE', 
          message: `O campo ${this.fieldName} deve ser menor ou igual a ${max}`,
          severity: 'error' 
        }];
      }
      return [];
    });
    return this;
  }

  cpf() {
    this.rules.push((value) => {
      if (!value) return [];
      
      const cpf = String(value).replace(/[^\d]/g, '');
      if (!this.isValidCPF(cpf)) {
        return [{ 
          field: this.fieldName, 
          code: 'INVALID_CPF', 
          message: `O campo ${this.fieldName} deve ser um CPF válido`,
          severity: 'error' 
        }];
      }
      return [];
    });
    return this;
  }

  custom(validator: (value: T) => ValidationError[]) {
    this.rules.push((value) => {
      try {
        return validator(value);
      } catch (error) {
        return [{
          field: this.fieldName,
          code: 'VALIDATION_ERROR',
          message: `Erro na validação do campo ${this.fieldName}`,
          severity: 'error'
        }];
      }
    });
    return this;
  }

  validate(value: T): ValidationResult<T> {
    const errors = this.rules.flatMap(rule => rule(value));
    
    return errors.length === 0 
      ? { success: true, data: value }
      : { success: false, errors };
  }

  private isValidCPF(cpf: string): boolean {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    // Modern approach: Use array methods instead of loops
    const digits = cpf.split('').map(Number);
    
    const calculateDigit = (digits: number[], weights: number[]) =>
      digits.reduce((sum, digit, index) => sum + digit * weights[index], 0);
    
    const firstWeights = [10, 9, 8, 7, 6, 5, 4, 3, 2];
    const secondWeights = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    
    const firstDigit = this.getCheckDigit(calculateDigit(digits.slice(0, 9), firstWeights));
    const secondDigit = this.getCheckDigit(calculateDigit(digits.slice(0, 10), secondWeights));
    
    return digits[9] === firstDigit && digits[10] === secondDigit;
  }

  private getCheckDigit(sum: number): number {
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }
}

export const validator = {
  for: <T>(fieldName: string) => new ValidatorBuilder<T>(fieldName),
  
  // Batch validation with modern async support
  validateAll: async <T extends Record<string, any>>(
    data: T, 
    schema: Record<keyof T, ValidatorBuilder<any>>
  ): Promise<ValidationResult<T>> => {
    const validationPromises = Object.entries(schema).map(async ([field, validator]) => {
      const result = (validator as ValidatorBuilder<any>).validate(data[field]);
      return result.success ? [] : result.errors;
    });
    
    const errorArrays = await Promise.all(validationPromises);
    const errors = errorArrays.flat();
    
    return errors.length === 0 
      ? { success: true, data }
      : { success: false, errors };
  }
};