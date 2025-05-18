import { withTimeout } from './promises';

/**
 * Dimensões da imagem
 * @interface ImageDimensions
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Opções de validação de imagem
 * @interface ImageValidationOptions
 */
export interface ImageValidationOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxSizeInBytes?: number;
  allowedTypes?: string[];
}

/**
 * Resultado da validação de imagem
 * @interface ImageValidationResult
 */
export interface ImageValidationResult {
  isValid: boolean;
  dimensions?: ImageDimensions;
  error?: string;
}

// Constantes de validação de imagem
export const DEFAULT_VALIDATION_OPTIONS: ImageValidationOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  maxSizeInBytes: 2 * 1024 * 1024, // 2MB
  allowedTypes: ['image/png', 'image/jpeg', 'image/jpg']
};

/**
 * Valida as dimensões de uma imagem
 * @param file - Arquivo de imagem a ser validado
 * @returns Promise<ImageDimensions> - Retorna as dimensões da imagem
 */
export const validateImageDimensions = async (file: File): Promise<ImageDimensions> => {
  const img = new Image();
  const objectUrl = URL.createObjectURL(file);

  try {
    const dimensions = await new Promise<ImageDimensions>((resolve, reject) => {
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        reject(new Error('Erro ao carregar imagem'));
      };

      img.src = objectUrl;
    });

    return dimensions;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erro ao validar imagem');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

/**
 * Valida uma imagem de acordo com as opções especificadas
 * @param file - Arquivo de imagem a ser validado
 * @param options - Opções de validação
 * @returns Promise<ImageValidationResult> - Retorna o resultado da validação
 */
export const validateImage = async (
  file: File,
  options: ImageValidationOptions = DEFAULT_VALIDATION_OPTIONS
): Promise<ImageValidationResult> => {
  const { maxWidth, maxHeight, maxSizeInBytes, allowedTypes } = { ...DEFAULT_VALIDATION_OPTIONS, ...options };

  try {
    // Validate file type
    if (!allowedTypes?.includes(file.type)) {
      return {
        isValid: false,
        error: `Formato inválido. Use: ${allowedTypes?.join(', ')}`
      };
    }

    // Validate file size
    if (maxSizeInBytes && file.size > maxSizeInBytes) {
      return {
        isValid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${(maxSizeInBytes / (1024 * 1024)).toFixed(1)}MB`
      };
    }

    // Validate image dimensions
    const dimensions = await validateImageDimensions(file);

    if (maxWidth && dimensions.width > maxWidth) {
      return {
        isValid: false,
        dimensions,
        error: `Largura máxima permitida: ${maxWidth}px`
      };
    }

    if (maxHeight && dimensions.height > maxHeight) {
      return {
        isValid: false,
        dimensions,
        error: `Altura máxima permitida: ${maxHeight}px`
      };
    }

    return {
      isValid: true,
      dimensions
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Erro ao validar imagem'
    };
  }
};

/**
 * Valida uma imagem com timeout
 * @param file - Arquivo de imagem a ser validado
 * @param timeoutMs - Tempo máximo de espera em milissegundos
 * @returns Promise<ImageValidationResult> - Retorna o resultado da validação
 */
export const validateImageWithTimeout = async (
  file: File,
  timeoutMs = 5000
): Promise<ImageValidationResult> => {
  try {
    const result = await withTimeout(validateImage(file), timeoutMs, 'Timeout ao validar imagem');
    return result;
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Erro ao validar imagem'
    };
  }
}; 