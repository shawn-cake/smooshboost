import { useState, useCallback, useEffect } from 'react';
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
  useMetadataInjection,
  useFigmaPluginReceiver,
} from './hooks';

// Types
import type { ImageItem, OutputFormat, WorkflowMode } from './types';
import { MAX_BATCH_SIZE, FORMAT_OPTIONS } from './types';

// Utils
import { isDownloadable } from './services/download';

function App() {
  // Boost Only toggle state (replaces workflow mode selector)
  const [boostOnly, setBoostOnly] = useState(false);
  // Derive workflow mode from boostOnly toggle
  const workflowMode: WorkflowMode = boostOnly ? 'boost-only' : 'smoosh-only';

  // Track which accordion is expanded (one at a time)
  const [expandedImageId, setExpandedImageId] = useState<string | null>(null);

  // File validation
  const { validateBatch, filterValidFiles } = useFileValidation();

  // Image queue state
  const {
    images,
    setFormatMode,
    convertFormat,
    setConvertFormat,
    addImages,
    removeImage,
    updateImage,
    updateQueuedOutputFormat,
    updateImageMetadata,
    applyMetadataToAll,
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

  // Metadata injection processing (per-image)
  const {
    isProcessing: isBoosting,
    processingImageId,
    processImageBoost,
  } = useMetadataInjection({
    images,
    updateImage,
    workflowMode,
  });

  // Download handling
  const { downloadAll, downloadOne } = useDownload();

  // Computed states
  const isProcessing = isCompressing || isBoosting;
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
        await addImages(valid, boostOnly);
        toast.success(`Added ${valid.length} image${valid.length !== 1 ? 's' : ''}`);
      }
    },
    [images.length, boostOnly, validateBatch, filterValidFiles, addImages]
  );

  // Start compression of all staged images
  const handleSmoosh = useCallback(() => {
    processQueue();
  }, [processQueue]);

  // Changing the format re-tags any staged (not yet compressed) images
  const handleConvertFormatChange = useCallback(
    (format: OutputFormat) => {
      setConvertFormat(format);
      if (!boostOnly) {
        updateQueuedOutputFormat(format);
      }
    },
    [boostOnly, setConvertFormat, updateQueuedOutputFormat]
  );

  // Toggling Boost Only re-tags staged images: boost-only output must match
  // the input format (no conversion happens), normal mode uses the selector
  const handleBoostOnlyChange = useCallback(
    (value: boolean) => {
      setBoostOnly(value);
      updateQueuedOutputFormat(value ? 'match' : convertFormat);
    },
    [convertFormat, updateQueuedOutputFormat]
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

  // Get downloadable images — an item has a download blob only once it has
  // reached a terminal state in either workflow (see isDownloadable)
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
    setExpandedImageId(null);
    toast.info('Queue cleared');
  }, [clearQueue]);

  // Handle accordion toggle (one at a time)
  const handleToggleExpanded = useCallback((id: string) => {
    setExpandedImageId((prev) => (prev === id ? null : id));
  }, []);

  // Auto-expand first image in boost-only mode when images are added
  useEffect(() => {
    if (boostOnly && images.length > 0 && expandedImageId === null) {
      setExpandedImageId(images[0].id);
    }
  }, [boostOnly, images, expandedImageId]);

  // Handle apply metadata to all (with toast notification)
  const handleApplyToAll = useCallback(
    (sourceId: string) => {
      applyMetadataToAll(sourceId);
      toast.success('Metadata settings applied to all images');
    },
    [applyMetadataToAll]
  );

  // Handle reset metadata for a single image
  const handleResetMetadata = useCallback(
    (id: string) => {
      updateImage(id, {
        boostStatus: 'pending',
        boostError: null,
        finalBlob: null,
        metadata: null,
        metadataWarnings: [],
      });
      toast.info('Metadata reset - you can now edit and re-apply');
    },
    [updateImage]
  );

  // Calculate stats
  const savings = getTotalSavings();
  const downloadableImages = getDownloadableImages();
  const hasDownloadableImages = downloadableImages.length > 0;

  // Staged images awaiting the Smoosh confirmation (boost-only skips compression)
  const stagedCount = boostOnly
    ? 0
    : images.filter((img) => img.status === 'queued').length;
  const formatLabel = FORMAT_OPTIONS.find((opt) => opt.value === convertFormat)?.label;

  // Calculate metadata summary
  const metadataSummary = {
    geoTaggedCount: images.filter((img) => img.metadata?.geoTag).length,
    copyrightCount: images.filter((img) => img.metadata?.copyright).length,
    titleCount: images.filter((img) => img.metadata?.title).length,
  };
  const hasAnyMetadata =
    metadataSummary.geoTaggedCount > 0 ||
    metadataSummary.copyrightCount > 0 ||
    metadataSummary.titleCount > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="max-w-[45rem] mx-auto px-6 flex-1 w-full flex flex-col">

        {images.length === 0 ? (
          /* Empty state — open, full-height layout */
          <div className="flex-1 flex flex-col gap-4 py-8">
            <FormatSelector
              onFormatModeChange={setFormatMode}
              convertFormat={convertFormat}
              onConvertFormatChange={handleConvertFormatChange}
              disabled={isProcessing}
              boostOnly={boostOnly}
              onBoostOnlyChange={handleBoostOnlyChange}
            />
            <UploadZone
              variant="open"
              onFilesSelected={handleFilesSelected}
              disabled={isProcessing}
              maxFiles={MAX_BATCH_SIZE}
              currentCount={images.length}
            />
          </div>
        ) : (
          /* Queue state — compact upload zone + image list */
          <div className="py-8 space-y-6">
            <FormatSelector
              onFormatModeChange={setFormatMode}
              convertFormat={convertFormat}
              onConvertFormatChange={handleConvertFormatChange}
              disabled={isProcessing}
              boostOnly={boostOnly}
              onBoostOnlyChange={handleBoostOnlyChange}
            />

            <UploadZone
              onFilesSelected={handleFilesSelected}
              disabled={isProcessing}
              maxFiles={MAX_BATCH_SIZE}
              currentCount={images.length}
            />

            <ImageQueue
              images={images}
              onDownload={handleDownloadOne}
              onRemove={removeImage}
              onRetry={retryCompression}
              onMetadataChange={updateImageMetadata}
              onApplyToAll={handleApplyToAll}
              onApplyMetadata={processImageBoost}
              onResetMetadata={handleResetMetadata}
              processingImageId={processingImageId}
              expandedImageId={expandedImageId}
              onToggleExpanded={handleToggleExpanded}
              boostOnly={boostOnly}
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
              metadataSummary={hasAnyMetadata ? metadataSummary : undefined}
              pngCount={images.filter((img) => img.outputFormat === 'png').length}
              geoTagEnabled={images.some((img) => img.metadataOptions.geoTagEnabled)}
              images={images}
            />

            {/* Download Section */}
            <DownloadSection
              onDownload={handleDownload}
              onClear={handleClearQueue}
              hasCompletedImages={hasDownloadableImages}
              isProcessing={isProcessing}
              isBoosting={isBoosting}
              completedCount={downloadableImages.length}
              hasMetadata={hasAnyMetadata}
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
