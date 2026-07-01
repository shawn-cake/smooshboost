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
  it('tags new images with the selected convert format (webp default)', async () => {
    const { result } = renderHook(() => useImageQueue());

    await act(async () => {
      await result.current.addImages([makeFile('photo.png', 'image/png')]);
    });

    expect(result.current.images).toHaveLength(1);
    expect(result.current.images[0].outputFormat).toBe('webp');
  });

  it('honors a changed convert format for subsequent adds', async () => {
    const { result } = renderHook(() => useImageQueue());

    act(() => {
      result.current.setConvertFormat('png');
    });

    await act(async () => {
      await result.current.addImages([makeFile('photo.jpg', 'image/jpeg')]);
    });

    expect(result.current.images[0].outputFormat).toBe('png');
  });
});

describe('useImageQueue.updateQueuedOutputFormat', () => {
  it('re-tags queued images with the new format', async () => {
    const { result } = renderHook(() => useImageQueue());

    await act(async () => {
      await result.current.addImages([makeFile('photo.png', 'image/png')]);
    });

    act(() => {
      result.current.updateQueuedOutputFormat('mozjpg');
    });

    expect(result.current.images[0].outputFormat).toBe('mozjpg');
  });

  it('leaves already-compressed images untouched', async () => {
    const { result } = renderHook(() => useImageQueue());

    await act(async () => {
      await result.current.addImages([makeFile('photo.png', 'image/png')]);
    });

    act(() => {
      result.current.updateImage(result.current.images[0].id, {
        status: 'complete',
      });
    });

    act(() => {
      result.current.updateQueuedOutputFormat('mozjpg');
    });

    expect(result.current.images[0].outputFormat).toBe('webp');
  });
});
