/**
 * Mock data for development and testing
 * @module data/mockData
 * @description Contains mock data for users, products, inventory, production, and sales
 */

import { User } from '../types/user';
import { Product, ProductCategory, Recipe } from '../types/product';
import { InventoryItem, Supplier, IncomingGoods, ShoppingListItem } from '../types/inventory';
import { 
  ProductionPlan, 
  ProductionOrder, 
  ProductionArea, 
  TechnicalSheet,
  KitchenPreparation,
  ConfectioneryItem,
  BakeryItem,
  ProductivityReport
} from '../types/production';
import { Sale } from '../types/sale';

/**
 * Mock users for testing authentication and authorization
 * @constant {User[]}
 * @description Predefined user accounts with different roles for testing
 */
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@bakery.com',
    password: 'admin123', // In a real app, this would be hashed
    role: 'admin',
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@bakery.com',
    password: 'manager123',
    role: 'manager',
  },
  {
    id: '3',
    name: 'Staff User',
    email: 'staff@bakery.com',
    password: 'staff123',
    role: 'staff',
  },
  {
    id: '4',
    name: 'Cashier User',
    email: 'cashier@bakery.com',
    password: 'cashier123',
    role: 'cashier',
  },
];

/**
 * Mock customers for testing customer management functionality
 * @constant {Object[]}
 * @description Sample customer data including both business and individual customers
 */
export const mockCustomers = [
  {
    id: '1',
    name: 'Jane Customer',
    phone: '555-987-6543',
    email: 'jane@example.com',
    address: '123 Main St, Anytown',
    type: 'business',
    contact: 'John Manager',
    createdAt: new Date('2023-08-20'),
  },
  {
    id: '2',
    name: 'Local Cafe',
    phone: '555-123-9876',
    email: 'orders@localcafe.com',
    address: '456 Commercial Ave, Anytown',
    type: 'business',
    contact: 'John Manager',
    createdAt: new Date('2023-08-20'),
  },
  {
    id: '3',
    name: 'Community Center',
    phone: '555-789-1234',
    email: 'events@communitycenter.org',
    address: '789 Civic Dr, Anytown',
    type: 'business',
    contact: 'Sarah Director',
    createdAt: new Date('2023-07-10'),
  },
  {
    id: '4',
    name: 'Bob Smith',
    phone: '555-456-7890',
    email: 'bob@example.com',
    address: '101 Oak St, Anytown',
    type: 'individual',
    createdAt: new Date('2023-10-01'),
  },
  {
    id: '5',
    name: 'Fresh Foods Market',
    phone: '555-246-8135',
    email: 'orders@freshfoods.com',
    address: '202 Market Sq, Anytown',
    type: 'business',
    contact: 'Maria Purchaser',
    createdAt: new Date('2023-09-05'),
  },
];

/**
 * Mock product categories for organizing products
 * @constant {ProductCategory[]}
 * @description Basic product categorization system
 */
export const mockProductCategories: ProductCategory[] = [
  { id: '1', name: 'Produtos de Revenda', description: 'Produtos prontos para revenda' },
  { id: '2', name: 'Matéria Prima', description: 'Insumos para produção' },
  { id: '3', name: 'Produção Própria', description: 'Produtos fabricados internamente' },
];

/**
 * Mock recipes for bakery products
 * @constant {Recipe[]}
 * @description Detailed recipes with ingredients, steps, and preparation times
 */
export const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Pão Sourdough Tradicional',
    steps: [
      'Misturar farinha, água e fermento natural',
      'Descansar por 1 hora',
      'Fazer 3 dobras a cada 30 minutos',
      'Modelar e colocar em cestos',
      'Fermentar por 12-16 horas na geladeira',
      'Assar a 220°C por 40 minutos'
    ],
    preparationTime: 1080, // em minutos (18 horas total)
    yield: 6,
    ingredients: [
      { id: '3', name: 'Sal', unitCost: 0.5, unitType: 'kg', quantity: 0.02, inventoryId: '3' },
      { id: '4', name: 'Fermento Natural', unitCost: 0.7, unitType: 'kg', quantity: 0.2, inventoryId: '4' }
    ]
  },
  {
    id: '2',
    name: 'Bolo de Cenoura com Cobertura',
    steps: [
      'Bater cenouras, óleo, ovos e açúcar no liquidificador',
      'Adicionar farinha e fermento',
      'Assar em forno a 180°C por 40 minutos',
      'Preparar a cobertura com chocolate e manteiga',
      'Cobrir o bolo depois de assado e esfriado'
    ],
    preparationTime: 60, // em minutos
    yield: 8, // quantas porções
    ingredients: [
      { id: '5', name: 'Farinha', unitCost: 0.8, unitType: 'kg', quantity: 0.2, inventoryId: '1' },
      { id: '6', name: 'Cenouras', unitCost: 1.5, unitType: 'kg', quantity: 0.15, inventoryId: '8' },
      { id: '7', name: 'Açúcar', unitCost: 1.2, unitType: 'kg', quantity: 0.15, inventoryId: '7' },
      { id: '8', name: 'Chocolate', unitCost: 8.0, unitType: 'kg', quantity: 0.1, inventoryId: '6' },
    ]
  }
];

/**
 * Mock products available in the system
 * @constant {Product[]}
 * @description Complete product catalog with pricing and inventory information
 */
export const mockProducts: Product[] = [
  {
    id: '1',
    internalCode: 'PRO001',
    name: 'Pão Sourdough',
    description: 'Pão sourdough tradicional com crosta crocante',
    category: 'Produção Própria',
    unitOfMeasure: 'un',
    price: 6.99,
    costPrice: 2.10,
    isActive: true,
    image: 'https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg',
    ingredients: [
      { id: '1', name: 'Farinha', unitCost: 0.8, unitType: 'kg', quantity: 1, inventoryId: '1' },
      { id: '2', name: 'Água', unitCost: 0.1, unitType: 'liter', quantity: 0.65, inventoryId: '2' },
      { id: '3', name: 'Sal', unitCost: 0.5, unitType: 'kg', quantity: 0.02, inventoryId: '3' },
      { id: '4', name: 'Fermento Natural', unitCost: 0.7, unitType: 'kg', quantity: 0.2, inventoryId: '4' }
    ],
    recipeId: '1',
    reorderPoint: 10,
    suggestedOrderQuantity: 20
  },
  {
    id: '2',
    internalCode: 'PRO002',
    name: 'Croissant de Chocolate',
    description: 'Croissant amanteigado recheado com chocolate',
    category: 'Produção Própria',
    unitOfMeasure: 'un',
    price: 3.49,
    costPrice: 0.95,
    isActive: true,
    image: 'https://images.pexels.com/photos/3892469/pexels-photo-3892469.jpeg',
    ingredients: [
      { id: '5', name: 'Farinha', unitCost: 0.8, unitType: 'kg', quantity: 0.1, inventoryId: '1' },
      { id: '6', name: 'Manteiga', unitCost: 6.0, unitType: 'kg', quantity: 0.05, inventoryId: '5' },
      { id: '7', name: 'Chocolate', unitCost: 8.0, unitType: 'kg', quantity: 0.03, inventoryId: '6' },
      { id: '8', name: 'Açúcar', unitCost: 1.2, unitType: 'kg', quantity: 0.01, inventoryId: '7' }
    ],
    reorderPoint: 15,
    suggestedOrderQuantity: 30
  }
];

/**
 * Mock inventory items with stock levels and tracking
 * @constant {InventoryItem[]}
 * @description Current inventory state with stock levels and reorder points
 */
export const mockInventory: InventoryItem[] = [
  {
    id: '1',
    internalCode: 'MP001',
    name: 'Farinha de Trigo',
    description: 'Farinha de trigo tipo 1',
    quantity: 15,
    unit: 'kg',
    minimumLevel: 20,
    reorderPoint: 25,
    suggestedOrderQuantity: 50,
    purchaseDate: new Date('2023-10-15'),
    costPerUnit: 0.8,
    supplierId: '1',
    location: 'Armazém Seco A1',
    lastUpdated: new Date('2023-10-15'),
    needsRestock: true
  },
  {
    id: '2',
    internalCode: 'MP010',
    name: 'Água',
    description: 'Água filtrada',
    quantity: 200,
    unit: 'l',
    minimumLevel: 50,
    reorderPoint: 60,
    suggestedOrderQuantity: 100,
    purchaseDate: new Date('2023-10-20'),
    costPerUnit: 0.1,
    supplierId: '2',
    location: 'Utilidades',
    lastUpdated: new Date('2023-10-20'),
    needsRestock: false
  },
  {
    id: '3',
    internalCode: 'MP002',
    name: 'Sal',
    quantity: 4,
    unit: 'kg',
    minimumLevel: 5,
    reorderPoint: 7,
    suggestedOrderQuantity: 10,
    purchaseDate: new Date('2023-09-10'),
    costPerUnit: 0.5,
    supplierId: '1',
    location: 'Armazém Seco A2',
    lastUpdated: new Date('2023-09-10'),
    needsRestock: true
  },
  {
    id: '4',
    internalCode: 'MP003',
    name: 'Fermento Natural',
    quantity: 8,
    unit: 'kg',
    minimumLevel: 2,
    reorderPoint: 3,
    suggestedOrderQuantity: 5,
    expiryDate: new Date('2023-11-10'),
    purchaseDate: new Date('2023-10-01'),
    costPerUnit: 0.7,
    supplierId: '3',
    location: 'Refrigerador 1',
    lastUpdated: new Date('2023-10-01'),
    needsRestock: false
  },
  {
    id: '5',
    internalCode: 'MP004',
    name: 'Manteiga',
    quantity: 5,
    unit: 'kg',
    minimumLevel: 10,
    reorderPoint: 12,
    suggestedOrderQuantity: 15,
    expiryDate: new Date('2023-12-15'),
    purchaseDate: new Date('2023-10-10'),
    costPerUnit: 6.0,
    supplierId: '2',
    location: 'Refrigerador 2',
    lastUpdated: new Date('2023-10-10'),
    needsRestock: true
  },
  {
    id: '6',
    internalCode: 'MP005',
    name: 'Chocolate',
    quantity: 3,
    unit: 'kg',
    minimumLevel: 5,
    reorderPoint: 7,
    suggestedOrderQuantity: 10,
    expiryDate: new Date('2024-02-01'),
    purchaseDate: new Date('2023-09-20'),
    costPerUnit: 8.0,
    supplierId: '4',
    location: 'Armazém Seco B1',
    lastUpdated: new Date('2023-09-20'),
    needsRestock: true
  },
  {
    id: '7',
    internalCode: 'MP006',
    name: 'Açúcar',
    quantity: 9,
    unit: 'kg',
    minimumLevel: 15,
    reorderPoint: 18,
    suggestedOrderQuantity: 25,
    purchaseDate: new Date('2023-09-15'),
    costPerUnit: 1.2,
    supplierId: '1',
    location: 'Armazém Seco A3',
    lastUpdated: new Date('2023-09-15'),
    needsRestock: true
  },
  {
    id: '8',
    internalCode: 'MP007',
    name: 'Cenouras',
    quantity: 10,
    unit: 'kg',
    minimumLevel: 5,
    reorderPoint: 7,
    suggestedOrderQuantity: 10,
    expiryDate: new Date('2023-10-30'),
    purchaseDate: new Date('2023-10-23'),
    costPerUnit: 1.5,
    supplierId: '5',
    location: 'Refrigerador 3',
    lastUpdated: new Date('2023-10-23'),
    needsRestock: false
  },
  {
    id: '9',
    internalCode: 'MP008',
    name: 'Cream Cheese',
    quantity: 2,
    unit: 'kg',
    minimumLevel: 3,
    reorderPoint: 4,
    suggestedOrderQuantity: 5,
    expiryDate: new Date('2023-11-15'),
    purchaseDate: new Date('2023-10-20'),
    costPerUnit: 5.0,
    supplierId: '2',
    location: 'Refrigerador 2',
    lastUpdated: new Date('2023-10-20'),
    needsRestock: true
  },
  {
    id: '10',
    internalCode: 'MP009',
    name: 'Gotas de Chocolate',
    quantity: 4,
    unit: 'kg',
    minimumLevel: 5,
    reorderPoint: 7,
    suggestedOrderQuantity: 10,
    expiryDate: new Date('2024-03-01'),
    purchaseDate: new Date('2023-09-25'),
    costPerUnit: 7.0,
    supplierId: '4',
    location: 'Armazém Seco B2',
    lastUpdated: new Date('2023-09-25'),
    needsRestock: true
  },
];

/**
 * Get current shopping list based on inventory levels
 * @function getShoppingList
 * @returns {ShoppingListItem[]} List of items that need to be purchased
 * @description Generates a shopping list based on current inventory levels and reorder points
 */
export const getShoppingList = (): ShoppingListItem[] => {
  return mockInventory
    .filter(item => item.needsRestock || item.quantity <= item.minimumLevel)
    .map(item => {
      const supplier = mockSuppliers.find(s => s.id === item.supplierId);
      return {
        id: item.id,
        inventoryItemId: item.id,
        quantity: item.suggestedOrderQuantity - item.quantity,
        preferredSupplierId: item.supplierId,
        notes: `Current stock: ${item.quantity}, Minimum level: ${item.minimumLevel}`
      };
    });
};

/**
 * Mock records of incoming goods
 * @constant {IncomingGoods[]}
 * @description Records of received inventory with invoice details
 */
export const mockIncomingGoods: IncomingGoods[] = [
  {
    id: '1',
    supplierId: '1',
    date: new Date(),
    items: [
      {
        inventoryItemId: '1',
        quantity: 50,
        unitCost: 4.50,
        batchNumber: 'BATCH-001'
      },
      {
        inventoryItemId: '3',
        quantity: 10,
        unitCost: 2.20,
        batchNumber: 'BATCH-002'
      }
    ],
    totalCost: 247.00,
    receivedBy: '2',
    notes: 'Regular weekly delivery'
  }
];

/**
 * Mock suppliers data
 * @constant {Supplier[]}
 * @description List of suppliers with contact information
 */
export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Flour & More Supplies',
    contactPerson: 'John Smith',
    email: 'john@flourmore.com',
    phone: '555-123-4567',
    address: '123 Baker Street, Flourtown',
    categories: ['Flour', 'Grains', 'Baking Supplies'],
    deliveryTerms: {
      minOrderValue: 100,
      deliveryTime: 24,
      deliveryFee: 15
    }
  },
  {
    id: '2',
    name: 'Dairy Delights',
    contactPerson: 'Mary Johnson',
    email: 'mary@dairydelights.com',
    phone: '555-234-5678',
    address: '456 Milk Road, Creamville',
    categories: ['Dairy', 'Eggs', 'Butter'],
    deliveryTerms: {
      minOrderValue: 150,
      deliveryTime: 12,
      deliveryFee: 20
    }
  },
  {
    id: '3',
    name: 'Artisan Ingredients',
    contactPerson: 'Robert Lee',
    email: 'robert@artisaningredients.com',
    phone: '555-345-6789',
    address: '789 Craft Avenue, Artstown',
    categories: ['Specialty', 'Organic', 'Artisanal'],
    deliveryTerms: {
      minOrderValue: 200,
      deliveryTime: 48,
      deliveryFee: 25
    }
  },
  {
    id: '4',
    name: 'Sweet Essentials',
    contactPerson: 'Sarah Brown',
    email: 'sarah@sweetessentials.com',
    phone: '555-456-7890',
    address: '101 Sugar Lane, Candyville',
    categories: ['Sugar', 'Chocolate', 'Confectionery'],
    deliveryTerms: {
      minOrderValue: 100,
      deliveryTime: 24,
      deliveryFee: 15
    }
  },
  {
    id: '5',
    name: 'Fresh Produce Co.',
    contactPerson: 'David Wilson',
    email: 'david@freshproduce.com',
    phone: '555-567-8901',
    address: '202 Garden Road, Harvestfield',
    categories: ['Fruits', 'Vegetables', 'Fresh'],
    deliveryTerms: {
      minOrderValue: 75,
      deliveryTime: 12,
      deliveryFee: 10
    }
  },
];

/**
 * Mock production areas in the facility
 * @constant {ProductionArea[]}
 * @description Different production zones with equipment and capacity
 */
export const mockProductionAreas: ProductionArea[] = [
  {
    id: '1',
    name: 'Cozinha',
    description: 'Área para preparações quentes e frias',
    productionCapacity: 200,
    currentUtilization: 65,
    activeProduction: ['1', '2'],
    equipment: [
      { id: '1', name: 'Fogão Industrial 6 bocas', type: 'fogão', status: 'active' },
      { id: '2', name: 'Forno Combinado', type: 'forno', status: 'active' },
      { id: '3', name: 'Fritadeira', type: 'fritadeira', status: 'maintenance', lastMaintenance: new Date('2023-10-01') }
    ]
  },
  {
    id: '2',
    name: 'Confeitaria',
    description: 'Área para produção de bolos, tortas e sobremesas',
    productionCapacity: 150,
    currentUtilization: 40,
    activeProduction: ['3'],
    equipment: [
      { id: '4', name: 'Batedeira Planetária Industrial', type: 'batedeira', status: 'active' },
      { id: '5', name: 'Forno para Confeitaria', type: 'forno', status: 'active' },
      { id: '6', name: 'Geladeira Vertical', type: 'refrigeração', status: 'active' }
    ]
  },
  {
    id: '3',
    name: 'Panificação',
    description: 'Área para produção de pães e produtos de panificação',
    productionCapacity: 300,
    currentUtilization: 80,
    activeProduction: ['4', '5'],
    equipment: [
      { id: '7', name: 'Forno para Pães', type: 'forno', status: 'active' },
      { id: '8', name: 'Masseira', type: 'masseira', status: 'active' },
      { id: '9', name: 'Câmara de Fermentação', type: 'fermentação', status: 'active' },
      { id: '10', name: 'Divisora de Massa', type: 'divisora', status: 'maintenance', lastMaintenance: new Date('2023-09-15') }
    ]
  }
];

/**
 * Mock technical sheets for production
 * @constant {TechnicalSheet[]}
 * @description Detailed production instructions and specifications
 */
export const mockTechnicalSheets: TechnicalSheet[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Pão Sourdough',
    area: 'bakery',
    specificInstructions: [
      'Utilizar fermento natural com 100% de hidratação',
      'Manter temperatura da massa entre 24°C e 26°C durante a fermentação inicial',
      'Fazer 3 dobras para desenvolver a rede de glúten'
    ],
    fermentationTime: 960, // 16 horas em minutos
    bakingTime: 40, // 40 minutos
    temperatureControl: {
      min: 220,
      max: 230,
      unit: 'C'
    },
    shelfLife: 72, // 72 horas (3 dias)
    preparationSteps: [
      {
        id: '1',
        order: 1,
        description: 'Misturar farinha, água e fermento natural (autólise)',
        estimatedTime: 20,
        equipmentNeeded: ['Bacia de Aço Inox', 'Balança de Precisão']
      },
      {
        id: '2',
        order: 2,
        description: 'Descansar a massa por 1 hora',
        estimatedTime: 60,
        equipmentNeeded: []
      },
      {
        id: '3',
        order: 3,
        description: 'Adicionar sal e incorporar à massa',
        estimatedTime: 10,
        equipmentNeeded: ['Espátula']
      },
      {
        id: '4',
        order: 4,
        description: 'Realizar dobras a cada 30 minutos (total 3 dobras)',
        estimatedTime: 90,
        equipmentNeeded: ['Espátula']
      },
      {
        id: '5',
        order: 5,
        description: 'Pré-modelar a massa e deixar descansar 30 minutos',
        estimatedTime: 40,
        equipmentNeeded: ['Bancada', 'Raspador']
      },
      {
        id: '6',
        order: 6,
        description: 'Modelar e colocar nos cestos de fermentação',
        estimatedTime: 20,
        equipmentNeeded: ['Cestos de Fermentação', 'Panos', 'Raspador']
      },
      {
        id: '7',
        order: 7,
        description: 'Fermentar na geladeira (12-16 horas)',
        estimatedTime: 840,
        equipmentNeeded: ['Geladeira']
      },
      {
        id: '8',
        order: 8,
        description: 'Pré-aquecer o forno com a pedra a 230°C',
        estimatedTime: 30,
        equipmentNeeded: ['Forno', 'Pedra de Forneamento']
      },
      {
        id: '9',
        order: 9,
        description: 'Fazer os cortes no pão e transferir para o forno',
        estimatedTime: 5,
        equipmentNeeded: ['Lâmina de Corte', 'Pá de Transferência']
      },
      {
        id: '10',
        order: 10,
        description: 'Assar com vapor por 20 minutos, depois sem vapor por mais 20 minutos',
        estimatedTime: 40,
        temperatureNeeded: 220,
        equipmentNeeded: ['Forno', 'Recipiente para Vapor']
      }
    ]
  },
  {
    id: '2',
    productId: '3',
    productName: 'Bolo de Cenoura',
    area: 'confectionery',
    specificInstructions: [
      'Utilizar cenouras frescas e orgânicas para melhor sabor',
      'Peneirar ingredientes secos para evitar grumos',
      'Verificar ponto do bolo com palito antes de retirar do forno'
    ],
    temperatureControl: {
      min: 175,
      max: 185,
      unit: 'C'
    },
    shelfLife: 48, // 48 horas (2 dias)
    preparationSteps: [
      {
        id: '11',
        order: 1,
        description: 'Lavar, descascar e cortar as cenouras',
        estimatedTime: 10,
        equipmentNeeded: ['Faca', 'Tábua de Corte']
      },
      {
        id: '12',
        order: 2,
        description: 'Bater no liquidificador cenouras, óleo, ovos e açúcar',
        estimatedTime: 5,
        equipmentNeeded: ['Liquidificador']
      },
      {
        id: '13',
        order: 3,
        description: 'Adicionar farinha peneirada e fermento, misturando levemente',
        estimatedTime: 5,
        equipmentNeeded: ['Peneira', 'Batedeira']
      },
      {
        id: '14',
        order: 4,
        description: 'Transferir para forma untada e enfarinhada',
        estimatedTime: 5,
        equipmentNeeded: ['Forma para Bolo']
      },
      {
        id: '15',
        order: 5,
        description: 'Assar em forno pré-aquecido a 180°C',
        estimatedTime: 40,
        temperatureNeeded: 180,
        equipmentNeeded: ['Forno']
      },
      {
        id: '16',
        order: 6,
        description: 'Preparar cobertura: derreter chocolate com manteiga',
        estimatedTime: 10,
        equipmentNeeded: ['Panela', 'Fogão']
      },
      {
        id: '17',
        order: 7,
        description: 'Aplicar cobertura no bolo já frio',
        estimatedTime: 5,
        equipmentNeeded: ['Espátula de Confeitaria']
      }
    ]
  },
  {
    id: '3',
    productId: '2',
    productName: 'Croissant de Chocolate',
    area: 'bakery',
    specificInstructions: [
      'Manter a massa e manteiga à mesma temperatura para dobras perfeitas',
      'Fazer descanso no frio entre as dobras',
      'Não deixar o chocolate exposto nas bordas para evitar vazamento'
    ],
    fermentationTime: 120, // 2 horas em minutos
    bakingTime: 18, // 18 minutos
    temperatureControl: {
      min: 170,
      max: 180,
      unit: 'C'
    },
    shelfLife: 24, // 24 horas (1 dia)
    preparationSteps: [
      {
        id: '18',
        order: 1,
        description: 'Preparar a massa base com farinha, água, açúcar, fermento e sal',
        estimatedTime: 15,
        equipmentNeeded: ['Masseira', 'Balança']
      },
      {
        id: '19',
        order: 2,
        description: 'Descansar a massa por 1 hora na geladeira',
        estimatedTime: 60,
        equipmentNeeded: ['Geladeira']
      },
      {
        id: '20',
        order: 3,
        description: 'Preparar o bloco de manteiga',
        estimatedTime: 10,
        equipmentNeeded: ['Rolo', 'Papel Manteiga']
      },
      {
        id: '21',
        order: 4,
        description: 'Incorporar a manteiga à massa e fazer a primeira dobra',
        estimatedTime: 15,
        equipmentNeeded: ['Rolo', 'Bancada']
      },
      {
        id: '22',
        order: 5,
        description: 'Descansar por 30 minutos na geladeira',
        estimatedTime: 30,
        equipmentNeeded: ['Geladeira']
      },
      {
        id: '23',
        order: 6,
        description: 'Realizar mais duas dobras com descansos intermediários',
        estimatedTime: 75,
        equipmentNeeded: ['Rolo', 'Bancada', 'Geladeira']
      },
      {
        id: '24',
        order: 7,
        description: 'Abrir a massa na espessura desejada',
        estimatedTime: 10,
        equipmentNeeded: ['Rolo']
      },
      {
        id: '25',
        order: 8,
        description: 'Cortar triângulos e adicionar chocolate',
        estimatedTime: 15,
        equipmentNeeded: ['Cortador', 'Balança']
      },
      {
        id: '26',
        order: 9,
        description: 'Modelar os croissants',
        estimatedTime: 15,
        equipmentNeeded: ['Bancada']
      },
      {
        id: '27',
        order: 10,
        description: 'Fermentar até dobrar de tamanho',
        estimatedTime: 120,
        equipmentNeeded: ['Câmara de Fermentação']
      },
      {
        id: '28',
        order: 11,
        description: 'Pincelar com ovo batido',
        estimatedTime: 5,
        equipmentNeeded: ['Pincel']
      },
      {
        id: '29',
        order: 12,
        description: 'Assar a 175°C até dourar',
        estimatedTime: 18,
        temperatureNeeded: 175,
        equipmentNeeded: ['Forno']
      }
    ]
  }
];

/**
 * Mock kitchen preparations
 * @constant {KitchenPreparation[]}
 * @description Recipes and preparations specific to kitchen area
 */
export const mockKitchenPreparations: KitchenPreparation[] = [
  {
    id: '1',
    name: 'Sopa de Legumes',
    isHot: true,
    cookingTime: 45,
    cookingTemperature: 95,
    ingredients: [
      { id: '1', inventoryItemId: '8', name: 'Cenoura', quantity: 0.3, unit: 'kg' },
      { id: '2', inventoryItemId: '3', name: 'Sal', quantity: 0.01, unit: 'kg' },
      { id: '3', inventoryItemId: '2', name: 'Água', quantity: 2, unit: 'liter' }
    ],
    instructions: [
      'Cortar os legumes em cubos pequenos',
      'Refogá-los em azeite por 5 minutos',
      'Adicionar água e sal',
      'Cozinhar em fogo médio por 30 minutos',
      'Bater no liquidificador e servir quente'
    ],
    servingSize: 4,
    equipmentNeeded: ['Fogão', 'Panela Grande', 'Liquidificador']
  },
  {
    id: '2',
    name: 'Molho de Tomate',
    isHot: true,
    cookingTime: 60,
    cookingTemperature: 85,
    ingredients: [
      { id: '4', inventoryItemId: '11', name: 'Tomates', quantity: 1, unit: 'kg' },
      { id: '5', inventoryItemId: '3', name: 'Sal', quantity: 0.01, unit: 'kg' },
      { id: '6', inventoryItemId: '12', name: 'Cebola', quantity: 0.2, unit: 'kg' },
      { id: '7', inventoryItemId: '13', name: 'Alho', quantity: 0.03, unit: 'kg' }
    ],
    instructions: [
      'Escaldar os tomates e remover as peles',
      'Picar cebola e alho finamente',
      'Refogar cebola e alho em azeite',
      'Adicionar os tomates picados',
      'Cozinhar em fogo baixo por 45 minutos',
      'Bater no liquidificador e voltar ao fogo por 10 minutos'
    ],
    servingSize: 10,
    equipmentNeeded: ['Fogão', 'Panela', 'Liquidificador']
  }
];

/**
 * Mock confectionery items
 * @constant {ConfectioneryItem[]}
 * @description Recipes and items specific to confectionery
 */
export const mockConfectioneryItems: ConfectioneryItem[] = [
  {
    id: '1',
    name: 'Mousse de Chocolate',
    standardizedRecipe: 'MOU-CHO-001',
    temperatureControl: {
      min: 2,
      max: 8
    },
    decorationItems: ['Raspas de Chocolate', 'Physalis', 'Hortelã'],
    expirationHours: 48,
    storageInstructions: 'Manter refrigerado entre 2°C e 8°C',
    ingredients: [
      { id: '8', inventoryItemId: '6', name: 'Chocolate', quantity: 0.2, unit: 'kg' },
      { id: '9', inventoryItemId: '5', name: 'Manteiga', quantity: 0.05, unit: 'kg' },
      { id: '10', inventoryItemId: '14', name: 'Creme de Leite', quantity: 0.5, unit: 'liter' },
      { id: '11', inventoryItemId: '7', name: 'Açúcar', quantity: 0.1, unit: 'kg' }
    ]
  },
  {
    id: '2',
    name: 'Torta de Morango',
    standardizedRecipe: 'TOR-MOR-001',
    temperatureControl: {
      min: 2,
      max: 6
    },
    decorationItems: ['Morangos Frescos', 'Folhas de Hortelã', 'Gelatina Transparente'],
    expirationHours: 36,
    storageInstructions: 'Manter sob refrigeração. Não congelar.',
    ingredients: [
      { id: '12', inventoryItemId: '1', name: 'Farinha', quantity: 0.3, unit: 'kg' },
      { id: '13', inventoryItemId: '5', name: 'Manteiga', quantity: 0.15, unit: 'kg' },
      { id: '14', inventoryItemId: '7', name: 'Açúcar', quantity: 0.2, unit: 'kg' },
      { id: '15', inventoryItemId: '15', name: 'Morangos', quantity: 0.4, unit: 'kg' }
    ]
  }
];

/**
 * Mock bakery items
 * @constant {BakeryItem[]}
 * @description Recipes and items specific to bakery
 */
export const mockBakeryItems: BakeryItem[] = [
  {
    id: '1',
    name: 'Pão Italiano',
    doughType: 'Alta Hidratação',
    fermentationTime: 180, // 3 horas em minutos
    fermentationTemperature: 24,
    ovenTime: 35,
    ovenTemperature: 230,
    batchSize: 8,
    ingredients: [
      { id: '16', inventoryItemId: '1', name: 'Farinha', quantity: 1, unit: 'kg' },
      { id: '17', inventoryItemId: '2', name: 'Água', quantity: 0.7, unit: 'liter' },
      { id: '18', inventoryItemId: '3', name: 'Sal', quantity: 0.02, unit: 'kg' },
      { id: '19', inventoryItemId: '16', name: 'Fermento Biológico', quantity: 0.01, unit: 'kg' }
    ],
    shelfLife: 24 // 24 horas
  },
  {
    id: '2',
    name: 'Brioche',
    doughType: 'Enriquecida',
    fermentationTime: 120, // 2 horas em minutos
    fermentationTemperature: 26,
    ovenTime: 25,
    ovenTemperature: 170,
    batchSize: 12,
    ingredients: [
      { id: '20', inventoryItemId: '1', name: 'Farinha', quantity: 0.5, unit: 'kg' },
      { id: '21', inventoryItemId: '5', name: 'Manteiga', quantity: 0.25, unit: 'kg' },
      { id: '22', inventoryItemId: '17', name: 'Ovos', quantity: 0.2, unit: 'kg' },
      { id: '23', inventoryItemId: '7', name: 'Açúcar', quantity: 0.1, unit: 'kg' },
      { id: '24', inventoryItemId: '16', name: 'Fermento Biológico', quantity: 0.015, unit: 'kg' }
    ],
    shelfLife: 48 // 48 horas
  }
];

/**
 * Mock production orders
 * @constant {ProductionOrder[]}
 * @description Active and completed production orders
 */
export const mockProductionOrders: ProductionOrder[] = [
  {
    id: '1',
    orderNumber: 'OP-2023-001',
    date: new Date(),
    dueDate: new Date(new Date().setHours(new Date().getHours() + 8)),
    clientName: 'Local Cafe',
    clientId: '101',
    status: 'in-production',
    priority: 'high',
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'Pão Sourdough',
        quantity: 10,
        status: 'in-production',
        area: 'bakery',
        technicalSheetId: '1',
        estimatedTime: 1080, // 18 horas
        startTime: new Date(new Date().setHours(new Date().getHours() - 12))
      },
      {
        id: '2',
        productId: '2',
        productName: 'Croissant de Chocolate',
        quantity: 20,
        status: 'pending',
        area: 'bakery',
        technicalSheetId: '3',
        estimatedTime: 420 // 7 horas
      }
    ],
    notes: 'Cliente precisa para amanhã de manhã. Prioridade máxima.',
    saleId: '101',
    totalEstimatedTime: 1500, // 25 horas
    assignedArea: 'bakery',
    createdBy: '2', // Manager
    trackingEvents: [
      {
        id: '1',
        timestamp: new Date(new Date().setHours(new Date().getHours() - 12)),
        description: 'Ordem de produção criada',
        userId: '2',
        userName: 'Manager User',
        status: 'pending'
      },
      {
        id: '2',
        timestamp: new Date(new Date().setHours(new Date().getHours() - 12)),
        description: 'Produção de Pão Sourdough iniciada',
        userId: '3',
        userName: 'Staff User',
        status: 'in-production'
      }
    ]
  },
  {
    id: '2',
    orderNumber: 'OP-2023-002',
    date: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    clientName: 'Restaurante Gourmet',
    clientId: '102',
    status: 'pending',
    priority: 'medium',
    items: [
      {
        id: '3',
        productId: '3',
        productName: 'Bolo de Cenoura',
        quantity: 2,
        status: 'pending',
        area: 'confectionery',
        technicalSheetId: '2',
        estimatedTime: 60 // 1 hora
      }
    ],
    notes: 'Bolo para evento corporativo',
    saleId: '102',
    totalEstimatedTime: 60, // 1 hora
    assignedArea: 'confectionery',
    createdBy: '2', // Manager
    trackingEvents: [
      {
        id: '3',
        timestamp: new Date(),
        description: 'Ordem de produção criada',
        userId: '2',
        userName: 'Manager User',
        status: 'pending'
      }
    ]
  },
  {
    id: '3',
    orderNumber: 'OP-2023-003',
    date: new Date(),
    dueDate: new Date(new Date().setHours(new Date().getHours() + 3)),
    status: 'in-production',
    priority: 'high',
    items: [
      {
        id: '4',
        productId: '100', // Custom kitchen item
        productName: 'Sopa de Legumes',
        quantity: 10,
        status: 'in-production',
        area: 'kitchen',
        technicalSheetId: 'k1',
        estimatedTime: 45, // 45 minutos
        startTime: new Date(new Date().setMinutes(new Date().getMinutes() - 20))
      }
    ],
    notes: 'Produção para o buffet do almoço',
    totalEstimatedTime: 45, // 45 minutos
    assignedArea: 'kitchen',
    createdBy: '3', // Staff
    trackingEvents: [
      {
        id: '5',
        timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 30)),
        description: 'Ordem de produção criada',
        userId: '3',
        userName: 'Staff User',
        status: 'pending'
      },
      {
        id: '6',
        timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 20)),
        description: 'Produção iniciada',
        userId: '3',
        userName: 'Staff User',
        status: 'in-production'
      }
    ]
  }
];

/**
 * Mock production plans
 * @constant {ProductionPlan[]}
 * @description Production planning and scheduling data
 */
export const mockProductionPlans: ProductionPlan[] = [
  {
    id: '1',
    date: new Date(),
    status: 'in-progress',
    assignedTo: '3',
    area: 'bakery',
    priority: 'high',
    estimatedTimeMinutes: 480,
    products: [
      { productId: '1', productName: 'Pão Sourdough', quantity: 20, completed: 15, wasted: 0 },
      { productId: '2', productName: 'Croissant de Chocolate', quantity: 30, completed: 20, wasted: 2 },
    ],
    notes: 'Foco na qualidade para pedido grande amanhã',
  },
  {
    id: '2',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    status: 'planned',
    assignedTo: '3',
    area: 'confectionery',
    priority: 'medium',
    estimatedTimeMinutes: 240,
    products: [
      { productId: '3', productName: 'Bolo de Cenoura', quantity: 5, completed: 0, wasted: 0 },
      { productId: '4', productName: 'Cookie com Gotas de Chocolate', quantity: 50, completed: 0, wasted: 0 },
    ],
  },
  {
    id: '3',
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    status: 'completed',
    assignedTo: '3',
    area: 'bakery',
    priority: 'medium',
    estimatedTimeMinutes: 360,
    actualTimeMinutes: 390,
    products: [
      { productId: '1', productName: 'Pão Sourdough', quantity: 18, completed: 18, wasted: 0 },
      { productId: '2', productName: 'Croissant de Chocolate', quantity: 25, completed: 22, wasted: 3 },
      { productId: '4', productName: 'Cookie com Gotas de Chocolate', quantity: 40, completed: 40, wasted: 0 },
    ],
  },
  {
    id: '4',
    date: new Date(),
    status: 'in-progress',
    assignedTo: '3',
    area: 'kitchen',
    priority: 'high',
    estimatedTimeMinutes: 120,
    products: [
      { productId: '100', productName: 'Sopa de Legumes', quantity: 20, completed: 10, wasted: 1 },
    ],
    notes: 'Preparar para o almoço',
    linkedOrders: ['3']
  },
];

/**
 * Mock productivity reports
 * @constant {ProductivityReport[]}
 * @description Production efficiency and performance metrics
 */
export const mockProductivityReports: ProductivityReport[] = [
  {
    periodStart: new Date(new Date().setDate(new Date().getDate() - 7)),
    periodEnd: new Date(),
    areas: [
      {
        area: 'kitchen',
        itemsProduced: 145,
        itemsWasted: 8,
        efficiencyRate: 92, // 92%
        avgCompletionTime: 55, // 55 minutos
        topProducedItems: [
          { productId: '100', productName: 'Sopa de Legumes', quantity: 60 },
          { productId: '101', productName: 'Molho de Tomate', quantity: 45 },
          { productId: '102', productName: 'Salada Caesar', quantity: 40 }
        ]
      },
      {
        area: 'confectionery',
        itemsProduced: 120,
        itemsWasted: 5,
        efficiencyRate: 95, // 95%
        avgCompletionTime: 90, // 90 minutos
        topProducedItems: [
          { productId: '3', productName: 'Bolo de Cenoura', quantity: 35 },
          { productId: '201', productName: 'Torta de Morango', quantity: 20 },
          { productId: '202', productName: 'Pudim de Leite', quantity: 30 }
        ]
      },
      {
        area: 'bakery',
        itemsProduced: 250,
        itemsWasted: 12,
        efficiencyRate: 90, // 90%
        avgCompletionTime: 120, // 120 minutos (por lote)
        topProducedItems: [
          { productId: '1', productName: 'Pão Sourdough', quantity: 80 },
          { productId: '2', productName: 'Croissant de Chocolate', quantity: 100 },
          { productId: '4', productName: 'Cookie com Gotas de Chocolate', quantity: 70 }
        ]
      }
    ],
    totalProduction: 515,
    totalPlanned: 550,
    completionRate: 93.6,
    wasteRate: 4.9,
    averageProductionTime: 88 // 88 minutos
  }
];

/**
 * Mock sales records
 * @constant {Sale[]}
 * @description Completed sales transactions
 */
export const mockSales: Sale[] = [
  {
    id: '1',
    orderNumber: 'SALE-2023-001',
    date: new Date(),
    items: [
      { 
        id: 'sale1-item1',
        productId: '1', 
        productName: 'Pão Sourdough', 
        quantity: 2, 
        unitPrice: 6.99, 
        total: 13.98 
      },
      { 
        id: 'sale1-item2',
        productId: '2', 
        productName: 'Croissant de Chocolate', 
        quantity: 3, 
        unitPrice: 3.49, 
        total: 10.47 
      }
    ],
    subtotal: 24.45,
    tax: 1.96,
    total: 26.41,
    payments: [
      {
        method: 'credit',
        amount: 26.41,
        reference: 'TRANS-001'
      }
    ],
    status: 'completed',
    cashierId: '4'
  },
  {
    id: '2',
    orderNumber: 'SALE-2023-002',
    date: new Date(new Date().setHours(new Date().getHours() - 2)),
    items: [
      { 
        id: 'sale2-item1',
        productId: '3', 
        productName: 'Bolo de Cenoura', 
        quantity: 1, 
        unitPrice: 4.99, 
        total: 4.99 
      },
      { 
        id: 'sale2-item2',
        productId: '4', 
        productName: 'Cookie com Gotas de Chocolate', 
        quantity: 5, 
        unitPrice: 1.99, 
        total: 9.95 
      }
    ],
    subtotal: 14.94,
    tax: 1.19,
    total: 16.13,
    payments: [
      {
        method: 'cash',
        amount: 20.00,
        change: 3.87
      }
    ],
    status: 'completed',
    cashierId: '4',
    customerDetails: {
      name: 'Jane Customer',
      phone: '555-987-6543'
    }
  },
  {
    id: '3',
    orderNumber: 'SALE-2023-003',
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    items: [
      { 
        id: 'sale3-item1',
        productId: '1', 
        productName: 'Pão Sourdough', 
        quantity: 5, 
        unitPrice: 6.99, 
        total: 34.95 
      },
      { 
        id: 'sale3-item2',
        productId: '2', 
        productName: 'Croissant de Chocolate', 
        quantity: 10, 
        unitPrice: 3.49, 
        total: 34.90 
      },
      { 
        id: 'sale3-item3',
        productId: '3', 
        productName: 'Bolo de Cenoura', 
        quantity: 2, 
        unitPrice: 4.99, 
        total: 9.98 
      }
    ],
    subtotal: 79.83,
    tax: 6.39,
    total: 86.22,
    payments: [
      {
        method: 'credit',
        amount: 86.22,
        reference: 'TRANS-002'
      }
    ],
    status: 'completed',
    cashierId: '4',
    customerDetails: {
      name: 'Local Cafe',
      phone: '555-123-9876',
      email: 'orders@localcafe.com'
    }
  },
];

/**
 * Mock daily sales summary
 * @constant {Object[]}
 * @description Daily sales totals and transaction counts
 */
export const mockDailySales = [
  { date: '2023-10-15', total: 523.45, transactions: 45 },
  { date: '2023-10-16', total: 612.30, transactions: 53 },
  { date: '2023-10-17', total: 498.75, transactions: 41 },
  { date: '2023-10-18', total: 587.20, transactions: 49 },
  { date: '2023-10-19', total: 645.90, transactions: 58 },
  { date: '2023-10-20', total: 712.15, transactions: 65 },
  { date: '2023-10-21', total: 823.50, transactions: 72 },
];

/**
 * Mock product sales data
 * @constant {Object[]}
 * @description Sales metrics by product
 */
export const mockProductSales = [
  { product: 'Pão Sourdough', sales: 145, revenue: 1013.55 },
  { product: 'Croissant de Chocolate', sales: 210, revenue: 732.90 },
  { product: 'Bolo de Cenoura', sales: 85, revenue: 424.15 },
  { product: 'Cookie com Gotas de Chocolate', sales: 320, revenue: 636.80 },
];

/**
 * Get items with low stock levels
 * @function getLowStockItems
 * @returns {InventoryItem[]} List of items with stock below reorder point
 * @description Identifies inventory items that need restocking
 */
export const getLowStockItems = (): InventoryItem[] => {
  return mockInventory.filter(
    (item) => item.quantity <= item.minimumLevel * 1.2
  );
};

/**
 * Get items approaching expiration
 * @function getExpiringSoonItems
 * @returns {InventoryItem[]} List of items approaching expiration date
 * @description Identifies inventory items that will expire within a week
 */
export const getExpiringSoonItems = (): InventoryItem[] => {
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
  
  return mockInventory.filter(
    (item) => item.expiryDate && item.expiryDate <= oneWeekFromNow
  );
};

/**
 * Get today's production schedule
 * @function getTodaysProduction
 * @returns {ProductionPlan[]} List of production plans for today
 * @description Retrieves all production plans scheduled for the current day
 */
export const getTodaysProduction = (): ProductionPlan[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return mockProductionPlans.filter(
    (plan) => new Date(plan.date).setHours(0, 0, 0, 0) === today.getTime()
  );
};

/**
 * Get today's sales data
 * @function getTodaysSales
 * @returns {Sale[]} List of sales transactions for today
 * @description Retrieves all sales transactions from the current day
 */
export const getTodaysSales = (): Sale[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return mockSales.filter(
    (sale) => new Date(sale.date).setHours(0, 0, 0, 0) === today.getTime()
  );
};

/**
 * Calculate today's revenue
 * @function getTodaysRevenue
 * @returns {number} Total revenue for today
 * @description Calculates the total revenue from all sales today
 */
export const getTodaysRevenue = (): number => {
  const todaySales = getTodaysSales();
  return todaySales.reduce((sum, sale) => sum + sale.total, 0);
};

/**
 * Get production orders by area
 * @function getProductionOrdersByArea
 * @param {string} area - Production area to filter by
 * @returns {ProductionOrder[]} List of production orders for the specified area
 * @description Filters production orders by specific production area
 */
export const getProductionOrdersByArea = (area: 'kitchen' | 'confectionery' | 'bakery'): ProductionOrder[] => {
  return mockProductionOrders.filter(order => 
    order.assignedArea === area || 
    (order.assignedArea === 'multiple' && order.items.some((item: { area: string }) => item.area === area))
  );
};

/**
 * Get ongoing production by area
 * @function getOngoingProductionByArea
 * @param {string} area - Production area to filter by
 * @returns {ProductionPlan[]} List of currently active production plans
 * @description Retrieves active production plans for a specific area
 */
export const getOngoingProductionByArea = (area: 'kitchen' | 'confectionery' | 'bakery'): ProductionPlan[] => {
  return mockProductionPlans.filter(
    plan => plan.status !== 'completed' && plan.area === area
  );
};

interface AreaProductivity {
  area: string;
  itemsProduced: number;
  itemsWasted: number;
  efficiencyRate: number;
  avgCompletionTime: number;
  topProducedItems: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
}

/**
 * Get productivity metrics by area
 * @function getProductivityByArea
 * @param {string} area - Production area to analyze
 * @returns {AreaProductivity | undefined} Productivity metrics for the specified area
 * @description Retrieves detailed productivity metrics for a specific production area
 */
export const getProductivityByArea = (area: 'kitchen' | 'confectionery' | 'bakery'): AreaProductivity | undefined => {
  const report = mockProductivityReports[0];
  return report.areas.find((a: AreaProductivity) => a.area === area);
};