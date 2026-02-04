import { QueueItem } from './QueueItem';
import type { ImageItem } from '../../types';

interface ImageQueueProps {
  images: ImageItem[];
  onDownload: (image: ImageItem) => void;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
}

export function ImageQueue({ images, onDownload, onRemove, onRetry }: ImageQueueProps) {
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
          />
        ))}
      </div>
    </div>
  );
}
