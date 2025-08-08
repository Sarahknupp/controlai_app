/**
 * Modern string utilities with enhanced performance and security
 */

/**
 * Generates a cryptographically secure random string
 * @param length - Length of the string to generate
 * @returns Random string
 */
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  // Modern: Use crypto.getRandomValues for better randomness
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes, byte => chars[byte % chars.length]).join('');
  }
  
  // Fallback: Use Array.from with modern functional approach
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

/**
 * Template literal processor for better formatting
 * @param template - Template string with {{variable}} placeholders
 * @param values - Object with replacement values
 * @returns Formatted string
 */
export const formatTemplate = (template: string, values: Record<string, string>): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => values[key] ?? match);
};

// Modern: Use Set for better performance in removeSpecialChars
export const removeSpecialChars = (str: string): string => {
  if (!str) return '';
  
  // Modern: Use Set for O(1) lookup instead of regex
  const allowedChars = new Set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ');
  return Array.from(str).filter(char => allowedChars.has(char)).join('');
};

// Memoization for expensive operations
const slugifyCache = new Map<string, string>();

export const slugify = (str: string): string => {
  if (!str) return '';
  
  // Use memoization for performance
  if (slugifyCache.has(str)) {
    return slugifyCache.get(str)!;
  }
  
  const result = str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // Cache result (with size limit)
  if (slugifyCache.size >= 1000) {
    const firstKey = slugifyCache.keys().next().value;
    if (firstKey !== undefined) {
      slugifyCache.delete(firstKey);
    }
  }
  slugifyCache.set(str, result);
  
  return result;
};