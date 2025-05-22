import { useState, useCallback } from 'react';
import { ocrService, OCRConfig, ImportRule, ProductImportResult } from '../services/ocr.service';
import { Product } from '../types/product';

interface UseProductImportReturn {
  loading: boolean;
  progress: number;
  error: string | null;
  result: ProductImportResult | null;
  config: OCRConfig;
  rules: ImportRule;
  importProducts: (image: File) => Promise<void>;
  updateConfig: (config: Partial<OCRConfig>) => Promise<void>;
  updateRules: (rules: Partial<ImportRule>) => Promise<void>;
  reset: () => void;
}

export const useProductImport = (): UseProductImportReturn => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductImportResult | null>(null);
  const [config, setConfig] = useState<OCRConfig>(ocrService.getConfig());
  const [rules, setRules] = useState<ImportRule>(ocrService.getRules());

  const importProducts = useCallback(async (image: File) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const importResult = await ocrService.importProductsFromOCR(image);
      setResult(importResult);
      setProgress(100);

      clearInterval(progressInterval);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar produtos');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (newConfig: Partial<OCRConfig>) => {
    try {
      await ocrService.updateConfig(newConfig);
      setConfig((prev) => ({ ...prev, ...newConfig }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar configurações');
    }
  }, []);

  const updateRules = useCallback(async (newRules: Partial<ImportRule>) => {
    try {
      await ocrService.updateRules(newRules);
      setRules((prev) => ({ ...prev, ...newRules }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar regras');
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return {
    loading,
    progress,
    error,
    result,
    config,
    rules,
    importProducts,
    updateConfig,
    updateRules,
    reset,
  };
}; 