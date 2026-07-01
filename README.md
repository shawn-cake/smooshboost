# Smoosh

**Smoosh Images** — A browser-based image compression tool for Cake Websites, a digital marketing agency. Also available as a [Figma plugin](#figma-plugin) for compressing frames directly from your design files.

> Formerly **SmooshBoost**. The "Boost" (SEO metadata injection) feature was removed in v0.4.0 — see [logs/CHANGELOG.md](logs/CHANGELOG.md).

## Overview

Smoosh strips images down to optimal file size using best-in-class compression engines. Drop images in, confirm the output format, hit **Smoosh**, download the results.

## Features

- **MozJPEG** — Superior JPEG compression with quality preservation
- **OxiPNG** — Lossless PNG optimization (WASM, in-browser)
- **TinyPNG** — Best-ratio PNG compression via API, with automatic OxiPNG fallback
- **WebP** — Modern format with excellent compression ratios (default output)
- **Format conversion** — Convert between JPG, PNG, and WebP
- **Staged flow** — Images queue up; compression starts when you confirm via the Smoosh button
- **Batch processing** — Up to 20 images at once, 3 compressed concurrently
- **Downloads** — Individual files or a single ZIP archive

Note on privacy: JPG and WebP compression run entirely in your browser via WASM. PNG output is uploaded to the TinyPNG API through our proxy (falling back to in-browser OxiPNG if TinyPNG is unavailable or over quota).

### Figma Plugin

- **One-click export** — Select any layers in Figma, choose format & scale, hit Export & Smoosh
- **MozJPEG WASM** — JPG compression runs entirely client-side
- **WebP output** — Figma exports lossless PNG, the plugin transcodes to WebP
- **TinyPNG API** — PNG compression via Vercel proxy with automatic OxiPNG WASM fallback
- **Batch processing** — Compress multiple layers with progress tracking
- **Download options** — Individual files or a single ZIP archive
- **Self-contained** — All WASM codecs are inlined in the plugin; no external dependencies at runtime

## Tech Stack

### Web App
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS v4** for styling
- **@jsquash** libraries for WASM-based compression
- **JSZip** for archive generation

### Figma Plugin
- **Figma Plugin API** for layer selection and export
- **esbuild** for bundling the plugin UI
- **@jsquash WASM codecs** inlined as base64 (MozJPEG, OxiPNG, WebP)
- **JSZip** for batch ZIP downloads

## Getting Started

### Prerequisites
- Node.js 18+
- npm

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

Smoosh uses the [TinyPNG API](https://tinypng.com/developers) for optimal PNG compression. The API key is **not included** in this repository for security reasons.

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

Smoosh is deployed on Vercel. The TinyPNG API proxy runs as a Vercel serverless function (`api/tinypng.ts`) that serves both the web app and the Figma plugin. Set `TINYPNG_API_KEY` in the Vercel dashboard environment variables.

## Usage

1. **Upload images** — Drag & drop or click to select (supports JPG, PNG, WebP)
2. **Pick an output format** — WebP is the default
3. **Hit Smoosh** — Compression starts on your confirmation
4. **Download** — Get individual files or download all as ZIP

## Project Structure

```
smooshboost/
├── api/
│   └── tinypng.ts            # TinyPNG API proxy (Vercel serverless)
├── src/
│   ├── app/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # Compression & download services
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
│       │   └── compression.ts # MozJPEG/OxiPNG/WebP WASM + TinyPNG proxy
│       ├── scripts/          # Build tooling (esbuild, WASM base64 encoding)
│       └── ui-template.html  # HTML shell (codecs + bundle injected at build)
├── public/                   # Static assets
└── guidelines/               # Project documentation
```

## Design System

- **Primary Color:** Cake Blue (#4074A8)
- **Accent Color:** Cake Yellow (#F2A918)
- **Fonts:** Spline Sans Mono + Syne
- **Spacing:** 8px base grid
