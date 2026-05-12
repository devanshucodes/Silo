import express, { Express } from 'express';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import helmet from 'helmet';
import cors from 'cors';
import { z } from 'zod';

const app: Express = express();
const port = process.env.RELAY_PORT || 3001;
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const relaySecret = process.env.RELAY_SECRET || 'dev-secret-change-in-production';
const ttlSeconds = parseInt(process.env.PAYLOAD_TTL_SECONDS || '600', 10);

let redis: Redis | null = null;
let redisAvailable = false;

try {
  redis = new Redis(redisUrl);
  redis.on('error', () => { redisAvailable = false; });
  redis.ping().then(() => { redisAvailable = true; }).catch(() => { redisAvailable = false; });
  redisAvailable = true;
} catch {
  redisAvailable = false;
}

const inMemoryStore = new Map<string, { data: string; expires: number }>();

const storePayload = async (key: string, data: string): Promise<number> => {
  const expires = Date.now() + ttlSeconds * 1000;
  if (redis && redisAvailable) {
    await redis.setex(key, ttlSeconds, JSON.stringify({ data, expires }));
    return ttlSeconds;
  }
  inMemoryStore.set(key, { data, expires });
  return ttlSeconds;
};

const getPayload = async (key: string): Promise<{ data: string; expires: number } | null> => {
  if (redis && redisAvailable) {
    const result = await redis.get(key);
    if (!result) return null;
    const parsed = JSON.parse(result);
    if (Date.now() > parsed.expires) {
      await redis.del(key);
      return null;
    }
    await redis.del(key);
    return parsed;
  }
  const item = inMemoryStore.get(key);
  if (!item) return null;
  if (Date.now() > item.expires) {
    inMemoryStore.delete(key);
    return null;
  }
  inMemoryStore.delete(key);
  return item;
};

const verifyAuth = (authHeader: string): boolean => {
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  return token === relaySecret;
};

const storeSchema = z.object({
  key: z.string().min(1).max(64),
  encrypted: z.string(),
  nonce: z.string(),
  ephemeralPubkey: z.string(),
});

app.use(helmet());
app.use(cors());
app.use(express.json());

const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!verifyAuth(req.headers.authorization || '')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

app.post('/payload', authMiddleware, async (req, res) => {
  try {
    const body = storeSchema.parse(req.body);
    const { key, encrypted, nonce, ephemeralPubkey } = body;
    const ttl = await storePayload(key, JSON.stringify({ encrypted, nonce, ephemeralPubkey }));
    res.json({ key, expires_in: ttl });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid payload', details: err.errors });
      return;
    }
    console.error('Store error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/payload/:key', authMiddleware, async (req, res) => {
  try {
    const { key } = req.params;
    const result = await getPayload(key);
    if (!result) {
      res.status(404).json({ error: 'Not found or expired' });
      return;
    }
    res.json(JSON.parse(result.data));
  } catch (err) {
    console.error('Get error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', async (_req, res) => {
  let redisStatus = 'disconnected';
  if (redis) {
    try {
      await redis.ping();
      redisStatus = 'connected';
    } catch {
      redisStatus = 'error';
    }
  } else {
    redisStatus = 'mock';
  }
  res.json({ status: 'ok', redis: redisStatus });
});

app.listen(port, () => {
  console.log(`Silo Relay running on port ${port}`);
});

export { app, storePayload, getPayload };