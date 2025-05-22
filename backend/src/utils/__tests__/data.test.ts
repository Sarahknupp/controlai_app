import {
  validateRequired,
  validateString,
  validateNumber,
  validateEmail,
  validateEnum,
  validateDate,
  validateArray,
  validateObject,
  validateCPF,
  validateCNPJ,
  validatePhone,
  validateCEP,
} from '../data';
import { createError } from '../error';

describe('Data Validation Utilities', () => {
  describe('validateRequired', () => {
    it('should throw error when value is undefined', () => {
      expect(() => validateRequired(undefined, 'field')).toThrow('O campo field é obrigatório');
    });

    it('should throw error when value is null', () => {
      expect(() => validateRequired(null, 'field')).toThrow('O campo field é obrigatório');
    });

    it('should throw error when value is empty string', () => {
      expect(() => validateRequired('', 'field')).toThrow('O campo field é obrigatório');
    });

    it('should not throw error when value is valid', () => {
      expect(() => validateRequired('value', 'field')).not.toThrow();
    });
  });

  describe('validateString', () => {
    it('should throw error when value is not a string', () => {
      expect(() => validateString(123, 'field')).toThrow('O campo field deve ser uma string');
    });

    it('should throw error when string is shorter than minLength', () => {
      expect(() => validateString('ab', 'field', 3)).toThrow('O campo field deve ter no mínimo 3 caracteres');
    });

    it('should throw error when string is longer than maxLength', () => {
      expect(() => validateString('abcd', 'field', 0, 3)).toThrow('O campo field deve ter no máximo 3 caracteres');
    });

    it('should not throw error when string is valid', () => {
      expect(() => validateString('abc', 'field', 2, 4)).not.toThrow();
    });
  });

  describe('validateNumber', () => {
    it('should throw error when value is not a number', () => {
      expect(() => validateNumber('abc', 'field')).toThrow('O campo field deve ser um número');
    });

    it('should throw error when number is less than min', () => {
      expect(() => validateNumber(5, 'field', 10)).toThrow('O campo field deve ser maior ou igual a 10');
    });

    it('should throw error when number is greater than max', () => {
      expect(() => validateNumber(15, 'field', 0, 10)).toThrow('O campo field deve ser menor ou igual a 10');
    });

    it('should not throw error when number is valid', () => {
      expect(() => validateNumber(5, 'field', 0, 10)).not.toThrow();
    });
  });

  describe('validateEmail', () => {
    it('should throw error when email is invalid', () => {
      expect(() => validateEmail('invalid-email', 'field')).toThrow('O campo field deve ser um email válido');
    });

    it('should not throw error when email is valid', () => {
      expect(() => validateEmail('test@example.com', 'field')).not.toThrow();
    });
  });

  describe('validateEnum', () => {
    const validValues = ['a', 'b', 'c'];

    it('should throw error when value is not in enum', () => {
      expect(() => validateEnum('d', 'field', validValues)).toThrow(
        'O campo field deve ser um dos seguintes valores: a, b, c'
      );
    });

    it('should not throw error when value is in enum', () => {
      expect(() => validateEnum('a', 'field', validValues)).not.toThrow();
    });
  });

  describe('validateDate', () => {
    it('should throw error when date is invalid', () => {
      expect(() => validateDate('invalid-date', 'field')).toThrow('O campo field deve ser uma data válida');
    });

    it('should not throw error when date is valid', () => {
      expect(() => validateDate('2024-03-20', 'field')).not.toThrow();
    });
  });

  describe('validateArray', () => {
    it('should throw error when value is not an array', () => {
      expect(() => validateArray('not-array', 'field')).toThrow('O campo field deve ser um array');
    });

    it('should throw error when array is shorter than minLength', () => {
      expect(() => validateArray([1], 'field', 2)).toThrow('O campo field deve ter no mínimo 2 itens');
    });

    it('should throw error when array is longer than maxLength', () => {
      expect(() => validateArray([1, 2, 3], 'field', 0, 2)).toThrow('O campo field deve ter no máximo 2 itens');
    });

    it('should not throw error when array is valid', () => {
      expect(() => validateArray([1, 2], 'field', 1, 3)).not.toThrow();
    });
  });

  describe('validateObject', () => {
    it('should throw error when value is not an object', () => {
      expect(() => validateObject('not-object', 'field', ['prop'])).toThrow('O campo field deve ser um objeto');
    });

    it('should throw error when required field is missing', () => {
      expect(() => validateObject({}, 'field', ['prop'])).toThrow('O campo prop é obrigatório no objeto field');
    });

    it('should not throw error when object is valid', () => {
      expect(() => validateObject({ prop: 'value' }, 'field', ['prop'])).not.toThrow();
    });
  });

  describe('validateCPF', () => {
    it('should throw error when CPF is invalid', () => {
      expect(() => validateCPF('123.456.789-00', 'field')).toThrow('O campo field é inválido');
    });

    it('should not throw error when CPF is valid', () => {
      expect(() => validateCPF('529.982.247-25', 'field')).not.toThrow();
    });
  });

  describe('validateCNPJ', () => {
    it('should throw error when CNPJ is invalid', () => {
      expect(() => validateCNPJ('12.345.678/0001-00', 'field')).toThrow('O campo field é inválido');
    });

    it('should not throw error when CNPJ is valid', () => {
      expect(() => validateCNPJ('33.000.167/0001-01', 'field')).not.toThrow();
    });
  });

  describe('validatePhone', () => {
    it('should throw error when phone is too short', () => {
      expect(() => validatePhone('123456789', 'field')).toThrow('O campo field deve conter entre 10 e 11 dígitos');
    });

    it('should throw error when phone is too long', () => {
      expect(() => validatePhone('123456789012', 'field')).toThrow('O campo field deve conter entre 10 e 11 dígitos');
    });

    it('should not throw error when phone is valid', () => {
      expect(() => validatePhone('11999999999', 'field')).not.toThrow();
    });
  });

  describe('validateCEP', () => {
    it('should throw error when CEP is invalid', () => {
      expect(() => validateCEP('12345', 'field')).toThrow('O campo field deve conter 8 dígitos');
    });

    it('should not throw error when CEP is valid', () => {
      expect(() => validateCEP('12345678', 'field')).not.toThrow();
    });
  });
}); 