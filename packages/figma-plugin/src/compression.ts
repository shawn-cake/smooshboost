/**
 * Core compression module for the Figma plugin.
 *
 * JPG path:  @jsquash/jpeg decode (WASM) → encode (WASM, MozJPEG quality 75)
 * PNG path:  TinyPNG via Vercel proxy → fallback to OxiPNG WASM (level 2)
 *
 * WASM binaries are inlined as base64 in wasm-data.ts and compiled once on
 * first use, avoiding any network fetch for WASM.
 */

import {
  MOZJPEG_ENC_WASM_BASE64,
  MOZJPEG_DEC_WASM_BASE64,
  OXIPNG_WASM_BASE64,
  base64ToArrayBuffer,
} from './wasm-data';

// ── MozJPEG options (mirrors squooshService.ts) ──────────────────────

const MOZJPEG_OPTIONS = {
  quality: 75,
  baseline: false,
  arithmetic: false,
  progressive: true,
  optimize_coding: true,
  smoothing: 0,
  color_space: 3, // YCbCr
  quant_table: 3, // ImageMagick
  trellis_multipass: false,
  trellis_opt_zero: false,
  trellis_opt_table: false,
  trellis_loops: 1,
  auto_subsample: true,
  chroma_subsample: 2,
  separate_chroma_quality: false,
  chroma_quality: 75,
};

// ── Lazy WASM module cache ───────────────────────────────────────────

let mozjpegEncModule: WebAssembly.Module | null = null;
let mozjpegDecModule: WebAssembly.Module | null = null;
let oxipngModule: WebAssembly.Module | null = null;

let jpegEncInitialised = false;
let jpegDecInitialised = false;
let oxipngInitialised = false;

// ── TinyPNG quota tracking (mirrors compressionRouter.ts) ────────────

const TINYPNG_BASE = 'https://smshbst.vercel.app/api/tinypng';
let tinypngQuotaExhausted = false;

// ── Helpers ──────────────────────────────────────────────────────────

function compileWasm(base64: string): WebAssembly.Module {
  const buffer = base64ToArrayBuffer(base64);
  return new WebAssembly.Module(buffer);
}

// ── JPEG (MozJPEG) ──────────────────────────────────────────────────

async function ensureJpegDec(): Promise<void> {
  if (jpegDecInitialised) return;
  if (!mozjpegDecModule) {
    mozjpegDecModule = compileWasm(MOZJPEG_DEC_WASM_BASE64);
  }
  const jpegDec = await import('@jsquash/jpeg/decode');
  await jpegDec.init(mozjpegDecModule);
  jpegDecInitialised = true;
}

async function ensureJpegEnc(): Promise<void> {
  if (jpegEncInitialised) return;
  if (!mozjpegEncModule) {
    mozjpegEncModule = compileWasm(MOZJPEG_ENC_WASM_BASE64);
  }
  const jpegEnc = await import('@jsquash/jpeg/encode');
  await jpegEnc.init(mozjpegEncModule);
  jpegEncInitialised = true;
}

/**
 * Compress a JPEG image using MozJPEG WASM.
 * Decodes → re-encodes with quality 75 progressive.
 */
export async function compressJpeg(jpegBytes: ArrayBuffer): Promise<ArrayBuffer> {
  await ensureJpegDec();
  await ensureJpegEnc();

  const { decode } = await import('@jsquash/jpeg/decode');
  const { encode } = await import('@jsquash/jpeg/encode');

  const imageData = await decode(jpegBytes);
  const compressed = await encode(imageData, MOZJPEG_OPTIONS);
  return compressed;
}

// ── PNG — TinyPNG via Vercel proxy ──────────────────────────────────

async function compressPngWithTinyPNG(pngBytes: ArrayBuffer): Promise<ArrayBuffer> {
  // Step 1: POST raw bytes to the Vercel proxy
  const uploadResponse = await fetch(`${TINYPNG_BASE}/shrink`, {
    method: 'POST',
    body: pngBytes,
    headers: { 'Content-Type': 'image/png' },
  });

  if (!uploadResponse.ok) {
    throw new Error(`TinyPNG upload failed: ${uploadResponse.status}`);
  }

  // Step 2: Get the Location header pointing to the compressed output
  const locationUrl = uploadResponse.headers.get('Location');
  if (!locationUrl) {
    throw new Error('TinyPNG did not return a Location header');
  }

  // Extract the path portion (e.g. /output/abc123)
  const outputPath = new URL(locationUrl).pathname;

  // Step 3: Download the compressed image through the proxy
  const downloadResponse = await fetch(`${TINYPNG_BASE}${outputPath}`, {
    method: 'GET',
  });

  if (!downloadResponse.ok) {
    throw new Error(`TinyPNG download failed: ${downloadResponse.status}`);
  }

  return downloadResponse.arrayBuffer();
}

// ── PNG — OxiPNG WASM fallback ──────────────────────────────────────

/**
 * Compress a PNG image using OxiPNG WASM (level 2).
 * Used as fallback when TinyPNG is unavailable or quota-exhausted.
 */
export async function compressPngWithOxipng(pngBytes: ArrayBuffer): Promise<ArrayBuffer> {
  if (!oxipngInitialised) {
    if (!oxipngModule) {
      oxipngModule = compileWasm(OXIPNG_WASM_BASE64);
    }
    // Import the single-threaded codec directly to avoid wasm-feature-detect
    const oxipng = await import('@jsquash/oxipng/codec/pkg/squoosh_oxipng.js');
    oxipng.initSync(oxipngModule);
    oxipngInitialised = true;
  }

  const oxipng = await import('@jsquash/oxipng/codec/pkg/squoosh_oxipng.js');
  const result = oxipng.optimise(new Uint8Array(pngBytes), 2, false, false);

  // Copy to a new ArrayBuffer (avoids SharedArrayBuffer issues)
  const output = new ArrayBuffer(result.byteLength);
  new Uint8Array(output).set(new Uint8Array(result.buffer));
  return output;
}

/**
 * Compress a PNG image. Tries TinyPNG first; falls back to OxiPNG on
 * any failure (network error, 429 quota, etc.).
 */
export async function compressPng(
  pngBytes: ArrayBuffer
): Promise<{ data: ArrayBuffer; engine: 'tinypng' | 'oxipng' }> {
  if (!tinypngQuotaExhausted) {
    try {
      const data = await compressPngWithTinyPNG(pngBytes);
      return { data, engine: 'tinypng' };
    } catch (error) {
      if (error instanceof Error && error.message.includes('429')) {
        console.warn('[SmooshBoost] TinyPNG quota exhausted, using OxiPNG');
        tinypngQuotaExhausted = true;
      } else {
        console.warn('[SmooshBoost] TinyPNG failed, using OxiPNG:', error);
      }
    }
  }

  const data = await compressPngWithOxipng(pngBytes);
  return { data, engine: 'oxipng' };
}
