/**
 * Core compression module for the Figma plugin.
 *
 * JPG path:  MozJPEG WASM decode → encode (quality 75, progressive)
 * PNG path:  TinyPNG via Vercel proxy → fallback to OxiPNG WASM (level 2)
 *
 * CRITICAL DESIGN DECISION:
 * We do NOT import from @jsquash/* at build time. The emscripten factory
 * code in those packages runs self-invoking IIFEs at module evaluation time
 * that crash in Figma's restricted plugin sandbox (XMLHttpRequest setup,
 * URL resolution via import.meta.url, etc.).
 *
 * Instead, the JS codec sources are embedded as strings in wasm-data.ts
 * (generated at build time by encode-wasm.mjs) and evaluated lazily via
 * new Function() only when compression is first requested.
 */

import {
  MOZJPEG_ENC_WASM_BASE64,
  MOZJPEG_DEC_WASM_BASE64,
  OXIPNG_WASM_BASE64,
  MOZJPEG_DEC_JS_SOURCE,
  MOZJPEG_ENC_JS_SOURCE,
  OXIPNG_JS_SOURCE,
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

// ── Lazy codec cache ────────────────────────────────────────────────

// Emscripten module instances (resolved promises from the factory)
let jpegDecModule: any = null;
let jpegEncModule: any = null;

// OxiPNG wasm-bindgen module namespace
let oxipngNs: any = null;

// ── TinyPNG quota tracking (mirrors compressionRouter.ts) ────────────

const TINYPNG_BASE = 'https://smshbst.vercel.app/api/tinypng';
let tinypngQuotaExhausted = false;

// ── Helpers ──────────────────────────────────────────────────────────

function compileWasm(base64: string): WebAssembly.Module {
  const buffer = base64ToArrayBuffer(base64);
  return new WebAssembly.Module(buffer);
}

/**
 * Evaluate an emscripten factory JS source string.
 *
 * The source files use `export default Module;` and
 * `var Module = (() => { var _scriptDir = import.meta.url; ... })();`
 *
 * We strip the ES module wrapper and provide a safe `import.meta.url`
 * substitute, then evaluate with new Function() so the code runs in a
 * fresh scope without polluting the global namespace.
 */
function loadEmscriptenFactory(source: string): (opts: any) => Promise<any> {
  // The emscripten factories look like:
  //   var Module = (() => {
  //     var _scriptDir = import.meta.url;
  //     return (function(moduleArg = {}) { ... });
  //   })();
  //   export default Module;
  //
  // We need to:
  // 1. Replace `import.meta.url` with a safe string
  // 2. Remove the `export default Module;` line
  // 3. Return the Module factory function

  let code = source;

  // Replace import.meta.url with a harmless data: URI
  code = code.replace(/import\.meta\.url/g, '"data:text/javascript,"');

  // Remove the ES module export
  code = code.replace(/export\s+default\s+Module\s*;?\s*$/, '');

  // Wrap in a function that returns the Module factory
  const fn = new Function(`${code}\nreturn Module;`);
  return fn();
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
  const factory = loadEmscriptenFactory(MOZJPEG_DEC_JS_SOURCE);
  const wasmModule = compileWasm(MOZJPEG_DEC_WASM_BASE64);
  jpegDecModule = await initEmscriptenModule(factory, wasmModule);
}

async function ensureJpegEnc(): Promise<void> {
  if (jpegEncModule) return;
  const factory = loadEmscriptenFactory(MOZJPEG_ENC_JS_SOURCE);
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

// ── PNG — OxiPNG WASM ───────────────────────────────────────────────

/**
 * Load the OxiPNG wasm-bindgen module from its embedded source string.
 *
 * The source uses ES module exports (export function optimise, export { initSync },
 * export default ...). We convert it to a script that assigns to a namespace object.
 */
function loadOxipngModule(): any {
  let code = OXIPNG_JS_SOURCE;

  // Replace import.meta.url
  code = code.replace(/import\.meta\.url/g, '"data:text/javascript,"');

  // The oxipng source has module-level side effects we need to handle:
  // - Lines at the end do environment detection and polyfill ImageData
  // We'll let those run — they're relatively safe in Figma's UI iframe.

  // Convert ES module exports to assignments on a namespace object.
  // The module has: export function optimise(...), export { initSync },
  // export default __wbg_init;

  // Remove export statements but keep the function declarations
  code = code.replace(/^export\s+default\s+__wbg_init\s*;?\s*$/m, '');
  code = code.replace(/^export\s*\{\s*initSync\s*\}\s*;?\s*$/m, '');
  code = code.replace(/^export\s+function\s+/gm, 'function ');
  code = code.replace(/^export\s+function\s*\*/gm, 'function* ');

  // Return the namespace with the functions we need
  const fn = new Function(`
    ${code}
    return { optimise, optimise_raw, initSync };
  `);
  return fn();
}

function ensureOxipng(): void {
  if (oxipngNs) return;
  oxipngNs = loadOxipngModule();
  const wasmModule = compileWasm(OXIPNG_WASM_BASE64);
  oxipngNs.initSync(wasmModule);
}

/**
 * Compress a PNG image using OxiPNG WASM (level 2).
 * Used as fallback when TinyPNG is unavailable or quota-exhausted.
 */
export async function compressPngWithOxipng(pngBytes: ArrayBuffer): Promise<ArrayBuffer> {
  ensureOxipng();

  const result = oxipngNs.optimise(new Uint8Array(pngBytes), 2, false, false);

  // Copy to a new ArrayBuffer (avoids SharedArrayBuffer issues)
  const output = new ArrayBuffer(result.byteLength);
  new Uint8Array(output).set(new Uint8Array(result.buffer, result.byteOffset, result.byteLength));
  return output;
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
