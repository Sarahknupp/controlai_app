// Clean up after all tests
afterAll(async () => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Close any open connections
  // Add cleanup code for any services that need to be closed
  // For example:
  // await emailService.close();
  // await smsService.close();
  // await pushNotificationService.close();
  // await queueService.close();
  
  // Reset environment variables
  process.env = { ...process.env };
}); 