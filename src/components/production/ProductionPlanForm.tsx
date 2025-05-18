/**
 * Production plan form component
 * @module components/production/ProductionPlanForm
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductionPlan, ProductionPriority } from '../../types/production';
import { useAuth } from '../../hooks/useAuth';

/**
 * Form field values interface
 * @interface FormValues
 * @property {Date} date - Production plan date
 * @property {string} area - Production area
 * @property {ProductionPriority} priority - Plan priority level
 * @property {Object[]} products - Products to be produced
 * @property {string} [notes] - Additional notes
 */
interface FormValues {
  date: Date;
  area: string;
  priority: ProductionPriority;
  products: {
    productId: string;
    productName: string;
    quantity: number;
  }[];
  notes?: string;
}

/**
 * Form validation errors interface
 * @interface FormErrors
 * @property {string} [date] - Date validation error
 * @property {string} [area] - Area validation error
 * @property {string} [priority] - Priority validation error
 * @property {string} [products] - Products validation error
 */
interface FormErrors {
  date?: string;
  area?: string;
  priority?: string;
  products?: string;
}

/**
 * Props for the ProductionPlanForm component
 * @interface ProductionPlanFormProps
 * @property {(plan: ProductionPlan) => Promise<void>} onSubmit - Form submission handler
 * @property {ProductionPlan} [initialValues] - Initial form values for editing
 */
interface ProductionPlanFormProps {
  onSubmit: (plan: ProductionPlan) => Promise<void>;
  initialValues?: ProductionPlan;
}

/**
 * Production plan form component for creating and editing production plans
 * @component
 * @param {ProductionPlanFormProps} props - Component props
 * @returns {JSX.Element} Production plan form
 * @example
 * ```tsx
 * const handleSubmit = async (plan: ProductionPlan) => {
 *   await savePlan(plan);
 * };
 * 
 * function ProductionPage() {
 *   return (
 *     <div>
 *       <h1>Novo Plano de Produção</h1>
 *       <ProductionPlanForm onSubmit={handleSubmit} />
 *     </div>
 *   );
 * }
 * ```
 */
const ProductionPlanForm: React.FC<ProductionPlanFormProps> = ({
  onSubmit,
  initialValues,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [values, setValues] = useState<FormValues>(
    initialValues || {
      date: new Date(),
      area: '',
      priority: 'medium',
      products: [],
      notes: '',
    }
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validates form fields
   * @function validateForm
   * @returns {boolean} Whether the form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!values.date) {
      newErrors.date = 'Data é obrigatória';
    }

    if (!values.area) {
      newErrors.area = 'Área é obrigatória';
    }

    if (!values.priority) {
      newErrors.priority = 'Prioridade é obrigatória';
    }

    if (!values.products.length) {
      newErrors.products = 'Adicione pelo menos um produto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form field changes
   * @function handleChange
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} event - Change event
   */
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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
   * Handles product list changes
   * @function handleProductChange
   * @param {number} index - Product index in array
   * @param {Partial<FormValues['products'][0]>} changes - Changes to apply
   */
  const handleProductChange = (
    index: number,
    changes: Partial<FormValues['products'][0]>
  ) => {
    setValues((prev) => ({
      ...prev,
      products: prev.products.map((product, i) =>
        i === index ? { ...product, ...changes } : product
      ),
    }));
  };

  /**
   * Adds a new product to the list
   * @function handleAddProduct
   */
  const handleAddProduct = () => {
    setValues((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        { productId: '', productName: '', quantity: 0 },
      ],
    }));
  };

  /**
   * Removes a product from the list
   * @function handleRemoveProduct
   * @param {number} index - Product index to remove
   */
  const handleRemoveProduct = (index: number) => {
    setValues((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
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
      const plan: ProductionPlan = {
        id: initialValues?.id || crypto.randomUUID(),
        date: values.date,
        status: initialValues?.status || 'planned',
        assignedTo: user?.id || '',
        area: values.area,
        priority: values.priority,
        estimatedTimeMinutes: 0, // This would be calculated based on products
        products: values.products.map(p => ({
          ...p,
          completed: 0,
          wasted: 0,
        })),
        notes: values.notes,
      };

      await onSubmit(plan);
      navigate('/production/plans');
    } catch (error) {
      setErrors({
        products: 'Erro ao salvar o plano. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700"
        >
          Data
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={values.date.toISOString().split('T')[0]}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            errors.date
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
        />
        {errors.date && (
          <p className="mt-2 text-sm text-red-600">{errors.date}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="area"
          className="block text-sm font-medium text-gray-700"
        >
          Área
        </label>
        <select
          id="area"
          name="area"
          value={values.area}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            errors.area
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
        >
          <option value="">Selecione uma área</option>
          <option value="padaria">Padaria</option>
          <option value="confeitaria">Confeitaria</option>
          <option value="cozinha">Cozinha</option>
        </select>
        {errors.area && (
          <p className="mt-2 text-sm text-red-600">{errors.area}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="priority"
          className="block text-sm font-medium text-gray-700"
        >
          Prioridade
        </label>
        <select
          id="priority"
          name="priority"
          value={values.priority}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            errors.priority
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
        >
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
        {errors.priority && (
          <p className="mt-2 text-sm text-red-600">{errors.priority}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Produtos
        </label>
        {values.products.map((product, index) => (
          <div key={index} className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="Nome do Produto"
              value={product.productName}
              onChange={(e) =>
                handleProductChange(index, { productName: e.target.value })
              }
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Quantidade"
              value={product.quantity}
              onChange={(e) =>
                handleProductChange(index, {
                  quantity: parseInt(e.target.value, 10),
                })
              }
              className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => handleRemoveProduct(index)}
              className="rounded-md bg-red-100 p-2 text-red-600 hover:bg-red-200"
            >
              Remover
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddProduct}
          className="mt-2 rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
        >
          Adicionar Produto
        </button>
        {errors.products && (
          <p className="mt-2 text-sm text-red-600">{errors.products}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Observações
        </label>
        <textarea
          id="notes"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/production/plans')}
          className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`rounded-md px-4 py-2 text-white ${
            isSubmitting
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};

export default ProductionPlanForm; 