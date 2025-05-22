import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { OCRStats } from '../OCRStats';
import { ocrService } from '../../services/ocr.service';

// Mock do serviço OCR
jest.mock('../../services/ocr.service');

describe('OCRStats', () => {
  const mockStats = {
    totalScans: 100,
    successfulScans: 80,
    failedScans: 20,
    averageConfidence: 85.5,
    lastScanDate: '2024-03-20T10:00:00Z',
    commonErrors: [
      { error: 'Erro 1', count: 10 },
      { error: 'Erro 2', count: 5 },
    ],
  };

  beforeEach(() => {
    (ocrService.getStats as jest.Mock).mockResolvedValue(mockStats);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state initially', () => {
    render(<OCRStats />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show error message when stats fetch fails', async () => {
    const errorMessage = 'Erro ao carregar estatísticas';
    (ocrService.getStats as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<OCRStats />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display stats correctly', async () => {
    render(<OCRStats />);

    await waitFor(() => {
      // Verifica os valores principais
      expect(screen.getByText('100')).toBeInTheDocument(); // Total de Scans
      expect(screen.getByText('80')).toBeInTheDocument(); // Scans com Sucesso
      expect(screen.getByText('20')).toBeInTheDocument(); // Scans com Falha
      expect(screen.getByText('85.5%')).toBeInTheDocument(); // Confiança Média

      // Verifica a taxa de sucesso
      expect(screen.getByText('80.0%')).toBeInTheDocument();

      // Verifica a data do último scan
      expect(screen.getByText(new Date(mockStats.lastScanDate).toLocaleString())).toBeInTheDocument();

      // Verifica os erros comuns
      expect(screen.getByText('Erro 1')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Erro 2')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('should handle empty stats', async () => {
    const emptyStats = {
      totalScans: 0,
      successfulScans: 0,
      failedScans: 0,
      averageConfidence: 0,
      lastScanDate: '',
      commonErrors: [],
    };

    (ocrService.getStats as jest.Mock).mockResolvedValue(emptyStats);

    render(<OCRStats />);

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument(); // Total de Scans
      expect(screen.getByText('0')).toBeInTheDocument(); // Scans com Sucesso
      expect(screen.getByText('0')).toBeInTheDocument(); // Scans com Falha
      expect(screen.getByText('0%')).toBeInTheDocument(); // Confiança Média
    });
  });

  it('should handle stats with no errors', async () => {
    const statsWithoutErrors = {
      ...mockStats,
      commonErrors: [],
    };

    (ocrService.getStats as jest.Mock).mockResolvedValue(statsWithoutErrors);

    render(<OCRStats />);

    await waitFor(() => {
      expect(screen.queryByText('Erros Comuns')).not.toBeInTheDocument();
    });
  });

  it('should format confidence percentage correctly', async () => {
    const statsWithDecimalConfidence = {
      ...mockStats,
      averageConfidence: 85.555,
    };

    (ocrService.getStats as jest.Mock).mockResolvedValue(statsWithDecimalConfidence);

    render(<OCRStats />);

    await waitFor(() => {
      expect(screen.getByText('85.6%')).toBeInTheDocument();
    });
  });
}); 