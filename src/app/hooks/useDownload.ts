import { useCallback } from 'react';
import type { ImageItem } from '../types';
import {
  downloadAsZip,
  downloadSingleImage,
  isDownloadable,
} from '../services/download';

/**
 * Hook for handling downloads
 */
export function useDownload() {
  /**
   * Downloads all ready images as a ZIP file
   */
  const downloadAll = useCallback(async (images: ImageItem[]) => {
    const ready = images.filter((img) => isDownloadable(img));

    if (ready.length === 0) {
      throw new Error('No completed images to download');
    }

    await downloadAsZip(ready);
  }, []);

  /**
   * Downloads a single image
   */
  const downloadOne = useCallback((image: ImageItem) => {
    if (!isDownloadable(image)) {
      throw new Error('Image is not ready for download');
    }

    downloadSingleImage(image);
  }, []);

  return {
    downloadAll,
    downloadOne,
  };
}
