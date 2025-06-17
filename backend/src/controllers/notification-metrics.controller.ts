import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationMetricsService, AlertThresholds } from '../services/notification-metrics.service';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../types/user';

@Controller('notification-metrics')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class NotificationMetricsController {
  constructor(private readonly metricsService: NotificationMetricsService) {}

  @Get()
  async getMetrics() {
    return this.metricsService.getMetrics();
  }

  @Get('trends')
  async getFailureTrends() {
    return this.metricsService.getFailureTrends();
  }

  @Post('check-alerts')
  async checkAlerts(@Body() thresholds: Partial<AlertThresholds>) {
    return this.metricsService.checkAlerts(thresholds);
  }
} 