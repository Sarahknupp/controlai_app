/**
 * Login form component for user authentication
 * @module components/auth/LoginForm
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validatePasswordComplexity } from '../../utils/passwordUtils';

/**
 * Form field values interface
 * @interface FormValues
 * @property {string} email - User's email address
 * @property {string} password - User's password
 */
interface FormValues {
  email: string;
  password: string;
}

/**
 * Form validation errors interface
 * @interface FormErrors
 * @property {string} [email] - Email validation error message
 * @property {string} [password] - Password validation error message
 */
interface FormErrors {
  email?: string;
  password?: string;
}

/**
 * Login form component with validation and error handling
 * @component
 * @returns {JSX.Element} Login form with email and password fields
 * @example
 * ```tsx
 * function AuthPage() {
 *   return (
 *     <div>
 *       <h1>Login</h1>
 *       <LoginForm />
 *     </div>
 *   );
 * }
 * ```
 */
const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [values, setValues] = useState<FormValues>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validates form fields
   * @function validateForm
   * @returns {boolean} Whether the form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate email
    if (!values.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validate password
    if (!values.password) {
      newErrors.password = 'Senha é obrigatória';
    } else {
      const passwordValidation = validatePasswordComplexity(values.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form field changes
   * @function handleChange
   * @param {React.ChangeEvent<HTMLInputElement>} event - Change event
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  /**
   * Handles form submission
   * @function handleSubmit
   * @param {React.FormEvent} event - Form submission event
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        navigate('/dashboard');
      } else {
        setErrors({
          password: 'Email ou senha inválidos',
        });
      }
    } catch (error) {
      setErrors({
        password: 'Erro ao fazer login. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            errors.email
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Senha
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            errors.password
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
        />
        {errors.password && (
          <p className="mt-2 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          isSubmitting
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
      >
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
};

export default LoginForm; 