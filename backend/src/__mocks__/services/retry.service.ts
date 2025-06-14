export const mockRetryJob = {
  id: 1,
  attempts: 0,
  nextAttempt: new Date(),
  data: {},
  error: null
};

export const mockRetryService = {
  addToRetryQueue: jest.fn().mockResolvedValue(mockRetryJob),
  processRetryQueue: jest.fn().mockResolvedValue(true),
  getRetryStats: jest.fn().mockReturnValue({
    queueSize: 0,
    jobs: []
  }),
  clearRetryQueue: jest.fn().mockResolvedValue(true)
};

export const RetryService = jest.fn(() => mockRetryService); 