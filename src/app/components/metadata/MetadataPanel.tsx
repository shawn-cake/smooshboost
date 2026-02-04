import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faSpinner } from '@fortawesome/free-solid-svg-icons';
import type { MetadataOptions, OutputFormat } from '../../types';
import { GeoTagSection } from './GeoTagSection';
import { CopyrightSection } from './CopyrightSection';
import { TitleDescSection } from './TitleDescSection';
import { Button } from '../ui';

interface MetadataPanelProps {
  options: MetadataOptions;
  onOptionsChange: (options: MetadataOptions) => void;
  outputFormat?: OutputFormat;
  disabled?: boolean;
  // Apply metadata action
  onApplyMetadata?: () => void;
  isApplying?: boolean;
  applyProgress?: { current: number; total: number };
  hasMetadataEnabled?: boolean;
  hasImages?: boolean;
}

export function MetadataPanel({
  options,
  onOptionsChange,
  outputFormat,
  disabled = false,
  onApplyMetadata,
  isApplying = false,
  applyProgress,
  hasMetadataEnabled = false,
  hasImages = false,
}: MetadataPanelProps) {
  // Count enabled options
  const enabledCount = [
    options.geoTagEnabled,
    options.copyrightEnabled,
    options.titleDescEnabled,
  ].filter(Boolean).length;

  // Get button text
  const getApplyButtonText = () => {
    if (isApplying && applyProgress) {
      return `Applying Metadata... ${applyProgress.current} of ${applyProgress.total}`;
    }
    return 'Apply Metadata';
  };

  return (
    <div
      className={`border border-gray-200 rounded-lg overflow-hidden ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50">
        <span className="text-base font-semibold text-gray-800">
          Boost Options
        </span>
        <span className="text-sm text-gray-500">({enabledCount}/3)</span>
      </div>

      {/* Body - always visible */}
      <div className="px-5 py-5 space-y-6 bg-white border-t border-gray-200">
        {/* Geo-location section */}
        <GeoTagSection
          enabled={options.geoTagEnabled}
          onEnabledChange={(enabled) =>
            onOptionsChange({ ...options, geoTagEnabled: enabled })
          }
          geoTag={options.geoTag}
          onGeoTagChange={(geoTag) => onOptionsChange({ ...options, geoTag })}
          outputFormat={outputFormat}
        />

        {/* Copyright section */}
        <CopyrightSection
          enabled={options.copyrightEnabled}
          onEnabledChange={(enabled) =>
            onOptionsChange({ ...options, copyrightEnabled: enabled })
          }
          copyright={options.copyright}
          onCopyrightChange={(copyright) =>
            onOptionsChange({ ...options, copyright })
          }
        />

        {/* Title & Description section */}
        <TitleDescSection
          enabled={options.titleDescEnabled}
          onEnabledChange={(enabled) =>
            onOptionsChange({ ...options, titleDescEnabled: enabled })
          }
          titleDesc={options.titleDesc}
          onTitleDescChange={(titleDesc) =>
            onOptionsChange({ ...options, titleDesc })
          }
        />

        {/* Apply Metadata Button */}
        {onApplyMetadata && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="accent"
              onClick={onApplyMetadata}
              disabled={isApplying || !hasMetadataEnabled || !hasImages}
              className="w-full"
            >
              <FontAwesomeIcon
                icon={isApplying ? faSpinner : faTag}
                className={`mr-2 ${isApplying ? 'animate-spin' : ''}`}
              />
              {getApplyButtonText()}
            </Button>
            {!hasMetadataEnabled && hasImages && (
              <p className="mt-2 text-xs text-gray-500 text-center">
                Enable at least one metadata option above
              </p>
            )}
            {!hasImages && (
              <p className="mt-2 text-xs text-gray-500 text-center">
                Upload images first to apply metadata
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

