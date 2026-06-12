import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// generateThumbnail relies on Image.onload, which never fires in jsdom and
// would hang addImages. Mock just that function; keep the rest real.
vi.mock('../utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils')>();
  return {
    ...actual,
    generateThumbnail: vi.fn().mockResolvedValue('data:image/jpeg;base64,thumb'),
  };
});

import { useImageQueue } from './useImageQueue';

function makeFile(name: string, type: string): File {
  return new File([new Uint8Array([1, 2, 3])], name, { type });
}

describe('useImageQueue.addImages output format', () => {
  it('boost-only: PNG keeps PNG output regardless of convert format', async () => {
    const { result } = renderHook(() => useImageQueue());

    // Default convertFormat is 'webp' — a non-boost upload would convert to webp.
    await act(async () => {
      await result.current.addImages([makeFile('photo.png', 'image/png')], true);
    });

    expect(result.current.images).toHaveLength(1);
    expect(result.current.images[0].outputFormat).toBe('png');
  });

  it('boost-only: JPG maps to mozjpg (.jpg extension)', async () => {
    const { result } = renderHook(() => useImageQueue());

    await act(async () => {
      await result.current.addImages([makeFile('photo.jpg', 'image/jpeg')], true);
    });

    expect(result.current.images[0].outputFormat).toBe('mozjpg');
  });

  it('boost-only: WebP keeps WebP output', async () => {
    const { result } = renderHook(() => useImageQueue());

    await act(async () => {
      await result.current.addImages([makeFile('photo.webp', 'image/webp')], true);
    });

    expect(result.current.images[0].outputFormat).toBe('webp');
  });

  it('non-boost: still honors the selected convert format', async () => {
    const { result } = renderHook(() => useImageQueue());

    // Default mode is convert + 'webp'
    await act(async () => {
      await result.current.addImages([makeFile('photo.png', 'image/png')], false);
    });

    expect(result.current.images[0].outputFormat).toBe('webp');
  });
});
