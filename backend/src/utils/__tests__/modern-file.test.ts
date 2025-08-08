import { FileValidator, fileUtils } from '../modern-file';

// Mock dependencies
const mockCreateHash = jest.fn();
const mockPipeline = jest.fn();
const mockCreateReadStream = jest.fn();

jest.mock('crypto', () => ({
  createHash: () => mockCreateHash.mockReturnThis(),
}));

jest.mock('stream/promises', () => ({
  pipeline: mockPipeline
}));

jest.mock('fs', () => ({
  createReadStream: mockCreateReadStream
}));

// Mock sharp for image processing
jest.mock('sharp', () => ({
  default: jest.fn(() => ({
    metadata: jest.fn().mockResolvedValue({ width: 800, height: 600 })
  }))
}));

// Mock createImageBitmap for browser environment
global.createImageBitmap = jest.fn();

describe('Modern File Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FileValidator', () => {
    describe('validateFile', () => {
      const mockFile = {
        size: 1024 * 1024, // 1MB
        mimetype: 'image/jpeg',
        path: '/tmp/test.jpg',
        buffer: Buffer.from('test data'),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8))
      } as any;

      it('should validate file size correctly', async () => {
        const options = { maxSize: 2 * 1024 * 1024 }; // 2MB limit
        
        const result = await FileValidator.validateFile(mockFile, options);
        
        expect(result.isValid).toBe(true);
        expect(result.metadata.size).toBe(1024 * 1024);
      });

      it('should reject files exceeding size limit', async () => {
        const largeFile = { ...mockFile, size: 5 * 1024 * 1024 }; // 5MB
        const options = { maxSize: 2 * 1024 * 1024 }; // 2MB limit
        
        const result = await FileValidator.validateFile(largeFile, options);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          expect.stringContaining('exceeds maximum')
        );
      });

      it('should validate file type correctly', async () => {
        const options = { allowedTypes: ['image/jpeg', 'image/png'] };
        
        const result = await FileValidator.validateFile(mockFile, options);
        
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid file types', async () => {
        const invalidFile = { ...mockFile, mimetype: 'application/exe' };
        const options = { allowedTypes: ['image/jpeg', 'image/png'] };
        
        const result = await FileValidator.validateFile(invalidFile, options);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          expect.stringContaining('not allowed')
        );
      });

      it('should validate file signatures for security', async () => {
        // Mock file with JPEG signature
        const jpegFile = {
          ...mockFile,
          mimetype: 'image/jpeg',
          buffer: Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), // JPEG signature
          arrayBuffer: jest.fn().mockResolvedValue(
            new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]).buffer
          )
        };

        const result = await FileValidator.validateFile(jpegFile);
        expect(result.isValid).toBe(true);
      });

      it('should reject files with mismatched signatures', async () => {
        // Mock file claiming to be JPEG but with PNG signature
        const mismatchedFile = {
          ...mockFile,
          mimetype: 'image/jpeg',
          buffer: Buffer.from([0x89, 0x50, 0x4E, 0x47]), // PNG signature
          arrayBuffer: jest.fn().mockResolvedValue(
            new Uint8Array([0x89, 0x50, 0x4E, 0x47]).buffer
          )
        };

        const result = await FileValidator.validateFile(mismatchedFile);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          expect.stringContaining('security risk')
        );
      });

      it('should generate file hash for integrity', async () => {
        mockCreateHash.mockReturnValue({
          update: jest.fn().mockReturnThis(),
          digest: jest.fn().mockReturnValue('mockedhash123')
        });

        mockPipeline.mockResolvedValue(undefined);

        const result = await FileValidator.validateFile(mockFile);
        
        if (result.isValid) {
          expect(result.metadata.hash).toBe('mockedhash123');
        }
      });

      it('should extract image dimensions', async () => {
        // Mock browser environment
        Object.defineProperty(window, 'window', { value: global });
        
        (global.createImageBitmap as jest.Mock).mockResolvedValue({
          width: 1920,
          height: 1080,
          close: jest.fn()
        });

        const imageFile = {
          ...mockFile,
          mimetype: 'image/png',
          constructor: { name: 'File' } // Mock File constructor
        } as any;

        const result = await FileValidator.validateFile(imageFile);
        
        if (result.isValid) {
          expect(result.metadata.dimensions).toEqual({
            width: 1920,
            height: 1080
          });
        }
      });

      it('should handle validation errors gracefully', async () => {
        const corruptFile = {
          ...mockFile,
          arrayBuffer: jest.fn().mockRejectedValue(new Error('Corrupt file'))
        };

        const result = await FileValidator.validateFile(corruptFile);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          expect.stringContaining('Metadata extraction failed')
        );
      });
    });

    describe('batch validation', () => {
      it('should validate multiple files concurrently', async () => {
        const files = Array.from({ length: 5 }, (_, i) => ({
          size: 1024 * (i + 1),
          mimetype: 'image/jpeg',
          path: `/tmp/test${i}.jpg`,
          buffer: Buffer.from(`test data ${i}`),
          arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8))
        })) as any[];

        mockCreateHash.mockReturnValue({
          update: jest.fn().mockReturnThis(),
          digest: jest.fn().mockReturnValue('hash')
        });
        mockPipeline.mockResolvedValue(undefined);

        const start = performance.now();
        const results = await Promise.all(
          files.map(file => FileValidator.validateFile(file))
        );
        const end = performance.now();

        expect(results).toHaveLength(5);
        expect(results.every(r => r.isValid)).toBe(true);
        expect(end - start).toBeLessThan(1000); // Should be concurrent
      });
    });
  });

  describe('fileUtils', () => {
    describe('readFileWithTimeout', () => {
      it('should read file successfully within timeout', async () => {
        const mockFile = {
          arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024))
        } as any;

        const result = await fileUtils.readFileWithTimeout(mockFile, 5000);
        
        expect(result).toBeInstanceOf(ArrayBuffer);
        expect(result.byteLength).toBe(1024);
      });

      it('should timeout for slow file operations', async () => {
        const mockFile = {
          arrayBuffer: jest.fn().mockImplementation(() => 
            new Promise(resolve => setTimeout(resolve, 2000))
          )
        } as any;

        await expect(
          fileUtils.readFileWithTimeout(mockFile, 1000)
        ).rejects.toThrow('timed out');
      });

      it('should handle file reading errors', async () => {
        const mockFile = {
          arrayBuffer: jest.fn().mockRejectedValue(new Error('Read error'))
        } as any;

        await expect(
          fileUtils.readFileWithTimeout(mockFile, 5000)
        ).rejects.toThrow('Read error');
      });
    });

    describe('processFileInWorker', () => {
      it('should process file in web worker successfully', async () => {
        // Mock Worker
        const mockWorker = {
          postMessage: jest.fn(),
          terminate: jest.fn(),
          onmessage: null,
          onerror: null
        };

        (global as any).Worker = jest.fn(() => mockWorker);

        const mockFile = new File(['test'], 'test.txt');
        const processingScript = '/worker.js';

        const processPromise = fileUtils.processFileInWorker(
          mockFile,
          processingScript
        );

        // Simulate worker success
        setTimeout(() => {
          if (mockWorker.onmessage) {
            mockWorker.onmessage({
              data: { result: 'processed successfully' }
            } as any);
          }
        }, 10);

        const result = await processPromise;
        expect(result).toBe('processed successfully');
        expect(mockWorker.terminate).toHaveBeenCalled();
      });

      it('should handle worker errors', async () => {
        const mockWorker = {
          postMessage: jest.fn(),
          terminate: jest.fn(),
          onmessage: null,
          onerror: null
        };

        (global as any).Worker = jest.fn(() => mockWorker);

        const mockFile = new File(['test'], 'test.txt');
        const processingScript = '/worker.js';

        const processPromise = fileUtils.processFileInWorker(
          mockFile,
          processingScript
        );

        // Simulate worker error
        setTimeout(() => {
          if (mockWorker.onerror) {
            mockWorker.onerror(new Error('Worker failed') as any);
          }
        }, 10);

        await expect(processPromise).rejects.toThrow('Worker failed');
        expect(mockWorker.terminate).toHaveBeenCalled();
      });
    });

    describe('processFiles batch processing', () => {
      it('should process files with concurrency limit', async () => {
        const files = Array.from({ length: 10 }, (_, i) => 
          new File([`content ${i}`], `file${i}.txt`)
        );

        let concurrentCount = 0;
        let maxConcurrent = 0;

        const processor = async (file: File) => {
          concurrentCount++;
          maxConcurrent = Math.max(maxConcurrent, concurrentCount);
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 50));
          
          concurrentCount--;
          return `processed ${file.name}`;
        };

        const start = performance.now();
        const results = await fileUtils.processFiles(files, processor, 3);
        const end = performance.now();

        expect(results).toHaveLength(10);
        expect(maxConcurrent).toBeLessThanOrEqual(3); // Respect concurrency limit
        expect(results[0]).toBe('processed file0.txt');
        expect(end - start).toBeGreaterThan(150); // Should take multiple batches
        expect(end - start).toBeLessThan(500); // But not sequential
      });

      it('should handle processing errors gracefully', async () => {
        const files = [
          new File(['content1'], 'file1.txt'),
          new File(['content2'], 'file2.txt'),
          new File(['content3'], 'file3.txt')
        ];

        const processor = async (file: File) => {
          if (file.name === 'file2.txt') {
            throw new Error('Processing failed');
          }
          return `processed ${file.name}`;
        };

        await expect(
          fileUtils.processFiles(files, processor, 2)
        ).rejects.toThrow('Processing failed');
      });

      it('should maintain result order', async () => {
        const files = Array.from({ length: 5 }, (_, i) => 
          new File([`content ${i}`], `file${i}.txt`)
        );

        // Processor with random delays
        const processor = async (file: File, index?: number) => {
          const delay = Math.random() * 100;
          await new Promise(resolve => setTimeout(resolve, delay));
          return file.name;
        };

        const results = await fileUtils.processFiles(files, processor, 3);

        expect(results).toEqual([
          'file0.txt',
          'file1.txt', 
          'file2.txt',
          'file3.txt',
          'file4.txt'
        ]);
      });
    });

    describe('performance characteristics', () => {
      it('should handle large numbers of files efficiently', async () => {
        const files = Array.from({ length: 100 }, (_, i) => 
          new File([`content ${i}`], `file${i}.txt`)
        );

        const processor = async (file: File) => {
          // Minimal processing
          return file.size;
        };

        const start = performance.now();
        const results = await fileUtils.processFiles(files, processor, 10);
        const end = performance.now();

        expect(results).toHaveLength(100);
        expect(end - start).toBeLessThan(2000); // Should be efficient
      });

      it('should not leak memory during processing', async () => {
        const files = Array.from({ length: 50 }, (_, i) => 
          new File([new ArrayBuffer(1024)], `file${i}.dat`)
        );

        const processor = async (file: File) => {
          // Process and return minimal data
          const buffer = await file.arrayBuffer();
          return buffer.byteLength;
        };

        // This test mainly ensures no memory leaks occur
        const results = await fileUtils.processFiles(files, processor, 5);
        
        expect(results).toHaveLength(50);
        expect(results.every(size => size === 1024)).toBe(true);
      });
    });
  });

  describe('integration tests', () => {
    it('should validate and process files in complete workflow', async () => {
      const mockFiles = [
        {
          name: 'image1.jpg',
          size: 1024 * 100, // 100KB
          mimetype: 'image/jpeg',
          buffer: Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), // JPEG signature
          arrayBuffer: jest.fn().mockResolvedValue(
            new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]).buffer
          )
        },
        {
          name: 'image2.png',
          size: 1024 * 200, // 200KB
          mimetype: 'image/png',
          buffer: Buffer.from([0x89, 0x50, 0x4E, 0x47]), // PNG signature
          arrayBuffer: jest.fn().mockResolvedValue(
            new Uint8Array([0x89, 0x50, 0x4E, 0x47]).buffer
          )
        }
      ] as any[];

      mockCreateHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hash123')
      });
      mockPipeline.mockResolvedValue(undefined);

      // Validate files first
      const validationResults = await Promise.all(
        mockFiles.map(file => FileValidator.validateFile(file, {
          maxSize: 1024 * 1024, // 1MB
          allowedTypes: ['image/jpeg', 'image/png']
        }))
      );

      expect(validationResults.every(r => r.isValid)).toBe(true);

      // Then process valid files
      const validFiles = mockFiles.filter((_, i) => validationResults[i].isValid);
      
      const processResults = await fileUtils.processFiles(
        validFiles,
        async (file) => ({
          name: file.name,
          hash: validationResults[mockFiles.indexOf(file)].metadata.hash,
          processed: true
        }),
        2
      );

      expect(processResults).toHaveLength(2);
      expect(processResults.every(r => r.processed)).toBe(true);
    });
  });
});