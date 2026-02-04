import { encode as encodeJpeg } from '@jsquash/jpeg';
import { encode as encodeWebp } from '@jsquash/webp';
import { optimise as optimisePng } from '@jsquash/oxipng';
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
 * Compresses an image using the appropriate jSquash codec
 */
export async function compressWithSquoosh(
  file: File,
  outputFormat: OutputFormat
): Promise<{ blob: Blob; engine: CompressionEngine }> {
  console.log(`[Compression] Starting: ${file.name} -> ${outputFormat}`);

  // Decode the image to ImageData
  const imageData = await decodeImageToImageData(file);
  console.log(`[Compression] Decoded: ${imageData.width}x${imageData.height}`);

  let resultData: ArrayBuffer | Uint8Array;
  let mimeType: string;
  let engine: CompressionEngine;

  switch (outputFormat) {
    case 'mozjpg': {
      // Encode as MozJPEG with Squoosh defaults
      resultData = await encodeJpeg(imageData, MOZJPEG_OPTIONS);
      mimeType = 'image/jpeg';
      engine = 'mozjpeg';
      break;
    }

    case 'webp': {
      // Encode as WebP
      resultData = await encodeWebp(imageData, WEBP_OPTIONS);
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

      // Convert to ArrayBuffer and optimize with oxipng
      const pngBuffer = await pngBlob.arrayBuffer();
      const optimizedPng = await optimisePng(new Uint8Array(pngBuffer), OXIPNG_OPTIONS);
      // oxipng returns Uint8Array, ensure we have proper data
      resultData = optimizedPng;
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
