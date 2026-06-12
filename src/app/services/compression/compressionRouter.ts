import type {
  InputFormat,
  OutputFormat,
  CompressionResult,
  CompressionEngine,
} from '../../types';
import { compressWithSquoosh } from './squooshService';
import { compressWithTinyPNG } from './tinypngService';

// Track if TinyPNG quota is exhausted (429 error, or Compression-Count >= limit)
let tinypngQuotaExhausted = false;

// TinyPNG free-tier monthly compression limit. At/above this, route to OxiPNG.
const TINYPNG_MONTHLY_LIMIT = 500;

/**
 * Resets the TinyPNG quota exhaustion flag.
 * Call this when clearing the queue so TinyPNG can be retried.
 */
export function resetTinypngQuota(): void {
  tinypngQuotaExhausted = false;
}

/**
 * Determines which compression engine to use based on output format.
 *
 * Routing logic (based on output format only):
 * - Output PNG: TinyPNG API (falls back to OxiPNG if quota exhausted)
 * - Output MozJPG: MozJPEG via @jsquash
 * - Output WebP: WebP via @jsquash
 */
export function getCompressionEngine(
  _inputFormat: InputFormat,
  outputFormat: OutputFormat
): CompressionEngine {
  switch (outputFormat) {
    case 'png':
      // Use TinyPNG for PNG output unless quota is exhausted
      return tinypngQuotaExhausted ? 'oxipng' : 'tinypng';
    case 'mozjpg':
      return 'mozjpeg';
    case 'webp':
      return 'webp';
    default:
      return 'webp';
  }
}

/**
 * Compresses an image file using the appropriate engine
 */
export async function compressImage(
  file: File,
  inputFormat: InputFormat,
  outputFormat: OutputFormat
): Promise<CompressionResult> {
  const engine = getCompressionEngine(inputFormat, outputFormat);

  // Use TinyPNG for PNG output
  if (engine === 'tinypng') {
    try {
      const result = await compressWithTinyPNG(file);
      // Pre-emptively exhaust the quota when we've hit the monthly limit, so
      // the next PNG goes straight to OxiPNG instead of eating a 429.
      if (
        result.compressionCount !== null &&
        result.compressionCount >= TINYPNG_MONTHLY_LIMIT
      ) {
        console.warn(
          `[Compression] TinyPNG monthly limit reached (${result.compressionCount}), switching to OxiPNG for subsequent PNGs`
        );
        tinypngQuotaExhausted = true;
      }
      return {
        blob: result.blob,
        size: result.blob.size,
        engine: 'tinypng',
      };
    } catch (error) {
      // Check if it's a quota error (429 Too Many Requests)
      if (error instanceof Error && error.message.includes('429')) {
        console.warn('[Compression] TinyPNG quota exhausted, falling back to Squoosh');
        tinypngQuotaExhausted = true;
      } else {
        console.warn('[Compression] TinyPNG failed, falling back to Squoosh:', error);
      }
      // Fall back to Squoosh
      const { blob, engine: fallbackEngine } = await compressWithSquoosh(file, outputFormat);
      return {
        blob,
        size: blob.size,
        engine: fallbackEngine,
      };
    }
  }

  // Use Squoosh for other formats
  const { blob, engine: squooshEngine } = await compressWithSquoosh(file, outputFormat);
  return {
    blob,
    size: blob.size,
    engine: squooshEngine,
  };
}

/**
 * Validates that the input/output format combination is supported
 */
export function isValidFormatCombination(
  inputFormat: InputFormat,
  outputFormat: OutputFormat
): boolean {
  // All combinations are valid with Squoosh
  // PNG/JPG input can be converted to any output format
  const validInputs: InputFormat[] = ['png', 'jpg', 'webp'];
  const validOutputs: OutputFormat[] = ['png', 'mozjpg', 'webp'];

  return validInputs.includes(inputFormat) && validOutputs.includes(outputFormat);
}

/**
 * Gets a human-readable description of the compression being performed
 */
export function getCompressionDescription(
  inputFormat: InputFormat,
  outputFormat: OutputFormat
): string {
  const engine = getCompressionEngine(inputFormat, outputFormat);

  switch (engine) {
    case 'tinypng':
      return 'Optimizing with TinyPNG';
    case 'oxipng':
      return 'Optimizing PNG with OxiPNG';
    case 'mozjpeg':
      return 'Compressing with MozJPEG';
    case 'webp':
      return 'Converting to WebP';
    default:
      return 'Compressing image';
  }
}
