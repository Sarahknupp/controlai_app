import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { CreateProductDto, UpdateProductDto, ProductFilter } from '../types/product';
import { createError } from '../utils/error';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productService.createProduct(req.body as CreateProductDto);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const product = await this.productService.updateProduct(id, req.body as UpdateProductDto);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      await this.productService.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const product = await this.productService.getProduct(id);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter: ProductFilter = {
        search: req.query.search as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        categories: req.query.categories ? (req.query.categories as string).split(',') : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as 'name' | 'price' | 'createdAt',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await this.productService.getProducts(filter);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  updateStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const quantity = parseInt(req.body.quantity);

      if (isNaN(quantity)) {
        throw createError(400, 'A quantidade deve ser um número válido');
      }

      const product = await this.productService.updateStock(id, quantity);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  addImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { images } = req.body;

      if (!Array.isArray(images)) {
        throw createError(400, 'O campo images deve ser um array');
      }

      const product = await this.productService.addImages(id, images);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  removeImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const imageId = parseInt(req.params.imageId);

      const product = await this.productService.removeImage(id, imageId);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };
} 