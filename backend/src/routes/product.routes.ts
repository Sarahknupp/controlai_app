import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types/user';
import { validateRequest } from '../middleware/validation.middleware';
import { productValidations } from '../validations/product.validation';

const router = Router();
const productController = new ProductController();

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