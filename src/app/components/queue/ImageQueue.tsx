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
          <QueueItem
            key={image.id}
            image={image}
            onDownload={() => onDownload(image)}
            onRemove={() => onRemove(image.id)}
            onRetry={onRetry ? () => onRetry(image.id) : undefined}
            onMetadataChange={
              onMetadataChange
                ? (opts) => onMetadataChange(image.id, opts)
                : undefined
            }
            onApplyToAll={onApplyToAll ? () => onApplyToAll(image.id) : undefined}
            onApplyMetadata={
              onApplyMetadata ? () => onApplyMetadata(image.id) : undefined
            }
            onResetMetadata={
              onResetMetadata ? () => onResetMetadata(image.id) : undefined
            }
            isProcessingBoost={processingImageId === image.id}
            isExpanded={expandedImageId === image.id}
            onToggleExpanded={
              onToggleExpanded ? () => onToggleExpanded(image.id) : undefined
            }
            boostOnly={boostOnly}
          />
        ))}
      </div>
    </div>
  );
}
