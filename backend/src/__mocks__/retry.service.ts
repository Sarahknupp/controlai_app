const mockRetryService = {
  addToRetryQueue: jest.fn(),
  processRetryQueue: jest.fn(),
  getRetryStats: jest.fn(),
  getRetryHistory: jest.fn(),
  getRetrySettings: jest.fn(),
  updateRetrySettings: jest.fn(),
  getRetryMetrics: jest.fn(),
  getRetryAlerts: jest.fn(),
  getRetryTrends: jest.fn(),
  getRetryReport: jest.fn(),
  clearRetryQueue: jest.fn(),
  pauseRetryQueue: jest.fn(),
  resumeRetryQueue: jest.fn(),
  getRetryQueueStatus: jest.fn(),
  getRetryQueueHealth: jest.fn()
};

export default mockRetryService; 