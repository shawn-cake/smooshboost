# SmooshBoost

**Smoosh & Boost Images** — A browser-based image optimization suite for Cake Website, a digital marketing agency. Also available as a [Figma plugin](#figma-plugin) for compressing frames directly from your design files.

## Overview

SmooshBoost combines best-in-class lossless compression techniques with SEO metadata optimization. The tool follows a two-phase workflow:

1. **Smoosh (Compression)** — Strip images down to optimal file size using intelligent compression
2. **Boost (Metadata Injection)** — Selectively inject SEO-relevant metadata for local search and attribution

## Features

### Compression (Smoosh Phase)
- **MozJPEG** — Superior JPEG compression with quality preservation
- **OxiPNG** — Lossless PNG optimization
- **WebP** — Modern format with excellent compression ratios
- **Automatic engine selection** based on input format
- **Batch processing** up to 20 images at once
- **Client-side processing** — Your images never leave your browser

### Metadata Injection (Boost Phase)
- **Geo-tagging** — Add GPS coordinates for local SEO (JPG/WebP only)
- **Copyright & Author** — Proper attribution embedded in image files
- **Title & Description** — SEO-optimized metadata for image search
- **Per-image configuration** — Customize metadata for each image individually
- **Apply to All** — Copy settings across your entire batch

### Output Options
- **Format conversion** — Convert between JPG, PNG, and WebP
- **Individual downloads** — Download images one at a time
- **ZIP export** — Download all images in a single archive
- **Boost Only mode** — Add metadata without compression

### Figma Plugin
- **One-click export** — Select frames in Figma, choose format & scale, hit Export & Smoosh
- **MozJPEG WASM** — JPG compression (quality 75, progressive) runs entirely client-side
- **TinyPNG API** — PNG compression via Vercel proxy with automatic OxiPNG WASM fallback
- **Batch processing** — Compress multiple frames with per-file progress tracking
- **Download options** — Individual files or a single ZIP archive
- **Self-contained** — All WASM codecs are inlined in the plugin; no external dependencies at runtime

## Tech Stack

### Web App
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling
- **@jsquash** libraries for WASM-based compression
- **piexifjs** for EXIF metadata manipulation
- **JSZip** for archive generation

### Figma Plugin
- **Figma Plugin API** for frame selection and export
- **esbuild** for bundling the plugin UI
- **@jsquash WASM codecs** inlined as base64 (MozJPEG encoder/decoder, OxiPNG)
- **JSZip** for batch ZIP downloads

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/shawn-cake/smooshboost.git
cd smooshboost

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env.local

# Start development server
npm run dev
```

### TinyPNG API Key Setup

SmooshBoost uses the [TinyPNG API](https://tinypng.com/developers) for optimal PNG compression. The API key is **not included** in this repository for security reasons.

**To enable TinyPNG compression:**

1. Get a free API key at [tinypng.com/developers](https://tinypng.com/developers) (500 free compressions/month)
2. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
3. Edit `.env.local` and add your API key:
   ```
   TINYPNG_API_KEY=your_api_key_here
   ```
4. Restart the development server

**Without an API key:** PNG compression will automatically fall back to OxiPNG (local WASM-based compression). This still provides good results but TinyPNG typically achieves better compression ratios.

> **Security Note:** Never commit API keys to version control. The `.env.local` file is gitignored by default.

### Figma Plugin

```bash
cd packages/figma-plugin
npm install
npm run build
```

Then in Figma: **Plugins → Development → Import plugin from manifest** → select `packages/figma-plugin/manifest.json`.

The plugin uses the same TinyPNG Vercel proxy as the web app — no extra configuration needed if `TINYPNG_API_KEY` is already set on Vercel.

### Build for Production

```bash
npm run build
npm run preview
```

### Deployment (Vercel)

SmooshBoost is deployed on Vercel. The TinyPNG API proxy runs as a Vercel serverless function (`api/tinypng.ts`) that serves both the web app and the Figma plugin. Set `TINYPNG_API_KEY` in the Vercel dashboard environment variables.

## Usage

1. **Upload images** — Drag & drop or click to select (supports JPG, PNG, WebP)
2. **Compression starts automatically** — Watch progress in the queue
3. **Configure Boost options** — Click the accordion on each image
4. **Apply metadata** — Click "Apply Metadata" for each image
5. **Download** — Get individual files or download all as ZIP

## Format Support

| Feature | JPG/MozJPG | PNG | WebP |
|---------|------------|-----|------|
| Compression | Yes | Yes | Yes |
| Geo-tagging | Yes | No | Yes |
| Copyright | Yes | Yes | Yes |
| Author | Yes | Yes | Yes |
| Title | Yes | Yes | Yes |
| Description | Yes | Yes | Yes |

## Project Structure

```
smooshboost/
├── api/
│   └── tinypng.ts            # TinyPNG API proxy (Vercel serverless)
├── src/
│   ├── app/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # Compression & metadata services
│   │   ├── utils/            # Utility functions
│   │   └── types.ts          # TypeScript types
│   ├── styles/               # Tailwind CSS v4 theme
│   └── main.tsx              # Application entry point
├── packages/
│   └── figma-plugin/         # Figma plugin (standalone package)
│       ├── manifest.json     # Plugin manifest & network permissions
│       ├── code.ts           # Figma sandbox (selection tracking, export)
│       ├── src/
│       │   ├── ui.ts         # Plugin UI entry point
│       │   └── compression.ts # MozJPEG/OxiPNG WASM + TinyPNG proxy
│       ├── scripts/          # Build tooling (esbuild, WASM base64 encoding)
│       └── ui-template.html  # HTML shell (codecs + bundle injected at build)
├── public/                   # Static assets
└── guidelines/               # Project documentation
```

## Design System

- **Primary Color:** Cake Blue (#4074A8)
- **Accent Color:** Cake Yellow (#F2A918)
- **Font:** Roboto
- **Spacing:** 8px base grid

## License

MIT License — See [LICENSE](LICENSE) for details.