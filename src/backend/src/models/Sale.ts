import mongoose, { Document, Model, Types } from 'mongoose';
import { Product } from './Product';
import { ICustomer } from './Customer';
import { IUser } from './User';

// Local interface for Product in the context of sales
interface IProduct extends Document {
  _id: Types.ObjectId;
  codigo: string;
  nome: string;
  preco: number;
  estoque: number;
}

interface IVendaItem {
  produto: mongoose.Types.ObjectId | IProduct;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  subtotal: number;
}

export interface ISale extends Document {
  codigo: string;
  cliente: mongoose.Types.ObjectId | ICustomer;
  vendedor: mongoose.Types.ObjectId | IUser;
  itens: IVendaItem[];
  total: number;
  desconto: number;
  formaPagamento: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  previousStatus?: string;
}

interface ISaleMethods {
  calcularTotal(): number;
  atualizarEstoque(): Promise<void>;
  estornarEstoque(): Promise<void>;
}

type SaleModel = Model<ISale, {}, ISaleMethods>;

const vendaItemSchema = new mongoose.Schema<IVendaItem>({
  produto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Produto é obrigatório']
  },
  quantidade: {
    type: Number,
    required: [true, 'Quantidade é obrigatória'],
    min: [0.01, 'Quantidade deve ser maior que zero']
  },
  precoUnitario: {
    type: Number,
    required: [true, 'Preço unitário é obrigatório'],
    min: [0, 'Preço unitário não pode ser negativo']
  },
  desconto: {
    type: Number,
    required: true,
    min: [0, 'Desconto não pode ser negativo'],
    default: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal não pode ser negativo']
  }
}, {
  _id: false
});

const saleSchema = new mongoose.Schema<ISale, SaleModel, ISaleMethods>({
  codigo: {
    type: String,
    required: [true, 'Código é obrigatório'],
    unique: true,
    trim: true
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Cliente é obrigatório']
  },
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendedor é obrigatório']
  },
  itens: {
    type: [vendaItemSchema],
    required: [true, 'Itens são obrigatórios'],
    validate: [
      {
        validator: function(v: IVendaItem[]) {
          return v.length > 0;
        },
        message: 'Venda deve ter pelo menos um item'
      }
    ]
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total não pode ser negativo']
  },
  desconto: {
    type: Number,
    required: true,
    min: [0, 'Desconto não pode ser negativo'],
    default: 0
  },
  formaPagamento: {
    type: String,
    required: [true, 'Forma de pagamento é obrigatória'],
    enum: ['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'boleto']
  },
  status: {
    type: String,
    required: true,
    enum: ['pendente', 'aprovada', 'cancelada'],
    default: 'pendente'
  },
  previousStatus: {
    type: String,
    enum: ['pendente', 'aprovada', 'cancelada']
  }
}, {
  timestamps: true
});

// Calcula o total da venda
saleSchema.method('calcularTotal', function(): number {
  const subtotal = this.itens.reduce((total, item) => {
    return total + (item.quantidade * item.precoUnitario - item.desconto);
  }, 0);
  return subtotal - this.desconto;
});

// Atualiza o estoque após a venda
saleSchema.method('atualizarEstoque', async function(): Promise<void> {
  const Product = mongoose.model('Product');
  for (const item of this.itens) {
    const produto = await Product.findById(item.produto);
    if (!produto) {
      throw new Error(`Produto ${item.produto} não encontrado`);
    }
    await produto.updateStock(-item.quantidade);
  }
});

// Estorna o estoque em caso de cancelamento
saleSchema.method('estornarEstoque', async function(): Promise<void> {
  const Product = mongoose.model('Product');
  for (const item of this.itens) {
    const produto = await Product.findById(item.produto);
    if (!produto) {
      throw new Error(`Produto ${item.produto} não encontrado`);
    }
    await produto.updateStock(item.quantidade);
  }
});

// Middleware para calcular subtotais e total antes de salvar
saleSchema.pre('save', function(next) {
  // Calcula subtotal de cada item
  this.itens.forEach(item => {
    item.subtotal = item.quantidade * item.precoUnitario - item.desconto;
  });

  // Calcula total da venda
  this.total = this.calcularTotal();
  next();
});

// Middleware para atualizar estoque após aprovar venda
saleSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.status === 'aprovada') {
    await this.atualizarEstoque();
  }
  next();
});

// Middleware para estornar estoque ao cancelar venda
saleSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.status === 'cancelada' && this.previousStatus === 'pendente') {
    await this.estornarEstoque();
    // Restaura o estoque dos produtos
    for (const item of this.itens) {
      await Product.findByIdAndUpdate(item.produto, {
        $inc: { estoque: item.quantidade }
      });
    }
  }
  next();
});

// Índices
saleSchema.index({ codigo: 1 }, { unique: true });
saleSchema.index({ cliente: 1 });
saleSchema.index({ vendedor: 1 });
saleSchema.index({ status: 1 });
saleSchema.index({ createdAt: 1 });
saleSchema.index({ formaPagamento: 1 });

export const Sale = mongoose.model<ISale, SaleModel>('Sale', saleSchema); 