import { MetricsService } from '../services/metrics.service';
import { SecurityMonitorService } from '../services/security-monitor.service';

const metricsService = MetricsService.getInstance();
const securityMonitor = SecurityMonitorService.getInstance();

export const monitoringConfig = {
  metrics: {
    enabled: true,
    interval: 60000, // 1 minuto
    retention: 7 * 24 * 60 * 60 * 1000, // 7 dias
    thresholds: {
      cpu: 80, // 80%
      memory: 85, // 85%
      responseTime: 1000, // 1 segundo
      errorRate: 5 // 5%
    }
  },
  security: {
    enabled: true,
    logLevel: 'info',
    alertThresholds: {
      failedLogins: 5,
      suspiciousIPs: 3,
      rateLimitExceeded: 10
    }
  },
  health: {
    enabled: true,
    interval: 300000, // 5 minutos
    endpoints: [
      {
        name: 'api',
        url: 'http://localhost:3000/health',
        timeout: 5000
      },
      {
        name: 'database',
        url: 'mongodb://localhost:27017/controlai_vendas',
        timeout: 5000
      },
      {
        name: 'redis',
        url: 'redis://localhost:6379',
        timeout: 5000
      }
    ]
  },
  alerts: {
    enabled: true,
    channels: {
      email: {
        enabled: true,
        recipients: ['admin@controleai.com.br']
      },
      slack: {
        enabled: true,
        webhook: process.env.SLACK_WEBHOOK_URL
      }
    }
  }
};

// Inicializa o monitoramento
export const initializeMonitoring = () => {
  if (monitoringConfig.metrics.enabled) {
    setInterval(() => {
      metricsService.logMemoryUsage();
    }, monitoringConfig.metrics.interval);
  }

  if (monitoringConfig.health.enabled) {
    setInterval(() => {
      monitoringConfig.health.endpoints.forEach(endpoint => {
        // Implementar verificação de saúde
      });
    }, monitoringConfig.health.interval);
  }
}; 