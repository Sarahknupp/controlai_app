export const AuthGuard = jest.fn().mockImplementation(() => ({
  canActivate: jest.fn().mockReturnValue(true)
})); 