export const mockNotification = {
  id: 1,
  userId: 1,
  type: 'INFO',
  message: 'Test notification',
  read: false,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockNotificationService = {
  sendUserNotification: jest.fn().mockResolvedValue(mockNotification),
  sendTemplateNotification: jest.fn().mockResolvedValue(mockNotification),
  getNotifications: jest.fn().mockResolvedValue([mockNotification]),
  markAsRead: jest.fn().mockResolvedValue(mockNotification),
  deleteNotification: jest.fn().mockResolvedValue(true),
  getUnreadCount: jest.fn().mockResolvedValue(1)
};

export const NotificationService = jest.fn(() => mockNotificationService); 