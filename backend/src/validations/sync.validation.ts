import Joi from 'joi';
import { SyncDirection } from '../services/sync.service';

export const syncValidation = {
  syncData: Joi.object({
    body: Joi.object({
      type: Joi.string().required(),
      direction: Joi.string().valid(...Object.values(SyncDirection)).required(),
      source: Joi.string().required(),
      destination: Joi.string().required(),
      options: Joi.object({
        batchSize: Joi.number().min(1).max(10000).default(1000),
        retryCount: Joi.number().min(0).max(10).default(3),
        retryDelay: Joi.number().min(1000).max(30000).default(5000),
        validateOnly: Joi.boolean().default(false),
        forceSync: Joi.boolean().default(false)
      }).default()
    }).required()
  }),

  getSyncStatus: Joi.object({
    params: Joi.object({
      syncId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    }).required()
  }),

  cancelSync: Joi.object({
    params: Joi.object({
      syncId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    }).required()
  })
}; 