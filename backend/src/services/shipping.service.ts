import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { OrderService, Order } from './order.service';
import { AuditAction, EntityType } from '../types/audit';

export type ShippingStatus = 'PENDING' | 'LABEL_CREATED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'RETURNED';
export type ShippingCarrier = 'CORREIOS' | 'FEDEX' | 'DHL' | 'UPS' | 'LOCAL_DELIVERY';

export interface ShippingLabel {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: ShippingCarrier;
  status: ShippingStatus;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  packageDetails: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    items: number;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingTracking {
  id: string;
  labelId: string;
  status: ShippingStatus;
  location?: string;
  description: string;
  timestamp: Date;
}

export class ShippingService {
  private labels: Map<string, ShippingLabel>;
  private tracking: Map<string, ShippingTracking[]>;
  private auditService: AuditService;
  private notificationService: NotificationService;
  private orderService: OrderService;

  constructor() {
    this.labels = new Map();
    this.tracking = new Map();
    this.auditService = new AuditService();
    this.notificationService = new NotificationService();
    this.orderService = new OrderService();
  }

  async createShippingLabel(
    orderId: string,
    carrier: ShippingCarrier,
    packageDetails: ShippingLabel['packageDetails']
  ): Promise<ShippingLabel> {
    try {
      const order = await this.orderService.getOrder(orderId);
      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }

      if (!order.shippingAddress) {
        throw new Error(`Order ${orderId} has no shipping address`);
      }

      // Generate tracking number (format: CARRIER-XXXX-XXXX-XXXX)
      const trackingNumber = `${carrier}-${uuidv4().slice(0, 4)}-${uuidv4().slice(0, 4)}-${uuidv4().slice(0, 4)}`;

      const label: ShippingLabel = {
        id: uuidv4(),
        orderId,
        trackingNumber,
        carrier,
        status: 'PENDING',
        shippingAddress: order.shippingAddress,
        packageDetails,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.labels.set(label.id, label);
      this.tracking.set(label.id, []);

      // Log label creation
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.ORDER,
        entityId: orderId,
        userId: 'system',
        details: `Created shipping label for order ${order.orderNumber}`,
        status: 'success'
      });

      return label;
    } catch (error) {
      logger.error('Error creating shipping label:', error);
      throw error;
    }
  }

  async updateShippingStatus(
    labelId: string,
    status: ShippingStatus,
    location?: string,
    description?: string
  ): Promise<ShippingLabel> {
    try {
      const label = this.labels.get(labelId);
      if (!label) {
        throw new Error(`Shipping label not found: ${labelId}`);
      }

      const order = await this.orderService.getOrder(label.orderId);
      if (!order) {
        throw new Error(`Order not found: ${label.orderId}`);
      }

      const previousStatus = label.status;
      label.status = status;
      label.updatedAt = new Date();

      if (status === 'DELIVERED') {
        label.actualDeliveryDate = new Date();
      }

      this.labels.set(labelId, label);

      // Add tracking entry
      const trackingEntry: ShippingTracking = {
        id: uuidv4(),
        labelId,
        status,
        location,
        description: description || `Package ${status.toLowerCase()}`,
        timestamp: new Date()
      };

      const trackingHistory = this.tracking.get(labelId) || [];
      trackingHistory.push(trackingEntry);
      this.tracking.set(labelId, trackingHistory);

      // Log status update
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.ORDER,
        entityId: label.orderId,
        userId: 'system',
        details: `Updated shipping status for order ${order.orderNumber} from ${previousStatus} to ${status}`,
        status: 'success'
      });

      // Update order status if needed
      if (status === 'DELIVERED') {
        await this.orderService.updateOrderStatus(label.orderId, 'DELIVERED');
      }

      // Send notification to customer
      if (order.customerId) {
        await this.notificationService.sendUserNotification(
          order.customerId,
          'Shipping Update',
          `Your order ${order.orderNumber} has been ${status.toLowerCase()}.`
        );
      }

      return label;
    } catch (error) {
      logger.error('Error updating shipping status:', error);
      throw error;
    }
  }

  async getShippingLabel(id: string): Promise<ShippingLabel | undefined> {
    return this.labels.get(id);
  }

  async getShippingLabels(
    filters: {
      orderId?: string;
      carrier?: ShippingCarrier;
      status?: ShippingStatus;
      startDate?: Date;
      endDate?: Date;
    } = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ labels: ShippingLabel[]; total: number; page: number; limit: number }> {
    try {
      let filteredLabels = Array.from(this.labels.values());

      // Apply filters
      if (filters.orderId) {
        filteredLabels = filteredLabels.filter(l => l.orderId === filters.orderId);
      }
      if (filters.carrier) {
        filteredLabels = filteredLabels.filter(l => l.carrier === filters.carrier);
      }
      if (filters.status) {
        filteredLabels = filteredLabels.filter(l => l.status === filters.status);
      }
      if (filters.startDate) {
        filteredLabels = filteredLabels.filter(l => l.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredLabels = filteredLabels.filter(l => l.createdAt <= filters.endDate!);
      }

      // Sort by creation date (newest first)
      filteredLabels.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLabels = filteredLabels.slice(startIndex, endIndex);

      return {
        labels: paginatedLabels,
        total: filteredLabels.length,
        page,
        limit
      };
    } catch (error) {
      logger.error('Error getting shipping labels:', error);
      throw error;
    }
  }

  async getTrackingHistory(labelId: string): Promise<ShippingTracking[]> {
    return this.tracking.get(labelId) || [];
  }

  async calculateShippingCost(
    packageDetails: ShippingLabel['packageDetails'],
    destination: ShippingLabel['shippingAddress'],
    carrier: ShippingCarrier
  ): Promise<number> {
    try {
      // This is a simplified calculation. In a real application, this would integrate with carrier APIs
      const baseRate = this.getBaseRate(carrier);
      const weightRate = packageDetails.weight * this.getWeightRate(carrier);
      const distanceRate = this.calculateDistanceRate(destination, carrier);
      const volumeRate = this.calculateVolumeRate(packageDetails.dimensions, carrier);

      return baseRate + weightRate + distanceRate + volumeRate;
    } catch (error) {
      logger.error('Error calculating shipping cost:', error);
      throw error;
    }
  }

  private getBaseRate(carrier: ShippingCarrier): number {
    const rates: Record<ShippingCarrier, number> = {
      CORREIOS: 10,
      FEDEX: 25,
      DHL: 30,
      UPS: 28,
      LOCAL_DELIVERY: 5
    };
    return rates[carrier] || 15;
  }

  private getWeightRate(carrier: ShippingCarrier): number {
    const rates: Record<ShippingCarrier, number> = {
      CORREIOS: 2,
      FEDEX: 5,
      DHL: 6,
      UPS: 5,
      LOCAL_DELIVERY: 1
    };
    return rates[carrier] || 3;
  }

  private calculateDistanceRate(
    destination: ShippingLabel['shippingAddress'],
    carrier: ShippingCarrier
  ): number {
    // This would typically use a geocoding service to calculate actual distance
    // For now, return a simplified rate based on carrier
    const rates: Record<ShippingCarrier, number> = {
      CORREIOS: 0.5,
      FEDEX: 1,
      DHL: 1.2,
      UPS: 1,
      LOCAL_DELIVERY: 0.2
    };
    return rates[carrier] || 0.5;
  }

  private calculateVolumeRate(
    dimensions: ShippingLabel['packageDetails']['dimensions'],
    carrier: ShippingCarrier
  ): number {
    const volume = dimensions.length * dimensions.width * dimensions.height;
    const rates: Record<ShippingCarrier, number> = {
      CORREIOS: 0.1,
      FEDEX: 0.2,
      DHL: 0.25,
      UPS: 0.2,
      LOCAL_DELIVERY: 0.05
    };
    return volume * (rates[carrier] || 0.15);
  }

  async getShippingStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalShipments: number;
    deliveredShipments: number;
    averageDeliveryTime: number;
    byCarrier: Record<ShippingCarrier, { count: number; delivered: number; averageTime: number }>;
    byStatus: Record<ShippingStatus, number>;
  }> {
    try {
      const labels = Array.from(this.labels.values())
        .filter(l => l.createdAt >= startDate && l.createdAt <= endDate);

      const totalShipments = labels.length;
      const deliveredShipments = labels.filter(l => l.status === 'DELIVERED').length;

      const byCarrier: Record<ShippingCarrier, { count: number; delivered: number; totalTime: number }> = {} as any;
      const byStatus: Record<ShippingStatus, number> = {} as any;

      labels.forEach(label => {
        // Aggregate by carrier
        if (!byCarrier[label.carrier]) {
          byCarrier[label.carrier] = { count: 0, delivered: 0, totalTime: 0 };
        }
        byCarrier[label.carrier].count++;
        if (label.status === 'DELIVERED') {
          byCarrier[label.carrier].delivered++;
          if (label.actualDeliveryDate) {
            const deliveryTime = label.actualDeliveryDate.getTime() - label.createdAt.getTime();
            byCarrier[label.carrier].totalTime += deliveryTime;
          }
        }

        // Aggregate by status
        if (!byStatus[label.status]) {
          byStatus[label.status] = 0;
        }
        byStatus[label.status]++;
      });

      // Calculate averages
      const averageDeliveryTime = deliveredShipments > 0
        ? labels
            .filter(l => l.status === 'DELIVERED' && l.actualDeliveryDate)
            .reduce((sum, l) => sum + (l.actualDeliveryDate!.getTime() - l.createdAt.getTime()), 0) / deliveredShipments
        : 0;

      // Convert carrier stats to include average time
      const carrierStats: Record<ShippingCarrier, { count: number; delivered: number; averageTime: number }> = {} as any;
      Object.entries(byCarrier).forEach(([carrier, stats]) => {
        carrierStats[carrier as ShippingCarrier] = {
          count: stats.count,
          delivered: stats.delivered,
          averageTime: stats.delivered > 0 ? stats.totalTime / stats.delivered : 0
        };
      });

      return {
        totalShipments,
        deliveredShipments,
        averageDeliveryTime,
        byCarrier: carrierStats,
        byStatus
      };
    } catch (error) {
      logger.error('Error getting shipping stats:', error);
      throw error;
    }
  }
} 