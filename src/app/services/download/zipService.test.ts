import { describe, it, expect } from 'vitest';
import { isDownloadable, getDownloadBlob } from './zipService';
import type { ImageItem, ImageStatus } from '../../types';

/**
 * Builds a minimal ImageItem for download-eligibility tests.
 */
function makeImage(overrides: Partial<ImageItem> = {}): ImageItem {
  const file = new File([new Uint8Array([1, 2, 3])], 'photo.png', {
    type: 'image/png',
  });
  return {
    id: 'test-id',
    file,
    name: 'photo.png',
    originalSize: 3,
    inputFormat: 'png',
    outputFormat: 'png',
    status: 'queued' as ImageStatus,
    engine: null,
    thumbnail: null,
    compressedBlob: null,
    compressedSize: null,
    error: null,
    ...overrides,
  };
}

describe('isDownloadable', () => {
  it('is false for a freshly queued image (no blob yet)', () => {
    expect(isDownloadable(makeImage())).toBe(false);
  });

  it('is false while compressing', () => {
    expect(isDownloadable(makeImage({ status: 'compressing' }))).toBe(false);
  });

  it('is true for a completed compression', () => {
    const compressedBlob = new Blob([new Uint8Array([4, 5])], {
      type: 'image/png',
    });
    expect(
      isDownloadable(makeImage({ status: 'complete', compressedBlob }))
    ).toBe(true);
  });

  it('is false for an errored image with no blob', () => {
    expect(
      isDownloadable(makeImage({ status: 'error', error: 'failed' }))
    ).toBe(false);
  });
});

describe('getDownloadBlob', () => {
  it('returns the compressed blob when present', () => {
    const compressedBlob = new Blob(['c'], { type: 'image/png' });
    expect(getDownloadBlob(makeImage({ compressedBlob }))).toBe(compressedBlob);
  });

  it('returns null when no blob is present', () => {
    expect(getDownloadBlob(makeImage())).toBeNull();
  });
});
