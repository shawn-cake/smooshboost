import { useState, useCallback } from 'react';
import type { ImageItem, WorkflowMode } from '../types';
import { injectMetadata, hasMetadataToInject } from '../services/metadata';

interface UseMetadataInjectionProps {
  images: ImageItem[];
  updateImage: (id: string, updates: Partial<ImageItem>) => void;
  workflowMode: WorkflowMode;
}

/**
 * Hook for processing metadata injection (Boost phase)
 * Now uses per-image metadata options
 */
export function useMetadataInjection({
  images,
  updateImage,
  workflowMode,
}: UseMetadataInjectionProps) {
  const [processingImageId, setProcessingImageId] = useState<string | null>(null);

  /**
   * Process a single image with its own metadata options
   */
  const processImageBoost = useCallback(
    async (id: string) => {
      const image = images.find((img) => img.id === id);
      if (!image) return;

      // Check if image is ready for boosting
      const isReady =
        workflowMode === 'boost-only'
          ? image.boostStatus === 'pending'
          : image.status === 'complete' && image.boostStatus === 'pending';

      if (!isReady) return;

      // Check if there's metadata to inject
      if (!hasMetadataToInject(image.metadataOptions)) {
        updateImage(id, {
          boostStatus: 'boost-skipped',
          finalBlob:
            workflowMode === 'boost-only'
              ? image.file
              : image.compressedBlob || image.file,
        });
        return;
      }

      setProcessingImageId(id);
      updateImage(id, { boostStatus: 'boosting' });

      try {
        const sourceBlob =
          workflowMode === 'boost-only'
            ? image.file
            : image.compressedBlob || image.file;

        const format =
          workflowMode === 'boost-only'
            ? image.inputFormat === 'jpg'
              ? 'mozjpg'
              : image.inputFormat
            : image.outputFormat;

        const result = await injectMetadata(
          sourceBlob,
          format,
          image.metadataOptions
        );

        updateImage(id, {
          boostStatus: 'boosted',
          finalBlob: result.blob,
          metadata: result.applied,
          metadataWarnings: result.warnings,
          boostError: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Metadata injection failed';

        updateImage(id, {
          boostStatus: 'boost-failed',
          boostError: errorMessage,
          finalBlob:
            workflowMode === 'boost-only'
              ? image.file
              : image.compressedBlob || image.file,
        });
      } finally {
        setProcessingImageId(null);
      }
    },
    [images, updateImage, workflowMode]
  );

  /**
   * Skip boost phase for a single image
   */
  const skipImageBoost = useCallback(
    (id: string) => {
      const image = images.find((img) => img.id === id);
      if (!image) return;

      updateImage(id, {
        boostStatus: 'boost-skipped',
        finalBlob:
          workflowMode === 'boost-only'
            ? image.file
            : image.compressedBlob || image.file,
      });
    },
    [images, updateImage, workflowMode]
  );

  /**
   * Skip boost phase for all pending images
   */
  const skipBoost = useCallback(() => {
    const boostableImages = images.filter((img) => {
      if (workflowMode === 'boost-only') {
        return img.boostStatus === 'pending';
      }
      return img.status === 'complete' && img.boostStatus === 'pending';
    });

    for (const image of boostableImages) {
      updateImage(image.id, {
        boostStatus: 'boost-skipped',
        finalBlob:
          workflowMode === 'boost-only'
            ? image.file
            : image.compressedBlob || image.file,
      });
    }
  }, [images, updateImage, workflowMode]);

  /**
   * Retry a failed boost for a single image
   */
  const retryBoost = useCallback(
    async (id: string) => {
      const image = images.find((img) => img.id === id);
      if (!image || image.boostStatus !== 'boost-failed') return;

      // Reset status and try again
      updateImage(id, { boostStatus: 'pending', boostError: null });
      await processImageBoost(id);
    },
    [images, updateImage, processImageBoost]
  );

  /**
   * Check if a specific image has metadata enabled
   */
  const imageHasMetadataEnabled = useCallback(
    (id: string) => {
      const image = images.find((img) => img.id === id);
      return image ? hasMetadataToInject(image.metadataOptions) : false;
    },
    [images]
  );

  return {
    processingImageId,
    isProcessing: processingImageId !== null,
    processImageBoost,
    skipImageBoost,
    skipBoost,
    retryBoost,
    imageHasMetadataEnabled,
  };
}

