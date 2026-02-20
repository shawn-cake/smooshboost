import type { VercelRequest, VercelResponse } from '@vercel/node';

// Disable Vercel's automatic body parsing so we receive raw binary data
// for image uploads.
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Vercel serverless function to proxy TinyPNG API requests.
 *
 * Single endpoint approach (avoids Vercel catch-all routing issues):
 *   POST /api/tinypng?path=shrink         -> https://api.tinify.com/shrink
 *   GET  /api/tinypng?path=output/abc123   -> https://api.tinify.com/output/abc123
 *
 * Also supports the legacy nested route format for backwards compatibility:
 *   POST /api/tinypng/shrink              -> https://api.tinify.com/shrink
 *   GET  /api/tinypng/output/abc123       -> https://api.tinify.com/output/abc123
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers for Figma plugin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Expose-Headers', 'Location, Compression-Count');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const apiKey = process.env.TINYPNG_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'TinyPNG API key not configured' });
  }

  // Get the sub-path from query parameter
  const subPath = typeof req.query.path === 'string' ? req.query.path : '';
  if (!subPath) {
    return res.status(400).json({
      error: 'missing_path',
      message: 'Query parameter "path" is required (e.g. ?path=shrink)',
    });
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
