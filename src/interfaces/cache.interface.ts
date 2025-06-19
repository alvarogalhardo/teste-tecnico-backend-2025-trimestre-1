export interface CacheInterface {
  get(key: string): Promise<Buffer | null>;
  set(key: string, value: Buffer, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
}
