/**
 * Password validation and strength checking utilities
 * @module utils/passwordUtils
 */

/**
 * Password strength score
 * @type {number}
 * @description Score from 0 (weakest) to 4 (strongest)
 */
export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

/**
 * Password validation result
 * @interface PasswordValidationResult
 * @property {boolean} isValid - Whether the password meets minimum requirements
 * @property {PasswordStrength} score - Password strength score
 * @property {string[]} errors - List of validation errors
 * @property {string[]} suggestions - List of improvement suggestions
 */
interface PasswordValidationResult {
  isValid: boolean;
  score: PasswordStrength;
  errors: string[];
  suggestions: string[];
}

/**
 * Password complexity requirements
 * @interface PasswordRequirements
 * @property {number} minLength - Minimum password length
 * @property {boolean} requireUppercase - Require at least one uppercase letter
 * @property {boolean} requireLowercase - Require at least one lowercase letter
 * @property {boolean} requireNumbers - Require at least one number
 * @property {boolean} requireSpecial - Require at least one special character
 */
interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecial: boolean;
}

/**
 * Default password requirements
 * @constant {PasswordRequirements}
 */
const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecial: true,
};

/**
 * Validates password complexity and returns strength score
 * @function validatePasswordComplexity
 * @param {string} password - Password to validate
 * @param {PasswordRequirements} [requirements] - Custom validation requirements
 * @returns {PasswordValidationResult} Validation result with score and feedback
 * @example
 * ```ts
 * const result = validatePasswordComplexity('MyP@ssw0rd');
 * if (result.isValid) {
 *   console.log(`Password strength: ${result.score}/4`);
 * } else {
 *   console.log('Validation errors:', result.errors);
 * }
 * ```
 */
export const validatePasswordComplexity = (
  password: string,
  requirements: PasswordRequirements = DEFAULT_REQUIREMENTS
): PasswordValidationResult => {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Check length
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  } else {
    score += 1;
  }

  // Check uppercase
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Check lowercase
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Check numbers
  if (requirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Check special characters
  if (requirements.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  // Add suggestions for improvement
  if (score < 4) {
    if (password.length < 12) {
      suggestions.push('Consider using a longer password');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      suggestions.push('Add special characters to make your password stronger');
    }
    if (!/\d/.test(password)) {
      suggestions.push('Include numbers for better security');
    }
  }

  return {
    isValid: errors.length === 0,
    score: Math.min(score, 4) as PasswordStrength,
    errors,
    suggestions,
  };
};

/**
 * Gets a descriptive label for a password strength score
 * @function getPasswordStrengthLabel
 * @param {PasswordStrength} score - Password strength score
 * @returns {string} Human-readable strength label
 * @example
 * ```ts
 * const label = getPasswordStrengthLabel(3); // Returns "Strong"
 * ```
 */
export const getPasswordStrengthLabel = (score: PasswordStrength): string => {
  switch (score) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Strong';
    case 4:
      return 'Very Strong';
    default:
      return 'Unknown';
  }
};

/**
 * Gets a color code for a password strength score
 * @function getPasswordStrengthColor
 * @param {PasswordStrength} score - Password strength score
 * @returns {string} Color code for visual feedback
 * @example
 * ```ts
 * const color = getPasswordStrengthColor(4); // Returns "#22c55e" (green)
 * ```
 */
export const getPasswordStrengthColor = (score: PasswordStrength): string => {
  switch (score) {
    case 0:
      return '#ef4444'; // red-500
    case 1:
      return '#f97316'; // orange-500
    case 2:
      return '#eab308'; // yellow-500
    case 3:
      return '#84cc16'; // lime-500
    case 4:
      return '#22c55e'; // green-500
    default:
      return '#6b7280'; // gray-500
  }
};

/**
 * Checks if two passwords match
 * @function doPasswordsMatch
 * @param {string} password - First password
 * @param {string} confirmPassword - Second password to compare
 * @returns {boolean} Whether the passwords match
 * @example
 * ```ts
 * if (!doPasswordsMatch(password, confirmPassword)) {
 *   console.error('Passwords do not match');
 * }
 * ```
 */
export const doPasswordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number, one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  return passwordRegex.test(password);
};