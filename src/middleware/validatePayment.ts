import { Request, Response, NextFunction } from 'express';
import { PaymentMethod } from '../types/sale';
import mongoose from 'mongoose';

interface ValidationError {
  field: string;
  message: string;
}

export const validateProcessPayment = (req: Request, res: Response, next: NextFunction) => {
  const errors: ValidationError[] = [];
  const { saleId, amount, method, reference } = req.body;

  // Validar saleId
  if (!saleId) {
    errors.push({ field: 'saleId', message: 'ID da venda é obrigatório' });
  } else if (!mongoose.Types.ObjectId.isValid(saleId)) {
    errors.push({ field: 'saleId', message: 'ID da venda inválido' });
  }

  // Validar amount
  if (amount === undefined || amount === null) {
    errors.push({ field: 'amount', message: 'Valor do pagamento é obrigatório' });
  } else if (typeof amount !== 'number') {
    errors.push({ field: 'amount', message: 'Valor do pagamento deve ser um número' });
  } else if (amount <= 0) {
    errors.push({ field: 'amount', message: 'Valor do pagamento deve ser maior que zero' });
  }

  // Validar method
  if (!method) {
    errors.push({ field: 'method', message: 'Método de pagamento é obrigatório' });
  } else if (!Object.values(PaymentMethod).includes(method)) {
    errors.push({ 
      field: 'method', 
      message: `Método de pagamento inválido. Valores aceitos: ${Object.values(PaymentMethod).join(', ')}` 
    });
  }

  // Validar reference (opcional, mas com regras se fornecido)
  if (reference !== undefined) {
    if (typeof reference !== 'string') {
      errors.push({ field: 'reference', message: 'Referência deve ser uma string' });
    } else if (reference.length > 100) {
      errors.push({ field: 'reference', message: 'Referência não pode ter mais de 100 caracteres' });
    }
  }

  // Se houver erros, retorna 400 com a lista de erros
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

export const validateCancelPayment = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      errors: [{ field: 'id', message: 'ID do pagamento inválido' }]
    });
  }

  next();
};

export const validateGetSalePayments = (req: Request, res: Response, next: NextFunction) => {
  const { saleId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(saleId)) {
    return res.status(400).json({
      success: false,
      errors: [{ field: 'saleId', message: 'ID da venda inválido' }]
    });
  }

  next();
}; 