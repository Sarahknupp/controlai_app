const mockTwilioClient = {
  messages: {
    create: jest.fn().mockResolvedValue({ sid: 'test-sid' }),
    list: jest.fn().mockResolvedValue([]),
    get: jest.fn().mockResolvedValue({ status: 'sent' })
  },
  calls: {
    create: jest.fn().mockResolvedValue({ sid: 'test-call-sid' }),
    list: jest.fn().mockResolvedValue([]),
    get: jest.fn().mockResolvedValue({ status: 'completed' })
  },
  verify: {
    services: {
      create: jest.fn().mockResolvedValue({ sid: 'test-verify-sid' }),
      get: jest.fn().mockReturnValue({
        verifications: {
          create: jest.fn().mockResolvedValue({ status: 'pending' }),
          get: jest.fn().mockResolvedValue({ status: 'approved' })
        }
      })
    }
  }
};

const Twilio = jest.fn().mockImplementation(() => ({
  messages: { create: jest.fn() },
  calls: { create: jest.fn() }
}));

export default Twilio;
export { Twilio };

module.exports = {
  mockTwilioClient
}; 