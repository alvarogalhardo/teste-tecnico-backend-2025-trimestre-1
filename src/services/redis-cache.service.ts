import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { CacheInterface } from '../interfaces/cache.interface';

@Injectable()
export class RedisCacheService
  implements CacheInterface, OnModuleInit, OnModuleDestroy
{
  private client: RedisClientType;
  private readonly DEFAULT_TTL = 60; // 60s

  async onModuleInit() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });

    await this.client.connect();
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      const data = await this.client.get(key);

      if (!data) {
        return null;
      }
      return Buffer.from(data, 'base64');
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(
    key: string,
    value: Buffer,
    ttlSeconds = this.DEFAULT_TTL,
  ): Promise<void> {
    try {
      const base64Data = value.toString('base64');

      await this.client.setEx(key, ttlSeconds, base64Data);
    } catch (error) {
      console.error('Redis set error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
      throw error;
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Redis has error:', error);
      return false;
    }
  }
}
