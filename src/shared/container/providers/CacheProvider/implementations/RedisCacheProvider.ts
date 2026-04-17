import Redis, { Redis as RedisClient } from 'ioredis';
import { cache } from '@config/cache';
import { ICacheProvider } from '../models/ICacheProvider';

export class RedisCacheProvider implements ICacheProvider {
  private client: RedisClient;

  constructor() {
    this.client = new Redis(cache.config.redis);
  }

  public async save(key: string, value: unknown): Promise<void> {
    const data = JSON.stringify(value);

    await this.client.set(key, data);
  }

  public async recover<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as T;
  }

  public async invalidate(key: string): Promise<void> {
    await this.client.del(key);
  }

  public async invalidatePrefix(prefix: string): Promise<void> {
    const keys = await this.client.keys(`${prefix}:*`);
    const pipeline = this.client.pipeline();

    keys.forEach(key => {
      pipeline.del(key);
    });

    await pipeline.exec();
  }
}
