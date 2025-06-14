const string = jest.fn(() => ({
  email: jest.fn().mockReturnThis(),
  required: jest.fn().mockReturnThis(),
  min: jest.fn().mockReturnThis(),
  max: jest.fn().mockReturnThis(),
  valid: jest.fn().mockReturnThis(),
  default: jest.fn().mockReturnThis(),
  pattern: jest.fn().mockReturnThis(),
  validate: jest.fn().mockReturnValue({ error: null, value: '' })
}));

const number = jest.fn(() => ({
  required: jest.fn().mockReturnThis(),
  min: jest.fn().mockReturnThis(),
  max: jest.fn().mockReturnThis(),
  integer: jest.fn().mockReturnThis(),
  default: jest.fn().mockReturnThis(),
  validate: jest.fn().mockReturnValue({ error: null, value: 0 })
}));

const boolean = jest.fn(() => ({
  required: jest.fn().mockReturnThis(),
  default: jest.fn().mockReturnThis(),
  validate: jest.fn().mockReturnValue({ error: null, value: false })
}));

const object = jest.fn(() => ({
  keys: jest.fn().mockReturnThis(),
  required: jest.fn().mockReturnThis(),
  default: jest.fn().mockReturnThis(),
  validate: jest.fn().mockReturnValue({ error: null, value: {} })
}));

const array = jest.fn(() => ({
  items: jest.fn().mockReturnThis(),
  min: jest.fn().mockReturnThis(),
  required: jest.fn().mockReturnThis(),
  default: jest.fn().mockReturnThis(),
  validate: jest.fn().mockReturnValue({ error: null, value: [] })
}));

const date = jest.fn(() => ({
  required: jest.fn().mockReturnThis(),
  default: jest.fn().mockReturnThis(),
  validate: jest.fn().mockReturnValue({ error: null, value: new Date() })
}));

const Joi = {
  string,
  number,
  boolean,
  object,
  array,
  date,
  validate: jest.fn().mockReturnValue({ error: null, value: {} })
};

export default Joi; 