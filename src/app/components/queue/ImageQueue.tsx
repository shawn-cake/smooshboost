import { useCallback, memo } from 'react';
import { QueueItem } from './QueueItem';
import type { ImageItem, MetadataOptions } from '../../types';

interface ImageQueueProps {
  images: ImageItem[];
  onDownload: (image: ImageItem) => void;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
  // Boost props (always available)
  onMetadataChange?: (id: string, metadataOptions: MetadataOptions) => void;
  onApplyToAll?: (sourceId: string) => void;
  onApplyMetadata?: (id: string) => void;
  onResetMetadata?: (id: string) => void;
  processingImageId?: string | null;
  expandedImageId?: string | null;
  onToggleExpanded?: (id: string) => void;
  boostOnly?: boolean;
}

/**
 * Props for the memoized queue item wrapper
 */
interface QueueItemWrapperProps {
  image: ImageItem;
  onDownload: (image: ImageItem) => void;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
  onMetadataChange?: (id: string, metadataOptions: MetadataOptions) => void;
  onApplyToAll?: (sourceId: string) => void;
  onApplyMetadata?: (id: string) => void;
  onResetMetadata?: (id: string) => void;
  isProcessingBoost: boolean;
  isExpanded: boolean;
  onToggleExpanded?: (id: string) => void;
  boostOnly: boolean;
}

/**
 * Wrapper component that creates stable callback references for QueueItem.
 * This ensures React.memo works correctly by preventing new function references on each render.
 */
const QueueItemWrapper = memo(function QueueItemWrapper({
  image,
  onDownload,
  onRemove,
  onRetry,
  onMetadataChange,
  onApplyToAll,
  onApplyMetadata,
  onResetMetadata,
  isProcessingBoost,
  isExpanded,
  onToggleExpanded,
  boostOnly,
}: QueueItemWrapperProps) {
  // Create stable callback references using useCallback
  const handleDownload = useCallback(() => {
    onDownload(image);
  }, [onDownload, image]);

  const handleRemove = useCallback(() => {
    onRemove(image.id);
  }, [onRemove, image.id]);

  const handleRetry = useCallback(() => {
    onRetry?.(image.id);
  }, [onRetry, image.id]);

  const handleMetadataChange = useCallback(
    (opts: MetadataOptions) => {
      onMetadataChange?.(image.id, opts);
    },
    [onMetadataChange, image.id]
  );

  const handleApplyToAll = useCallback(() => {
    onApplyToAll?.(image.id);
  }, [onApplyToAll, image.id]);

  const handleApplyMetadata = useCallback(() => {
    onApplyMetadata?.(image.id);
  }, [onApplyMetadata, image.id]);

  const handleResetMetadata = useCallback(() => {
    onResetMetadata?.(image.id);
  }, [onResetMetadata, image.id]);

  const handleToggleExpanded = useCallback(() => {
    onToggleExpanded?.(image.id);
  }, [onToggleExpanded, image.id]);

  return (
    <QueueItem
      image={image}
      onDownload={handleDownload}
      onRemove={handleRemove}
      onRetry={onRetry ? handleRetry : undefined}
      onMetadataChange={onMetadataChange ? handleMetadataChange : undefined}
      onApplyToAll={onApplyToAll ? handleApplyToAll : undefined}
      onApplyMetadata={onApplyMetadata ? handleApplyMetadata : undefined}
      onResetMetadata={onResetMetadata ? handleResetMetadata : undefined}
      isProcessingBoost={isProcessingBoost}
      isExpanded={isExpanded}
      onToggleExpanded={onToggleExpanded ? handleToggleExpanded : undefined}
      boostOnly={boostOnly}
    />
  );
});

export function ImageQueue({
  images,
  onDownload,
  onRemove,
  onRetry,
  onMetadataChange,
  onApplyToAll,
  onApplyMetadata,
  onResetMetadata,
  processingImageId,
  expandedImageId,
  onToggleExpanded,
  boostOnly = false,
}: ImageQueueProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-gray-700">
        Images ({images.length})
      </h2>
      <div className="space-y-2">
        {images.map((image) => (
          <QueueItemWrapper
            key={image.id}
            image={image}
            onDownload={onDownload}
            onRemove={onRemove}
            onRetry={onRetry}
            onMetadataChange={onMetadataChange}
            onApplyToAll={onApplyToAll}
            onApplyMetadata={onApplyMetadata}
            onResetMetadata={onResetMetadata}
            isProcessingBoost={processingImageId === image.id}
            isExpanded={expandedImageId === image.id}
            onToggleExpanded={onToggleExpanded}
            boostOnly={boostOnly}
          />
        ))}
      </div>
    </div>
  );
}
