const mockMetricsService = {
  getMetrics: jest.fn(),
  checkAlerts: jest.fn(),
  getFailureTrends: jest.fn(),
  getSuccessRate: jest.fn(),
  getAverageRetryAttempts: jest.fn(),
  getFailureRate: jest.fn(),
  getRetryRate: jest.fn(),
  getQueueSize: jest.fn(),
  getProcessingTime: jest.fn(),
  getErrorRate: jest.fn(),
  getAlertThresholds: jest.fn(),
  setAlertThresholds: jest.fn(),
  getMetricsHistory: jest.fn(),
  getMetricsSummary: jest.fn(),
  getMetricsReport: jest.fn()
};

export default mockMetricsService; 