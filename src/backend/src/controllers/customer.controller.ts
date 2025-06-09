/**
 * Customer controller for handling customer-related operations
 * @module controllers/customer
 */

import { Request, Response, NextFunction } from 'express';
import { Customer, ICustomer } from '../../backend/src/models/Customer';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';
import { FilterQuery } from 'mongoose';

/**
 * Interface for customer query parameters
 * @interface CustomerQueryParams
 */
interface CustomerQueryParams {
  /** Search term for customer name, email, or document */
  search?: string;
  /** Filter by document type (CPF/CNPJ) */
  documentType?: 'cpf' | 'cnpj';
  /** Filter by state */
  state?: string;
  /** Filter by city */
  city?: string;
  /** Whether to include inactive customers */
  includeInactive?: boolean;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Page number for pagination */
  page?: number;
  /** Items per page for pagination */
  limit?: number;
}

/**
 * Customer controller class containing all customer-related operations
 * @class CustomerController
 */
export class CustomerController {
  /**
   * Create a new customer
   * @async
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   * @returns {Promise<void>}
   */
  static createCustomer = catchAsync(async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    const customer = await Customer.create(req.body);
    res.status(201).json({
      status: 'success',
      data: customer,
    });
  });

  /**
   * Get all customers with filtering, sorting, and pagination
   * @async
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   * @returns {Promise<void>}
   */
  static getAllCustomers = catchAsync(async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    const {
      search,
      documentType,
      state,
      city,
      includeInactive = false,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
    } = req.query as unknown as CustomerQueryParams;

    // Build filter query
    const filter: FilterQuery<ICustomer> = {};
    
    if (!includeInactive) {
      filter.isActive = true;
    }
    
    if (search) {
      filter.$or = [
        { nome: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { documento: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (documentType) {
      filter.documento = documentType === 'cpf' 
        ? { $regex: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/ }
        : { $regex: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/ };
    }
    
    if (state) {
      filter['endereco.estado'] = state.toUpperCase();
    }
    
    if (city) {
      filter['endereco.cidade'] = { $regex: city, $options: 'i' };
    }

    // Build sort query
    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.nome = 1; // Default sort by name
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Customer.countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  /**
   * Get a single customer by ID
   * @async
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   * @returns {Promise<void>}
   */
  static getCustomer = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return next(new ApiError('Cliente não encontrado', 404));
    }

    res.status(200).json({
      status: 'success',
      data: customer,
    });
  });

  /**
   * Update a customer
   * @async
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   * @returns {Promise<void>}
   */
  static updateCustomer = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return next(new ApiError('Cliente não encontrado', 404));
    }

    res.status(200).json({
      status: 'success',
      data: customer,
    });
  });

  /**
   * Delete a customer (soft delete by setting isActive to false)
   * @async
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   * @returns {Promise<void>}
   */
  static deleteCustomer = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      return next(new ApiError('Cliente não encontrado', 404));
    }

    res.status(200).json({
      status: 'success',
      data: null,
    });
  });

  /**
   * Search customers by document (CPF/CNPJ)
   * @async
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   * @returns {Promise<void>}
   */
  static searchByDocument = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { documento } = req.params;
    
    const customer = await Customer.findOne({
      documento: documento.replace(/[^\d]/g, '')
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    });

    if (!customer) {
      return next(new ApiError('Cliente não encontrado', 404));
    }

    res.status(200).json({
      status: 'success',
      data: customer,
    });
  });

  /**
   * Search customers by CEP
   * @async
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   * @returns {Promise<void>}
   */
  static searchByCEP = catchAsync(async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    const { cep } = req.params;
    
    const customers = await Customer.find({
      'endereco.cep': cep.replace(/[^\d]/g, '')
        .replace(/(\d{5})(\d{3})/, '$1-$2')
    });

    res.status(200).json({
      status: 'success',
      data: customers,
    });
  });
} 