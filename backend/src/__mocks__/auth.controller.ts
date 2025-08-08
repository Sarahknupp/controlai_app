const mockAuthController = {
  register: jest.fn(),
  login: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  verifyEmail: jest.fn(),
  resendVerificationEmail: jest.fn(),
  refreshToken: jest.fn(),
  logout: jest.fn(),
  changePassword: jest.fn(),
  updateProfile: jest.fn(),
  getProfile: jest.fn(),
  deleteAccount: jest.fn()
};

export default mockAuthController; 