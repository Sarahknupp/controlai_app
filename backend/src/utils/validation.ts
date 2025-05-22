import { AppError, createError } from './error';
import { ValidationRule } from '../types/validation';

export const validateRequired = (value: any): boolean => {
  return value !== undefined && value !== null && value !== '';
};

export const validateString = (value: any, rules: ValidationRule): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  if (rules.minLength && value.length < rules.minLength) {
    return false;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return false;
  }

  switch (rules.type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);

    case 'date':
      const date = new Date(value);
      return !isNaN(date.getTime());

    case 'cpf':
      const cpf = value.replace(/[^\d]/g, '');
      if (cpf.length !== 11) return false;
      // Validate first digit
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let rest = 11 - (sum % 11);
      let digit = rest > 9 ? 0 : rest;
      if (digit !== parseInt(cpf.charAt(9))) return false;
      // Validate second digit
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
      }
      rest = 11 - (sum % 11);
      digit = rest > 9 ? 0 : rest;
      return digit === parseInt(cpf.charAt(10));

    case 'cnpj':
      const cnpj = value.replace(/[^\d]/g, '');
      if (cnpj.length !== 14) return false;
      // Validate first digit
      sum = 0;
      let weight = 5;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(cnpj.charAt(i)) * weight;
        weight = weight === 2 ? 9 : weight - 1;
      }
      rest = sum % 11;
      digit = rest < 2 ? 0 : 11 - rest;
      if (digit !== parseInt(cnpj.charAt(12))) return false;
      // Validate second digit
      sum = 0;
      weight = 6;
      for (let i = 0; i < 13; i++) {
        sum += parseInt(cnpj.charAt(i)) * weight;
        weight = weight === 2 ? 9 : weight - 1;
      }
      rest = sum % 11;
      digit = rest < 2 ? 0 : 11 - rest;
      return digit === parseInt(cnpj.charAt(13));

    case 'phone':
      const phone = value.replace(/[^\d]/g, '');
      return phone.length >= 10 && phone.length <= 11;

    case 'cep':
      const cep = value.replace(/[^\d]/g, '');
      return cep.length === 8;

    default:
      return true;
  }
};

export const validateNumber = (value: any, rules: ValidationRule): boolean => {
  const num = Number(value);
  if (isNaN(num)) {
    return false;
  }

  if (rules.min !== undefined && num < rules.min) {
    return false;
  }

  if (rules.max !== undefined && num > rules.max) {
    return false;
  }

  return true;
};

export const validateEmail = (value: any, fieldName: string): void => {
  validateRequired(value);
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw createError(400, `O campo ${fieldName} deve ser um email válido`);
  }
};

export const validateEnum = (value: any, fieldName: string, enumValues: any[]): void => {
  validateRequired(value);
  
  if (!enumValues.includes(value)) {
    throw createError(400, `O campo ${fieldName} deve ser um dos seguintes valores: ${enumValues.join(', ')}`);
  }
};

export const validateDate = (value: any, fieldName: string): void => {
  validateRequired(value);
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw createError(400, `O campo ${fieldName} deve ser uma data válida`);
  }
};

export const validateArray = (value: any, rules: ValidationRule): boolean => {
  if (!Array.isArray(value)) {
    return false;
  }

  if (rules.minLength && value.length < rules.minLength) {
    return false;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return false;
  }

  if (rules.properties) {
    return value.every(item => validateObject(item, rules));
  }

  return true;
};

export const validateObject = (value: any, rules: ValidationRule): boolean => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (rules.properties) {
    for (const [key, rule] of Object.entries(rules.properties)) {
      const itemValue = value[key];
      if (rule.required && !validateRequired(itemValue)) {
        return false;
      }
      if (itemValue !== undefined) {
        switch (rule.type) {
          case 'string':
            if (!validateString(itemValue, rule)) return false;
            break;
          case 'number':
            if (!validateNumber(itemValue, rule)) return false;
            break;
          case 'array':
            if (!validateArray(itemValue, rule)) return false;
            break;
          case 'object':
            if (!validateObject(itemValue, rule)) return false;
            break;
        }
      }
    }
  }

  return true;
}; 