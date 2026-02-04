import type {
  InputFormat,
  OutputFormat,
  CompressionResult,
  CompressionEngine,
} from '../../types';
import { compressWithSquoosh } from './squooshService';
import { compressWithTinyPNG } from './tinypngService';

// Track if TinyPNG quota is exhausted (429 error)
let tinypngQuotaExhausted = false;

/**
 * Determines which compression engine to use based on input/output formats
 *
 * Routing logic:
 * - PNG → PNG: TinyPNG API (falls back to oxipng if quota exhausted)
 * - JPG → PNG: TinyPNG API (falls back to oxipng if quota exhausted)
 * - JPG → MozJPG: mozjpeg (Squoosh)
 * - JPG → WebP: webp (Squoosh)
 * - PNG → WebP: webp (Squoosh)
 * - PNG → MozJPG: mozjpeg (Squoosh) - converts to JPEG
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
  const validInputs: InputFormat[] = ['png', 'jpg'];
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
