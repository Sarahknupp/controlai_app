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
  params: {
    id: { type: 'number' as const, required: true, min: 1 }
  }
};

const imageIdSchema = {
  params: {
    id: { type: 'number' as const, required: true, min: 1 },
    imageId: { type: 'number' as const, required: true, min: 1 }
  }
};

const productFilterSchema = {
  query: {
    search: { type: 'string' as const, minLength: 3 },
    minPrice: { type: 'number' as const, min: 0 },
    maxPrice: { type: 'number' as const, min: 0 },
    categories: { type: 'string' as const },
    page: { type: 'number' as const, min: 1 },
    limit: { type: 'number' as const, min: 1, max: 100 },
    sortBy: { type: 'string' as const, enum: ['name', 'price', 'createdAt'] },
    sortOrder: { type: 'string' as const, enum: ['asc', 'desc'] }
  }
};

const stockUpdateSchema = {
  params: {
    id: { type: 'number' as const, required: true, min: 1 }
  },
  body: {
    quantity: { type: 'number' as const, required: true }
  }
};

const imagesSchema = {
  params: {
    id: { type: 'number' as const, required: true, min: 1 }
  },
  body: {
    images: { type: 'array' as const, required: true, minLength: 1 }
  }
};

// Routes
router.post('/', validateRequest({ body: createProductSchema }), productController.createProduct);
router.put('/:id', validateRequest({ ...productIdSchema, body: updateProductSchema }), productController.updateProduct);
router.delete('/:id', validateRequest(productIdSchema), productController.deleteProduct);
router.get('/:id', validateRequest(productIdSchema), productController.getProduct);
router.get('/', validateRequest(productFilterSchema), productController.getProducts);
router.put('/:id/stock', validateRequest(stockUpdateSchema), productController.updateStock);
router.post('/:id/images', validateRequest(imagesSchema), productController.addImages);
router.delete('/:id/images/:imageId', validateRequest(imageIdSchema), productController.removeImage);

export default router; 