import {
  capitalize,
  capitalizeWords,
  slugify,
  truncate,
  removeAccents,
  removeSpecialChars,
  removeExtraSpaces,
  formatPhoneNumber,
  formatCPF,
  formatCNPJ,
  formatCEP,
  maskEmail,
  maskPhone,
  maskCPF,
  maskCNPJ,
  generateRandomString,
  generateRandomNumber,
} from '../string';

describe('String Manipulation Utilities', () => {
  describe('capitalize', () => {
    it('should return empty string for empty input', () => {
      expect(capitalize('')).toBe('');
    });

    it('should capitalize first letter and lowercase rest', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
      expect(capitalize('hELLO')).toBe('Hello');
    });
  });

  describe('capitalizeWords', () => {
    it('should return empty string for empty input', () => {
      expect(capitalizeWords('')).toBe('');
    });

    it('should capitalize first letter of each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
      expect(capitalizeWords('HELLO WORLD')).toBe('Hello World');
      expect(capitalizeWords('hELLO wORLD')).toBe('Hello World');
    });
  });

  describe('slugify', () => {
    it('should return empty string for empty input', () => {
      expect(slugify('')).toBe('');
    });

    it('should convert string to URL-friendly format', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Hello & World')).toBe('hello-world');
      expect(slugify('Hello-World')).toBe('hello-world');
      expect(slugify('Hello.World')).toBe('hello-world');
    });

    it('should handle accented characters', () => {
      expect(slugify('Olá Mundo')).toBe('ola-mundo');
      expect(slugify('Café com Leite')).toBe('cafe-com-leite');
    });
  });

  describe('truncate', () => {
    it('should return empty string for empty input', () => {
      expect(truncate('', 5)).toBe('');
    });

    it('should truncate string to specified length', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
      expect(truncate('Hello World', 5, '!')).toBe('Hello!');
    });

    it('should not truncate if string is shorter than length', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });
  });

  describe('removeAccents', () => {
    it('should return empty string for empty input', () => {
      expect(removeAccents('')).toBe('');
    });

    it('should remove accents from string', () => {
      expect(removeAccents('Olá Mundo')).toBe('Ola Mundo');
      expect(removeAccents('Café com Leite')).toBe('Cafe com Leite');
    });
  });

  describe('removeSpecialChars', () => {
    it('should return empty string for empty input', () => {
      expect(removeSpecialChars('')).toBe('');
    });

    it('should remove special characters from string', () => {
      expect(removeSpecialChars('Hello! World?')).toBe('Hello World');
      expect(removeSpecialChars('Hello@World#')).toBe('HelloWorld');
    });
  });

  describe('removeExtraSpaces', () => {
    it('should return empty string for empty input', () => {
      expect(removeExtraSpaces('')).toBe('');
    });

    it('should remove extra spaces from string', () => {
      expect(removeExtraSpaces('Hello   World')).toBe('Hello World');
      expect(removeExtraSpaces('  Hello  World  ')).toBe('Hello World');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should return empty string for empty input', () => {
      expect(formatPhoneNumber('')).toBe('');
    });

    it('should format phone number correctly', () => {
      expect(formatPhoneNumber('11999999999')).toBe('(11) 99999-9999');
      expect(formatPhoneNumber('1199999999')).toBe('(11) 99999-9999');
    });
  });

  describe('formatCPF', () => {
    it('should return empty string for empty input', () => {
      expect(formatCPF('')).toBe('');
    });

    it('should format CPF correctly', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01');
    });
  });

  describe('formatCNPJ', () => {
    it('should return empty string for empty input', () => {
      expect(formatCNPJ('')).toBe('');
    });

    it('should format CNPJ correctly', () => {
      expect(formatCNPJ('12345678901234')).toBe('12.345.678/9012-34');
    });
  });

  describe('formatCEP', () => {
    it('should return empty string for empty input', () => {
      expect(formatCEP('')).toBe('');
    });

    it('should format CEP correctly', () => {
      expect(formatCEP('12345678')).toBe('12345-678');
    });
  });

  describe('maskEmail', () => {
    it('should return empty string for empty input', () => {
      expect(maskEmail('')).toBe('');
    });

    it('should mask email correctly', () => {
      expect(maskEmail('test@example.com')).toBe('t**t@example.com');
      expect(maskEmail('john.doe@example.com')).toBe('j**n.d**e@example.com');
    });
  });

  describe('maskPhone', () => {
    it('should return empty string for empty input', () => {
      expect(maskPhone('')).toBe('');
    });

    it('should mask phone number correctly', () => {
      expect(maskPhone('11999999999')).toBe('(11) *****-9999');
    });
  });

  describe('maskCPF', () => {
    it('should return empty string for empty input', () => {
      expect(maskCPF('')).toBe('');
    });

    it('should mask CPF correctly', () => {
      expect(maskCPF('12345678901')).toBe('***.***.789-01');
    });
  });

  describe('maskCNPJ', () => {
    it('should return empty string for empty input', () => {
      expect(maskCNPJ('')).toBe('');
    });

    it('should mask CNPJ correctly', () => {
      expect(maskCNPJ('12345678901234')).toBe('**.***.789/****-34');
    });
  });

  describe('generateRandomString', () => {
    it('should generate string of specified length', () => {
      const length = 10;
      const result = generateRandomString(length);
      expect(result.length).toBe(length);
      expect(result).toMatch(/^[A-Za-z0-9]+$/);
    });
  });

  describe('generateRandomNumber', () => {
    it('should generate number string of specified length', () => {
      const length = 6;
      const result = generateRandomNumber(length);
      expect(result.length).toBe(length);
      expect(result).toMatch(/^[0-9]+$/);
    });
  });
}); 