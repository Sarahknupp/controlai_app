import { createError } from './error';

export const validateRequired = (value: any, fieldName: string): void => {
  if (value === undefined || value === null || value === '') {
    throw createError(400, `O campo ${fieldName} é obrigatório`);
  }
};

export const validateString = (value: any, fieldName: string, minLength = 0, maxLength?: number): void => {
  validateRequired(value, fieldName);
  
  if (typeof value !== 'string') {
    throw createError(400, `O campo ${fieldName} deve ser uma string`);
  }

  if (value.length < minLength) {
    throw createError(400, `O campo ${fieldName} deve ter no mínimo ${minLength} caracteres`);
  }

  if (maxLength && value.length > maxLength) {
    throw createError(400, `O campo ${fieldName} deve ter no máximo ${maxLength} caracteres`);
  }
};

export const validateNumber = (value: any, fieldName: string, min?: number, max?: number): void => {
  validateRequired(value, fieldName);
  
  const num = Number(value);
  if (isNaN(num)) {
    throw createError(400, `O campo ${fieldName} deve ser um número`);
  }

  if (min !== undefined && num < min) {
    throw createError(400, `O campo ${fieldName} deve ser maior ou igual a ${min}`);
  }

  if (max !== undefined && num > max) {
    throw createError(400, `O campo ${fieldName} deve ser menor ou igual a ${max}`);
  }
};

export const validateEmail = (value: any, fieldName: string): void => {
  validateRequired(value, fieldName);
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw createError(400, `O campo ${fieldName} deve ser um email válido`);
  }
};

export const validateEnum = (value: any, fieldName: string, enumValues: any[]): void => {
  validateRequired(value, fieldName);
  
  if (!enumValues.includes(value)) {
    throw createError(400, `O campo ${fieldName} deve ser um dos seguintes valores: ${enumValues.join(', ')}`);
  }
};

export const validateDate = (value: any, fieldName: string): void => {
  validateRequired(value, fieldName);
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw createError(400, `O campo ${fieldName} deve ser uma data válida`);
  }
};

export const validateArray = (value: any, fieldName: string, minLength = 0, maxLength?: number): void => {
  validateRequired(value, fieldName);
  
  if (!Array.isArray(value)) {
    throw createError(400, `O campo ${fieldName} deve ser um array`);
  }

  if (value.length < minLength) {
    throw createError(400, `O campo ${fieldName} deve ter no mínimo ${minLength} itens`);
  }

  if (maxLength && value.length > maxLength) {
    throw createError(400, `O campo ${fieldName} deve ter no máximo ${maxLength} itens`);
  }
};

export const validateObject = (value: any, fieldName: string, requiredFields: string[]): void => {
  validateRequired(value, fieldName);
  
  if (typeof value !== 'object' || value === null) {
    throw createError(400, `O campo ${fieldName} deve ser um objeto`);
  }

  for (const field of requiredFields) {
    if (!(field in value)) {
      throw createError(400, `O campo ${field} é obrigatório no objeto ${fieldName}`);
    }
  }
};

export const validateCPF = (value: any, fieldName: string): void => {
  validateRequired(value, fieldName);
  
  const cpf = value.replace(/[^\d]/g, '');
  if (cpf.length !== 11) {
    throw createError(400, `O campo ${fieldName} deve conter 11 dígitos`);
  }

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let rest = 11 - (sum % 11);
  let digit = rest > 9 ? 0 : rest;
  if (digit !== parseInt(cpf.charAt(9))) {
    throw createError(400, `O campo ${fieldName} é inválido`);
  }

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  rest = 11 - (sum % 11);
  digit = rest > 9 ? 0 : rest;
  if (digit !== parseInt(cpf.charAt(10))) {
    throw createError(400, `O campo ${fieldName} é inválido`);
  }
};

export const validateCNPJ = (value: any, fieldName: string): void => {
  validateRequired(value, fieldName);
  
  const cnpj = value.replace(/[^\d]/g, '');
  if (cnpj.length !== 14) {
    throw createError(400, `O campo ${fieldName} deve conter 14 dígitos`);
  }

  // Validação do primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let rest = sum % 11;
  let digit = rest < 2 ? 0 : 11 - rest;
  if (digit !== parseInt(cnpj.charAt(12))) {
    throw createError(400, `O campo ${fieldName} é inválido`);
  }

  // Validação do segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  rest = sum % 11;
  digit = rest < 2 ? 0 : 11 - rest;
  if (digit !== parseInt(cnpj.charAt(13))) {
    throw createError(400, `O campo ${fieldName} é inválido`);
  }
};

export const validatePhone = (value: any, fieldName: string): void => {
  validateRequired(value, fieldName);
  
  const phone = value.replace(/[^\d]/g, '');
  if (phone.length < 10 || phone.length > 11) {
    throw createError(400, `O campo ${fieldName} deve conter entre 10 e 11 dígitos`);
  }
};

export const validateCEP = (value: any, fieldName: string): void => {
  validateRequired(value, fieldName);
  
  const cep = value.replace(/[^\d]/g, '');
  if (cep.length !== 8) {
    throw createError(400, `O campo ${fieldName} deve conter 8 dígitos`);
  }
}; 