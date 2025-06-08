export const Twilio = jest.fn().mockImplementation(() => ({
  messages: { create: jest.fn() },
  calls: { create: jest.fn() }
})); 