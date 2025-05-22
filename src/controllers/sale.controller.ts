import { Request, Response } from 'express';
import { Sale } from '../models/Sale';
import { Product } from '../models/Product';

// @desc    Criar nova venda
// @route   POST /api/sales
// @access  Private
export const createSale = async (req: Request, res: Response) => {
  try {
    const { items, customer, paymentMethod } = req.body;

    // Calcular subtotal e total
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Produto ${item.product} não encontrado`
        });
      }

      // Verificar estoque
      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Estoque insuficiente para o produto ${product.name}`
        });
      }

      // Calcular total do item
      item.price = product.price;
      item.total = (item.price * item.quantity) - (item.discount || 0);
      subtotal += item.total;

      // Atualizar estoque
      product.stock -= item.quantity;
      await product.save();
    }

    // Criar venda
    const sale = await Sale.create({
      customer,
      items,
      subtotal,
      total: subtotal - (req.body.discount || 0),
      discount: req.body.discount || 0,
      paymentMethod,
      seller: req.user._id
    });

    // Populate dados relacionados
    await sale.populate([
      { path: 'customer', select: 'name email' },
      { path: 'seller', select: 'name' },
      { path: 'items.product', select: 'name sku' }
    ]);

    res.status(201).json({
      success: true,
      data: sale
    });
  } catch (error: any) {
    // Se houver erro, reverter alterações no estoque
    if (req.body.items) {
      for (const item of req.body.items) {
        try {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock += item.quantity;
            await product.save();
          }
        } catch (err) {
          console.error('Erro ao reverter estoque:', err);
        }
      }
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Listar todas as vendas
// @route   GET /api/sales
// @access  Private
export const getSales = async (req: Request, res: Response) => {
  try {
    const sales = await Sale.find()
      .populate('customer', 'name email')
      .populate('seller', 'name')
      .populate('items.product', 'name sku');

    res.json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Buscar venda por ID
// @route   GET /api/sales/:id
// @access  Private
export const getSale = async (req: Request, res: Response) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('seller', 'name')
      .populate('items.product', 'name sku');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancelar venda
// @route   PATCH /api/sales/:id/cancel
// @access  Private/Admin
export const cancelSale = async (req: Request, res: Response) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    if (sale.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Venda já está cancelada'
      });
    }

    // Restaurar estoque
    for (const item of sale.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    sale.status = 'cancelled';
    await sale.save();

    res.json({
      success: true,
      data: sale
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 