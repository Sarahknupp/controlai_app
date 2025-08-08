import { Controller, Get, Post, Param, Delete, UseGuards } from '@nestjs/common';
import { QueueMonitorService } from '../services/queue-monitor.service';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../types/user';

@Controller('queue-monitor')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class QueueMonitorController {
  constructor(private readonly monitorService: QueueMonitorService) {}

  @Get('metrics')
  async getMetrics() {
    return this.monitorService.getMetrics();
  }

  @Get('jobs/:id')
  async getJobDetails(@Param('id') jobId: string) {
    return this.monitorService.getJobDetails(jobId);
  }

  @Get('failed')
  async getFailedJobs() {
    return this.monitorService.getFailedJobs();
  }

  @Get('retry')
  async getRetryJobs() {
    return this.monitorService.getRetryJobs();
  }

  @Delete('failed')
  async clearFailedJobs() {
    await this.monitorService.clearFailedJobs();
    return { message: 'Failed jobs cleared successfully' };
  }

  @Post('retry/:id')
  async retryFailedJob(@Param('id') jobId: string) {
    await this.monitorService.retryFailedJob(jobId);
    return { message: 'Job retry initiated successfully' };
  }
} 