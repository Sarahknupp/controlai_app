const mockMonitorService = {
  getMetrics: jest.fn(),
  getJobDetails: jest.fn(),
  getFailedJobs: jest.fn(),
  getRetryJobs: jest.fn(),
  clearFailedJobs: jest.fn(),
  retryFailedJob: jest.fn(),
  getQueueStatus: jest.fn(),
  getJobStats: jest.fn(),
  getQueueMetrics: jest.fn(),
  getJobMetrics: jest.fn(),
  getQueueHealth: jest.fn(),
  getJobHealth: jest.fn(),
  getQueueAlerts: jest.fn(),
  getJobAlerts: jest.fn(),
  getQueueTrends: jest.fn(),
  getJobTrends: jest.fn()
};

export default mockMonitorService; 