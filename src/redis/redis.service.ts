import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private available = false;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      lazyConnect: true,
      enableReadyCheck: true,
    });

    this.client.on('connect', () => {
      this.available = true;
      this.logger.log('Redis connected');
    });

    this.client.on('error', (err) => {
      if (this.available) {
        this.logger.warn(`Redis error — falling back to DB: ${err.message}`);
        this.available = false;
      }
    });

    this.client.connect().catch(() => {
      this.logger.warn('Redis not available on startup — caching disabled');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.available) return null;

    try {
      const value = await this.client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!this.available) return;

    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // ignore
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (!this.available) return;
    try {
      if (keys.length > 0) await this.client.del(...keys);
    } catch {
      // ignore
    }
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
