import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types/user';
import { validateRequest } from '../middleware/validation.middleware';
import { productValidations } from '../validations/product.validation';

const router = Router();
const productController = new ProductController();

// Validation schemas
const createProductSchema = {
  body: {
    name: { type: 'string' as const, required: true, minLength: 3, maxLength: 100 },
    description: { type: 'string' as const, required: true, minLength: 10, maxLength: 1000 },
    price: { type: 'number' as const, required: true, min: 0 },
    stock: { type: 'number' as const, required: true, min: 0 },
    categories: { type: 'array' as const, minLength: 1 },
    images: { type: 'array' as const, minLength: 1 },
    specifications: { type: 'object' as const }
  }
};

const updateProductSchema = {
  body: {
    name: { type: 'string' as const, minLength: 3, maxLength: 100 },
    description: { type: 'string' as const, minLength: 10, maxLength: 1000 },
    price: { type: 'number' as const, min: 0 },
    stock: { type: 'number' as const, min: 0 },
    categories: { type: 'array' as const, minLength: 1 },
    images: { type: 'array' as const, minLength: 1 },
    specifications: { type: 'object' as const }
  }
};

const productIdSchema = {
  params: {
    productId: { type: 'number' as const, required: true, min: 1 }
  }
};

const imageIdSchema = {
  params: {
    productId: { type: 'number' as const, required: true, min: 1 },
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
    productId: { type: 'number' as const, required: true, min: 1 }
  },
  body: {
    quantity: { type: 'number' as const, required: true }
  }
};

const imagesSchema = {
  params: {
    productId: { type: 'number' as const, required: true, min: 1 }
  },
  body: {
    images: { type: 'array' as const, required: true, minLength: 1 }
  }
};

// Base routes
router.post('/', validateRequest(createProductSchema), productController.createProduct);
router.get('/', validateRequest(productFilterSchema), productController.getProducts);

// Product-specific routes
router.get('/:productId', validateRequest(productIdSchema), productController.getProduct);
router.put('/:productId', validateRequest({ ...productIdSchema, ...updateProductSchema }), productController.updateProduct);
router.delete('/:productId', validateRequest(productIdSchema), productController.deleteProduct);

// Stock management
router.put('/:productId/stock', validateRequest(stockUpdateSchema), productController.updateStock);

// Image management
router.post('/:productId/images', validateRequest(imagesSchema), productController.addImages);
router.delete('/:productId/images/:imageId', validateRequest(imageIdSchema), productController.removeImage);


// Todas as rotas requerem autenticação
router.use(protect);

// Rotas públicas (requerem apenas autenticação)
router.get('/', validateRequest(productValidations.filter), productController.getProducts);
router.get('/:id', validateRequest(productValidations.id), productController.getProduct);

// Rotas que requerem permissão de gerente ou admin
router.use(authorize(UserRole.MANAGER, UserRole.ADMIN));

router.post('/', validateRequest(productValidations.create), productController.createProduct);
router.put('/:id', validateRequest(productValidations.update), productController.updateProduct);
router.put('/:id/stock', validateRequest(productValidations.stockUpdate), productController.updateStock);
router.post('/:id/images', validateRequest(productValidations.images), productController.addImages);
router.delete('/:id/images/:imageId', validateRequest(productValidations.imageId), productController.removeImage);

// Rotas que requerem permissão de admin
router.use(authorize(UserRole.ADMIN));
router.delete('/:id', validateRequest(productValidations.id), productController.deleteProduct);


export default router; 