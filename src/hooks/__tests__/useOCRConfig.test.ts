import { renderHook, act } from '@testing-library/react-hooks';
import { useOCRConfig } from '../useOCRConfig';
import { ocrService } from '../../services/ocr.service';

// Mock do serviço OCR
jest.mock('../../services/ocr.service');

describe('useOCRConfig', () => {
  const mockConfig = {
    language: 'pt-BR',
    minConfidence: 80,
    autoCorrect: true,
    validateData: true,
  };

  const mockRules = {
    codeFormat: 'PROD-{NUMBER}',
    defaultCategories: ['Categoria 1', 'Categoria 2'],
    defaultBrand: 'Marca Própria',
    createCategories: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ocrService.getConfig as jest.Mock).mockReturnValue(mockConfig);
    (ocrService.getRules as jest.Mock).mockReturnValue(mockRules);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useOCRConfig());

    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.rules).toEqual(mockRules);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update config successfully', async () => {
    const newConfig = {
      language: 'en-US',
      minConfidence: 90,
    };

    const { result } = renderHook(() => useOCRConfig());

    await act(async () => {
      await result.current.updateConfig(newConfig);
    });

    expect(ocrService.updateConfig).toHaveBeenCalledWith(newConfig);
    expect(result.current.config).toEqual({
      ...mockConfig,
      ...newConfig,
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle config update error', async () => {
    const errorMessage = 'Erro ao atualizar configurações';
    (ocrService.updateConfig as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useOCRConfig());

    await act(async () => {
      await result.current.updateConfig({ language: 'en-US' });
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.config).toEqual(mockConfig); // Config não deve ter mudado
  });

  it('should update rules successfully', async () => {
    const newRules = {
      codeFormat: 'ITEM-{NUMBER}',
      defaultCategories: ['Nova Categoria'],
    };

    const { result } = renderHook(() => useOCRConfig());

    await act(async () => {
      await result.current.updateRules(newRules);
    });

    expect(ocrService.updateRules).toHaveBeenCalledWith(newRules);
    expect(result.current.rules).toEqual({
      ...mockRules,
      ...newRules,
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle rules update error', async () => {
    const errorMessage = 'Erro ao atualizar regras';
    (ocrService.updateRules as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useOCRConfig());

    await act(async () => {
      await result.current.updateRules({ codeFormat: 'ITEM-{NUMBER}' });
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.rules).toEqual(mockRules); // Rules não devem ter mudado
  });

  it('should reset state', async () => {
    const { result } = renderHook(() => useOCRConfig());

    // Primeiro atualiza a configuração
    await act(async () => {
      await result.current.updateConfig({ language: 'en-US' });
    });

    // Depois reseta
    act(() => {
      result.current.reset();
    });

    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.rules).toEqual(mockRules);
    expect(result.current.error).toBeNull();
  });

  it('should handle multiple updates', async () => {
    const { result } = renderHook(() => useOCRConfig());

    // Primeira atualização
    await act(async () => {
      await result.current.updateConfig({ language: 'en-US' });
    });

    expect(result.current.config.language).toBe('en-US');

    // Segunda atualização
    await act(async () => {
      await result.current.updateConfig({ minConfidence: 90 });
    });

    expect(result.current.config).toEqual({
      ...mockConfig,
      language: 'en-US',
      minConfidence: 90,
    });
  });

  it('should handle loading state during updates', async () => {
    (ocrService.updateConfig as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    const { result } = renderHook(() => useOCRConfig());

    const updatePromise = act(async () => {
      await result.current.updateConfig({ language: 'en-US' });
    });

    expect(result.current.loading).toBe(true);

    await updatePromise;

    expect(result.current.loading).toBe(false);
  });
}); 