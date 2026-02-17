# SmooshBoost

**Smoosh & Boost Images** — A browser-based image optimization suite for Cake Website, a digital marketing agency.

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

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling
- **@jsquash** libraries for WASM-based compression
- **piexifjs** for EXIF metadata manipulation
- **JSZip** for archive generation

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

### Build for Production

```bash
npm run build
npm run preview
```

### Deployment (Vercel)

SmooshBoost is deployed on Vercel. The TinyPNG API proxy runs as a Vercel serverless function (`api/tinypng/`). Set `TINYPNG_API_KEY` in the Vercel dashboard environment variables.

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
├── api/                   # Vercel serverless functions
│   └── tinypng/           # TinyPNG API proxy
├── src/
│   ├── app/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # Compression & metadata services
│   │   ├── utils/         # Utility functions
│   │   └── types.ts       # TypeScript types
│   ├── styles/            # Tailwind CSS v4 theme
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── guidelines/            # Project documentation
└── logs/                  # Development logs
```

## Design System

- **Primary Color:** Cake Blue (#4074A8)
- **Accent Color:** Cake Yellow (#F2A918)
- **Font:** Roboto
- **Spacing:** 8px base grid

## License

MIT License — See [LICENSE](LICENSE) for details.