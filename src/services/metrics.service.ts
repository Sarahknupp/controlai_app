import { EventEmitter } from 'events';
import { createWriteStream, WriteStream } from 'fs';
import path from 'path';
import { format } from 'date-fns';

interface MetricEvent {
  type: string;
  timestamp: Date;
  duration?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export class MetricsService {
  private static instance: MetricsService;
  private eventEmitter: EventEmitter;
  private metricsStream: WriteStream;
  private metricsBuffer: MetricEvent[] = [];
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds
  private readonly MAX_BUFFER_SIZE = 100;

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.setupMetricsFile();
    this.setupEventListeners();
    this.startPeriodicFlush();
  }

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  private setupMetricsFile(): void {
    const metricsDir = path.join(process.cwd(), 'logs', 'metrics');
    const today = format(new Date(), 'yyyy-MM-dd');
    const filePath = path.join(metricsDir, `metrics-${today}.jsonl`);

    this.metricsStream = createWriteStream(filePath, { flags: 'a' });
  }

  private setupEventListeners(): void {
    this.eventEmitter.on('metric', (event: MetricEvent) => {
      this.metricsBuffer.push(event);
      if (this.metricsBuffer.length >= this.MAX_BUFFER_SIZE) {
        this.flushMetrics();
      }
    });

    this.eventEmitter.on('error', (error: Error) => {
      console.error('Metrics service error:', error);
    });
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      if (this.metricsBuffer.length > 0) {
        this.flushMetrics();
      }
    }, this.FLUSH_INTERVAL);
  }

  private flushMetrics(): void {
    const metrics = this.metricsBuffer.splice(0, this.metricsBuffer.length);
    metrics.forEach(metric => {
      this.metricsStream.write(JSON.stringify(metric) + '\n');
    });
  }

  public trackPDFGeneration(
    receiptNumber: string,
    startTime: number,
    success: boolean,
    error?: string,
    metadata?: Record<string, any>
  ): void {
    const duration = Date.now() - startTime;
    this.eventEmitter.emit('metric', {
      type: 'pdf_generation',
      timestamp: new Date(),
      duration,
      success,
      error,
      metadata: {
        receiptNumber,
        ...metadata
      }
    });
  }

  public trackEmailSending(
    receiptNumber: string,
    startTime: number,
    success: boolean,
    error?: string,
    metadata?: Record<string, any>
  ): void {
    const duration = Date.now() - startTime;
    this.eventEmitter.emit('metric', {
      type: 'email_sending',
      timestamp: new Date(),
      duration,
      success,
      error,
      metadata: {
        receiptNumber,
        ...metadata
      }
    });
  }

  public trackCacheOperation(
    operation: 'hit' | 'miss' | 'set' | 'delete',
    receiptNumber: string,
    success: boolean,
    error?: string
  ): void {
    this.eventEmitter.emit('metric', {
      type: 'cache_operation',
      timestamp: new Date(),
      success,
      error,
      metadata: {
        operation,
        receiptNumber
      }
    });
  }

  public getMetricsSummary(): Promise<{
    totalPDFs: number;
    averagePDFGenerationTime: number;
    pdfSuccessRate: number;
    totalEmails: number;
    averageEmailSendTime: number;
    emailSuccessRate: number;
    cacheHitRate: number;
  }> {
    // Implementar lógica de agregação de métricas
    return Promise.resolve({
      totalPDFs: 0,
      averagePDFGenerationTime: 0,
      pdfSuccessRate: 0,
      totalEmails: 0,
      averageEmailSendTime: 0,
      emailSuccessRate: 0,
      cacheHitRate: 0
    });
  }

  public async close(): Promise<void> {
    await this.flushMetrics();
    this.metricsStream.end();
  }
} 