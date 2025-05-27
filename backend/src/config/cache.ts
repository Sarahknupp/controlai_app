import Redis from 'ioredis';
import { logger } from './logger';

// Configuração do Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// Cliente Redis
export const redis = new Redis(redisConfig);

// Eventos do Redis
redis.on('connect', () => {
  logger.info('Redis conectado');
});

redis.on('error', (error) => {
  logger.error('Erro no Redis:', error);
});

// Configuração do cache
export const cacheConfig = {
  // Tempo de expiração padrão (1 hora)
  defaultTTL: 3600,
  // Prefixo para chaves do cache
  keyPrefix: 'cache:',
  // Configurações específicas por rota
  routes: {
    '/api/products': {
      ttl: 1800, // 30 minutos
      key: 'products'
    },
    '/api/categories': {
      ttl: 3600, // 1 hora
      key: 'categories'
    },
    '/api/sales': {
      ttl: 300, // 5 minutos
      key: 'sales'
    }
  }
};

// Funções de cache
export const cache = {
  // Obtém valor do cache
  async get(key: string): Promise<string | null> {
    try {
      return await redis.get(cacheConfig.keyPrefix + key);
    } catch (error) {
      logger.error('Erro ao obter do cache:', error);
      return null;
    }
  },

  // Define valor no cache
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      await redis.set(
        cacheConfig.keyPrefix + key,
        value,
        'EX',
        ttl || cacheConfig.defaultTTL
      );
    } catch (error) {
      logger.error('Erro ao definir no cache:', error);
    }
  },

  // Remove valor do cache
  async del(key: string): Promise<void> {
    try {
      await redis.del(cacheConfig.keyPrefix + key);
    } catch (error) {
      logger.error('Erro ao remover do cache:', error);
    }
  },

  // Limpa todo o cache
  async flush(): Promise<void> {
    try {
      const keys = await redis.keys(cacheConfig.keyPrefix + '*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error('Erro ao limpar cache:', error);
    }
  }
}; 