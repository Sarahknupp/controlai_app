import { useState, useCallback } from 'react';
import { ocrService, OCRConfig, ImportRule } from '../services/ocr.service';

interface UseOCRConfigReturn {
  config: OCRConfig;
  rules: ImportRule;
  loading: boolean;
  error: string | null;
  updateConfig: (config: Partial<OCRConfig>) => Promise<void>;
  updateRules: (rules: Partial<ImportRule>) => Promise<void>;
  reset: () => void;
}

export const useOCRConfig = (): UseOCRConfigReturn => {
  const [config, setConfig] = useState<OCRConfig>(ocrService.getConfig());
  const [rules, setRules] = useState<ImportRule>(ocrService.getRules());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateConfig = useCallback(async (newConfig: Partial<OCRConfig>) => {
    try {
      setLoading(true);
      setError(null);
      await ocrService.updateConfig(newConfig);
      setConfig((prev) => ({ ...prev, ...newConfig }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar configurações');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRules = useCallback(async (newRules: Partial<ImportRule>) => {
    try {
      setLoading(true);
      setError(null);
      await ocrService.updateRules(newRules);
      setRules((prev) => ({ ...prev, ...newRules }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar regras');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setConfig(ocrService.getConfig());
    setRules(ocrService.getRules());
    setError(null);
  }, []);

  return {
    config,
    rules,
    loading,
    error,
    updateConfig,
    updateRules,
    reset,
  };
}; 