const registerValidation = {
  validate: jest.fn().mockReturnValue({ error: null, value: {} })
};

const loginValidation = {
  validate: jest.fn().mockReturnValue({ error: null, value: {} })
};

const forgotPasswordValidation = {
  validate: jest.fn().mockReturnValue({ error: null, value: {} })
};

const resetPasswordValidation = {
  validate: jest.fn().mockReturnValue({ error: null, value: {} })
};

const changePasswordValidation = {
  validate: jest.fn().mockReturnValue({ error: null, value: {} })
};

const updateProfileValidation = {
  validate: jest.fn().mockReturnValue({ error: null, value: {} })
};

export {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  updateProfileValidation
}; 