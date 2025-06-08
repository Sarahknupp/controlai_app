const Joi = {
  object: jest.fn(() => ({
    keys: jest.fn().mockReturnThis(),
    validate: jest.fn().mockReturnValue({ error: null, value: {} })
  })),
  string: jest.fn(() => ({
    required: jest.fn().mockReturnThis(),
    email: jest.fn().mockReturnThis(),
    min: jest.fn().mockReturnThis(),
    max: jest.fn().mockReturnThis(),
    pattern: jest.fn().mockReturnThis(),
    validate: jest.fn().mockReturnValue({ error: null, value: '' })
  })),
  number: jest.fn(() => ({
    required: jest.fn().mockReturnThis(),
    min: jest.fn().mockReturnThis(),
    max: jest.fn().mockReturnThis(),
    integer: jest.fn().mockReturnThis(),
    validate: jest.fn().mockReturnValue({ error: null, value: 0 })
  })),
  boolean: jest.fn(() => ({
    required: jest.fn().mockReturnThis(),
    validate: jest.fn().mockReturnValue({ error: null, value: false })
  })),
  array: jest.fn(() => ({
    items: jest.fn().mockReturnThis(),
    required: jest.fn().mockReturnThis(),
    validate: jest.fn().mockReturnValue({ error: null, value: [] })
  })),
  date: jest.fn(() => ({
    required: jest.fn().mockReturnThis(),
    validate: jest.fn().mockReturnValue({ error: null, value: new Date() })
  }))
};

export default Joi; 