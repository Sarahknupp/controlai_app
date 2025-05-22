import { Request, Response } from 'express';
import { Customer } from '../models/Customer';
import { Sale } from '../models/Sale';

// @desc    Criar novo cliente
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Listar todos os clientes
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await Customer.find({ active: true });

    res.json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Buscar cliente por ID
// @route   GET /api/customers/:id
// @access  Private
export const getCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Atualizar cliente
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Excluir cliente (soft delete)
// @route   DELETE /api/customers/:id
// @access  Private
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Buscar histórico de compras do cliente
// @route   GET /api/customers/:id/purchases
// @access  Private
export const getCustomerPurchases = async (req: Request, res: Response) => {
  try {
    const sales = await Sale.find({ 
      customer: req.params.id,
      status: { $ne: 'cancelled' }
    })
    .populate('items.product', 'name price')
    .select('number items total paymentMethod createdAt');

    // Calcular estatísticas
    const totalPurchases = sales.length;
    const totalSpent = sales.reduce((acc, sale) => acc + sale.total, 0);
    const averageTicket = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

    res.json({
      success: true,
      data: {
        sales,
        stats: {
          totalPurchases,
          totalSpent,
          averageTicket
        }
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 