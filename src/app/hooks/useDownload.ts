import { useCallback } from 'react';
import type { ImageItem } from '../types';
import { downloadAsZip, downloadSingleImage } from '../services/download';

/**
 * Hook for handling downloads
 */
export function useDownload() {
  /**
   * Downloads all completed images as a ZIP file
   */
  const downloadAll = useCallback(async (images: ImageItem[]) => {
    const completed = images.filter(
      (img) => img.status === 'complete' && img.compressedBlob
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
    if (image.status !== 'complete' || !image.compressedBlob) {
      throw new Error('Image is not ready for download');
    }

    downloadSingleImage(image);
  }, []);

  return {
    downloadAll,
    downloadOne,
  };
}
