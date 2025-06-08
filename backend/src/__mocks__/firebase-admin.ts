export const initializeApp = jest.fn(() => ({
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({ exists: false, data: () => null }),
        set: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({})
      })),
      add: jest.fn().mockResolvedValue({ id: 'mock-id' }),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ docs: [], empty: true })
    }))
  }))
}));

export const credential = {
  applicationDefault: jest.fn()
};

export const auth = jest.fn(() => ({
  verifyIdToken: jest.fn().mockResolvedValue({ uid: 'mock-uid' }),
  createCustomToken: jest.fn().mockResolvedValue('mock-token'),
  getUser: jest.fn().mockResolvedValue({ uid: 'mock-uid' })
}));

export default {
  initializeApp,
  credential,
  auth
}; 