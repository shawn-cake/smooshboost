import { useCallback } from 'react';
import type { ImageItem } from '../types';
import { downloadAsZip, downloadSingleImage } from '../services/download';

/**
 * Get the best blob for download - prefer finalBlob (with metadata) over compressedBlob
 */
function getDownloadBlob(image: ImageItem): Blob | null {
  // After boost: use finalBlob (has metadata)
  // After compression only: use compressedBlob
  // Boost-only mode: use finalBlob or original file
  return image.finalBlob || image.compressedBlob || null;
}

/**
 * Hook for handling downloads
 */
export function useDownload() {
  /**
   * Downloads all completed images as a ZIP file
   */
  const downloadAll = useCallback(async (images: ImageItem[]) => {
    const completed = images.filter(
      (img) => img.status === 'complete' && getDownloadBlob(img)
    );

    if (completed.length === 0) {
      throw new Error('No completed images to download');
    }

    await downloadAsZip(completed);
  }, []);

  /**
   * Downloads a single image
   */
  const downloadOne = useCallback((image: ImageItem) => {
    const blob = getDownloadBlob(image);
    if (image.status !== 'complete' || !blob) {
      throw new Error('Image is not ready for download');
    }

    downloadSingleImage(image);
  }, []);

  return {
    downloadAll,
    downloadOne,
  };
}
