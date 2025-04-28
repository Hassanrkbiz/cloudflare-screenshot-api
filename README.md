# Cloudflare Screenshot API (Hono + Flareshot)

A robust, production-ready API for browser rendering (screenshots, HTML rendering, etc.) using Cloudflare Workers, the Hono framework, and the [flareshot](https://www.npmjs.com/package/flareshot) package for browserless screenshots.

## Features
- Fast, scalable API on Cloudflare Workers
- Screenshot endpoint (URL to PNG/JPEG) powered by flareshot
- Input validation, error handling, rate limiting, logging
- TypeScript, modular structure

## Endpoints
### `GET /take`
Request a screenshot of a web page.
**Query Parameters:**
- `url` (required): The URL to screenshot
- `fullPage` (optional, default: false): Set to `true` for full page
- `type` (optional, default: png): Either `png` or `jpeg`
- `device` (optional): One of `desktop`, `tablet`, or `mobile` for device emulation
- `delay` (optional): Delay before screenshot in seconds (0-10)
- `width` (optional): Custom viewport width (overrides device)
- `height` (optional): Custom viewport height (overrides device)
- `quality` (optional): JPEG quality (0-100)

Example curl request:
```sh
curl "https://<your-worker-domain>/take?url=https://example.com&fullPage=true&type=png&device=mobile&delay=3" --output screenshot.png
```

## Usage (in Worker code)

The backend uses the correct flareshot API signature:

```ts
import { Flareshot } from 'flareshot';

// In your Hono route handler:
const client = new Flareshot(env.MYBROWSER);
const image = await client.takeScreenshot(url, {
  fullPage: true,
  type: 'png',
  device: 'mobile', // 'desktop', 'tablet', or 'mobile'
  delay: 3,         // seconds (0-10)
  width: 1200,      // optional, overrides device
  height: 800,      // optional, overrides device
  quality: 90,      // optional, JPEG only
});
return new Response(image, { headers: { 'Content-Type': 'image/png' } });
```

## Setup
1. Install dependencies:
   ```
   npm install
   ```
2. Start local dev server:
   ```
   npm run dev
   ```
3. Deploy:
   ```
   npm run deploy
   ```

## Configuration
- Requires Cloudflare Worker with Browser Rendering enabled (see flareshot docs).
- Set up your `wrangler.toml` with:
  ```toml
  browser = { binding = "MYBROWSER" }
  compatibility_flags = ["nodejs_compat"]
  ```
- All rendering is handled by flareshot inside the Worker.
- Adjust rate limits, logging, and error handling in `src/middleware.ts` as needed.

## Powered by
- [Hono](https://hono.dev/)
- [flareshot](https://www.npmjs.com/package/flareshot)
- [Cloudflare Workers](https://workers.cloudflare.com/)
