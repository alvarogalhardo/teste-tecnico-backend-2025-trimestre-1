import { Injectable } from '@nestjs/common';
import { CacheInterface } from '../interfaces/cache.interface';

interface CacheItem {
  data: Buffer;
  timestamp: number;
  ttl: number;
}

@Injectable()
export class MemoryCacheService implements CacheInterface {
  private readonly cache = new Map<string, CacheItem>();
  private readonly DEFAULT_TTL = 60; // 60 segundos

  async get(key: string): Promise<Buffer | null> {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Verificar se o item expirou
    const now = Date.now();
    if (now - item.timestamp > item.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  async set(
    key: string,
    value: Buffer,
    ttlSeconds = this.DEFAULT_TTL,
  ): Promise<void> {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttlSeconds,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async has(key: string): Promise<boolean> {
    const item = await this.get(key);
    return item !== null;
  }

  // Método para limpeza periódica de itens expirados
  clearExpired(): void {
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl * 1000) {
        this.cache.delete(key);
      }
    }
  }
}
