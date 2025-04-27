import { Hono, Context } from 'hono';
import { z } from 'zod';
import { Flareshot } from 'flareshot';
import type { Env } from '../../types/env';

const ScreenshotSchema = z.object({
  url: z.string().url(),
  fullPage: z.boolean().optional().default(false),
  type: z.enum(['png', 'jpeg']).optional().default('png'),
});

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c: Context<{ Bindings: Env }>) => {
  const url = c.req.query('url');
  const fullPage = c.req.query('fullPage') === 'true';
  const type = c.req.query('type') || 'png';

  const parse = ScreenshotSchema.safeParse({ url, fullPage, type });
  if (!parse.success) {
    return c.json({ error: 'Invalid input', details: parse.error.errors }, 400);
  }
  const { url: validatedUrl, fullPage: validatedFullPage, type: validatedType } = parse.data;

  try {
    // Use Flareshot class with the browser binding from env
    const client = new Flareshot(c.env.MYBROWSER);
    const image = await client.takeScreenshot(validatedUrl, { fullPage: validatedFullPage, type: validatedType });
    c.header('content-type', validatedType === 'png' ? 'image/png' : 'image/jpeg');
    return new Response(image, { status: 200 });
  } catch (err: any) {
    return c.json({ error: 'Screenshot failed', details: err.message }, 500);
  }
});

export default router;
