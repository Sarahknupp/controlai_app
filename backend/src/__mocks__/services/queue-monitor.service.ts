export const mockJob = {
  id: '123',
  data: { type: 'notification', userId: 1 },
  attempts: 2,
  failedReason: 'Connection timeout',
  timestamp: new Date()
};

export const mockFailedJobs = [mockJob];
export const mockRetryJobs = [mockJob];

export const mockMetrics = {
  active: 10,
  waiting: 5,
  completed: 100,
  failed: 20,
  delayed: 3
};

export const mockQueueMonitorService = {
  getMetrics: jest.fn().mockResolvedValue(mockMetrics),
  getJobDetails: jest.fn().mockResolvedValue(mockJob),
  getFailedJobs: jest.fn().mockResolvedValue(mockFailedJobs),
  getRetryJobs: jest.fn().mockResolvedValue(mockRetryJobs),
  clearFailedJobs: jest.fn().mockResolvedValue(true),
  retryFailedJob: jest.fn().mockResolvedValue(true)
};

export const QueueMonitorService = jest.fn(() => mockQueueMonitorService); 