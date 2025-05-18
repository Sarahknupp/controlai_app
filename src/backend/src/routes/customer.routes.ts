/**
 * Customer routes
 * @module routes/customer
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { UserRole } from '../types/auth';

const router = Router();

/**
 * @route   POST /api/customers
 * @desc    Create a new customer
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  authorize(['admin', 'gerente', 'vendedor'] as UserRole[]),
  validate([
    body('nome')
      .trim()
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('documento')
      .trim()
      .notEmpty()
      .withMessage('Documento é obrigatório')
      .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
      .withMessage('Documento inválido'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email é obrigatório')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    body('telefone')
      .trim()
      .notEmpty()
      .withMessage('Telefone é obrigatório')
      .matches(/^\(\d{2}\) \d{4,5}-\d{4}$/)
      .withMessage('Telefone inválido'),
    body('endereco.rua')
      .trim()
      .notEmpty()
      .withMessage('Rua é obrigatória')
      .isLength({ min: 2, max: 100 })
      .withMessage('Rua deve ter entre 2 e 100 caracteres'),
    body('endereco.numero')
      .trim()
      .notEmpty()
      .withMessage('Número é obrigatório'),
    body('endereco.bairro')
      .trim()
      .notEmpty()
      .withMessage('Bairro é obrigatório')
      .isLength({ min: 2, max: 50 })
      .withMessage('Bairro deve ter entre 2 e 50 caracteres'),
    body('endereco.cidade')
      .trim()
      .notEmpty()
      .withMessage('Cidade é obrigatória')
      .isLength({ min: 2, max: 50 })
      .withMessage('Cidade deve ter entre 2 e 50 caracteres'),
    body('endereco.estado')
      .trim()
      .notEmpty()
      .withMessage('Estado é obrigatório')
      .isLength({ min: 2, max: 2 })
      .withMessage('Estado deve ter 2 caracteres')
      .isUppercase()
      .withMessage('Estado deve estar em maiúsculas'),
    body('endereco.cep')
      .trim()
      .notEmpty()
      .withMessage('CEP é obrigatório')
      .matches(/^\d{5}-?\d{3}$/)
      .withMessage('CEP inválido'),
  ]),
  CustomerController.createCustomer
);

/**
 * @route   GET /api/customers
 * @desc    Get all customers with filtering and pagination
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  authorize(['admin', 'gerente', 'vendedor'] as UserRole[]),
  validate([
    query('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limite inválido'),
    query('sortBy').optional().isString().withMessage('Campo de ordenação inválido'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Ordem inválida'),
    query('documentType').optional().isIn(['cpf', 'cnpj']).withMessage('Tipo de documento inválido'),
    query('state').optional().isLength({ min: 2, max: 2 }).withMessage('Estado inválido'),
  ]),
  CustomerController.getAllCustomers
);

/**
 * @route   GET /api/customers/:id
 * @desc    Get a single customer by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  authorize(['admin', 'gerente', 'vendedor'] as UserRole[]),
  validate([
    param('id').isMongoId().withMessage('ID inválido'),
  ]),
  CustomerController.getCustomer
);

/**
 * @route   PUT /api/customers/:id
 * @desc    Update a customer
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin', 'gerente'] as UserRole[]),
  validate([
    param('id').isMongoId().withMessage('ID inválido'),
    body('nome')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    body('telefone')
      .optional()
      .trim()
      .matches(/^\(\d{2}\) \d{4,5}-\d{4}$/)
      .withMessage('Telefone inválido'),
    body('endereco.rua')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Rua deve ter entre 2 e 100 caracteres'),
    body('endereco.bairro')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Bairro deve ter entre 2 e 50 caracteres'),
    body('endereco.cidade')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Cidade deve ter entre 2 e 50 caracteres'),
    body('endereco.estado')
      .optional()
      .trim()
      .isLength({ min: 2, max: 2 })
      .withMessage('Estado deve ter 2 caracteres')
      .isUppercase()
      .withMessage('Estado deve estar em maiúsculas'),
    body('endereco.cep')
      .optional()
      .trim()
      .matches(/^\d{5}-?\d{3}$/)
      .withMessage('CEP inválido'),
  ]),
  CustomerController.updateCustomer
);

/**
 * @route   DELETE /api/customers/:id
 * @desc    Delete a customer (soft delete)
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin', 'gerente'] as UserRole[]),
  validate([
    param('id').isMongoId().withMessage('ID inválido'),
  ]),
  CustomerController.deleteCustomer
);

/**
 * @route   GET /api/customers/document/:documento
 * @desc    Search customers by document (CPF/CNPJ)
 * @access  Private
 */
router.get(
  '/document/:documento',
  authenticate,
  authorize(['admin', 'gerente', 'vendedor'] as UserRole[]),
  validate([
    param('documento')
      .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
      .withMessage('Documento inválido'),
  ]),
  CustomerController.searchByDocument
);

/**
 * @route   GET /api/customers/cep/:cep
 * @desc    Search customers by CEP
 * @access  Private
 */
router.get(
  '/cep/:cep',
  authenticate,
  authorize(['admin', 'gerente', 'vendedor'] as UserRole[]),
  validate([
    param('cep')
      .matches(/^\d{5}-?\d{3}$/)
      .withMessage('CEP inválido'),
  ]),
  CustomerController.searchByCEP
);

export default router; 