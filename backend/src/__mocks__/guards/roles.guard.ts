export const RolesGuard = jest.fn().mockImplementation(() => ({
  canActivate: jest.fn().mockReturnValue(true)
})); 