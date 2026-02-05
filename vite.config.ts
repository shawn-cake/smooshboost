import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  const TINYPNG_API_KEY = env.TINYPNG_API_KEY || ''

  // Warn if API key is missing in development
  if (!TINYPNG_API_KEY && mode === 'development') {
    console.warn('\n⚠️  TINYPNG_API_KEY not set. TinyPNG compression will fall back to OxiPNG.')
    console.warn('   See README.md for setup instructions.\n')
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      // Exclude jSquash WASM packages from pre-bundling
      exclude: ['@jsquash/jpeg', '@jsquash/webp', '@jsquash/oxipng'],
    },
    worker: {
      format: 'es',
    },
    server: {
      proxy: TINYPNG_API_KEY
        ? {
            '/api/tinypng': {
              target: 'https://api.tinify.com',
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api\/tinypng/, ''),
              configure: (proxy) => {
                proxy.on('proxyReq', (proxyReq) => {
                  // Add Basic Auth header with TinyPNG API key
                  const auth = Buffer.from(`api:${TINYPNG_API_KEY}`).toString('base64')
                  proxyReq.setHeader('Authorization', `Basic ${auth}`)
                })
              },
            },
          }
        : undefined,
    },
  }
})
