import type { VercelRequest, VercelResponse } from '@vercel/node';

// Disable Vercel's automatic body parsing so we receive raw binary data
// for image uploads (POST to /shrink).
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Vercel serverless function to proxy TinyPNG API requests.
 *
 * In development, Vite's dev server proxy handles /api/tinypng/* requests.
 * In production on Vercel, this serverless function takes over.
 *
 * Routes:
 *   POST /api/tinypng/shrink  -> https://api.tinify.com/shrink
 *   GET  /api/tinypng/output/* -> https://api.tinify.com/output/*
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.TINYPNG_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'TinyPNG API key not configured' });
  }

  // Extract the path after /api/tinypng/
  // NOTE: req.query.path can be empty on POST requests in some Vercel runtimes,
  // so we also parse from req.url as a reliable fallback.
  let subPath = '';
  const pathSegments = req.query.path;
  if (pathSegments) {
    subPath = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;
  } else if (req.url) {
    // req.url is like "/api/tinypng/shrink" or "/api/tinypng/output/abc123"
    const match = req.url.match(/^\/api\/tinypng\/(.+?)(\?.*)?$/);
    if (match) {
      subPath = match[1];
    }
  }
  const targetUrl = `https://api.tinify.com/${subPath}`;

  const auth = Buffer.from(`api:${apiKey}`).toString('base64');

  try {
    const headers: Record<string, string> = {
      Authorization: `Basic ${auth}`,
    };

    // Forward content-type for upload requests
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'];
    }

    // Build fetch options
    const fetchOptions: RequestInit = {
      method: req.method || 'GET',
      headers,
    };

    // Forward body for POST requests (bodyParser is disabled, so we stream raw bytes)
    if (req.method === 'POST') {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
      }
      fetchOptions.body = Buffer.concat(chunks);
    }

    const response = await fetch(targetUrl, fetchOptions);

    // Forward relevant response headers
    const locationHeader = response.headers.get('Location');
    if (locationHeader) {
      res.setHeader('Location', locationHeader);
    }

    const compressionCount = response.headers.get('Compression-Count');
    if (compressionCount) {
      res.setHeader('Compression-Count', compressionCount);
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // For JSON responses (upload step), parse and forward
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    // For binary responses (download step), stream the response
    const buffer = Buffer.from(await response.arrayBuffer());
    return res.status(response.status).send(buffer);
  } catch (error) {
    console.error('[TinyPNG Proxy] Error:', error);
    return res.status(502).json({
      error: 'proxy_error',
      message: 'Failed to reach TinyPNG API',
    });
  }
}
