import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../ui';

interface DownloadSectionProps {
  onDownload: () => void;
  onClear: () => void;
  hasCompletedImages: boolean;
  isProcessing: boolean;
  completedCount: number;
}

export function DownloadSection({
  onDownload,
  onClear,
  hasCompletedImages,
  isProcessing,
  completedCount,
}: DownloadSectionProps) {
  const isSingleImage = completedCount === 1;
  const buttonText = isSingleImage ? 'Download' : `Download All (${completedCount})`;

  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        variant="accent"
        onClick={onDownload}
        disabled={!hasCompletedImages || isProcessing}
        icon={faDownload}
      >
        {buttonText}
      </Button>

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
