import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private isEnabled: boolean = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      console.warn('⚠️  REDIS_URL not configured. Running without Redis cache.');
      this.isEnabled = false;
      return;
    }

    try {
      this.client = new Redis(redisUrl, {
        connectTimeout: 10000,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('⚠️  Redis connection failed after 3 attempts. Running without Redis cache.');
            return null;
          }
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isEnabled = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis connection error:', err.message);
        this.isEnabled = false;
      });

      this.isEnabled = true;
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error);
      this.isEnabled = false;
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  isAvailable(): boolean {
    return this.isEnabled && this.client !== null;
  }

  // Helper methods for common operations
  async set(key: string, value: string, expirationSeconds?: number): Promise<void> {
    if (!this.isAvailable()) {
      return; // Silently skip if Redis is not available
    }
    try {
      if (expirationSeconds) {
        await this.client!.set(key, value, 'EX', expirationSeconds);
      } else {
        await this.client!.set(key, value);
      }
    } catch (error) {
      console.warn('Redis set operation failed:', error);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isAvailable()) {
      return null; // Return null if Redis is not available
    }
    try {
      return await this.client!.get(key);
    } catch (error) {
      console.warn('Redis get operation failed:', error);
      return null;
    }
  }

  async del(key: string): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }
    try {
      return await this.client!.del(key);
    } catch (error) {
      console.warn('Redis del operation failed:', error);
      return 0;
    }
  }

  async exists(key: string): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }
    try {
      return await this.client!.exists(key);
    } catch (error) {
      console.warn('Redis exists operation failed:', error);
      return 0;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.isAvailable()) {
      return [];
    }
    try {
      return await this.client!.keys(pattern);
    } catch (error) {
      console.warn('Redis keys operation failed:', error);
      return [];
    }
  }

  // Distributed lock operations
  async acquireLock(
    lockKey: string,
    value: string,
    ttlSeconds: number = 30,
  ): Promise<boolean> {
    if (!this.isAvailable()) {
      // Without Redis, we can't implement distributed locks, so return true to allow operation
      console.warn('Redis not available, skipping distributed lock');
      return true;
    }
    try {
      const result = await this.client!.set(lockKey, value, 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch (error) {
      console.warn('Redis acquireLock failed:', error);
      return true; // Allow operation to proceed
    }
  }

  async releaseLock(lockKey: string): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }
    try {
      await this.client!.del(lockKey);
    } catch (error) {
      console.warn('Redis releaseLock failed:', error);
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }
    try {
      return await this.client!.expire(key, seconds);
    } catch (error) {
      console.warn('Redis expire operation failed:', error);
      return 0;
    }
  }
}
