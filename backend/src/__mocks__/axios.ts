const axios = jest.fn();

axios.create = jest.fn(() => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn()
    },
    response: {
      use: jest.fn(),
      eject: jest.fn()
    }
  }
}));

axios.get = jest.fn();
axios.post = jest.fn();
axios.put = jest.fn();
axios.delete = jest.fn();
axios.patch = jest.fn();

export default axios; 