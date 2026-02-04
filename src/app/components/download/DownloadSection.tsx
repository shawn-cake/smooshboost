import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../ui';

interface DownloadSectionProps {
  onDownloadAll: () => void;
  onClear: () => void;
  hasCompletedImages: boolean;
  isProcessing: boolean;
  completedCount: number;
}

export function DownloadSection({
  onDownloadAll,
  onClear,
  hasCompletedImages,
  isProcessing,
  completedCount,
}: DownloadSectionProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        variant="accent"
        onClick={onDownloadAll}
        disabled={!hasCompletedImages || isProcessing}
        icon={faDownload}
      >
        Download All ({completedCount})
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
