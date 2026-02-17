import { decodeImageToImageData } from '../../utils/fileHelpers';
import type { OutputFormat, CompressionEngine } from '../../types';

/**
 * MozJPEG encoder options matching Squoosh defaults
 * https://github.com/GoogleChromeLabs/squoosh/blob/dev/src/features/encoders/mozJPEG/shared/meta.ts
 */
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

/**
 * WebP encoder options
 */
const WEBP_OPTIONS = {
  quality: 75,
};

/**
 * OxiPNG optimizer options
 */
const OXIPNG_OPTIONS = {
  level: 2, // Optimization level (1-6, higher = slower but smaller)
};

/**
 * Dynamically imports and encodes image as MozJPEG
 */
async function encodeToJpeg(imageData: ImageData): Promise<ArrayBuffer> {
  const { encode } = await import('@jsquash/jpeg');
  return encode(imageData, MOZJPEG_OPTIONS);
}

/**
 * Dynamically imports and encodes image as WebP
 */
async function encodeToWebp(imageData: ImageData): Promise<ArrayBuffer> {
  const { encode } = await import('@jsquash/webp');
  return encode(imageData, WEBP_OPTIONS);
}

/**
 * Dynamically imports and optimizes PNG with OxiPNG
 * Returns ArrayBuffer for consistent typing with other encoders
 */
async function optimizePng(pngBuffer: ArrayBuffer): Promise<ArrayBuffer> {
  const { optimise } = await import('@jsquash/oxipng');
  // oxipng accepts ArrayBuffer directly
  const result = await optimise(pngBuffer, OXIPNG_OPTIONS);
  // Copy result to a new ArrayBuffer (avoids SharedArrayBuffer issues in TS 5.9)
  const resultArray = new Uint8Array(result);
  const outputBuffer = new ArrayBuffer(resultArray.byteLength);
  new Uint8Array(outputBuffer).set(resultArray);
  return outputBuffer;
}

/**
 * Compresses an image using the appropriate jSquash codec
 * Codecs are dynamically imported to reduce initial bundle size
 */
export async function compressWithSquoosh(
  file: File,
  outputFormat: OutputFormat
): Promise<{ blob: Blob; engine: CompressionEngine }> {
  console.log(`[Compression] Starting: ${file.name} -> ${outputFormat}`);

  // Decode the image to ImageData
  const imageData = await decodeImageToImageData(file);
  console.log(`[Compression] Decoded: ${imageData.width}x${imageData.height}`);

  let resultData: ArrayBuffer;
  let mimeType: string;
  let engine: CompressionEngine;

  switch (outputFormat) {
    case 'mozjpg': {
      // Dynamically load and encode as MozJPEG
      resultData = await encodeToJpeg(imageData);
      mimeType = 'image/jpeg';
      engine = 'mozjpeg';
      break;
    }

    case 'webp': {
      // Dynamically load and encode as WebP
      resultData = await encodeToWebp(imageData);
      mimeType = 'image/webp';
      engine = 'webp';
      break;
    }

    case 'png': {
      // For PNG, we need to first get the PNG data, then optimize it
      // Convert ImageData to PNG using canvas
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      ctx.putImageData(imageData, 0, 0);

      // Get PNG blob from canvas
      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create PNG blob'));
          },
          'image/png'
        );
      });

      // Convert to ArrayBuffer and dynamically load oxipng
      const pngBuffer = await pngBlob.arrayBuffer();
      resultData = await optimizePng(pngBuffer);
      mimeType = 'image/png';
      engine = 'oxipng';
      break;
    }

    default:
      throw new Error(`Unsupported output format: ${outputFormat}`);
  }

  const resultBlob = new Blob([resultData], { type: mimeType });
  console.log(`[Compression] Complete: ${file.name} -> ${resultBlob.size} bytes (${engine})`);

  return {
    blob: resultBlob,
    engine,
  };
}
