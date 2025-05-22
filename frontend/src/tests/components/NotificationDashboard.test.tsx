import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import NotificationDashboard from '../../components/NotificationDashboard';
import wsService from '../../services/websocket.service';
import exportService from '../../services/export.service';
import '@testing-library/jest-dom';

// Mock WebSocket service
jest.mock('../../services/websocket.service', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    messages$: {
      subscribe: jest.fn(),
      unsubscribe: jest.fn()
    }
  }
}));

// Mock export service
jest.mock('../../services/export.service', () => ({
  __esModule: true,
  default: {
    exportMetrics: jest.fn(),
    exportTrends: jest.fn(),
    exportFailures: jest.fn()
  }
}));

// Mock fetch
global.fetch = jest.fn();

describe('NotificationDashboard', () => {
  const mockMetrics = {
    totalSent: 1000,
    totalFailed: 100,
    failureRate: 0.1,
    averageRetryAttempts: 2.5,
    failuresByType: {
      email: 60,
      sms: 30,
      push: 10
    },
    failuresByError: {
      'Connection timeout': 1,
      'Invalid number': 1
    },
    hourlyFailureRate: [
      { hour: '2024-03-20T10:00:00Z', rate: 0.2 },
      { hour: '2024-03-20T11:00:00Z', rate: 0.1 }
    ],
    recentFailures: [
      {
        id: '1',
        type: 'email',
        error: 'Connection timeout',
        timestamp: '2024-03-20T10:00:00Z',
        attempts: 3
      }
    ]
  };

  const mockTrends = {
    daily: [
      { date: '2024-03-20', rate: 0.15 }
    ],
    weekly: [
      { week: '2024-03-17', rate: 0.15 }
    ],
    monthly: [
      { month: '2024-03', rate: 0.15 }
    ]
  };

  const mockAlerts = {
    alerts: [
      'High failure rate: 10.0%',
      'High average retry attempts: 2.5'
    ],
    metrics: mockMetrics
  };

  let mockSubscribe: any;

  beforeEach(() => {
    mockSubscribe = jest.fn();
    (wsService.messages$.subscribe as jest.Mock).mockReturnValue({
      unsubscribe: jest.fn()
    });

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/notification-metrics') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMetrics)
        });
      }
      if (url === '/api/notification-metrics/trends') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTrends)
        });
      }
      if (url === '/api/notification-metrics/check-alerts') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAlerts)
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('connects to WebSocket on mount', () => {
    render(<NotificationDashboard />);
    expect(wsService.connect).toHaveBeenCalled();
  });

  it('disconnects from WebSocket on unmount', () => {
    const { unmount } = render(<NotificationDashboard />);
    unmount();
    expect(wsService.disconnect).toHaveBeenCalled();
  });

  it('updates metrics when receiving WebSocket message', async () => {
    const updatedMetrics = {
      totalSent: 2000,
      totalFailed: 200
    };

    let messageCallback: any;
    (wsService.messages$.subscribe as jest.Mock).mockImplementation((callback) => {
      messageCallback = callback;
      return { unsubscribe: jest.fn() };
    });

    render(<NotificationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('1000')).toBeInTheDocument();
    });

    act(() => {
      messageCallback({
        type: 'metrics',
        data: updatedMetrics
      });
    });

    await waitFor(() => {
      expect(screen.getByText('2000')).toBeInTheDocument();
    });
  });

  it('adds new alerts when receiving WebSocket message', async () => {
    const newAlert = 'New critical alert: System overload';

    let messageCallback: any;
    (wsService.messages$.subscribe as jest.Mock).mockImplementation((callback) => {
      messageCallback = callback;
      return { unsubscribe: jest.fn() };
    });

    render(<NotificationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('High failure rate: 10.0%')).toBeInTheDocument();
    });

    act(() => {
      messageCallback({
        type: 'alert',
        data: newAlert
      });
    });

    await waitFor(() => {
      expect(screen.getByText(newAlert)).toBeInTheDocument();
    });
  });

  it('shows error snackbar when receiving WebSocket error', async () => {
    const errorMessage = 'Connection lost';

    let messageCallback: any;
    (wsService.messages$.subscribe as jest.Mock).mockImplementation((callback) => {
      messageCallback = callback;
      return { unsubscribe: jest.fn() };
    });

    render(<NotificationDashboard />);

    act(() => {
      messageCallback({
        type: 'error',
        data: errorMessage
      });
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('renders loading state initially', () => {
    render(<NotificationDashboard />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<NotificationDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('renders dashboard with metrics data', async () => {
    render(<NotificationDashboard />);
    
    await waitFor(() => {
      // Check summary cards
      expect(screen.getByText('Total Sent')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
      expect(screen.getByText('Failed Notifications')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Failure Rate')).toBeInTheDocument();
      expect(screen.getByText('10.0%')).toBeInTheDocument();
      expect(screen.getByText('Avg. Retry Attempts')).toBeInTheDocument();
      expect(screen.getByText('2.5')).toBeInTheDocument();

      // Check alerts
      expect(screen.getByText('High failure rate: 10.0%')).toBeInTheDocument();
      expect(screen.getByText('High average retry attempts: 2.5')).toBeInTheDocument();

      // Check charts
      expect(screen.getByText('Failure Trends')).toBeInTheDocument();
      expect(screen.getByText('Failures by Type')).toBeInTheDocument();
      expect(screen.getByText('Failures by Error')).toBeInTheDocument();

      // Check recent failures table
      expect(screen.getByText('Recent Failures')).toBeInTheDocument();
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Timestamp')).toBeInTheDocument();
      expect(screen.getByText('Attempts')).toBeInTheDocument();
    });
  });

  it('updates data periodically', async () => {
    jest.useFakeTimers();
    render(<NotificationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('1000')).toBeInTheDocument();
    });

    // Update mock data
    const updatedMetrics = {
      ...mockMetrics,
      totalSent: 2000
    };

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/notification-metrics') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(updatedMetrics)
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    // Fast-forward time
    jest.advanceTimersByTime(60000);

    await waitFor(() => {
      expect(screen.getByText('2000')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('handles tab changes for failure trends', async () => {
    render(<NotificationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Daily')).toBeInTheDocument();
    });

    // Click on Weekly tab
    screen.getByText('Weekly').click();

    await waitFor(() => {
      expect(screen.getByText('Weekly')).toHaveAttribute('aria-selected', 'true');
    });

    // Click on Monthly tab
    screen.getByText('Monthly').click();

    await waitFor(() => {
      expect(screen.getByText('Monthly')).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Export functionality', () => {
    it('should show export menu when clicking export button', async () => {
      render(<NotificationDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Export'));

      expect(screen.getByText('Export Metrics (JSON)')).toBeInTheDocument();
      expect(screen.getByText('Export Metrics (CSV)')).toBeInTheDocument();
      expect(screen.getByText('Export Trends (JSON)')).toBeInTheDocument();
      expect(screen.getByText('Export Trends (CSV)')).toBeInTheDocument();
      expect(screen.getByText('Export Failures (JSON)')).toBeInTheDocument();
      expect(screen.getByText('Export Failures (CSV)')).toBeInTheDocument();
    });

    it('should export metrics in JSON format', async () => {
      render(<NotificationDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Export'));
      fireEvent.click(screen.getByText('Export Metrics (JSON)'));

      expect(exportService.exportMetrics).toHaveBeenCalledWith(mockMetrics, 'json');
    });

    it('should export metrics in CSV format', async () => {
      render(<NotificationDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Export'));
      fireEvent.click(screen.getByText('Export Metrics (CSV)'));

      expect(exportService.exportMetrics).toHaveBeenCalledWith(mockMetrics, 'csv');
    });

    it('should export trends in JSON format', async () => {
      render(<NotificationDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Export'));
      fireEvent.click(screen.getByText('Export Trends (JSON)'));

      expect(exportService.exportTrends).toHaveBeenCalledWith(mockTrends, 'json');
    });

    it('should export trends in CSV format', async () => {
      render(<NotificationDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Export'));
      fireEvent.click(screen.getByText('Export Trends (CSV)'));

      expect(exportService.exportTrends).toHaveBeenCalledWith(mockTrends, 'csv');
    });

    it('should export failures in JSON format', async () => {
      render(<NotificationDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Export'));
      fireEvent.click(screen.getByText('Export Failures (JSON)'));

      expect(exportService.exportFailures).toHaveBeenCalledWith(
        mockMetrics.recentFailures,
        'json'
      );
    });

    it('should export failures in CSV format', async () => {
      render(<NotificationDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Export'));
      fireEvent.click(screen.getByText('Export Failures (CSV)'));

      expect(exportService.exportFailures).toHaveBeenCalledWith(
        mockMetrics.recentFailures,
        'csv'
      );
    });

    it('should handle export errors', async () => {
      (exportService.exportMetrics as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Export failed');
      });

      render(<NotificationDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Export'));
      fireEvent.click(screen.getByText('Export Metrics (JSON)'));

      expect(screen.getByText('Failed to export data')).toBeInTheDocument();
    });
  });
}); 