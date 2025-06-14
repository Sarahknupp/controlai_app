const mockValidationSchemas = {
  createUser: {
    validate: jest.fn().mockReturnValue({ error: null, value: {} })
  },
  createProduct: {
    validate: jest.fn().mockReturnValue({ error: null, value: {} })
  },
  createOrder: {
    validate: jest.fn().mockReturnValue({ error: null, value: {} })
  },
  pagination: {
    validate: jest.fn().mockReturnValue({ error: null, value: { page: 1, limit: 10 } })
  },
  updateUser: {
    validate: jest.fn().mockReturnValue({ error: null, value: {} })
  },
  updateProduct: {
    validate: jest.fn().mockReturnValue({ error: null, value: {} })
  },
  updateOrder: {
    validate: jest.fn().mockReturnValue({ error: null, value: {} })
  },
  filter: {
    validate: jest.fn().mockReturnValue({ error: null, value: {} })
  },
  search: {
    validate: jest.fn().mockReturnValue({ error: null, value: {} })
  },
  sort: {
    validate: jest.fn().mockReturnValue({ error: null, value: {} })
  }
};

export default mockValidationSchemas; 