import { useState, useCallback, useEffect, useRef } from 'react';
import type { ImageItem } from '../types';
import { compressImage } from '../services/compression';

interface UseCompressionProps {
  images: ImageItem[];
  updateImage: (id: string, updates: Partial<ImageItem>) => void;
  autoStart?: boolean; // Whether to auto-start compression when queued images are detected
}

/**
 * Hook for processing the compression queue
 */
export function useCompression({ images, updateImage, autoStart = false }: UseCompressionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false); // Use ref to avoid stale closure issues
  const imagesRef = useRef(images); // Keep a ref to current images

  // Keep imagesRef in sync with images
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  /**
   * Processes all queued images using the ref for current state
   */
  const processQueue = useCallback(async () => {
    // Get queued images from the ref (current state)
    const queuedImages = imagesRef.current.filter((img) => img.status === 'queued');

    if (queuedImages.length === 0 || isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;
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

    isProcessingRef.current = false;
    setIsProcessing(false);

    // Check if more images were added while processing
    const newQueuedImages = imagesRef.current.filter((img) => img.status === 'queued');
    if (newQueuedImages.length > 0 && autoStart) {
      // Recursively process new images
      processQueue();
    }
  }, [updateImage, autoStart]);

  /**
   * Auto-start compression when queued images are detected
   */
  useEffect(() => {
    if (!autoStart) return;

    const hasQueuedImages = images.some((img) => img.status === 'queued');

    if (hasQueuedImages && !isProcessingRef.current) {
      processQueue();
    }
  }, [images, autoStart, processQueue]);

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
