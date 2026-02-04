import { useState, useCallback } from 'react';
import type { ImageItem } from '../types';
import { compressImage } from '../services/compression';

interface UseCompressionProps {
  images: ImageItem[];
  updateImage: (id: string, updates: Partial<ImageItem>) => void;
}

/**
 * Hook for processing the compression queue
 */
export function useCompression({ images, updateImage }: UseCompressionProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Processes all queued images
   */
  const processQueue = useCallback(async () => {
    const queuedImages = images.filter((img) => img.status === 'queued');

    if (queuedImages.length === 0 || isProcessing) {
      return;
    }

    setIsProcessing(true);

    // Process images sequentially to avoid overwhelming the browser
    for (const image of queuedImages) {
      // Mark as compressing
      updateImage(image.id, { status: 'compressing' });

      try {
        const result = await compressImage(
          image.file,
          image.inputFormat,
          image.outputFormat
        );

        // Mark as complete
        updateImage(image.id, {
          status: 'complete',
          compressedBlob: result.blob,
          compressedSize: result.size,
          engine: result.engine,
        });
      } catch (error) {
        // Mark as error
        const errorMessage =
          error instanceof Error ? error.message : 'Compression failed';

        updateImage(image.id, {
          status: 'error',
          error: errorMessage,
        });
      }
    }

    setIsProcessing(false);
  }, [images, updateImage, isProcessing]);

  /**
   * Retries a failed compression
   */
  const retryCompression = useCallback(
    async (id: string) => {
      const image = images.find((img) => img.id === id);
      if (!image || image.status !== 'error') return;

      // Reset to queued and reprocess
      updateImage(id, {
        status: 'queued',
        error: null,
        compressedBlob: null,
        compressedSize: null,
      });

      // Process just this image
      updateImage(id, { status: 'compressing' });

      try {
        const result = await compressImage(
          image.file,
          image.inputFormat,
          image.outputFormat
        );

        updateImage(id, {
          status: 'complete',
          compressedBlob: result.blob,
          compressedSize: result.size,
          engine: result.engine,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Compression failed';

        updateImage(id, {
          status: 'error',
          error: errorMessage,
        });
      }
    },
    [images, updateImage]
  );

  return {
    isProcessing,
    processQueue,
    retryCompression,
  };
}
