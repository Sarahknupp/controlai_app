import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validateRequest } from '../middleware/validation';

const router = Router();
const productController = new ProductController();

// Validation schemas
const createProductSchema = {
  name: { type: 'string' as const, required: true, minLength: 3, maxLength: 100 },
  description: { type: 'string' as const, required: true, minLength: 10, maxLength: 1000 },
  price: { type: 'number' as const, required: true, min: 0 },
  stock: { type: 'number' as const, required: true, min: 0 },
  categories: { type: 'array' as const, minLength: 1 },
  images: { type: 'array' as const, minLength: 1 },
  specifications: { type: 'object' as const },
};

const updateProductSchema = {
  name: { type: 'string' as const, minLength: 3, maxLength: 100 },
  description: { type: 'string' as const, minLength: 10, maxLength: 1000 },
  price: { type: 'number' as const, min: 0 },
  stock: { type: 'number' as const, min: 0 },
  categories: { type: 'array' as const, minLength: 1 },
  images: { type: 'array' as const, minLength: 1 },
  specifications: { type: 'object' as const },
};

const productIdSchema = {
  id: { type: 'number' as const, required: true, min: 1 },
};

const imageIdSchema = {
  id: { type: 'number' as const, required: true, min: 1 },
  imageId: { type: 'number' as const, required: true, min: 1 },
};

const productFilterSchema = {
  search: { type: 'string' as const, minLength: 3 },
  minPrice: { type: 'number' as const, min: 0 },
  maxPrice: { type: 'number' as const, min: 0 },
  categories: { type: 'string' as const },
  page: { type: 'number' as const, min: 1 },
  limit: { type: 'number' as const, min: 1, max: 100 },
  sortBy: { type: 'string' as const, enum: ['name', 'price', 'createdAt'] },
  sortOrder: { type: 'string' as const, enum: ['asc', 'desc'] },
};

const stockUpdateSchema = {
  quantity: { type: 'number' as const, required: true },
};

const imagesSchema = {
  images: { type: 'array' as const, required: true, minLength: 1 },
};

// Routes
router.post('/', validateRequest(createProductSchema), (req, res, next): void => {
  productController.createProduct(req, res, next);
});

router.put('/:id', validateRequest({ ...productIdSchema, ...updateProductSchema }), (req, res, next): void => {
  productController.updateProduct(req, res, next);
});

router.delete('/:id', validateRequest(productIdSchema), (req, res, next): void => {
  productController.deleteProduct(req, res, next);
});

router.get('/:id', validateRequest(productIdSchema), (req, res, next): void => {
  productController.getProduct(req, res, next);
});

router.get('/', validateRequest(productFilterSchema), (req, res, next): void => {
  productController.getProducts(req, res, next);
});

router.put('/:id/stock', validateRequest({ ...productIdSchema, ...stockUpdateSchema }), (req, res, next): void => {
  productController.updateStock(req, res, next);
});

router.post('/:id/images', validateRequest({ ...productIdSchema, ...imagesSchema }), (req, res, next): void => {
  productController.addImages(req, res, next);
});

router.delete('/:id/images/:imageId', validateRequest(imageIdSchema), (req, res, next): void => {
  productController.removeImage(req, res, next);
});

export default router; 