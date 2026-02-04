import type { AppliedMetadata, MetadataOptions, GeoTag } from '../../types';
import { buildExifBytes } from './jpgMetadata';

/**
 * WebP file structure constants
 */
const RIFF_HEADER = new Uint8Array([0x52, 0x49, 0x46, 0x46]); // "RIFF"
const WEBP_SIGNATURE = new Uint8Array([0x57, 0x45, 0x42, 0x50]); // "WEBP"
const VP8X_CHUNK = new Uint8Array([0x56, 0x50, 0x38, 0x58]); // "VP8X"
const EXIF_CHUNK = new Uint8Array([0x45, 0x58, 0x49, 0x46]); // "EXIF"

/**
 * Read 32-bit little-endian value from buffer
 */
function readUint32LE(data: Uint8Array, offset: number): number {
  return (
    data[offset] |
    (data[offset + 1] << 8) |
    (data[offset + 2] << 16) |
    (data[offset + 3] << 24)
  ) >>> 0;
}

/**
 * Write 32-bit little-endian value to buffer
 */
function writeUint32LE(data: Uint8Array, offset: number, value: number): void {
  data[offset] = value & 0xff;
  data[offset + 1] = (value >> 8) & 0xff;
  data[offset + 2] = (value >> 16) & 0xff;
  data[offset + 3] = (value >> 24) & 0xff;
}

/**
 * Check if two Uint8Arrays are equal
 */
function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Inject EXIF metadata into a WebP image
 * WebP supports full EXIF including GPS coordinates
 */
export async function injectWebpMetadata(
  blob: Blob,
  options: MetadataOptions
): Promise<{ blob: Blob; applied: AppliedMetadata }> {
  const applied: AppliedMetadata = {
    geoTag: null,
    copyright: null,
    title: null,
    description: null,
  };

  const buffer = await blob.arrayBuffer();
  const data = new Uint8Array(buffer);

  // Validate WebP format
  if (
    !arraysEqual(data.slice(0, 4), RIFF_HEADER) ||
    !arraysEqual(data.slice(8, 12), WEBP_SIGNATURE)
  ) {
    throw new Error('Invalid WebP file format');
  }

  // Build metadata to inject
  const exifOptions: {
    geoTag?: GeoTag;
    copyright?: string;
    author?: string;
    title?: string;
    description?: string;
  } = {};

  if (
    options.geoTagEnabled &&
    options.geoTag.latitude !== null &&
    options.geoTag.longitude !== null
  ) {
    exifOptions.geoTag = {
      latitude: options.geoTag.latitude,
      longitude: options.geoTag.longitude,
      address: options.geoTag.address || undefined,
    };
    applied.geoTag = exifOptions.geoTag;
  }

  if (options.copyrightEnabled && options.copyright.text) {
    exifOptions.copyright = options.copyright.text;
    applied.copyright = options.copyright.text;
  }

  if (options.copyrightEnabled && options.copyright.author) {
    exifOptions.author = options.copyright.author;
  }

  if (options.titleDescEnabled) {
    if (options.titleDesc.title) {
      exifOptions.title = options.titleDesc.title;
      applied.title = options.titleDesc.title;
    }
    if (options.titleDesc.description) {
      exifOptions.description = options.titleDesc.description;
      applied.description = options.titleDesc.description;
    }
  }

  // If no metadata to inject, return original
  if (Object.keys(exifOptions).length === 0) {
    return { blob, applied };
  }

  // Build EXIF data
  const exifData = buildExifBytes(exifOptions);

  // For simplicity, we'll create a new WebP with EXIF chunk
  // This is a simplified approach - full implementation would parse VP8X flags
  const newBlob = await createWebpWithExif(data, exifData);

  return { blob: newBlob, applied };
}

/**
 * Create a new WebP file with EXIF chunk injected
 * Simplified implementation that adds EXIF chunk after VP8X or image data
 */
async function createWebpWithExif(
  originalData: Uint8Array,
  exifData: Uint8Array
): Promise<Blob> {
  // Find insertion point for EXIF chunk
  let insertPosition = 12; // After "RIFF" + size + "WEBP"
  let offset = 12;

  while (offset < originalData.length - 8) {
    const chunkType = originalData.slice(offset, offset + 4);
    const chunkSize = readUint32LE(originalData, offset + 4);

    if (arraysEqual(chunkType, VP8X_CHUNK)) {
      // Found VP8X chunk - insert EXIF after it
      insertPosition = offset + 8 + chunkSize + (chunkSize % 2); // After VP8X
      break;
    }

    // Move to next chunk (chunk header + data + padding)
    offset += 8 + chunkSize + (chunkSize % 2);
  }

  // Calculate EXIF chunk size (must be even, add padding if needed)
  const exifChunkSize = exifData.length;
  const exifPadding = exifChunkSize % 2;
  const exifChunkTotalSize = 8 + exifChunkSize + exifPadding;

  // Create new buffer
  const newSize = originalData.length + exifChunkTotalSize;
  const newData = new Uint8Array(newSize);

  // Copy data before insertion point
  newData.set(originalData.slice(0, insertPosition), 0);

  // Write EXIF chunk
  let writeOffset = insertPosition;
  newData.set(EXIF_CHUNK, writeOffset);
  writeUint32LE(newData, writeOffset + 4, exifChunkSize);
  newData.set(exifData, writeOffset + 8);
  writeOffset += exifChunkTotalSize;

  // Copy remaining data
  newData.set(originalData.slice(insertPosition), writeOffset);

  // Update RIFF size (total file size - 8)
  writeUint32LE(newData, 4, newSize - 8);

  return new Blob([newData], { type: 'image/webp' });
}

