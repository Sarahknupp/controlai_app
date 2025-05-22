import BaseService from '../base.service';
import { loggingService } from '../logging.service';
import { cacheService } from '../cache.service';
import { requestInterceptor } from '../interceptors';

// Mock dependencies
jest.mock('../logging.service');
jest.mock('../cache.service');
jest.mock('../interceptors');

describe('BaseService', () => {
  let baseService: BaseService;
  let mockFetch: jest.Mock;
  let mockResponse: Response;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock fetch
    mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ data: 'test' }),
      blob: jest.fn().mockResolvedValue(new Blob()),
      headers: new Headers(),
      status: 200,
      statusText: 'OK'
    } as unknown as Response;

    mockFetch = jest.fn().mockResolvedValue(mockResponse);
    global.fetch = mockFetch;

    // Mock request interceptor
    (requestInterceptor.handleRequest as jest.Mock).mockImplementation((req) => req);
    (requestInterceptor.handleResponse as jest.Mock).mockImplementation((res) => res);

    // Create service instance
    baseService = new BaseService();
  });

  describe('request', () => {
    it('should make a successful GET request', async () => {
      const response = await baseService.request('/test', { method: 'GET' });
      expect(response).toEqual({ data: 'test' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Request),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should handle request errors', async () => {
      const errorResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Error' })
      } as unknown as Response;

      mockFetch.mockResolvedValueOnce(errorResponse);
      (requestInterceptor.handleResponse as jest.Mock).mockResolvedValueOnce(errorResponse);

      await expect(baseService.request('/test')).rejects.toThrow('Error');
    });
  });

  describe('get', () => {
    it('should make a GET request with query parameters', async () => {
      const params = { key: 'value' };
      await baseService.get('/test', params);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Request),
        expect.objectContaining({
          method: 'GET',
          params
        })
      );
    });

    it('should use debounce when specified', async () => {
      const debouncedGet = baseService.get('/test', {}, { debounce: 200 });
      
      // Call multiple times
      debouncedGet();
      debouncedGet();
      debouncedGet();

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('download', () => {
    it('should download a file successfully', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/plain' });
      const mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob)
      } as unknown as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);
      (requestInterceptor.handleResponse as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Mock URL.createObjectURL and document.createElement
      const mockUrl = 'blob:test';
      URL.createObjectURL = jest.fn().mockReturnValue(mockUrl);
      document.createElement = jest.fn().mockReturnValue({
        href: '',
        download: '',
        click: jest.fn()
      });

      await baseService.download('/test', 'test.txt');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Request),
        expect.objectContaining({ method: 'GET' })
      );
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    });

    it('should handle download errors', async () => {
      const errorResponse = {
        ok: false,
        blob: jest.fn().mockRejectedValue(new Error('Download failed'))
      } as unknown as Response;

      mockFetch.mockResolvedValueOnce(errorResponse);
      (requestInterceptor.handleResponse as jest.Mock).mockResolvedValueOnce(errorResponse);

      await expect(baseService.download('/test', 'test.txt')).rejects.toThrow('Download failed');
    });
  });
}); 