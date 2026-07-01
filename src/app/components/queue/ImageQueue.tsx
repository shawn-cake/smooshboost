import { useCallback, memo } from 'react';
import { QueueItem } from './QueueItem';
import type { ImageItem } from '../../types';

interface ImageQueueProps {
  images: ImageItem[];
  onDownload: (image: ImageItem) => void;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
}

/**
 * Props for the memoized queue item wrapper
 */
interface QueueItemWrapperProps {
  image: ImageItem;
  onDownload: (image: ImageItem) => void;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
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

  return (
    <QueueItem
      image={image}
      onDownload={handleDownload}
      onRemove={handleRemove}
      onRetry={onRetry ? handleRetry : undefined}
    />
  );
});

export function ImageQueue({ images, onDownload, onRemove, onRetry }: ImageQueueProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-medium text-gray-700">
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
          />
        ))}
      </div>
    </div>
  );
}
