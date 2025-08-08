/**
 * Modern file utilities with streaming and better async patterns
 */

interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}

interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  metadata: {
    size: number;
    type: string;
    hash?: string;
    dimensions?: { width: number; height: number };
  };
}

export class FileValidator {
  private static readonly CHUNK_SIZE = 64 * 1024; // 64KB chunks

  // Modern file validation with streaming and web standards
  static async validateFile(
    file: Express.Multer.File | File,
    options: FileValidationOptions = {}
  ): Promise<FileValidationResult> {
    const errors: string[] = [];
    const metadata = {
      size: file.size,
      type: 'mimetype' in file ? file.mimetype : file.type
    };

    // Use modern async validation
    const validations = [
      this.validateSize(file, options),
      this.validateType(file, options),
      this.validateContent(file, options),
    ];

    const results = await Promise.allSettled(validations);
    
    results.forEach(result => {
      if (result.status === 'rejected') {
        errors.push(result.reason.message);
      }
    });

    // Generate file hash for integrity checking
    if (errors.length === 0) {
      try {
        metadata.hash = await this.generateFileHash(file);
        
        // Get image dimensions if it's an image
        if (this.isImage(metadata.type)) {
          metadata.dimensions = await this.getImageDimensions(file);
        }
      } catch (error) {
        errors.push(`Metadata extraction failed: ${error.message}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      metadata
    };
  }

  private static async validateSize(file: Express.Multer.File | File, options: FileValidationOptions): Promise<void> {
    const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
    if (file.size > maxSize) {
      throw new Error(`File exceeds maximum size of ${maxSize} bytes`);
    }
  }

  private static async validateType(file: Express.Multer.File | File, options: FileValidationOptions): Promise<void> {
    const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/gif'];
    const mimeType = 'mimetype' in file ? file.mimetype : file.type;
    
    if (!allowedTypes.includes(mimeType)) {
      throw new Error(`File type ${mimeType} is not allowed`);
    }
  }

  // Modern streaming hash generation
  private static async generateFileHash(file: Express.Multer.File | File): Promise<string> {
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256');

    if ('path' in file) {
      // Server-side file
      const fs = await import('fs');
      const { pipeline } = await import('stream/promises');
      await pipeline(fs.createReadStream(file.path), hash);
    } else {
      // Browser File API
      const buffer = await file.arrayBuffer();
      hash.update(new Uint8Array(buffer));
    }

    return hash.digest('hex');
  }

  // Modern image dimensions with Web APIs
  private static async getImageDimensions(file: Express.Multer.File | File): Promise<{ width: number; height: number }> {
    if (typeof window !== 'undefined' && file instanceof File) {
      // Browser environment - use ImageBitmap
      return new Promise((resolve, reject) => {
        createImageBitmap(file).then(bitmap => {
          resolve({ width: bitmap.width, height: bitmap.height });
          bitmap.close(); // Free memory
        }).catch(reject);
      });
    } else {
      // Server environment - use sharp or similar library
      try {
        const sharp = await import('sharp');
        const buffer = 'buffer' in file ? file.buffer : Buffer.from(await file.arrayBuffer());
        const { width, height } = await sharp.default(buffer).metadata();
        return { width: width!, height: height! };
      } catch {
        return { width: 0, height: 0 };
      }
    }
  }

  // Async content validation
  private static async validateContent(
    file: Express.Multer.File | File,
    options: FileValidationOptions
  ): Promise<void> {
    // Validate file signature (magic numbers) for security
    const buffer = 'buffer' in file 
      ? file.buffer 
      : new Uint8Array(await file.slice(0, 16).arrayBuffer());

    const signature = Array.from(buffer.slice(0, 4))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');

    const mimeType = 'mimetype' in file ? file.mimetype : file.type;
    
    if (!this.isValidSignature(signature, mimeType)) {
      throw new Error('File signature does not match declared type (potential security risk)');
    }
  }

  // Modern MIME type detection with security focus
  private static isValidSignature(signature: string, mimeType: string): boolean {
    const signatures: Record<string, string[]> = {
      'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2'],
      'image/png': ['89504e47'],
      'application/pdf': ['25504446'],
      'image/gif': ['47494638'],
      // Add more as needed
    };

    const validSignatures = signatures[mimeType];
    return validSignatures ? validSignatures.includes(signature) : true;
  }

  // Other helper methods
  private static isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }
}

// Modern file operations with better error handling
export const fileUtils = {
  // Modern file reading with abort controller
  async readFileWithTimeout(
    file: File, 
    timeout = 30000
  ): Promise<ArrayBuffer> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const buffer = await file.arrayBuffer();
      clearTimeout(timeoutId);
      return buffer;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('File reading timed out');
      }
      throw error;
    }
  },

  // Modern file processing with Web Workers
  async processFileInWorker<T>(
    file: File,
    processingScript: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(processingScript);
      
      worker.postMessage({ file, action: 'process' });
      
      worker.onmessage = (e) => {
        worker.terminate();
        if (e.data.error) {
          reject(new Error(e.data.error));
        } else {
          resolve(e.data.result);
        }
      };
      
      worker.onerror = (error) => {
        worker.terminate();
        reject(error);
      };
    });
  },

  // Modern batch processing with concurrency control
  async processFiles<T>(
    files: File[],
    processor: (file: File) => Promise<T>,
    concurrency = 3
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const [index, file] of files.entries()) {
      const promise = processor(file).then(result => {
        results[index] = result;
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }

    await Promise.all(executing);
    return results;
  }
};