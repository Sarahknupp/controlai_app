export type ValidationType = 'string' | 'number' | 'email' | 'date' | 'array' | 'object' | 'cpf' | 'cnpj' | 'phone' | 'cep';

export interface ValidationRule {
  type: ValidationType;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: any[];
  properties?: ValidationSchema;
}

export type ValidationSchema = {
  [key: string]: ValidationRule;
}; 