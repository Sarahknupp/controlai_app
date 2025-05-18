/**
 * Tipos e interfaces relacionados a vendas
 * @module types/sale
 * @description Tipos para gerenciamento de vendas, pedidos, pagamentos e descontos
 */

/**
 * Métodos de pagamento disponíveis
 * @type {string}
 */
export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'pix' | 'transfer';

/**
 * Status possíveis de uma venda
 * @type {string}
 */
export type SaleStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

/**
 * Tipos de desconto disponíveis
 * @type {string}
 */
export type DiscountType = 'percentage' | 'fixed';

/**
 * Detalhes do cliente para clientes não cadastrados
 * @interface CustomerDetails
 * @property {string} name - Nome do cliente
 * @property {string} phone - Número de telefone para contato
 * @property {string} [email] - Endereço de e-mail para contato (opcional)
 */
export interface CustomerDetails {
  name: string;
  phone: string;
  email?: string;
}

/**
 * Interface de venda representando uma transação
 * @interface Sale
 * @property {string} id - Identificador único da venda
 * @property {string} orderNumber - Número de referência do pedido
 * @property {Date} date - Data e hora da venda
 * @property {string} cashierId - ID do caixa que processou a venda
 * @property {string} [customerId] - ID do cliente se cadastrado
 * @property {Array<SaleItem>} items - Itens incluídos na venda
 * @property {number} subtotal - Total antes de descontos e impostos
 * @property {Object} [discount] - Detalhes do desconto aplicado
 * @property {number} tax - Valor do imposto aplicado
 * @property {number} total - Valor total final
 * @property {Array<Payment>} payments - Detalhes dos pagamentos
 * @property {SaleStatus} status - Status atual da venda
 * @property {string} [notes] - Observações adicionais da venda
 * @property {DeliveryInfo} [delivery] - Informações de entrega, se aplicável
 * @property {CustomerDetails} [customerDetails] - Informações do cliente não cadastrado
 */
export interface Sale {
  id: string;
  orderNumber: string;
  date: Date;
  cashierId: string;
  customerId?: string;
  items: Array<SaleItem>;
  subtotal: number;
  discount?: {
    type: DiscountType;
    value: number;
    reason?: string;
  };
  tax: number;
  total: number;
  payments: Array<Payment>;
  status: SaleStatus;
  notes?: string;
  delivery?: DeliveryInfo;
  customerDetails?: CustomerDetails;
}

/**
 * Interface para item de venda
 * @interface SaleItem
 * @property {string} id - Identificador único do item
 * @property {string} productId - ID do produto
 * @property {string} productName - Nome do produto
 * @property {number} quantity - Quantidade vendida
 * @property {number} unitPrice - Preço unitário
 * @property {Object} [discount] - Desconto aplicado ao item
 * @property {number} total - Valor total do item
 */
export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount?: {
    type: DiscountType;
    value: number;
  };
  total: number;
}

/**
 * Interface para informações de entrega
 * @interface DeliveryInfo
 * @property {string} address - Endereço de entrega
 * @property {string} contact - Contato para entrega
 * @property {string} [instructions] - Instruções especiais para entrega
 * @property {number} fee - Taxa de entrega
 * @property {number} estimatedTime - Tempo estimado de entrega em minutos
 */
export interface DeliveryInfo {
  address: string;
  contact: string;
  instructions?: string;
  fee: number;
  estimatedTime: number;
}

/**
 * Interface para pagamento
 * @interface Payment
 * @property {PaymentMethod} method - Método de pagamento utilizado
 * @property {number} amount - Valor do pagamento
 * @property {string} [reference] - Referência do pagamento (ex: número da transação)
 * @property {number} [change] - Troco, se aplicável
 */
export interface Payment {
  method: PaymentMethod;
  amount: number;
  reference?: string;
  change?: number;
}

/**
 * Relatório diário de vendas
 * @interface DailySalesReport
 * @property {Date} date - Data do relatório
 * @property {number} totalSales - Número total de vendas
 * @property {number} totalRevenue - Receita total
 * @property {number} totalTax - Total de impostos coletados
 * @property {number} totalDiscounts - Total de descontos concedidos
 * @property {Record<PaymentMethod, PaymentBreakdown>} paymentBreakdown - Vendas por método de pagamento
 * @property {Array<TopProduct>} topProducts - Produtos mais vendidos
 * @property {Record<string, HourlyBreakdown>} hourlyBreakdown - Vendas por hora
 */
export interface DailySalesReport {
  date: Date;
  totalSales: number;
  totalRevenue: number;
  totalTax: number;
  totalDiscounts: number;
  paymentBreakdown: Record<PaymentMethod, PaymentBreakdown>;
  topProducts: Array<TopProduct>;
  hourlyBreakdown: Record<string, HourlyBreakdown>;
}

/**
 * Detalhamento de pagamentos
 * @interface PaymentBreakdown
 * @property {number} count - Quantidade de transações
 * @property {number} total - Valor total
 */
export interface PaymentBreakdown {
  count: number;
  total: number;
}

/**
 * Produto mais vendido
 * @interface TopProduct
 * @property {string} productId - ID do produto
 * @property {string} productName - Nome do produto
 * @property {number} quantity - Quantidade vendida
 * @property {number} revenue - Receita gerada
 */
export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

/**
 * Detalhamento por hora
 * @interface HourlyBreakdown
 * @property {number} sales - Número de vendas
 * @property {number} revenue - Receita total
 */
export interface HourlyBreakdown {
  sales: number;
  revenue: number;
}

/**
 * Configuração de metas de vendas
 * @interface SalesTarget
 * @property {string} id - Identificador único da meta
 * @property {Date} startDate - Data de início do período
 * @property {Date} endDate - Data de fim do período
 * @property {number} revenueTarget - Meta de receita
 * @property {number} salesTarget - Meta de número de vendas
 * @property {Array<ProductTarget>} productTargets - Metas específicas por produto
 * @property {SalesIncentives} incentives - Configuração de incentivos de vendas
 */
export interface SalesTarget {
  id: string;
  startDate: Date;
  endDate: Date;
  revenueTarget: number;
  salesTarget: number;
  productTargets: Array<ProductTarget>;
  incentives: SalesIncentives;
}

/**
 * Meta por produto
 * @interface ProductTarget
 * @property {string} productId - ID do produto
 * @property {string} productName - Nome do produto
 * @property {number} quantityTarget - Meta de quantidade
 * @property {number} revenueTarget - Meta de receita
 */
export interface ProductTarget {
  productId: string;
  productName: string;
  quantityTarget: number;
  revenueTarget: number;
}

/**
 * Incentivos de vendas
 * @interface SalesIncentives
 * @property {Array<ThresholdBonus>} thresholds - Bônus por atingimento de meta
 * @property {Array<ProductBonus>} productBonuses - Bônus por produto
 */
export interface SalesIncentives {
  thresholds: Array<ThresholdBonus>;
  productBonuses: Array<ProductBonus>;
}

/**
 * Bônus por atingimento
 * @interface ThresholdBonus
 * @property {number} target - Valor alvo
 * @property {number} bonus - Valor do bônus
 */
export interface ThresholdBonus {
  target: number;
  bonus: number;
}

/**
 * Bônus por produto
 * @interface ProductBonus
 * @property {string} productId - ID do produto
 * @property {number} bonus - Valor do bônus
 */
export interface ProductBonus {
  productId: string;
  bonus: number;
}

/**
 * Registro de turno do caixa
 * @interface CashierShift
 * @property {string} id - Identificador único do turno
 * @property {string} cashierId - ID do caixa
 * @property {Date} startTime - Hora de início do turno
 * @property {Date} [endTime] - Hora de término do turno
 * @property {number} startingBalance - Saldo inicial em dinheiro
 * @property {number} [endingBalance] - Saldo final em dinheiro
 * @property {ShiftTransactions} transactions - Totais de transações por tipo
 * @property {ShiftDiscrepancy} [discrepancies] - Discrepâncias de saldo
 * @property {Array<string>} saleIds - IDs das vendas durante o turno
 */
export interface CashierShift {
  id: string;
  cashierId: string;
  startTime: Date;
  endTime?: Date;
  startingBalance: number;
  endingBalance?: number;
  transactions: ShiftTransactions;
  discrepancies?: ShiftDiscrepancy;
  saleIds: Array<string>;
}

/**
 * Transações do turno
 * @interface ShiftTransactions
 * @property {number} sales - Total de vendas
 * @property {number} refunds - Total de reembolsos
 * @property {number} expenses - Total de despesas
 * @property {number} deposits - Total de depósitos
 * @property {number} withdrawals - Total de retiradas
 */
export interface ShiftTransactions {
  sales: number;
  refunds: number;
  expenses: number;
  deposits: number;
  withdrawals: number;
}

/**
 * Discrepância de saldo
 * @interface ShiftDiscrepancy
 * @property {number} amount - Valor da discrepância
 * @property {string} [explanation] - Explicação da discrepância
 */
export interface ShiftDiscrepancy {
  amount: number;
  explanation?: string;
}

/**
 * Programa de fidelidade
 * @interface LoyaltyProgram
 * @property {string} id - Identificador único do programa
 * @property {string} name - Nome do programa
 * @property {number} pointsPerCurrency - Pontos por unidade monetária
 * @property {Array<LoyaltyReward>} rewards - Recompensas disponíveis
 * @property {Array<LoyaltyTier>} tiers - Níveis do programa
 * @property {LoyaltyBonusRules} bonusRules - Regras de bônus
 */
export interface LoyaltyProgram {
  id: string;
  name: string;
  pointsPerCurrency: number;
  rewards: Array<LoyaltyReward>;
  tiers: Array<LoyaltyTier>;
  bonusRules: LoyaltyBonusRules;
}

/**
 * Recompensa do programa de fidelidade
 * @interface LoyaltyReward
 * @property {string} id - Identificador único da recompensa
 * @property {string} name - Nome da recompensa
 * @property {string} description - Descrição da recompensa
 * @property {number} pointsCost - Custo em pontos
 * @property {number} validityDays - Dias de validade
 */
export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  validityDays: number;
}

/**
 * Nível do programa de fidelidade
 * @interface LoyaltyTier
 * @property {string} name - Nome do nível
 * @property {number} minimumPoints - Pontos mínimos para o nível
 * @property {Array<string>} benefits - Benefícios do nível
 * @property {number} multiplier - Multiplicador de pontos
 */
export interface LoyaltyTier {
  name: string;
  minimumPoints: number;
  benefits: Array<string>;
  multiplier: number;
}

/**
 * Regras de bônus do programa de fidelidade
 * @interface LoyaltyBonusRules
 * @property {Array<CategoryBonus>} productCategories - Bônus por categoria de produto
 * @property {Array<DayBonus>} specialDays - Bônus por dia da semana
 */
export interface LoyaltyBonusRules {
  productCategories: Array<CategoryBonus>;
  specialDays: Array<DayBonus>;
}

/**
 * Bônus por categoria
 * @interface CategoryBonus
 * @property {string} categoryId - ID da categoria
 * @property {number} multiplier - Multiplicador de pontos
 */
export interface CategoryBonus {
  categoryId: string;
  multiplier: number;
}

/**
 * Bônus por dia
 * @interface DayBonus
 * @property {number} dayOfWeek - Dia da semana (0-6, onde 0 é domingo)
 * @property {number} multiplier - Multiplicador de pontos
 */
export interface DayBonus {
  dayOfWeek: number;
  multiplier: number;
}