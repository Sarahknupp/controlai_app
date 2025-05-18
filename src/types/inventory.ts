/**
 * Tipos e interfaces relacionados ao inventário
 * @module types/inventory
 * @description Definições de tipos para gerenciamento de estoque, fornecedores e compras
 */

/**
 * Status do item no inventário
 * @type {string}
 */
export type InventoryItemStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

/**
 * Unidades de medida
 * @type {string}
 */
export type UnitType = 'kg' | 'g' | 'l' | 'ml' | 'unit' | 'pack' | 'liter';

/**
 * Interface de item do inventário
 * @interface InventoryItem
 * @property {string} id - Identificador único do item
 * @property {string} internalCode - Código interno do produto
 * @property {string} name - Nome do item
 * @property {string} [description] - Descrição do item
 * @property {number} quantity - Quantidade atual em estoque
 * @property {UnitType} unit - Unidade de medida
 * @property {number} minimumLevel - Nível mínimo de estoque
 * @property {number} reorderPoint - Nível de estoque para disparar reposição
 * @property {number} suggestedOrderQuantity - Quantidade sugerida para pedido
 * @property {Date} purchaseDate - Data da última compra
 * @property {number} costPerUnit - Custo por unidade
 * @property {string} supplierId - ID do fornecedor principal
 * @property {string} location - Localização no estoque
 * @property {Date} lastUpdated - Data da última atualização
 * @property {boolean} needsRestock - Indica se precisa de reposição
 * @property {Date} [expiryDate] - Data de validade, se aplicável
 */
export interface InventoryItem {
  id: string;
  internalCode: string;
  name: string;
  description?: string;
  quantity: number;
  unit: UnitType;
  minimumLevel: number;
  reorderPoint: number;
  suggestedOrderQuantity: number;
  purchaseDate: Date;
  costPerUnit: number;
  supplierId: string;
  location: string;
  lastUpdated: Date;
  needsRestock: boolean;
  expiryDate?: Date;
}

/**
 * Termos de entrega do fornecedor
 * @interface DeliveryTerms
 * @property {number} minOrderValue - Valor mínimo do pedido
 * @property {number} deliveryTime - Tempo de entrega em horas
 * @property {number} deliveryFee - Taxa de entrega
 */
export interface DeliveryTerms {
  minOrderValue: number;
  deliveryTime: number;
  deliveryFee: number;
}

/**
 * Interface do fornecedor
 * @interface Supplier
 * @property {string} id - Identificador único do fornecedor
 * @property {string} name - Nome do fornecedor
 * @property {string} contactPerson - Nome da pessoa de contato
 * @property {string} email - E-mail de contato
 * @property {string} phone - Telefone de contato
 * @property {string} address - Endereço do fornecedor
 * @property {Array<string>} categories - Categorias de produtos fornecidos
 * @property {DeliveryTerms} deliveryTerms - Termos e condições de entrega
 */
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  categories: Array<string>;
  deliveryTerms: DeliveryTerms;
}

/**
 * Item recebido no estoque
 * @interface IncomingItem
 * @property {string} inventoryItemId - ID do item no inventário
 * @property {number} quantity - Quantidade recebida
 * @property {number} unitCost - Custo unitário
 * @property {Date} [expirationDate] - Data de validade
 * @property {string} [batchNumber] - Número do lote
 */
export interface IncomingItem {
  inventoryItemId: string;
  quantity: number;
  unitCost: number;
  expirationDate?: Date;
  batchNumber?: string;
}

/**
 * Registro de mercadorias recebidas
 * @interface IncomingGoods
 * @property {string} id - Identificador único do registro
 * @property {string} supplierId - ID do fornecedor
 * @property {Date} date - Data de entrega
 * @property {Array<IncomingItem>} items - Itens entregues
 * @property {number} totalCost - Custo total da entrega
 * @property {string} receivedBy - ID do usuário que recebeu a entrega
 * @property {string} [notes] - Observações adicionais
 */
export interface IncomingGoods {
  id: string;
  supplierId: string;
  date: Date;
  items: Array<IncomingItem>;
  totalCost: number;
  receivedBy: string;
  notes?: string;
}

/**
 * Item da lista de compras
 * @interface ShoppingListItem
 * @property {string} id - Identificador único do item
 * @property {string} inventoryItemId - ID do item no inventário
 * @property {number} quantity - Quantidade a ser pedida
 * @property {string} [preferredSupplierId] - ID do fornecedor preferencial
 * @property {string} [notes] - Observações adicionais
 */
export interface ShoppingListItem {
  id: string;
  inventoryItemId: string;
  quantity: number;
  preferredSupplierId?: string;
  notes?: string;
}

/**
 * Item com estoque baixo
 * @interface LowStockItem
 * @property {string} id - ID do item
 * @property {string} name - Nome do item
 * @property {number} currentStock - Estoque atual
 * @property {number} minStock - Estoque mínimo
 */
export interface LowStockItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
}

/**
 * Item próximo ao vencimento
 * @interface ExpiringItem
 * @property {string} id - ID do item
 * @property {string} name - Nome do item
 * @property {Date} expirationDate - Data de vencimento
 * @property {number} quantity - Quantidade em estoque
 */
export interface ExpiringItem {
  id: string;
  name: string;
  expirationDate: Date;
  quantity: number;
}

/**
 * Visão geral do status do inventário
 * @interface InventoryStatus
 * @property {number} totalItems - Número total de itens no inventário
 * @property {Array<LowStockItem>} lowStockItems - Itens abaixo do ponto de reposição
 * @property {Array<LowStockItem>} criticalStockItems - Itens abaixo do estoque mínimo
 * @property {Array<ExpiringItem>} expiringItems - Itens próximos ao vencimento
 */
export interface InventoryStatus {
  totalItems: number;
  lowStockItems: Array<LowStockItem>;
  criticalStockItems: Array<LowStockItem>;
  expiringItems: Array<ExpiringItem>;
}