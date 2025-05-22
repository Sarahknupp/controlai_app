import { Sale } from '../models/sale.model';
import { Product } from '../models/product.model';
import { Customer } from '../models/customer.model';
import { User } from '../models/user.model';
import { AuditService } from './audit.service';
import { EntityType, AuditAction } from '../types/audit';
import { NotificationService } from './notification.service';
import { EventEmitter } from 'events';
import logger from '../utils/logger';
import { UserRole } from './user.service';
import { RoleService, Permission } from './role.service';

interface ValidationOptions {
  type: 'sales' | 'products' | 'customers' | 'users' | 'all';
  userId?: string;
  filters?: Record<string, any>;
}

interface ValidationResult {
  validationId: string;
  type: string;
  timestamp: Date;
  status: 'success' | 'error';
  details: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    errors: Array<{
      entityId: string;
      field: string;
      error: string;
    }>;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ValidationService extends EventEmitter {
  private auditService: AuditService;
  private notificationService: NotificationService;
  private validationInProgress: boolean;
  private roleService: RoleService;

  constructor() {
    super();
    this.auditService = new AuditService();
    this.notificationService = new NotificationService();
    this.validationInProgress = false;
    this.roleService = new RoleService();
  }

  async validateData(options: ValidationOptions): Promise<ValidationResult> {
    if (this.validationInProgress) {
      throw new Error('Validation already in progress');
    }

    const timestamp = new Date();
    const validationId = `validation_${options.type}_${timestamp.getTime()}`;
    this.validationInProgress = true;

    try {
      const result = await this.performValidation(options);

      // Log the validation
      await this.auditService.logAction({
        action: AuditAction.READ,
        entityType: EntityType.VALIDATION,
        entityId: validationId,
        userId: options.userId,
        details: `Validated ${options.type} data`,
        status: 'success'
      });

      // Emit validation complete event
      this.emit('validationComplete', {
        type: options.type,
        timestamp,
        result
      });

      // Send notification
      await this.notificationService.sendNotification({
        type: 'system',
        priority: 'medium',
        title: 'Data Validation Complete',
        message: `Successfully validated ${options.type} data`,
        metadata: {
          validationId,
          type: options.type,
          timestamp: timestamp.toISOString()
        }
      });

      return {
        validationId,
        type: options.type,
        timestamp,
        status: 'success',
        details: result
      };
    } catch (error) {
      logger.error('Error validating data:', error);

      // Log failure
      await this.auditService.logAction({
        action: AuditAction.READ,
        entityType: EntityType.VALIDATION,
        entityId: validationId,
        userId: options.userId,
        details: `Failed to validate ${options.type} data: ${error.message}`,
        status: 'error'
      });

      // Send failure notification
      await this.notificationService.sendNotification({
        type: 'error',
        priority: 'high',
        title: 'Data Validation Failed',
        message: `Failed to validate ${options.type} data`,
        metadata: {
          validationId,
          type: options.type,
          error: error.message,
          timestamp: timestamp.toISOString()
        }
      });

      throw error;
    } finally {
      this.validationInProgress = false;
    }
  }

  private async performValidation(options: ValidationOptions): Promise<{
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    errors: Array<{ entityId: string; field: string; error: string }>;
  }> {
    const result = {
      totalRecords: 0,
      validRecords: 0,
      invalidRecords: 0,
      errors: [] as Array<{ entityId: string; field: string; error: string }>
    };

    const types = options.type === 'all' 
      ? ['sales', 'products', 'customers', 'users']
      : [options.type];

    for (const type of types) {
      const typeResult = await this.validateEntityType(type, options.filters);
      result.totalRecords += typeResult.totalRecords;
      result.validRecords += typeResult.validRecords;
      result.invalidRecords += typeResult.invalidRecords;
      result.errors.push(...typeResult.errors);
    }

    return result;
  }

  private async validateEntityType(type: string, filters?: Record<string, any>): Promise<{
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    errors: Array<{ entityId: string; field: string; error: string }>;
  }> {
    const result = {
      totalRecords: 0,
      validRecords: 0,
      invalidRecords: 0,
      errors: [] as Array<{ entityId: string; field: string; error: string }>
    };

    try {
      switch (type) {
        case 'sales':
          await this.validateSales(result, filters);
          break;
        case 'products':
          await this.validateProducts(result, filters);
          break;
        case 'customers':
          await this.validateCustomers(result, filters);
          break;
        case 'users':
          await this.validateUsers(result, filters);
          break;
        default:
          throw new Error('Invalid validation type');
      }
    } catch (error) {
      logger.error(`Error validating ${type}:`, error);
      result.errors.push({
        entityId: type,
        field: 'type',
        error: error.message
      });
    }

    return result;
  }

  private async validateSales(result: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    errors: Array<{ entityId: string; field: string; error: string }>;
  }, filters?: Record<string, any>): Promise<void> {
    const sales = await Sale.find(filters || {}).populate('customer product user');
    result.totalRecords = sales.length;

    for (const sale of sales) {
      const errors = [];

      // Validate required fields
      if (!sale.customer) {
        errors.push({ field: 'customer', error: 'Customer is required' });
      }
      if (!sale.product) {
        errors.push({ field: 'product', error: 'Product is required' });
      }
      if (!sale.quantity || sale.quantity <= 0) {
        errors.push({ field: 'quantity', error: 'Quantity must be greater than 0' });
      }
      if (!sale.price || sale.price <= 0) {
        errors.push({ field: 'price', error: 'Price must be greater than 0' });
      }
      if (!sale.paymentMethod) {
        errors.push({ field: 'paymentMethod', error: 'Payment method is required' });
      }

      // Validate relationships
      if (sale.product && sale.quantity > sale.product.stock) {
        errors.push({ field: 'quantity', error: 'Quantity exceeds available stock' });
      }

      if (errors.length === 0) {
        result.validRecords++;
      } else {
        result.invalidRecords++;
        result.errors.push(...errors.map(error => ({
          entityId: sale._id.toString(),
          ...error
        })));
      }
    }
  }

  private async validateProducts(result: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    errors: Array<{ entityId: string; field: string; error: string }>;
  }, filters?: Record<string, any>): Promise<void> {
    const products = await Product.find(filters || {});
    result.totalRecords = products.length;

    for (const product of products) {
      const errors = [];

      // Validate required fields
      if (!product.name) {
        errors.push({ field: 'name', error: 'Name is required' });
      }
      if (!product.price || product.price <= 0) {
        errors.push({ field: 'price', error: 'Price must be greater than 0' });
      }
      if (product.stock < 0) {
        errors.push({ field: 'stock', error: 'Stock cannot be negative' });
      }

      // Validate unique fields
      if (product.sku) {
        const duplicateSku = await Product.findOne({ sku: product.sku, _id: { $ne: product._id } });
        if (duplicateSku) {
          errors.push({ field: 'sku', error: 'SKU must be unique' });
        }
      }

      if (errors.length === 0) {
        result.validRecords++;
      } else {
        result.invalidRecords++;
        result.errors.push(...errors.map(error => ({
          entityId: product._id.toString(),
          ...error
        })));
      }
    }
  }

  private async validateCustomers(result: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    errors: Array<{ entityId: string; field: string; error: string }>;
  }, filters?: Record<string, any>): Promise<void> {
    const customers = await Customer.find(filters || {});
    result.totalRecords = customers.length;

    for (const customer of customers) {
      const errors = [];

      // Validate required fields
      if (!customer.name) {
        errors.push({ field: 'name', error: 'Name is required' });
      }
      if (!customer.email) {
        errors.push({ field: 'email', error: 'Email is required' });
      } else if (!this.isValidEmail(customer.email)) {
        errors.push({ field: 'email', error: 'Invalid email format' });
      }

      // Validate unique fields
      const duplicateEmail = await Customer.findOne({ email: customer.email, _id: { $ne: customer._id } });
      if (duplicateEmail) {
        errors.push({ field: 'email', error: 'Email must be unique' });
      }

      if (errors.length === 0) {
        result.validRecords++;
      } else {
        result.invalidRecords++;
        result.errors.push(...errors.map(error => ({
          entityId: customer._id.toString(),
          ...error
        })));
      }
    }
  }

  private async validateUsers(result: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    errors: Array<{ entityId: string; field: string; error: string }>;
  }, filters?: Record<string, any>): Promise<void> {
    const users = await User.find(filters || {});
    result.totalRecords = users.length;

    for (const user of users) {
      const errors = [];

      // Validate required fields
      if (!user.name) {
        errors.push({ field: 'name', error: 'Name is required' });
      }
      if (!user.email) {
        errors.push({ field: 'email', error: 'Email is required' });
      } else if (!this.isValidEmail(user.email)) {
        errors.push({ field: 'email', error: 'Invalid email format' });
      }
      if (!user.role) {
        errors.push({ field: 'role', error: 'Role is required' });
      }

      // Validate unique fields
      const duplicateEmail = await User.findOne({ email: user.email, _id: { $ne: user._id } });
      if (duplicateEmail) {
        errors.push({ field: 'email', error: 'Email must be unique' });
      }

      if (errors.length === 0) {
        result.validRecords++;
      } else {
        result.invalidRecords++;
        result.errors.push(...errors.map(error => ({
          entityId: user._id.toString(),
          ...error
        })));
      }
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidationInProgress(): boolean {
    return this.validationInProgress;
  }

  // User Validation
  async validateUserData(data: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Required fields
    if (!data.email) {
      errors.push({
        field: 'email',
        message: 'Email é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    } else if (!this.isValidEmail(data.email)) {
      errors.push({
        field: 'email',
        message: 'Email inválido',
        code: 'INVALID_EMAIL'
      });
    }

    if (!data.name) {
      errors.push({
        field: 'name',
        message: 'Nome é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!data.role) {
      errors.push({
        field: 'role',
        message: 'Função é obrigatória',
        code: 'REQUIRED_FIELD'
      });
    } else if (!Object.values(UserRole).includes(data.role)) {
      errors.push({
        field: 'role',
        message: 'Função inválida',
        code: 'INVALID_ROLE'
      });
    }

    // Password validation
    if (data.password) {
      const passwordErrors = this.validatePassword(data.password);
      errors.push(...passwordErrors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Customer Validation
  async validateCustomerData(data: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Required fields
    if (!data.name) {
      errors.push({
        field: 'name',
        message: 'Nome é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!data.email) {
      errors.push({
        field: 'email',
        message: 'Email é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    } else if (!this.isValidEmail(data.email)) {
      errors.push({
        field: 'email',
        message: 'Email inválido',
        code: 'INVALID_EMAIL'
      });
    }

    if (!data.document) {
      errors.push({
        field: 'document',
        message: 'CPF/CNPJ é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    } else if (!this.isValidDocument(data.document)) {
      errors.push({
        field: 'document',
        message: 'CPF/CNPJ inválido',
        code: 'INVALID_DOCUMENT'
      });
    }

    // Phone validation
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push({
        field: 'phone',
        message: 'Telefone inválido',
        code: 'INVALID_PHONE'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Product Validation
  async validateProductData(data: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Required fields
    if (!data.name) {
      errors.push({
        field: 'name',
        message: 'Nome é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!data.sku) {
      errors.push({
        field: 'sku',
        message: 'SKU é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    }

    if (data.price === undefined || data.price === null) {
      errors.push({
        field: 'price',
        message: 'Preço é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    } else if (data.price < 0) {
      errors.push({
        field: 'price',
        message: 'Preço não pode ser negativo',
        code: 'INVALID_PRICE'
      });
    }

    if (data.stock !== undefined && data.stock < 0) {
      errors.push({
        field: 'stock',
        message: 'Estoque não pode ser negativo',
        code: 'INVALID_STOCK'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Order Validation
  async validateOrderData(data: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Required fields
    if (!data.customerId) {
      errors.push({
        field: 'customerId',
        message: 'Cliente é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push({
        field: 'items',
        message: 'Pedido deve conter pelo menos um item',
        code: 'REQUIRED_FIELD'
      });
    } else {
      // Validate each order item
      data.items.forEach((item: any, index: number) => {
        if (!item.productId) {
          errors.push({
            field: `items[${index}].productId`,
            message: 'Produto é obrigatório',
            code: 'REQUIRED_FIELD'
          });
        }

        if (!item.quantity || item.quantity <= 0) {
          errors.push({
            field: `items[${index}].quantity`,
            message: 'Quantidade deve ser maior que zero',
            code: 'INVALID_QUANTITY'
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Payment Validation
  async validatePaymentData(data: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Required fields
    if (!data.orderId) {
      errors.push({
        field: 'orderId',
        message: 'Pedido é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!data.amount || data.amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Valor deve ser maior que zero',
        code: 'INVALID_AMOUNT'
      });
    }

    if (!data.method) {
      errors.push({
        field: 'method',
        message: 'Método de pagamento é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    }

    // Validate payment method specific data
    if (data.method === 'CREDIT_CARD' || data.method === 'DEBIT_CARD') {
      if (!data.cardNumber || !this.isValidCardNumber(data.cardNumber)) {
        errors.push({
          field: 'cardNumber',
          message: 'Número do cartão inválido',
          code: 'INVALID_CARD_NUMBER'
        });
      }

      if (!data.expiryDate || !this.isValidExpiryDate(data.expiryDate)) {
        errors.push({
          field: 'expiryDate',
          message: 'Data de expiração inválida',
          code: 'INVALID_EXPIRY_DATE'
        });
      }

      if (!data.cvv || !this.isValidCVV(data.cvv)) {
        errors.push({
          field: 'cvv',
          message: 'CVV inválido',
          code: 'INVALID_CVV'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Permission Validation
  async validatePermissions(userRole: UserRole, requiredPermissions: Permission[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const hasPermissions = await this.roleService.validatePermissions(userRole, requiredPermissions);

    if (!hasPermissions) {
      errors.push({
        field: 'permissions',
        message: 'Usuário não possui as permissões necessárias',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper Methods
  private validatePassword(password: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (password.length < 8) {
      errors.push({
        field: 'password',
        message: 'Senha deve ter pelo menos 8 caracteres',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    if (!/[A-Z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Senha deve conter pelo menos uma letra maiúscula',
        code: 'PASSWORD_NO_UPPERCASE'
      });
    }

    if (!/[a-z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Senha deve conter pelo menos uma letra minúscula',
        code: 'PASSWORD_NO_LOWERCASE'
      });
    }

    if (!/[0-9]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Senha deve conter pelo menos um número',
        code: 'PASSWORD_NO_NUMBER'
      });
    }

    if (!/[!@#$%^&*]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Senha deve conter pelo menos um caractere especial',
        code: 'PASSWORD_NO_SPECIAL'
      });
    }

    return errors;
  }

  private isValidDocument(document: string): boolean {
    // Remove non-numeric characters
    const cleanDoc = document.replace(/\D/g, '');

    // Check if it's a CPF (11 digits) or CNPJ (14 digits)
    if (cleanDoc.length === 11) {
      return this.isValidCPF(cleanDoc);
    } else if (cleanDoc.length === 14) {
      return this.isValidCNPJ(cleanDoc);
    }

    return false;
  }

  private isValidCPF(cpf: string): boolean {
    // CPF validation logic
    if (cpf.length !== 11) return false;

    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Validate first digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;

    // Validate second digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  private isValidCNPJ(cnpj: string): boolean {
    // CNPJ validation logic
    if (cnpj.length !== 14) return false;

    // Check if all digits are the same
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    // Validate first digit
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    let digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    // Validate second digit
    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  }

  private isValidPhone(phone: string): boolean {
    // Remove non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Brazilian phone numbers should have 10 or 11 digits
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  private isValidCardNumber(cardNumber: string): boolean {
    // Remove non-numeric characters
    const cleanNumber = cardNumber.replace(/\D/g, '');
    // Basic length check
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;

    // Luhn algorithm for card number validation
    let sum = 0;
    let isEven = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i));

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  private isValidExpiryDate(expiryDate: string): boolean {
    // Format: MM/YY
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(expiryDate)) return false;

    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expYear = parseInt(year);
    const expMonth = parseInt(month);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return false;
    }

    return true;
  }

  private isValidCVV(cvv: string): boolean {
    // CVV should be 3 or 4 digits
    return /^[0-9]{3,4}$/.test(cvv);
  }
} 