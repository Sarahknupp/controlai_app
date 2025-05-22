import { createError } from './error';
import { config } from '../config';

export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}

export const validateFile = (
  file: Express.Multer.File,
  options: FileValidationOptions = {}
): void => {
  const {
    maxSize = config.upload.maxFileSize,
    allowedTypes = config.upload.allowedFileTypes,
    maxFiles = config.upload.maxFiles,
  } = options;

  // Validar tamanho do arquivo
  if (file.size > maxSize) {
    throw createError(400, `O arquivo excede o tamanho máximo permitido de ${maxSize} bytes`);
  }

  // Validar tipo do arquivo
  const fileType = file.mimetype;
  if (!allowedTypes.includes(fileType)) {
    throw createError(400, `Tipo de arquivo não permitido. Tipos permitidos: ${allowedTypes.join(', ')}`);
  }
};

export const validateFiles = (
  files: Express.Multer.File[],
  options: FileValidationOptions = {}
): void => {
  const { maxFiles = config.upload.maxFiles } = options;

  // Validar número de arquivos
  if (files.length > maxFiles) {
    throw createError(400, `Número máximo de arquivos excedido. Máximo permitido: ${maxFiles}`);
  }

  // Validar cada arquivo
  files.forEach((file) => validateFile(file, options));
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

export const generateUniqueFilename = (originalname: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = getFileExtension(originalname);
  return `${timestamp}-${randomString}.${extension}`;
};

export const isImageFile = (mimetype: string): boolean => {
  return mimetype.startsWith('image/');
};

export const isPDFFile = (mimetype: string): boolean => {
  return mimetype === 'application/pdf';
};

export const isExcelFile = (mimetype: string): boolean => {
  return [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ].includes(mimetype);
};

export const isCSVFile = (mimetype: string): boolean => {
  return mimetype === 'text/csv';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Substitui caracteres não permitidos por underscore
    .replace(/_{2,}/g, '_') // Remove underscores duplicados
    .toLowerCase();
}; 