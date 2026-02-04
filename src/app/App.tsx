import { useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';

// Components
import { Header, Footer } from './components/layout';
import { UploadZone } from './components/upload';
import { FormatSelector } from './components/format';
import { ImageQueue } from './components/queue';
import { SummaryBar } from './components/summary';
import { DownloadSection } from './components/download';

// Hooks
import {
  useFileValidation,
  useImageQueue,
  useCompression,
  useDownload,
} from './hooks';

// Types
import type { ImageItem } from './types';
import { MAX_BATCH_SIZE } from './types';

function App() {
  // File validation
  const { validateBatch, filterValidFiles } = useFileValidation();

  // Image queue state
  const {
    images,
    formatMode,
    setFormatMode,
    convertFormat,
    setConvertFormat,
    addImages,
    removeImage,
    updateImage,
    clearQueue,
    getCompletedImages,
    getTotalSavings,
    hasQueuedImages,
  } = useImageQueue();

  // Compression processing
  const { isProcessing, processQueue, retryCompression } = useCompression({
    images,
    updateImage,
  });

  // Download handling
  const { downloadAll, downloadOne } = useDownload();

  // Auto-start compression when images are added
  useEffect(() => {
    if (hasQueuedImages && !isProcessing) {
      processQueue();
    }
  }, [hasQueuedImages, isProcessing, processQueue]);

  // Handle file selection
  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      // Validate batch
      const validation = validateBatch(files, images.length);

      if (!validation.valid) {
        // Show first error
        toast.error(validation.errors[0]);
        return;
      }

      // Filter valid files and show errors for invalid ones
      const { valid, errors } = filterValidFiles(files);

      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error));
      }

      if (valid.length > 0) {
        await addImages(valid);
        toast.success(`Added ${valid.length} image${valid.length !== 1 ? 's' : ''}`);
      }
    },
    [images.length, validateBatch, filterValidFiles, addImages]
  );

  // Handle single image download
  const handleDownloadOne = useCallback(
    (image: ImageItem) => {
      try {
        downloadOne(image);
      } catch {
        toast.error('Failed to download image');
      }
    },
    [downloadOne]
  );

  // Handle download all
  const handleDownloadAll = useCallback(async () => {
    try {
      const completed = getCompletedImages();
      await downloadAll(completed);
      toast.success('Downloaded all images');
    } catch {
      toast.error('Failed to download images');
    }
  }, [getCompletedImages, downloadAll]);

  // Handle clear queue
  const handleClearQueue = useCallback(() => {
    clearQueue();
    toast.info('Queue cleared');
  }, [clearQueue]);

  // Calculate stats
  const savings = getTotalSavings();
  const completedImages = getCompletedImages();
  const hasCompletedImages = completedImages.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="max-w-[720px] mx-auto px-6 py-8 space-y-6 flex-1 w-full">
        {/* Upload Zone */}
        <UploadZone
          onFilesSelected={handleFilesSelected}
          disabled={isProcessing}
          maxFiles={MAX_BATCH_SIZE}
          currentCount={images.length}
        />

        {/* Format Selector */}
        <FormatSelector
          formatMode={formatMode}
          onFormatModeChange={setFormatMode}
          convertFormat={convertFormat}
          onConvertFormatChange={setConvertFormat}
          disabled={isProcessing || images.length > 0}
        />

        {/* Image Queue */}
        {images.length > 0 && (
          <>
            <ImageQueue
              images={images}
              onDownload={handleDownloadOne}
              onRemove={removeImage}
              onRetry={retryCompression}
            />

            {/* Summary Bar */}
            <SummaryBar
              savings={savings}
              completedCount={completedImages.length}
              totalCount={images.length}
            />

            {/* Download Section */}
            <DownloadSection
              onDownloadAll={handleDownloadAll}
              onClear={handleClearQueue}
              hasCompletedImages={hasCompletedImages}
              isProcessing={isProcessing}
              completedCount={completedImages.length}
            />
          </>
        )}
      </main>

      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "'Roboto', sans-serif",
          },
        }}
      />

      <Footer />
    </div>
  );
}

export default App;
