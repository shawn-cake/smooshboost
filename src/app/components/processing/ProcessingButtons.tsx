import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../ui';

interface ProcessingButtonsProps {
  // Queue state
  hasImages: boolean;
  // Processing state
  isCompressing: boolean;
  compressProgress?: { current: number; total: number };
  // Staged state — images waiting for the user to confirm format and start
  stagedCount?: number;
  formatLabel?: string;
  onSmoosh?: () => void;
}

/**
 * Shows the Smoosh confirmation button while images are staged, and the
 * compression progress indicator while compressing.
 * Boost phase buttons are now in DownloadSection.
 */
export function ProcessingButtons({
  hasImages,
  isCompressing,
  compressProgress,
  stagedCount = 0,
  formatLabel,
  onSmoosh,
}: ProcessingButtonsProps) {
  if (!hasImages) return null;

  // Staged images waiting for confirmation
  if (!isCompressing && stagedCount > 0 && onSmoosh) {
    return (
      <div className="w-full">
        <Button variant="primary" size="lg" className="w-full" onClick={onSmoosh}>
          Smoosh {stagedCount} image{stagedCount !== 1 ? 's' : ''}
          {formatLabel ? ` to ${formatLabel}` : ''}
        </Button>
      </div>
    );
  }

  // Only show progress when compressing
  if (!isCompressing || !compressProgress) return null;

  const progressPercent = Math.round(
    (compressProgress.current / compressProgress.total) * 100
  );

  return (
    <div className="w-full">
      {/* Compression Progress Status Bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin text-primary-500"
            />
            <span>Compressing images...</span>
          </div>
          <span className="text-xs font-medium text-gray-700 font-mono">
            {compressProgress.current} of {compressProgress.total}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
