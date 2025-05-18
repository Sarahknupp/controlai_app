import mongoose, { Document, Model } from 'mongoose';

interface IEndereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface ICustomer extends Document {
  codigo: string;
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  endereco: IEndereco;
  createdAt: Date;
  updatedAt: Date;
}

interface ICustomerMethods {
  formatarDocumento(): string;
  formatarTelefone(): string;
}

type CustomerModel = Model<ICustomer, {}, ICustomerMethods>;

const enderecoSchema = new mongoose.Schema<IEndereco>({
  rua: {
    type: String,
    required: [true, 'Rua é obrigatória'],
    trim: true,
    minlength: [2, 'Rua deve ter no mínimo 2 caracteres'],
    maxlength: [100, 'Rua deve ter no máximo 100 caracteres']
  },
  numero: {
    type: String,
    required: [true, 'Número é obrigatório'],
    trim: true
  },
  complemento: {
    type: String,
    trim: true,
    maxlength: [50, 'Complemento deve ter no máximo 50 caracteres']
  },
  bairro: {
    type: String,
    required: [true, 'Bairro é obrigatório'],
    trim: true,
    minlength: [2, 'Bairro deve ter no mínimo 2 caracteres'],
    maxlength: [50, 'Bairro deve ter no máximo 50 caracteres']
  },
  cidade: {
    type: String,
    required: [true, 'Cidade é obrigatória'],
    trim: true,
    minlength: [2, 'Cidade deve ter no mínimo 2 caracteres'],
    maxlength: [50, 'Cidade deve ter no máximo 50 caracteres']
  },
  estado: {
    type: String,
    required: [true, 'Estado é obrigatório'],
    trim: true,
    minlength: [2, 'Estado deve ter no mínimo 2 caracteres'],
    maxlength: [2, 'Estado deve ter no máximo 2 caracteres'],
    uppercase: true
  },
  cep: {
    type: String,
    required: [true, 'CEP é obrigatório'],
    trim: true,
    match: [/^\d{5}-?\d{3}$/, 'CEP inválido']
  }
}, {
  _id: false
});

const customerSchema = new mongoose.Schema<ICustomer, CustomerModel, ICustomerMethods>({
  codigo: {
    type: String,
    required: [true, 'Código é obrigatório'],
    unique: true,
    trim: true
  },
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter no mínimo 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  documento: {
    type: String,
    required: [true, 'Documento é obrigatório'],
    trim: true,
    unique: true,
    validate: {
      validator: function(v: string) {
        // Aceita CPF (XXX.XXX.XXX-XX) ou CNPJ (XX.XXX.XXX/XXXX-XX)
        return /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(v);
      },
      message: 'Documento inválido'
    }
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  telefone: {
    type: String,
    required: [true, 'Telefone é obrigatório'],
    trim: true,
    validate: {
      validator: function(v: string) {
        // Aceita formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
        return /^\(\d{2}\) \d{4,5}-\d{4}$/.test(v);
      },
      message: 'Telefone inválido'
    }
  },
  endereco: {
    type: enderecoSchema,
    required: [true, 'Endereço é obrigatório']
  }
}, {
  timestamps: true
});

// Formata o documento (CPF/CNPJ)
customerSchema.method('formatarDocumento', function(): string {
  return this.documento.replace(/[^\d]/g, '');
});

// Formata o telefone
customerSchema.method('formatarTelefone', function(): string {
  return this.telefone.replace(/[^\d]/g, '');
});

// Índices
customerSchema.index({ codigo: 1 }, { unique: true });
customerSchema.index({ nome: 1 });
customerSchema.index({ documento: 1 }, { unique: true });
customerSchema.index({ email: 1 }, { unique: true });
customerSchema.index({ 'endereco.cep': 1 });

export const Customer = mongoose.model<ICustomer, CustomerModel>('Customer', customerSchema); 