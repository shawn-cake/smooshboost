import { memo } from 'react';
import { faDownload, faTrash, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../ui';
import { StatusIndicator } from './StatusIndicator';
import type { ImageItem, OutputFormat } from '../../types';
import { formatBytes, calculateSavingsPercentage } from '../../utils';
import { isDownloadable } from '../../services/download';

// Format display labels for download button
const FORMAT_LABELS: Record<OutputFormat, string> = {
  png: 'PNG',
  mozjpg: 'JPG',
  webp: 'WebP',
};

interface QueueItemProps {
  image: ImageItem;
  onDownload: () => void;
  onRemove: () => void;
  onRetry?: () => void;
}

/**
 * QueueItem component wrapped in React.memo for performance optimization.
 * Prevents unnecessary re-renders when other items in the queue update.
 */
export const QueueItem = memo(function QueueItem({
  image,
  onDownload,
  onRemove,
  onRetry,
}: QueueItemProps) {
  const isComplete = image.status === 'complete';
  const isError = image.status === 'error';
  const isProcessing = image.status === 'compressing';

  const canDownload = isDownloadable(image);

  const savings =
    isComplete && image.compressedSize
      ? calculateSavingsPercentage(image.originalSize, image.compressedSize)
      : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-4 p-3">
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
          <p className="text-xs font-medium text-gray-900 truncate font-mono">{image.name}</p>
          <p className="text-xs text-gray-500 font-mono">
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
              <span className="text-red-500 font-sans"> - {image.error}</span>
            )}
          </p>
        </div>

        {/* Status */}
        <div className="flex-shrink-0">
          <StatusIndicator status={image.status} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {canDownload && (
            <button
              type="button"
              onClick={onDownload}
              title={`Download as ${FORMAT_LABELS[image.outputFormat]}`}
              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <FontAwesomeIcon icon={faDownload} className="text-xs" />
              <span className="font-mono text-xs font-medium">{FORMAT_LABELS[image.outputFormat]}</span>
            </button>
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
    </div>
  );
});
