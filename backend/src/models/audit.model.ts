import mongoose, { Document } from 'mongoose';
import { EntityType, AuditAction } from '../types/audit';

export interface IAuditLog extends Document {
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  details: any;
  status: 'success' | 'error' | 'warning' | 'info';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: Object.values(AuditAction),
    required: true,
  },
  entityType: {
    type: String,
    enum: Object.values(EntityType),
    required: true,
  },
  entityId: {
    type: String,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  status: {
    type: String,
    enum: ['success', 'error', 'warning', 'info'],
    required: true,
  },
  userId: {
    type: String,
    required: false,
  },
  ipAddress: {
    type: String,
    required: false,
  },
  userAgent: {
    type: String,
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// Indexes for better query performance
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entityType: 1 });
auditLogSchema.index({ entityId: 1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ status: 1 });
auditLogSchema.index({ timestamp: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema); 