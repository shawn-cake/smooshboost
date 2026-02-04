import { faDownload, faTrash, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../ui';
import { StatusIndicator } from './StatusIndicator';
import type { ImageItem } from '../../types';
import { formatBytes, calculateSavingsPercentage } from '../../utils';

interface QueueItemProps {
  image: ImageItem;
  onDownload: () => void;
  onRemove: () => void;
  onRetry?: () => void;
}

export function QueueItem({ image, onDownload, onRemove, onRetry }: QueueItemProps) {
  const isComplete = image.status === 'complete';
  const isError = image.status === 'error';
  const isProcessing = image.status === 'compressing';

  const savings =
    isComplete && image.compressedSize
      ? calculateSavingsPercentage(image.originalSize, image.compressedSize)
      : null;

  return (
    <div className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg">
      {/* Thumbnail */}
      <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
        {image.thumbnail ? (
          <img
            src={image.thumbnail}
            alt={image.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            IMG
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{image.name}</p>
        <p className="text-xs text-gray-500">
          {formatBytes(image.originalSize)}
          {isComplete && image.compressedSize && (
            <>
              {' → '}
              <span className="text-green-600">{formatBytes(image.compressedSize)}</span>
              {savings !== null && savings > 0 && (
                <span className="text-green-600 font-medium"> ({savings}% saved)</span>
              )}
            </>
          )}
          {isError && image.error && (
            <span className="text-red-500"> - {image.error}</span>
          )}
        </p>
      </div>

      {/* Status */}
      <div className="flex-shrink-0">
        <StatusIndicator status={image.status} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isComplete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            icon={faDownload}
            title="Download"
          >
            <span className="sr-only">Download</span>
          </Button>
        )}
        {isError && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            icon={faRotateRight}
            title="Retry"
          >
            <span className="sr-only">Retry</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={isProcessing}
          icon={faTrash}
          title="Remove"
          className="text-gray-400 hover:text-red-500"
        >
          <span className="sr-only">Remove</span>
        </Button>
      </div>
    </div>
  );
}
