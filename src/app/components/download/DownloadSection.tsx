import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../ui';

interface DownloadSectionProps {
  onDownload: () => void;
  onClear: () => void;
  hasCompletedImages: boolean;
  isProcessing: boolean;
  isBoosting?: boolean;
  completedCount: number;
  hasMetadata?: boolean;
}

export function DownloadSection({
  onDownload,
  onClear,
  hasCompletedImages,
  isProcessing,
  isBoosting = false,
  completedCount,
  hasMetadata = false,
}: DownloadSectionProps) {
  const isSingleImage = completedCount === 1;

  // Build button text based on count and metadata status
  const getDownloadButtonText = () => {
    if (isSingleImage) {
      return hasMetadata ? 'Download with Metadata' : 'Download';
    }
    return hasMetadata
      ? `Download All with Metadata (${completedCount})`
      : `Download All (${completedCount})`;
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button
          variant="accent"
          onClick={onDownload}
          disabled={!hasCompletedImages || isProcessing || isBoosting}
          icon={faDownload}
        >
          {getDownloadButtonText()}
        </Button>
      </div>

      <Button
        variant="ghost"
        onClick={onClear}
        disabled={isProcessing}
        className="text-gray-500 hover:text-red-500"
      >
        <FontAwesomeIcon icon={faTrash} className="mr-2" />
        Clear Queue
      </Button>
    </div>
  );
}
