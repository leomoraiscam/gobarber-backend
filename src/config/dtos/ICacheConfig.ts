import { RedisOptions } from 'ioredis';

export interface ICacheConfig {
  driver: 'redis';
  config: {
    redis: RedisOptions;
  };
}
