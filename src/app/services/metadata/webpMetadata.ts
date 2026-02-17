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

  // Create a new WebP with EXIF chunk (handles VP8X flags and deduplication)
  const newBlob = await createWebpWithExif(data, exifData);

  return { blob: newBlob, applied };
}

/**
 * Create a new WebP file with EXIF chunk injected.
 * Handles:
 * - Removing any existing EXIF chunk to avoid duplicates
 * - Creating a VP8X chunk if one doesn't exist (required for extended format)
 * - Setting the EXIF flag in VP8X
 */
async function createWebpWithExif(
  originalData: Uint8Array,
  exifData: Uint8Array
): Promise<Blob> {
  // First pass: parse all chunks, remove existing EXIF, find VP8X
  const chunks: { type: Uint8Array; data: Uint8Array }[] = [];
  let vp8xIndex = -1;
  let hasVP8X = false;
  let offset = 12; // After "RIFF" + size + "WEBP"

  while (offset < originalData.length - 8) {
    const chunkType = originalData.slice(offset, offset + 4);
    const chunkSize = readUint32LE(originalData, offset + 4);
    const chunkData = originalData.slice(offset + 8, offset + 8 + chunkSize);

    // Skip existing EXIF chunks
    if (!arraysEqual(chunkType, EXIF_CHUNK)) {
      if (arraysEqual(chunkType, VP8X_CHUNK)) {
        hasVP8X = true;
        vp8xIndex = chunks.length;
      }
      chunks.push({ type: new Uint8Array(chunkType), data: chunkData });
    }

    // Move to next chunk (header + data + optional padding byte)
    offset += 8 + chunkSize + (chunkSize % 2);
  }

  // If no VP8X chunk, create one (required for EXIF support)
  if (!hasVP8X) {
    // VP8X chunk is 10 bytes: 4 bytes flags + 3 bytes width-1 + 3 bytes height-1
    // We need canvas dimensions from the image chunk
    let canvasWidth = 0;
    let canvasHeight = 0;

    // Try to read dimensions from VP8 or VP8L chunk
    for (const chunk of chunks) {
      const vp8 = new Uint8Array([0x56, 0x50, 0x38, 0x20]); // "VP8 "
      const vp8l = new Uint8Array([0x56, 0x50, 0x38, 0x4c]); // "VP8L"

      if (arraysEqual(chunk.type, vp8) && chunk.data.length >= 10) {
        // VP8 bitstream: width at byte 6-7, height at byte 8-9 (after frame tag)
        canvasWidth = (chunk.data[6] | (chunk.data[7] << 8)) & 0x3fff;
        canvasHeight = (chunk.data[8] | (chunk.data[9] << 8)) & 0x3fff;
        break;
      } else if (arraysEqual(chunk.type, vp8l) && chunk.data.length >= 5) {
        // VP8L: dimensions encoded in first 4 bytes after signature byte
        const bits = readUint32LE(chunk.data, 1);
        canvasWidth = (bits & 0x3fff) + 1;
        canvasHeight = ((bits >> 14) & 0x3fff) + 1;
        break;
      }
    }

    // Build VP8X chunk data (10 bytes)
    const vp8xData = new Uint8Array(10);
    // Flags byte: bit 3 = EXIF present
    vp8xData[0] = 0x08; // EXIF flag
    // If original is VP8L (lossless), no alpha flag needed from us
    // Canvas width - 1 (24-bit LE)
    const w = Math.max(canvasWidth - 1, 0);
    vp8xData[4] = w & 0xff;
    vp8xData[5] = (w >> 8) & 0xff;
    vp8xData[6] = (w >> 16) & 0xff;
    // Canvas height - 1 (24-bit LE)
    const h = Math.max(canvasHeight - 1, 0);
    vp8xData[7] = h & 0xff;
    vp8xData[8] = (h >> 8) & 0xff;
    vp8xData[9] = (h >> 16) & 0xff;

    // Insert VP8X at the beginning of chunks
    chunks.unshift({ type: new Uint8Array(VP8X_CHUNK), data: vp8xData });
    vp8xIndex = 0;
  } else {
    // VP8X exists — set the EXIF flag (bit 3 of the first flags byte)
    const vp8xChunk = chunks[vp8xIndex];
    if (vp8xChunk.data.length >= 4) {
      const updatedData = new Uint8Array(vp8xChunk.data);
      updatedData[0] = updatedData[0] | 0x08; // Set EXIF bit
      chunks[vp8xIndex] = { type: vp8xChunk.type, data: updatedData };
    }
  }

  // Add the new EXIF chunk (after VP8X, before image data for proper ordering)
  const exifChunk = { type: new Uint8Array(EXIF_CHUNK), data: exifData };
  // Insert right after VP8X
  chunks.splice(vp8xIndex + 1, 0, exifChunk);

  // Rebuild the WebP file
  // Calculate total RIFF payload size
  let payloadSize = 4; // "WEBP" signature
  for (const chunk of chunks) {
    payloadSize += 8 + chunk.data.length + (chunk.data.length % 2);
  }

  const newData = new Uint8Array(8 + payloadSize); // RIFF header + payload
  // RIFF header
  newData.set(RIFF_HEADER, 0);
  writeUint32LE(newData, 4, payloadSize);
  newData.set(WEBP_SIGNATURE, 8);

  // Write chunks
  let writeOffset = 12;
  for (const chunk of chunks) {
    newData.set(chunk.type, writeOffset);
    writeUint32LE(newData, writeOffset + 4, chunk.data.length);
    newData.set(chunk.data, writeOffset + 8);
    writeOffset += 8 + chunk.data.length;
    // Add padding byte if chunk size is odd
    if (chunk.data.length % 2 !== 0) {
      newData[writeOffset] = 0;
      writeOffset += 1;
    }
  }

  return new Blob([newData], { type: 'image/webp' });
}

