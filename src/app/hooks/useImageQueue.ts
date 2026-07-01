import { useState, useCallback } from 'react';
import type { ImageItem, OutputFormat, Savings } from '../types';
import { generateId, generateThumbnail, detectInputFormat } from '../utils';
import { resetTinypngQuota } from '../services/compression/compressionRouter';

/**
 * Hook for managing the image queue state
 */
export function useImageQueue() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [convertFormat, setConvertFormat] = useState<OutputFormat>('webp');

  /**
   * Adds files to the queue
   */
  const addImages = useCallback(
    async (files: File[]) => {
      const newImages: ImageItem[] = [];

      for (const file of files) {
        const inputFormat = detectInputFormat(file);
        if (!inputFormat) continue;

        // Generate thumbnail
        let thumbnail: string | null = null;
        try {
          thumbnail = await generateThumbnail(file);
        } catch {
          // Thumbnail generation failed, continue without it
        }

        newImages.push({
          id: generateId(),
          file,
          name: file.name,
          originalSize: file.size,
          inputFormat,
          outputFormat: convertFormat,
          status: 'queued',
          engine: null,
          thumbnail,
          compressedBlob: null,
          compressedSize: null,
          error: null,
        });
      }

      setImages((prev) => [...prev, ...newImages]);
    },
    [convertFormat]
  );

  /**
   * Re-tags images that haven't been compressed yet with a new output format.
   */
  const updateQueuedOutputFormat = useCallback((format: OutputFormat) => {
    setImages((prev) =>
      prev.map((img) =>
        img.status === 'queued' ? { ...img, outputFormat: format } : img
      )
    );
  }, []);

  /**
   * Removes an image from the queue
   */
  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  /**
   * Updates an image in the queue
   */
  const updateImage = useCallback(
    (id: string, updates: Partial<ImageItem>) => {
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
      );
    },
    []
  );

  /**
   * Clears all images from the queue
   */
  const clearQueue = useCallback(() => {
    setImages([]);
    resetTinypngQuota();
  }, []);

  /**
   * Gets all completed images
   */
  const getCompletedImages = useCallback(() => {
    return images.filter((img) => img.status === 'complete');
  }, [images]);

  /**
   * Gets all queued images (not yet processed)
   */
  const getQueuedImages = useCallback(() => {
    return images.filter((img) => img.status === 'queued');
  }, [images]);

  /**
   * Calculates total savings across all completed images
   */
  const getTotalSavings = useCallback((): Savings => {
    const completed = images.filter(
      (img) => img.status === 'complete' && img.compressedSize !== null
    );

    const originalSize = completed.reduce((sum, img) => sum + img.originalSize, 0);
    const compressedSize = completed.reduce(
      (sum, img) => sum + (img.compressedSize || 0),
      0
    );
    const savedBytes = originalSize - compressedSize;
    const percentage =
      originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

    return {
      originalSize,
      compressedSize,
      savedBytes,
      percentage,
    };
  }, [images]);

  /**
   * Checks if any images are currently processing
   */
  const isProcessing = images.some((img) => img.status === 'compressing');

  /**
   * Checks if the queue has any queued images
   */
  const hasQueuedImages = images.some((img) => img.status === 'queued');

  return {
    images,
    convertFormat,
    setConvertFormat,
    addImages,
    removeImage,
    updateImage,
    updateQueuedOutputFormat,
    clearQueue,
    getCompletedImages,
    getQueuedImages,
    getTotalSavings,
    isProcessing,
    hasQueuedImages,
  };
}
