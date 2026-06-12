import { describe, it, expect } from 'vitest';
import { isDownloadable, getDownloadBlob } from './zipService';
import type { ImageItem, ImageStatus, BoostStatus } from '../../types';
import { DEFAULT_METADATA_OPTIONS } from '../../types';

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
    boostStatus: 'pending' as BoostStatus,
    boostError: null,
    finalBlob: null,
    metadata: null,
    metadataWarnings: [],
    metadataOptions: structuredClone(DEFAULT_METADATA_OPTIONS),
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

  it('is true for a completed compression (smoosh mode)', () => {
    const compressedBlob = new Blob([new Uint8Array([4, 5])], {
      type: 'image/png',
    });
    expect(
      isDownloadable(makeImage({ status: 'complete', compressedBlob }))
    ).toBe(true);
  });

  // Regression: boost-only images keep status 'queued' (compression never
  // runs) and become downloadable only via finalBlob. A status === 'complete'
  // check would wrongly exclude them.
  it('is true for a boost-only image after boosting (status stays queued)', () => {
    const finalBlob = new Blob([new Uint8Array([6, 7])], { type: 'image/png' });
    expect(
      isDownloadable(
        makeImage({ status: 'queued', boostStatus: 'boosted', finalBlob })
      )
    ).toBe(true);
  });

  it('is true for a boost-only image that skipped boost (finalBlob = original)', () => {
    const file = new File([new Uint8Array([8])], 'photo.png', {
      type: 'image/png',
    });
    expect(
      isDownloadable(
        makeImage({
          status: 'queued',
          boostStatus: 'boost-skipped',
          finalBlob: file,
        })
      )
    ).toBe(true);
  });

  it('is false for a boost-only image still pending boost', () => {
    expect(
      isDownloadable(makeImage({ status: 'queued', boostStatus: 'pending' }))
    ).toBe(false);
  });
});

describe('getDownloadBlob', () => {
  it('prefers finalBlob over compressedBlob', () => {
    const compressedBlob = new Blob(['c'], { type: 'image/png' });
    const finalBlob = new Blob(['f'], { type: 'image/png' });
    expect(getDownloadBlob(makeImage({ compressedBlob, finalBlob }))).toBe(
      finalBlob
    );
  });

  it('falls back to compressedBlob when no finalBlob', () => {
    const compressedBlob = new Blob(['c'], { type: 'image/png' });
    expect(getDownloadBlob(makeImage({ compressedBlob }))).toBe(compressedBlob);
  });

  it('returns null when no blobs are present', () => {
    expect(getDownloadBlob(makeImage())).toBeNull();
  });
});
