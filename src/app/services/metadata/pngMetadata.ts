import encode from 'png-chunks-encode';
import extract from 'png-chunks-extract';
import text from 'png-chunk-text';
import type { AppliedMetadata, MetadataOptions } from '../../types';

/**
 * PNG text chunk interface
 */
interface PngChunk {
  name: string;
  data: Uint8Array;
}

/**
 * Inject text metadata into a PNG image via tEXt chunks
 * Note: PNG does NOT support GPS coordinates - only text metadata
 */
export async function injectPngMetadata(
  blob: Blob,
  options: MetadataOptions
): Promise<{ blob: Blob; applied: AppliedMetadata; warnings: string[] }> {
  const applied: AppliedMetadata = {
    geoTag: null,
    copyright: null,
    title: null,
    description: null,
  };
  const warnings: string[] = [];

  // Add warning if GPS was requested for PNG
  if (
    options.geoTagEnabled &&
    options.geoTag.latitude !== null &&
    options.geoTag.longitude !== null
  ) {
    warnings.push(
      'GPS coordinates cannot be embedded in PNG files. Consider using JPG or WebP for geo-tagged images.'
    );
  }

  const buffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);

  // Extract existing chunks
  const chunks: PngChunk[] = extract(uint8Array);

  // Find the position of IEND chunk (must be last)
  const iendIndex = chunks.findIndex((chunk) => chunk.name === 'IEND');
  if (iendIndex === -1) {
    throw new Error('Invalid PNG: missing IEND chunk');
  }

  // Remove any existing text chunks with our keywords to avoid duplicates
  const keywords = ['Copyright', 'Title', 'Description', 'Author'];
  const filteredChunks = chunks.filter(
    (chunk) =>
      chunk.name !== 'tEXt' ||
      !keywords.some((keyword) => {
        const chunkText = new TextDecoder().decode(chunk.data);
        return chunkText.startsWith(keyword);
      })
  );

  // Re-find IEND position after filtering
  const newIendIndex = filteredChunks.findIndex(
    (chunk) => chunk.name === 'IEND'
  );

  // Create text chunks for metadata
  const textChunks: PngChunk[] = [];

  if (options.copyrightEnabled && options.copyright.text) {
    textChunks.push(text.encode('Copyright', options.copyright.text));
    applied.copyright = options.copyright.text;
  }

  if (options.copyrightEnabled && options.copyright.author) {
    textChunks.push(text.encode('Author', options.copyright.author));
  }

  if (options.titleDescEnabled && options.titleDesc.title) {
    textChunks.push(text.encode('Title', options.titleDesc.title));
    applied.title = options.titleDesc.title;
  }

  if (options.titleDescEnabled && options.titleDesc.description) {
    textChunks.push(text.encode('Description', options.titleDesc.description));
    applied.description = options.titleDesc.description;
  }

  // Insert text chunks before IEND
  if (textChunks.length > 0) {
    filteredChunks.splice(newIendIndex, 0, ...textChunks);
  }

  // Re-encode PNG
  const newPngData = encode(filteredChunks);
  const newBlob = new Blob([newPngData], { type: 'image/png' });

  return { blob: newBlob, applied, warnings };
}

