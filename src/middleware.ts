import { MiddlewareHandler } from 'hono';

export const logger = (): MiddlewareHandler => async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`[${c.req.method}] ${c.req.url} - ${ms}ms`);
};

export const errorHandler = (): MiddlewareHandler => async (c, next) => {
  try {
    await next();
  } catch (err: any) {
    console.error('Error:', err);
    return c.json({ error: 'Internal Server Error', details: err.message }, 500);
  }
};

// Simple in-memory rate limiter (for demo; use Durable Objects for prod scale)
const RATE_LIMIT = 60; // requests per minute
const ipCache = new Map<string, { count: number; ts: number }>();

export const rateLimiter = (): MiddlewareHandler => async (c, next) => {
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  const now = Math.floor(Date.now() / 60000);
  const record = ipCache.get(ip);
  if (!record || record.ts !== now) {
    ipCache.set(ip, { count: 1, ts: now });
  } else {
    if (record.count >= RATE_LIMIT) {
      return c.json({ error: 'Rate limit exceeded' }, 429);
    }
    record.count++;
    ipCache.set(ip, record);
  }
  await next();
};
