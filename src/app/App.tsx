import { useCallback } from 'react';
import { Toaster, toast } from 'sonner';

// Components
import { Footer } from './components/layout';
import { UploadZone } from './components/upload';
import { FormatSelector } from './components/format';
import { ImageQueue } from './components/queue';
import { SummaryBar } from './components/summary';
import { DownloadSection } from './components/download';
import { ProcessingButtons } from './components/processing';

// Hooks
import {
  useFileValidation,
  useImageQueue,
  useCompression,
  useDownload,
  useFigmaPluginReceiver,
} from './hooks';

// Types
import type { ImageItem, OutputFormat } from './types';
import { MAX_BATCH_SIZE, FORMAT_OPTIONS } from './types';

// Utils
import { isDownloadable } from './services/download';

function App() {
  // File validation
  const { validateBatch, filterValidFiles } = useFileValidation();

  // Image queue state
  const {
    images,
    convertFormat,
    setConvertFormat,
    addImages,
    removeImage,
    updateImage,
    updateQueuedOutputFormat,
    clearQueue,
    getTotalSavings,
  } = useImageQueue();

  // Compression processing — staged flow: images queue up and compression
  // starts only when the user confirms the output format via the Smoosh button
  const {
    isProcessing: isCompressing,
    processQueue,
    retryCompression,
  } = useCompression({
    images,
    updateImage,
    autoStart: false,
  });

  // Download handling
  const { downloadAll, downloadOne } = useDownload();

  // Computed states
  const compressProgress = isCompressing
    ? {
        current: images.filter((img) => img.status === 'complete').length,
        total: images.length,
      }
    : undefined;

  // Handle file selection
  // Note: Images are staged as 'queued' — compression starts when the user
  // confirms via the Smoosh button (see handleSmoosh)
  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      // Validate batch
      const validation = validateBatch(files, images.length);

      if (!validation.valid) {
        // Show first error
        toast.error(validation.errors[0]);
        return;
      }

      // Filter valid files and show errors for invalid ones (includes magic byte check)
      const { valid, errors } = await filterValidFiles(files);

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

  // Start compression of all staged images
  const handleSmoosh = useCallback(() => {
    processQueue();
  }, [processQueue]);

  // Changing the format re-tags any staged (not yet compressed) images
  const handleConvertFormatChange = useCallback(
    (format: OutputFormat) => {
      setConvertFormat(format);
      updateQueuedOutputFormat(format);
    },
    [setConvertFormat, updateQueuedOutputFormat]
  );

  // Figma plugin bridge — receives exported files via postMessage
  useFigmaPluginReceiver(handleFilesSelected);

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

  // Get downloadable images
  const getDownloadableImages = useCallback(() => {
    return images.filter((img) => isDownloadable(img));
  }, [images]);

  // Handle download (single image or ZIP for multiple)
  const handleDownload = useCallback(async () => {
    try {
      const downloadable = getDownloadableImages();
      if (downloadable.length === 0) {
        toast.error('No images ready for download');
        return;
      }
      if (downloadable.length === 1) {
        downloadOne(downloadable[0]);
      } else {
        await downloadAll(downloadable);
        toast.success('Downloaded all images');
      }
    } catch {
      toast.error('Failed to download images');
    }
  }, [getDownloadableImages, downloadOne, downloadAll]);

  // Handle clear queue
  const handleClearQueue = useCallback(() => {
    clearQueue();
    toast.info('Queue cleared');
  }, [clearQueue]);

  // Calculate stats
  const savings = getTotalSavings();
  const downloadableImages = getDownloadableImages();
  const hasDownloadableImages = downloadableImages.length > 0;

  // Staged images awaiting the Smoosh confirmation
  const stagedCount = images.filter((img) => img.status === 'queued').length;
  const formatLabel = FORMAT_OPTIONS.find((opt) => opt.value === convertFormat)?.label;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="max-w-[45rem] mx-auto px-6 flex-1 w-full flex flex-col">

        {images.length === 0 ? (
          /* Empty state — open, full-height layout */
          <div className="flex-1 flex flex-col gap-4 py-8">
            <FormatSelector
              convertFormat={convertFormat}
              onConvertFormatChange={handleConvertFormatChange}
              disabled={isCompressing}
            />
            <UploadZone
              variant="open"
              onFilesSelected={handleFilesSelected}
              disabled={isCompressing}
              maxFiles={MAX_BATCH_SIZE}
              currentCount={images.length}
            />
          </div>
        ) : (
          /* Queue state — compact upload zone + image list */
          <div className="py-8 space-y-6">
            <FormatSelector
              convertFormat={convertFormat}
              onConvertFormatChange={handleConvertFormatChange}
              disabled={isCompressing}
            />

            <UploadZone
              onFilesSelected={handleFilesSelected}
              disabled={isCompressing}
              maxFiles={MAX_BATCH_SIZE}
              currentCount={images.length}
            />

            <ImageQueue
              images={images}
              onDownload={handleDownloadOne}
              onRemove={removeImage}
              onRetry={retryCompression}
            />

            {/* Processing Buttons - Smoosh confirmation + compression progress */}
            <ProcessingButtons
              hasImages={images.length > 0}
              isCompressing={isCompressing}
              compressProgress={compressProgress}
              stagedCount={stagedCount}
              formatLabel={formatLabel}
              onSmoosh={handleSmoosh}
            />

            {/* Summary Bar */}
            <SummaryBar
              savings={savings}
              completedCount={downloadableImages.length}
              totalCount={images.length}
              images={images}
            />

            {/* Download Section */}
            <DownloadSection
              onDownload={handleDownload}
              onClear={handleClearQueue}
              hasCompletedImages={hasDownloadableImages}
              isProcessing={isCompressing}
              completedCount={downloadableImages.length}
            />
          </div>
        )}
      </main>

      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "'Spline Sans Mono', monospace",
          },
        }}
      />

      <Footer />
    </div>
  );
}

export default App;
