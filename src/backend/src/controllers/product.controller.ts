/**
 * Product controller for handling product-related operations
 * @module controllers/product
 */

import { Request, Response, NextFunction } from 'express';
import { Product, ProductDocument } from '../models/Product';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';
import { FilterQuery } from 'mongoose';

/**
 * Interface for product query parameters
 * @interface ProductQueryParams
 */
interface ProductQueryParams {
  /** Search term for product name or description */
  search?: string;
  /** Category ID filter */
  category?: string;
  /** Minimum price filter */
  minPrice?: number;
  /** Maximum price filter */
  maxPrice?: number;
  /** Whether to include inactive products */
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
 * Product controller class containing all product-related operations
 * @class ProductController
 */
export class ProductController {
  /**
   * Create a new product
   * @async
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} _next - Express next function
   * @returns {Promise<void>}
   */
  static createProduct = catchAsync(async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    const product = await Product.create(req.body);
    res.status(201).json({
      status: 'success',
      data: product,
    });
  });

  /**
   * Get all products with filtering, sorting, and pagination
   * @async
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} _next - Express next function
   * @returns {Promise<void>}
   */
  static getAllProducts = catchAsync(async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      includeInactive,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
    } = req.query as unknown as ProductQueryParams;

    // Build filter query
    const filter: FilterQuery<ProductDocument> = {};
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (category) {
      filter['category.id'] = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }
    
    if (!includeInactive) {
      filter.isActive = true;
    }

    // Build sort query
    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  /**
   * Get a single product by ID
   * @async
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   * @returns {Promise<void>}
   */
  static getProduct = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new ApiError('Product not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: product,
    });
  });

  /**
   * Update a product
   * @async
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   * @returns {Promise<void>}
   */
  static updateProduct = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return next(new ApiError('Product not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: product,
    });
  });

  /**
   * Delete a product (soft delete by setting isActive to false)
   * @async
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   * @returns {Promise<void>}
   */
  static deleteProduct = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return next(new ApiError('Product not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: null,
    });
  });

  /**
   * Get low stock products
   * @async
   * @param {Request} _req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} _next - Express next function
   * @returns {Promise<void>}
   */
  static getLowStockProducts = catchAsync(async (
    _req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stockQuantity', '$minimumStock'] },
    });

    res.status(200).json({
      status: 'success',
      data: products,
    });
  });
} 