export const mockMetrics = {
  totalSent: 1000,
  totalFailed: 50,
  totalRetried: 25,
  averageRetryAttempts: 2.5,
  failureRate: 5.0
};

export const mockTrends = {
  daily: [
    { date: '2024-01-01', failures: 10 },
    { date: '2024-01-02', failures: 15 }
  ],
  weekly: [
    { week: '2024-W01', failures: 50 },
    { week: '2024-W02', failures: 75 }
  ]
};

export const mockAlerts = {
  alerts: ['High failure rate: 10.0%', 'High average retry attempts: 2.5'],
  metrics: mockMetrics
};

export const mockMetricsService = {
  getMetrics: jest.fn().mockResolvedValue(mockMetrics),
  getFailureTrends: jest.fn().mockResolvedValue(mockTrends),
  checkAlerts: jest.fn().mockResolvedValue(mockAlerts)
};

export const MetricsService = jest.fn(() => mockMetricsService); 