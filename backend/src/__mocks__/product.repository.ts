const mockProductRepository = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByCategory: jest.fn(),
  findByPriceRange: jest.fn(),
  findBySearchTerm: jest.fn(),
  updateStock: jest.fn(),
  addImages: jest.fn(),
  removeImage: jest.fn(),
  getProductStats: jest.fn(),
  getProductMetrics: jest.fn(),
  getProductTrends: jest.fn(),
  getProductAlerts: jest.fn()
};

export default mockProductRepository; 