import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../redis/client';

/**
 * Authoritative Idempotency Middleware (§12.4, §15.1)
 * Checks Idempotency-Key header on mutating operations and caches responses in Redis
 */
export async function idempotencyMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
  if (!idempotencyKey || typeof idempotencyKey !== 'string') {
    return next();
  }

  const cacheKey = `idempotency:response:${idempotencyKey}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`[Idempotency] Cache hit for key: ${idempotencyKey}`);
      const parsed = JSON.parse(cached);
      res.status(parsed.status || 200).json(parsed.body);
      return;
    }
  } catch (err: any) {
    console.warn('[Idempotency] Redis read failed, proceeding without cache:', err.message);
  }

  // Intercept res.json / res.send to cache response
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    try {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redisClient.setex(cacheKey, 86400, JSON.stringify({ status: res.statusCode, body })).catch((err) => {
          console.warn('[Idempotency] Redis write failed:', err.message);
        });
      }
    } catch (e) {
      // Ignore serialization errors
    }
    return originalJson(body);
  };

  next();
}
