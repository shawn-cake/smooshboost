/**
 * Core compression module for the Figma plugin.
 *
 * JPG path:  MozJPEG WASM decode → encode (quality 75, progressive)
 * PNG path:  TinyPNG via Vercel proxy → fallback to OxiPNG WASM (level 2)
 *
 * CRITICAL DESIGN DECISION:
 * We do NOT import from @jsquash/* at build time. The emscripten factory
 * code in those packages runs self-invoking IIFEs at module evaluation time
 * that crash in Figma's restricted plugin sandbox.
 *
 * Instead, the codec JS sources are injected into the HTML as separate
 * <script> tags by build-ui.mjs. They define factory functions on the
 * window object:
 *   - window.__smoosh_mozjpeg_dec  (emscripten factory for JPEG decoder)
 *   - window.__smoosh_mozjpeg_enc  (emscripten factory for JPEG encoder)
 *   - window.__smoosh_oxipng       ({ initSync, optimise, optimise_raw })
 *
 * This avoids:
 *   - esbuild bundling emscripten code (crashes on module evaluation)
 *   - new Function() / eval() (blocked by Figma's CSP)
 */

import {
  MOZJPEG_ENC_WASM_BASE64,
  MOZJPEG_DEC_WASM_BASE64,
  OXIPNG_WASM_BASE64,
  WEBP_ENC_WASM_BASE64,
  base64ToArrayBuffer,
} from './wasm-data';

// ── Globals set by codec <script> tags ──────────────────────────────

declare global {
  interface Window {
    __smoosh_mozjpeg_dec: (opts: any) => Promise<any>;
    __smoosh_mozjpeg_enc: (opts: any) => Promise<any>;
    __smoosh_webp_enc: (opts: any) => Promise<any>;
    __smoosh_oxipng: {
      initSync: (module: WebAssembly.Module) => any;
      optimise: (data: Uint8Array, level: number, interlace: boolean, optimize_alpha: boolean) => Uint8Array;
      optimise_raw: (data: Uint8ClampedArray, width: number, height: number, level: number, interlace: boolean, optimize_alpha: boolean) => Uint8Array;
    };
  }
}

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

// ── WebP options ─────────────────────────────────────────────────────
//
// Full option struct from @jsquash/webp meta.js `defaultOptions`. The raw
// emscripten module.encode() does NOT merge defaults like the @jsquash
// wrapper does, so every field is required. Quality is bumped above the web
// app's 75 — Figma exports are often used at larger display sizes, and 75
// read as a touch too soft in testing.

const WEBP_OPTIONS = {
  quality: 85,
  target_size: 0,
  target_PSNR: 0,
  method: 4,
  sns_strength: 50,
  filter_strength: 60,
  filter_sharpness: 0,
  filter_type: 1,
  partitions: 0,
  segments: 4,
  pass: 1,
  show_compressed: 0,
  preprocessing: 0,
  autofilter: 0,
  partition_limit: 0,
  alpha_compression: 1,
  alpha_filtering: 1,
  alpha_quality: 100,
  lossless: 0,
  exact: 0,
  image_hint: 0,
  emulate_jpeg_size: 0,
  thread_level: 0,
  low_memory: 0,
  near_lossless: 100,
  use_delta_palette: 0,
  use_sharp_yuv: 0,
};

// ── Lazy codec cache ────────────────────────────────────────────────

// Emscripten module instances (resolved promises from the factory)
let jpegDecModule: any = null;
let jpegEncModule: any = null;
let webpEncModule: any = null;

// OxiPNG initialised flag
let oxipngInitialised = false;

// ── TinyPNG quota tracking (mirrors compressionRouter.ts) ────────────

const TINYPNG_BASE = 'https://smshbst.vercel.app/api/tinypng';
let tinypngQuotaExhausted = false;

// ── Helpers ──────────────────────────────────────────────────────────

function compileWasm(base64: string): WebAssembly.Module {
  const buffer = base64ToArrayBuffer(base64);
  return new WebAssembly.Module(buffer);
}

/**
 * Mirrors @jsquash/jpeg/utils.js `initEmscriptenModule`.
 * Calls the emscripten factory with our pre-compiled WebAssembly.Module
 * passed through the `instantiateWasm` callback.
 */
function initEmscriptenModule(
  factory: (opts: any) => Promise<any>,
  wasmModule: WebAssembly.Module,
): Promise<any> {
  return factory({
    noInitialRun: true,
    // Provide locateFile so the factory never calls `new URL(wasm, import.meta.url)`
    // which fails with "Invalid URL" in Figma's sandbox.
    locateFile: (path: string) => path,
    instantiateWasm: (
      imports: WebAssembly.Imports,
      callback: (instance: WebAssembly.Instance) => void,
    ) => {
      const instance = new WebAssembly.Instance(wasmModule, imports);
      callback(instance);
      return instance.exports;
    },
  });
}

// ── JPEG (MozJPEG) ──────────────────────────────────────────────────

async function ensureJpegDec(): Promise<void> {
  if (jpegDecModule) return;
  const factory = window.__smoosh_mozjpeg_dec;
  if (!factory) throw new Error('MozJPEG decoder codec not loaded');
  const wasmModule = compileWasm(MOZJPEG_DEC_WASM_BASE64);
  jpegDecModule = await initEmscriptenModule(factory, wasmModule);
}

async function ensureJpegEnc(): Promise<void> {
  if (jpegEncModule) return;
  const factory = window.__smoosh_mozjpeg_enc;
  if (!factory) throw new Error('MozJPEG encoder codec not loaded');
  const wasmModule = compileWasm(MOZJPEG_ENC_WASM_BASE64);
  jpegEncModule = await initEmscriptenModule(factory, wasmModule);
}

/**
 * Compress a JPEG image using MozJPEG WASM.
 * Decodes → re-encodes with quality 75 progressive.
 */
export async function compressJpeg(jpegBytes: ArrayBuffer): Promise<ArrayBuffer> {
  await ensureJpegDec();
  await ensureJpegEnc();

  // decode() and encode() mirror @jsquash/jpeg/decode.js and encode.js
  const imageData = jpegDecModule.decode(new Uint8Array(jpegBytes), false);
  if (!imageData) throw new Error('MozJPEG decode failed');

  const resultView = jpegEncModule.encode(
    imageData.data,
    imageData.width,
    imageData.height,
    MOZJPEG_OPTIONS,
  );
  // Return a copy (avoids wasm memory issues)
  return resultView.buffer.slice(
    resultView.byteOffset,
    resultView.byteOffset + resultView.byteLength,
  );
}

// ── WebP ────────────────────────────────────────────────────────────

async function ensureWebpEnc(): Promise<void> {
  if (webpEncModule) return;
  const factory = window.__smoosh_webp_enc;
  if (!factory) throw new Error('WebP encoder codec not loaded');
  const wasmModule = compileWasm(WEBP_ENC_WASM_BASE64);
  webpEncModule = await initEmscriptenModule(factory, wasmModule);
}

/**
 * Encode raw RGBA pixels to WebP using the WebP encoder WASM (quality 75).
 *
 * Figma's exportAsync() cannot emit WebP, so the sandbox exports a lossless
 * PNG and the UI decodes it to ImageData (via canvas) before calling this.
 * Mirrors @jsquash/webp encode.js: module.encode(data, width, height, opts).
 */
export async function compressWebp(imageData: ImageData): Promise<ArrayBuffer> {
  await ensureWebpEnc();

  const resultView = webpEncModule.encode(
    imageData.data,
    imageData.width,
    imageData.height,
    WEBP_OPTIONS,
  );
  if (!resultView) throw new Error('WebP encode failed');

  // Return a copy (avoids wasm memory issues)
  return resultView.buffer.slice(
    resultView.byteOffset,
    resultView.byteOffset + resultView.byteLength,
  );
}

// ── PNG — OxiPNG WASM ───────────────────────────────────────────────

function ensureOxipng(): void {
  if (oxipngInitialised) return;
  const ns = window.__smoosh_oxipng;
  if (!ns) throw new Error('OxiPNG codec not loaded');
  const wasmModule = compileWasm(OXIPNG_WASM_BASE64);
  ns.initSync(wasmModule);
  oxipngInitialised = true;
}

/**
 * Compress a PNG image using OxiPNG WASM (level 2).
 * Used as fallback when TinyPNG is unavailable or quota-exhausted.
 */
export async function compressPngWithOxipng(pngBytes: ArrayBuffer): Promise<ArrayBuffer> {
  ensureOxipng();

  const result = window.__smoosh_oxipng.optimise(new Uint8Array(pngBytes), 2, false, false);

  // Copy to a new ArrayBuffer (avoids SharedArrayBuffer issues)
  const output = new ArrayBuffer(result.byteLength);
  new Uint8Array(output).set(new Uint8Array(result.buffer, result.byteOffset, result.byteLength));
  return output;
}

// ── PNG — TinyPNG via Vercel proxy ──────────────────────────────────

async function compressPngWithTinyPNG(pngBytes: ArrayBuffer): Promise<ArrayBuffer> {
  // Step 1: POST raw bytes to the Vercel proxy (query-param based endpoint)
  const uploadResponse = await fetch(`${TINYPNG_BASE}?path=shrink`, {
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

  // Extract the path portion (e.g. /output/abc123) and pass as query param
  let outputPath: string;
  try {
    outputPath = new URL(locationUrl).pathname.replace(/^\//, '');
  } catch {
    throw new Error(`TinyPNG returned an invalid Location URL: ${locationUrl}`);
  }

  // Step 3: Download the compressed image through the proxy
  const downloadResponse = await fetch(`${TINYPNG_BASE}?path=${encodeURIComponent(outputPath)}`, {
    method: 'GET',
  });

  if (!downloadResponse.ok) {
    throw new Error(`TinyPNG download failed: ${downloadResponse.status}`);
  }

  return downloadResponse.arrayBuffer();
}

// ── PNG — combined (TinyPNG → OxiPNG fallback) ─────────────────────

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
        console.warn('[Smoosh] TinyPNG quota exhausted, using OxiPNG');
        tinypngQuotaExhausted = true;
      } else {
        console.warn('[Smoosh] TinyPNG failed, using OxiPNG:', error);
      }
    }
  }

  const data = await compressPngWithOxipng(pngBytes);
  return { data, engine: 'oxipng' };
}
