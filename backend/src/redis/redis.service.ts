import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

class MockRedis {
  private store = new Map<string, string>();
  private ttls = new Map<string, number>();

  async set(key: string, value: string, option?: string, ttl?: number): Promise<'OK'> {
    this.store.set(key, value);
    if (option === 'EX' && ttl) {
      this.ttls.set(key, Date.now() + ttl * 1000);
    }
    return 'OK';
  }

  async get(key: string): Promise<string | null> {
    if (this.ttls.has(key) && this.ttls.get(key) < Date.now()) {
      this.store.delete(key);
      this.ttls.delete(key);
      return null;
    }
    return this.store.get(key) || null;
  }

  async incr(key: string): Promise<number> {
    const val = await this.get(key);
    const num = val ? parseInt(val, 10) + 1 : 1;
    await this.set(key, num.toString());
    return num;
  }

  async expire(key: string, seconds: number): Promise<number> {
    this.ttls.set(key, Date.now() + seconds * 1000);
    return 1;
  }

  async del(key: string): Promise<number> {
    let count = 0;
    if (this.store.has(key)) {
      this.store.delete(key);
      count++;
    }
    this.ttls.delete(key);
    return count;
  }

  async ping(): Promise<'PONG'> {
    return 'PONG';
  }

  disconnect() {}
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: any;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    if (process.env.STANDALONE === 'true') {
      console.log('[RedisService] Standalone Mode active: using MockRedis.');
      this.redisClient = new MockRedis();
      return;
    }

    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    try {
      this.redisClient = new Redis(redisUrl);
      this.redisClient.on('error', (err) => {
        console.warn('[RedisService] Redis client connection error. Falling back to MockRedis.', err.message);
        this.redisClient = new MockRedis();
      });
    } catch (e) {
      console.warn('[RedisService] Failed to initialize Redis connection. Falling back to MockRedis.', e.message);
      this.redisClient = new MockRedis();
    }
  }

  onModuleDestroy() {
    if (this.redisClient && typeof this.redisClient.disconnect === 'function') {
      this.redisClient.disconnect();
    }
  }

  getClient(): Redis {
    return this.redisClient;
  }

  // Token revocation helper
  async revokeToken(tokenId: string, ttlSeconds: number): Promise<void> {
    await this.redisClient.set(`revoked_token:${tokenId}`, 'true', 'EX', ttlSeconds);
  }

  async isTokenRevoked(tokenId: string): Promise<boolean> {
    const res = await this.redisClient.get(`revoked_token:${tokenId}`);
    return res === 'true';
  }

  // Brute force lockout helper
  async incrementLoginFailures(email: string): Promise<number> {
    const key = `login_fail:${email}`;
    const failures = await this.redisClient.incr(key);
    if (failures === 1) {
      await this.redisClient.expire(key, 600); // 10 minutes sliding window
    }
    return failures;
  }

  async resetLoginFailures(email: string): Promise<void> {
    await this.redisClient.del(`login_fail:${email}`);
    await this.redisClient.del(`lockout:${email}`);
  }

  async lockUser(email: string, lockDurationSeconds: number): Promise<void> {
    await this.redisClient.set(`lockout:${email}`, 'true', 'EX', lockDurationSeconds);
  }

  async isUserLocked(email: string): Promise<boolean> {
    const res = await this.redisClient.get(`lockout:${email}`);
    return res === 'true';
  }

  // Rate Limiting helper
  async isRateLimited(key: string, limit: number, ttlSeconds: number): Promise<boolean> {
    const current = await this.redisClient.incr(key);
    if (current === 1) {
      await this.redisClient.expire(key, ttlSeconds);
    }
    return current > limit;
  }

  // Generic Caching helper
  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redisClient.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}

