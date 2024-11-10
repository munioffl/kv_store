import { createClient } from 'redis';
import { config } from '../config/config';

const redisClient = createClient({
  url: `redis://${config.redis.host}:${config.redis.port}`,
});
redisClient.connect().catch(console.error);

export { redisClient };
