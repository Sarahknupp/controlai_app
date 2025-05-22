import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductImportOCR } from '../ProductImportOCR';
import { useProductImport } from '../../hooks/useProductImport';

// Mock do hook useProductImport
jest.mock('../../hooks/useProductImport');

describe('ProductImportOCR', () => {
  const mockImportProducts = jest.fn();
  const mockOnImportComplete = jest.fn();

  beforeEach(() => {
    (useProductImport as jest.Mock).mockReturnValue({
      loading: false,
      progress: 0,
      error: null,
      result: null,
      importProducts: mockImportProducts,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render dropzone correctly', () => {
    render(<ProductImportOCR onImportComplete={mockOnImportComplete} />);

    expect(screen.getByText(/Arraste e solte uma imagem aqui/i)).toBeInTheDocument();
    expect(screen.getByText(/ou clique para selecionar uma imagem/i)).toBeInTheDocument();
  });

  it('should show loading state when importing', async () => {
    (useProductImport as jest.Mock).mockReturnValue({
      loading: true,
      progress: 50,
      error: null,
      result: null,
      importProducts: mockImportProducts,
    });

    render(<ProductImportOCR onImportComplete={mockOnImportComplete} />);

    expect(screen.getByText(/Processando imagem/i)).toBeInTheDocument();
    expect(screen.getByText(/50%/i)).toBeInTheDocument();
  });

  it('should show error message when import fails', () => {
    const errorMessage = 'Erro ao importar produtos';
    (useProductImport as jest.Mock).mockReturnValue({
      loading: false,
      progress: 0,
      error: errorMessage,
      result: null,
      importProducts: mockImportProducts,
    });

    render(<ProductImportOCR onImportComplete={mockOnImportComplete} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should show import results when successful', () => {
    const mockResult = {
      success: true,
      products: [
        {
          code: 'PROD-001',
          name: 'Produto 1',
          price: 10.99,
          quantity: 5,
          category: 'Categoria 1',
          brand: 'Marca 1',
        },
      ],
      errors: [],
      stats: {
        total: 1,
        successful: 1,
        failed: 0,
        confidence: 95,
      },
    };

    (useProductImport as jest.Mock).mockReturnValue({
      loading: false,
      progress: 100,
      error: null,
      result: mockResult,
      importProducts: mockImportProducts,
    });

    render(<ProductImportOCR onImportComplete={mockOnImportComplete} />);

    expect(screen.getByText(/Importação concluída/i)).toBeInTheDocument();
    expect(screen.getByText('PROD-001')).toBeInTheDocument();
    expect(screen.getByText('Produto 1')).toBeInTheDocument();
    expect(screen.getByText('R$ 10.99')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Categoria 1')).toBeInTheDocument();
    expect(screen.getByText('Marca 1')).toBeInTheDocument();
  });

  it('should show errors when import has failures', () => {
    const mockResult = {
      success: false,
      products: [],
      errors: ['Erro 1', 'Erro 2'],
      stats: {
        total: 2,
        successful: 0,
        failed: 2,
        confidence: 0,
      },
    };

    (useProductImport as jest.Mock).mockReturnValue({
      loading: false,
      progress: 100,
      error: null,
      result: mockResult,
      importProducts: mockImportProducts,
    });

    render(<ProductImportOCR onImportComplete={mockOnImportComplete} />);

    expect(screen.getByText(/Importação concluída/i)).toBeInTheDocument();
    expect(screen.getByText('Erro 1')).toBeInTheDocument();
    expect(screen.getByText('Erro 2')).toBeInTheDocument();
  });

  it('should call onImportComplete when import is successful', async () => {
    const mockResult = {
      success: true,
      products: [],
      errors: [],
      stats: {
        total: 0,
        successful: 0,
        failed: 0,
        confidence: 100,
      },
    };

    (useProductImport as jest.Mock).mockReturnValue({
      loading: false,
      progress: 100,
      error: null,
      result: mockResult,
      importProducts: mockImportProducts,
    });

    render(<ProductImportOCR onImportComplete={mockOnImportComplete} />);

    await waitFor(() => {
      expect(mockOnImportComplete).toHaveBeenCalledWith(mockResult);
    });
  });
}); 