const mockNotificationService = {
  sendUserNotification: jest.fn(),
  sendSystemNotification: jest.fn(),
  sendBulkNotification: jest.fn(),
  getNotificationStatus: jest.fn(),
  getNotificationHistory: jest.fn(),
  getNotificationStats: jest.fn(),
  getNotificationSettings: jest.fn(),
  updateNotificationSettings: jest.fn(),
  getNotificationTemplates: jest.fn(),
  createNotificationTemplate: jest.fn(),
  updateNotificationTemplate: jest.fn(),
  deleteNotificationTemplate: jest.fn(),
  getNotificationChannels: jest.fn(),
  enableNotificationChannel: jest.fn(),
  disableNotificationChannel: jest.fn()
};

export default mockNotificationService; 