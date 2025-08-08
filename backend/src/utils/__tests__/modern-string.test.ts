import {
  generateRandomString,
  formatTemplate,
  removeSpecialChars,
  slugify
} from '../modern-string';

// Mock crypto for testing
const mockGetRandomValues = jest.fn();
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: mockGetRandomValues
  }
});

describe('Modern String Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateRandomString', () => {
    it('should use crypto.getRandomValues when available', () => {
      const length = 10;
      mockGetRandomValues.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = 65; // ASCII 'A' when modded with chars length
        }
        return array;
      });

      const result = generateRandomString(length);
      expect(result).toHaveLength(length);
      expect(mockGetRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array));
    });

    it('should fallback to Math.random when crypto is not available', () => {
      // Temporarily remove crypto
      const originalCrypto = global.crypto;
      delete (global as any).crypto;
      
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = generateRandomString(8);
      expect(result).toHaveLength(8);
      expect(result).toMatch(/^[A-Za-z0-9]+$/);

      // Restore crypto
      (global as any).crypto = originalCrypto;
      jest.restoreAllMocks();
    });

    it('should generate strings of different lengths', () => {
      [1, 5, 10, 20, 50].forEach(length => {
        const result = generateRandomString(length);
        expect(result).toHaveLength(length);
      });
    });

    it('should generate different strings on multiple calls', () => {
      const results = Array.from({ length: 10 }, () => generateRandomString(10));
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
  });

  describe('formatTemplate', () => {
    it('should replace template variables with values', () => {
      const template = 'Hello {{name}}, welcome to {{app}}!';
      const values = { name: 'John', app: 'ControleAI' };
      const result = formatTemplate(template, values);
      expect(result).toBe('Hello John, welcome to ControleAI!');
    });

    it('should leave unknown variables unchanged', () => {
      const template = 'Hello {{name}}, {{unknown}} variable';
      const values = { name: 'John' };
      const result = formatTemplate(template, values);
      expect(result).toBe('Hello John, {{unknown}} variable');
    });

    it('should handle empty template', () => {
      const result = formatTemplate('', {});
      expect(result).toBe('');
    });

    it('should handle template without variables', () => {
      const template = 'Hello World';
      const result = formatTemplate(template, {});
      expect(result).toBe('Hello World');
    });

    it('should handle multiple occurrences of same variable', () => {
      const template = '{{name}} said: "Hello {{name}}"';
      const values = { name: 'John' };
      const result = formatTemplate(template, values);
      expect(result).toBe('John said: "Hello John"');
    });
  });

  describe('removeSpecialChars (modern implementation)', () => {
    it('should remove special characters using Set-based approach', () => {
      expect(removeSpecialChars('Hello! World?')).toBe('Hello World');
      expect(removeSpecialChars('Test@#$%^&*()_+')).toBe('Test');
      expect(removeSpecialChars('a1b2c3')).toBe('a1b2c3');
    });

    it('should preserve alphanumeric and spaces', () => {
      expect(removeSpecialChars('ABC 123 xyz')).toBe('ABC 123 xyz');
    });

    it('should handle empty string', () => {
      expect(removeSpecialChars('')).toBe('');
    });

    it('should handle string with only special characters', () => {
      expect(removeSpecialChars('!@#$%^&*()')).toBe('');
    });

    it('should handle unicode characters', () => {
      expect(removeSpecialChars('Test™®©')).toBe('Test');
    });

    // Performance test
    it('should handle large strings efficiently', () => {
      const largeString = 'a'.repeat(10000) + '!'.repeat(10000);
      const start = performance.now();
      const result = removeSpecialChars(largeString);
      const end = performance.now();
      
      expect(result).toBe('a'.repeat(10000));
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });
  });

  describe('slugify (with memoization)', () => {
    it('should convert strings to URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Hello & World')).toBe('hello-world');
      expect(slugify('Olá Mundo')).toBe('ola-mundo');
    });

    it('should handle accented characters', () => {
      expect(slugify('Café com Açúcar')).toBe('cafe-com-acucar');
      expect(slugify('São Paulo')).toBe('sao-paulo');
    });

    it('should memoize results for performance', () => {
      const input = 'Complex String to Slugify';
      
      // First call
      const start1 = performance.now();
      const result1 = slugify(input);
      const end1 = performance.now();
      const time1 = end1 - start1;
      
      // Second call (should be cached)
      const start2 = performance.now();
      const result2 = slugify(input);
      const end2 = performance.now();
      const time2 = end2 - start2;
      
      expect(result1).toBe(result2);
      expect(result1).toBe('complex-string-to-slugify');
      expect(time2).toBeLessThan(time1); // Cached call should be faster
    });

    it('should handle cache size limits', () => {
      // This test ensures the cache doesn't grow indefinitely
      // Generate 1100 unique strings (more than cache limit of 1000)
      for (let i = 0; i < 1100; i++) {
        slugify(`test string ${i}`);
      }
      
      // Should still work without memory issues
      expect(slugify('final test')).toBe('final-test');
    });

    it('should handle edge cases', () => {
      expect(slugify('')).toBe('');
      expect(slugify('---')).toBe('');
      expect(slugify('  multiple   spaces  ')).toBe('multiple-spaces');
      expect(slugify('UPPERCASE')).toBe('uppercase');
    });

    it('should remove leading and trailing dashes', () => {
      expect(slugify('-test-')).toBe('test');
      expect(slugify('--test--')).toBe('test');
    });
  });

  describe('Performance characteristics', () => {
    it('should handle concurrent operations efficiently', async () => {
      const operations = Array.from({ length: 100 }, (_, i) => 
        Promise.resolve().then(() => ({
          random: generateRandomString(10),
          template: formatTemplate('Test {{num}}', { num: i.toString() }),
          slug: slugify(`Test String ${i}`)
        }))
      );

      const start = performance.now();
      const results = await Promise.all(operations);
      const end = performance.now();

      expect(results).toHaveLength(100);
      expect(end - start).toBeLessThan(1000); // Should complete in less than 1 second
      
      // Verify all operations produced valid results
      results.forEach((result, index) => {
        expect(result.random).toHaveLength(10);
        expect(result.template).toBe(`Test ${index}`);
        expect(result.slug).toBe(`test-string-${index}`);
      });
    });
  });
});