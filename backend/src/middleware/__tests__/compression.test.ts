import { Request, Response } from 'express';
import { shouldCompress, compressionOptions } from '../compression';

describe('Compression Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      path: '/api/test',
    };
    mockResponse = {
      getHeader: jest.fn(),
    };
  });

  describe('shouldCompress', () => {
    it('should not compress small responses', () => {
      (mockResponse.getHeader as jest.Mock).mockImplementation((header) => {
        if (header === 'Content-Length') return '500';
        return 'application/json';
      });

      const result = shouldCompress(mockRequest as Request, mockResponse as Response);
      expect(result).toBe(false);
    });

    it('should not compress image responses', () => {
      (mockResponse.getHeader as jest.Mock).mockImplementation((header) => {
        if (header === 'Content-Length') return '5000';
        return 'image/jpeg';
      });

      const result = shouldCompress(mockRequest as Request, mockResponse as Response);
      expect(result).toBe(false);
    });

    it('should not compress PDF responses', () => {
      (mockResponse.getHeader as jest.Mock).mockImplementation((header) => {
        if (header === 'Content-Length') return '5000';
        return 'application/pdf';
      });

      const result = shouldCompress(mockRequest as Request, mockResponse as Response);
      expect(result).toBe(false);
    });

    it('should compress large JSON responses', () => {
      (mockResponse.getHeader as jest.Mock).mockImplementation((header) => {
        if (header === 'Content-Length') return '5000';
        return 'application/json';
      });

      const result = shouldCompress(mockRequest as Request, mockResponse as Response);
      expect(result).toBe(true);
    });

    it('should compress large text responses', () => {
      (mockResponse.getHeader as jest.Mock).mockImplementation((header) => {
        if (header === 'Content-Length') return '5000';
        return 'text/plain';
      });

      const result = shouldCompress(mockRequest as Request, mockResponse as Response);
      expect(result).toBe(true);
    });

    it('should compress large HTML responses', () => {
      (mockResponse.getHeader as jest.Mock).mockImplementation((header) => {
        if (header === 'Content-Length') return '5000';
        return 'text/html';
      });

      const result = shouldCompress(mockRequest as Request, mockResponse as Response);
      expect(result).toBe(true);
    });

    it('should handle missing content length', () => {
      (mockResponse.getHeader as jest.Mock).mockImplementation((header) => {
        if (header === 'Content-Length') return undefined;
        return 'application/json';
      });

      const result = shouldCompress(mockRequest as Request, mockResponse as Response);
      expect(result).toBe(true);
    });

    it('should handle missing content type', () => {
      (mockResponse.getHeader as jest.Mock).mockImplementation((header) => {
        if (header === 'Content-Length') return '5000';
        return undefined;
      });

      const result = shouldCompress(mockRequest as Request, mockResponse as Response);
      expect(result).toBe(true);
    });
  });

  describe('compressionOptions', () => {
    it('should have correct compression options', () => {
      expect(compressionOptions).toBeDefined();
      expect(compressionOptions.level).toBe(6);
      expect(compressionOptions.threshold).toBe(1024);
      expect(compressionOptions.windowBits).toBe(15);
      expect(compressionOptions.memLevel).toBe(8);
      expect(compressionOptions.strategy).toBe(0);
      expect(compressionOptions.chunkSize).toBe(16 * 1024);
      expect(compressionOptions.contentType).toContain('application/json');
      expect(compressionOptions.contentType).toContain('text/html');
      expect(compressionOptions.contentType).toContain('text/css');
      expect(compressionOptions.contentType).toContain('application/javascript');
    });
  });
}); 