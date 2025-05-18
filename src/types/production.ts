/**
 * Tipos e interfaces relacionados à produção
 * @module types/production
 * @description Tipos para gerenciamento de planejamento, ordens e acompanhamento da produção
 */

/**
 * Status dos equipamentos
 * @type {string}
 */
export type EquipmentStatus = 'active' | 'maintenance' | 'out-of-service';

/**
 * Status das ordens de produção
 * @type {string}
 */
export type ProductionOrderStatus = 'pending' | 'in-production' | 'completed' | 'cancelled';

/**
 * Níveis de prioridade da produção
 * @type {string}
 */
export type ProductionPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Equipamento em uma área de produção
 * @interface Equipment
 * @property {string} id - Identificador único do equipamento
 * @property {string} name - Nome do equipamento
 * @property {string} type - Tipo ou categoria do equipamento
 * @property {EquipmentStatus} status - Status operacional atual
 * @property {Date} [lastMaintenance] - Data da última manutenção
 */
export interface Equipment {
  id: string;
  name: string;
  type: string;
  status: EquipmentStatus;
  lastMaintenance?: Date;
}

/**
 * Área de produção na instalação
 * @interface ProductionArea
 * @property {string} id - Identificador único da área
 * @property {string} name - Nome da área de produção
 * @property {string} description - Descrição do propósito da área
 * @property {number} productionCapacity - Capacidade máxima de produção
 * @property {number} currentUtilization - Percentual de utilização atual
 * @property {Array<string>} activeProduction - IDs das ordens de produção ativas
 * @property {Array<Equipment>} equipment - Equipamentos disponíveis nesta área
 */
export interface ProductionArea {
  id: string;
  name: string;
  description: string;
  productionCapacity: number;
  currentUtilization: number;
  activeProduction: Array<string>;
  equipment: Array<Equipment>;
}

/**
 * Controle de temperatura
 * @interface TemperatureControl
 * @property {number} min - Temperatura mínima
 * @property {number} max - Temperatura máxima
 * @property {string} [unit] - Unidade de medida (opcional)
 */
export interface TemperatureControl {
  min: number;
  max: number;
  unit?: string;
}

/**
 * Etapa de preparação
 * @interface PreparationStep
 * @property {string} id - Identificador único da etapa
 * @property {number} order - Ordem da etapa
 * @property {string} description - Descrição da etapa
 * @property {number} estimatedTime - Tempo estimado em minutos
 * @property {number} [temperatureNeeded] - Temperatura necessária
 * @property {Array<string>} equipmentNeeded - Equipamentos necessários
 */
export interface PreparationStep {
  id: string;
  order: number;
  description: string;
  estimatedTime: number;
  temperatureNeeded?: number;
  equipmentNeeded: Array<string>;
}

/**
 * Ficha técnica de produção
 * @interface TechnicalSheet
 * @property {string} id - Identificador único da ficha técnica
 * @property {string} productId - ID do produto
 * @property {string} productName - Nome do produto
 * @property {string} area - Área de produção onde é feito
 * @property {Array<string>} specificInstructions - Instruções especiais
 * @property {number} [fermentationTime] - Tempo de fermentação em minutos
 * @property {number} [bakingTime] - Tempo de forno em minutos
 * @property {TemperatureControl} temperatureControl - Requisitos de temperatura
 * @property {number} shelfLife - Vida útil do produto em horas
 * @property {Array<PreparationStep>} preparationSteps - Etapas detalhadas de produção
 */
export interface TechnicalSheet {
  id: string;
  productId: string;
  productName: string;
  area: string;
  specificInstructions: Array<string>;
  fermentationTime?: number;
  bakingTime?: number;
  temperatureControl: TemperatureControl;
  shelfLife: number;
  preparationSteps: Array<PreparationStep>;
}

/**
 * Ingrediente de produção
 * @interface ProductionIngredient
 * @property {string} id - Identificador único do ingrediente
 * @property {string} inventoryItemId - ID do item no inventário
 * @property {string} name - Nome do ingrediente
 * @property {number} quantity - Quantidade necessária
 * @property {string} unit - Unidade de medida
 */
export interface ProductionIngredient {
  id: string;
  inventoryItemId: string;
  name: string;
  quantity: number;
  unit: string;
}

/**
 * Preparação de cozinha
 * @interface KitchenPreparation
 * @property {string} id - Identificador único da preparação
 * @property {string} name - Nome da preparação
 * @property {boolean} isHot - Se é uma preparação quente
 * @property {number} cookingTime - Tempo de cozimento em minutos
 * @property {number} cookingTemperature - Temperatura de cozimento
 * @property {Array<ProductionIngredient>} ingredients - Ingredientes necessários
 * @property {Array<string>} instructions - Instruções de preparação
 * @property {number} servingSize - Número de porções produzidas
 * @property {Array<string>} equipmentNeeded - Equipamentos necessários
 */
export interface KitchenPreparation {
  id: string;
  name: string;
  isHot: boolean;
  cookingTime: number;
  cookingTemperature: number;
  ingredients: Array<ProductionIngredient>;
  instructions: Array<string>;
  servingSize: number;
  equipmentNeeded: Array<string>;
}

/**
 * Item de confeitaria
 * @interface ConfectioneryItem
 * @property {string} id - Identificador único do item
 * @property {string} name - Nome do item
 * @property {string} standardizedRecipe - Código de referência da receita
 * @property {TemperatureControl} temperatureControl - Requisitos de temperatura
 * @property {Array<string>} decorationItems - Itens usados na decoração
 * @property {number} expirationHours - Horas até a validade
 * @property {string} storageInstructions - Requisitos de armazenamento
 * @property {Array<ProductionIngredient>} ingredients - Ingredientes necessários
 */
export interface ConfectioneryItem {
  id: string;
  name: string;
  standardizedRecipe: string;
  temperatureControl: TemperatureControl;
  decorationItems: Array<string>;
  expirationHours: number;
  storageInstructions: string;
  ingredients: Array<ProductionIngredient>;
}

/**
 * Item de panificação
 * @interface BakeryItem
 * @property {string} id - Identificador único do item
 * @property {string} name - Nome do item
 * @property {string} doughType - Tipo de massa utilizada
 * @property {number} fermentationTime - Tempo de fermentação em minutos
 * @property {number} fermentationTemperature - Temperatura de fermentação
 * @property {number} ovenTime - Tempo de forno em minutos
 * @property {number} ovenTemperature - Temperatura do forno
 * @property {number} batchSize - Quantidade por lote
 * @property {Array<ProductionIngredient>} ingredients - Ingredientes necessários
 * @property {number} shelfLife - Vida útil em horas
 */
export interface BakeryItem {
  id: string;
  name: string;
  doughType: string;
  fermentationTime: number;
  fermentationTemperature: number;
  ovenTime: number;
  ovenTemperature: number;
  batchSize: number;
  ingredients: Array<ProductionIngredient>;
  shelfLife: number;
}

/**
 * Item de ordem de produção
 * @interface ProductionOrderItem
 * @property {string} id - Identificador único do item
 * @property {string} productId - ID do produto
 * @property {string} productName - Nome do produto
 * @property {number} quantity - Quantidade a produzir
 * @property {ProductionOrderStatus} status - Status do item
 * @property {string} area - Área de produção
 * @property {string} technicalSheetId - ID da ficha técnica
 * @property {number} estimatedTime - Tempo estimado em minutos
 * @property {Date} [startTime] - Hora de início da produção
 */
export interface ProductionOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  status: ProductionOrderStatus;
  area: string;
  technicalSheetId: string;
  estimatedTime: number;
  startTime?: Date;
}

/**
 * Evento de acompanhamento
 * @interface TrackingEvent
 * @property {string} id - Identificador único do evento
 * @property {Date} timestamp - Data e hora do evento
 * @property {string} description - Descrição do evento
 * @property {string} userId - ID do usuário responsável
 * @property {string} userName - Nome do usuário responsável
 * @property {ProductionOrderStatus} status - Status após o evento
 */
export interface TrackingEvent {
  id: string;
  timestamp: Date;
  description: string;
  userId: string;
  userName: string;
  status: ProductionOrderStatus;
}

/**
 * Ordem de produção
 * @interface ProductionOrder
 * @property {string} id - Identificador único da ordem
 * @property {string} orderNumber - Número da ordem
 * @property {Date} date - Data de criação
 * @property {Date} dueDate - Data de entrega
 * @property {string} [clientName] - Nome do cliente
 * @property {string} [clientId] - ID do cliente
 * @property {ProductionOrderStatus} status - Status da ordem
 * @property {ProductionPriority} priority - Prioridade da ordem
 * @property {Array<ProductionOrderItem>} items - Itens da ordem
 * @property {string} [notes] - Observações
 * @property {string} [saleId] - ID da venda relacionada
 * @property {number} totalEstimatedTime - Tempo total estimado em minutos
 * @property {string} assignedArea - Área responsável
 * @property {string} createdBy - ID do usuário que criou
 * @property {Array<TrackingEvent>} trackingEvents - Eventos de acompanhamento
 */
export interface ProductionOrder {
  id: string;
  orderNumber: string;
  date: Date;
  dueDate: Date;
  clientName?: string;
  clientId?: string;
  status: ProductionOrderStatus;
  priority: ProductionPriority;
  items: Array<ProductionOrderItem>;
  notes?: string;
  saleId?: string;
  totalEstimatedTime: number;
  assignedArea: string;
  createdBy: string;
  trackingEvents: Array<TrackingEvent>;
}

/**
 * Produto do plano de produção
 * @interface PlannedProduct
 * @property {string} productId - ID do produto
 * @property {string} productName - Nome do produto
 * @property {number} quantity - Quantidade planejada
 * @property {number} completed - Quantidade concluída
 * @property {number} wasted - Quantidade perdida
 */
export interface PlannedProduct {
  productId: string;
  productName: string;
  quantity: number;
  completed: number;
  wasted: number;
}

/**
 * Plano de produção
 * @interface ProductionPlan
 * @property {string} id - Identificador único do plano
 * @property {Date} date - Data do plano
 * @property {string} status - Status do plano
 * @property {string} assignedTo - ID do responsável
 * @property {string} area - Área de produção
 * @property {ProductionPriority} priority - Prioridade do plano
 * @property {number} estimatedTimeMinutes - Tempo estimado em minutos
 * @property {number} [actualTimeMinutes] - Tempo real em minutos
 * @property {Array<PlannedProduct>} products - Produtos planejados
 * @property {string} [notes] - Observações
 * @property {Array<string>} [linkedOrders] - Ordens de produção vinculadas
 */
export interface ProductionPlan {
  id: string;
  date: Date;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo: string;
  area: string;
  priority: ProductionPriority;
  estimatedTimeMinutes: number;
  actualTimeMinutes?: number;
  products: Array<PlannedProduct>;
  notes?: string;
  linkedOrders?: Array<string>;
}

/**
 * Produtividade por área
 * @interface AreaProductivity
 * @property {string} area - Nome da área
 * @property {number} itemsProduced - Itens produzidos
 * @property {number} itemsWasted - Itens perdidos
 * @property {number} efficiencyRate - Taxa de eficiência
 * @property {number} avgCompletionTime - Tempo médio de conclusão
 * @property {Array<TopProducedItem>} topProducedItems - Itens mais produzidos
 */
export interface AreaProductivity {
  area: string;
  itemsProduced: number;
  itemsWasted: number;
  efficiencyRate: number;
  avgCompletionTime: number;
  topProducedItems: Array<TopProducedItem>;
}

/**
 * Item mais produzido
 * @interface TopProducedItem
 * @property {string} productId - ID do produto
 * @property {string} productName - Nome do produto
 * @property {number} quantity - Quantidade produzida
 */
export interface TopProducedItem {
  productId: string;
  productName: string;
  quantity: number;
}

/**
 * Relatório de produtividade
 * @interface ProductivityReport
 * @property {Date} periodStart - Início do período
 * @property {Date} periodEnd - Fim do período
 * @property {Array<AreaProductivity>} areas - Produtividade por área
 * @property {number} totalProduction - Total de itens produzidos
 * @property {number} totalPlanned - Total de itens planejados
 * @property {number} completionRate - Taxa de conclusão
 * @property {number} wasteRate - Taxa de perdas
 * @property {number} averageProductionTime - Tempo médio de produção
 */
export interface ProductivityReport {
  periodStart: Date;
  periodEnd: Date;
  areas: Array<AreaProductivity>;
  totalProduction: number;
  totalPlanned: number;
  completionRate: number;
  wasteRate: number;
  averageProductionTime: number;
}