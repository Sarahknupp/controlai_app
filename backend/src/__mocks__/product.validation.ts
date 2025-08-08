const createProductSchema = {
  validate: jest.fn().mockReturnValue({ error: null, value: {} })
};

const updateProductSchema = {
  validate: jest.fn().mockReturnValue({ error: null, value: {} })
};

const productFilterSchema = {
  validate: jest.fn().mockReturnValue({ error: null, value: {} })
};

const productIdSchema = {
  validate: jest.fn().mockReturnValue({ error: null, value: {} })
};

const updateStockSchema = {
  validate: jest.fn().mockReturnValue({ error: null, value: {} })
};

const addImagesSchema = {
  validate: jest.fn().mockReturnValue({ error: null, value: {} })
};

const removeImageSchema = {
  validate: jest.fn().mockReturnValue({ error: null, value: {} })
};

export {
  createProductSchema,
  updateProductSchema,
  productFilterSchema,
  productIdSchema,
  updateStockSchema,
  addImagesSchema,
  removeImageSchema
}; 