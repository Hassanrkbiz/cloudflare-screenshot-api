import { Hono, Context } from 'hono';
import { z } from 'zod';
import { Flareshot } from 'flareshot';
import type { Env } from '../../types/env';

const ScreenshotSchema = z.object({
  url: z.string().url(),
  fullPage: z.boolean().optional().default(false),
  type: z.enum(['png', 'jpeg','pdf']).optional().default('png'),
  width: z.coerce.number().int().positive().optional(),
  height: z.coerce.number().int().positive().optional(),
  quality: z.coerce.number().int().min(0).max(100).optional(),
});

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c: Context<{ Bindings: Env }>) => {
  const url = c.req.query('url');
  const fullPage = c.req.query('fullPage') === 'true';
  const type = c.req.query('type') || 'png';
  const width = c.req.query('width') ? Number(c.req.query('width')) : undefined;
  const height = c.req.query('height') ? Number(c.req.query('height')) : undefined;
  const quality = c.req.query('quality') ? Number(c.req.query('quality')) : undefined;

  const parse = ScreenshotSchema.safeParse({ url, fullPage, type, width, height, quality });
  if (!parse.success) {
    return c.json({ error: 'Invalid input', details: parse.error.errors }, 400);
  }
  const { url: validatedUrl, fullPage: validatedFullPage, type: validatedType, width: validatedWidth, height: validatedHeight, quality: validatedQuality } = parse.data;

  try {
    // Use Flareshot class with the browser binding from env
    const client = new Flareshot(c.env.MYBROWSER);
    const options: any = { fullPage: validatedFullPage, type: validatedType };
    if (validatedWidth) options.width = validatedWidth;
    if (validatedHeight) options.height = validatedHeight;
    if (validatedQuality) options.quality = validatedQuality;
    const image = await client.takeScreenshot(validatedUrl, options);
    if (validatedType === 'png') {
      c.header('content-type', 'image/png');
    } else if (validatedType === 'jpeg') {
      c.header('content-type', 'image/jpeg');
    } else if (validatedType === 'pdf') {
      c.header('content-type', 'application/pdf');
    }
    return new Response(image, { status: 200 });
  } catch (err: any) {
    return c.json({ error: 'Screenshot failed', details: err.message }, 500);
  }
});

export default router;
