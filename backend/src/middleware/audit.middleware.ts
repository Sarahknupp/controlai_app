import { Request, Response, NextFunction } from 'express';
import { SecurityMonitorService } from '../services/security-monitor.service';
import { AuthRequest } from './auth.middleware';

const securityMonitor = SecurityMonitorService.getInstance();

export interface AuditConfig {
  action: string;
  resource: string;
  includeBody?: boolean;
  includeParams?: boolean;
  includeQuery?: boolean;
}

export const auditMiddleware = (config: AuditConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    res.json = function(data: any) {
      const auditData = {
        user: (req as AuthRequest).user?._id?.toString(),
        action: config.action,
        resource: config.resource,
        method: req.method,
        path: req.path,
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent'),
        timestamp: new Date(),
        statusCode: res.statusCode,
        ...(config.includeBody && { body: req.body }),
        ...(config.includeParams && { params: req.params }),
        ...(config.includeQuery && { query: req.query })
      };

      securityMonitor.logAction(auditData);
      return originalJson.call(this, data);
    };
    next();
  };
}; 