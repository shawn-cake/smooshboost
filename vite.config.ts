import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// TinyPNG API key - only used in development via Vite proxy
// For production, use a serverless function (Vercel/Netlify)
const TINYPNG_API_KEY = 'REMOVED_API_KEY'

// https://vite.dev/config/
export default defineConfig({
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
    proxy: {
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
    },
  },
})
