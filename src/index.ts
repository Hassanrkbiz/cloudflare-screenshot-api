import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger, errorHandler, rateLimiter } from './middleware';
import screenshotRoute from './routes/screenshot';

const app = new Hono();

app.use('*', cors({
  origin: ['http://localhost:3000', 'https://screen-shot.xyz'],
}));
app.use('*', logger());
app.use('*', rateLimiter());
app.use('*', errorHandler());

app.route('/take', screenshotRoute);
app.get('/', (c) => c.json({ status: 'ok', message: 'Cloudflare Screenshot API running.' }));

export default app;
