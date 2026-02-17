import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faChevronRight,
  faCopy,
  faCheck,
  faSpinner,
  faRocket,
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import type { ImageItem, MetadataOptions } from '../../types';
import { GeoTagSection } from '../metadata/GeoTagSection';
import { CopyrightSection } from '../metadata/CopyrightSection';
import { TitleDescSection } from '../metadata/TitleDescSection';
import { Button } from '../ui';

interface ImageMetadataAccordionProps {
  image: ImageItem;
  onMetadataChange: (metadataOptions: MetadataOptions) => void;
  onApplyToAll: () => void;
  onApplyMetadata: () => void;
  onResetMetadata?: () => void;
  isExpanded: boolean;
  onToggle: () => void;
  isProcessing: boolean;
}

export function ImageMetadataAccordion({
  image,
  onMetadataChange,
  onApplyToAll,
  onApplyMetadata,
  onResetMetadata,
  isExpanded,
  onToggle,
  isProcessing,
}: ImageMetadataAccordionProps) {
  const { metadataOptions } = image;

  // Count enabled options
  const enabledCount = [
    metadataOptions.geoTagEnabled,
    metadataOptions.copyrightEnabled,
    metadataOptions.titleDescEnabled,
  ].filter(Boolean).length;

  // Check if any metadata is filled in (for enabling "Apply to All" button)
  const hasAnyMetadata =
    (metadataOptions.geoTagEnabled &&
      metadataOptions.geoTag.latitude !== null &&
      metadataOptions.geoTag.longitude !== null) ||
    (metadataOptions.copyrightEnabled &&
      (metadataOptions.copyright.text.trim() !== '' ||
        metadataOptions.copyright.author.trim() !== '')) ||
    (metadataOptions.titleDescEnabled &&
      (metadataOptions.titleDesc.title.trim() !== '' ||
        metadataOptions.titleDesc.description.trim() !== ''));

  // Check if boost is already complete
  const isBoostComplete =
    image.boostStatus === 'boosted' || image.boostStatus === 'boost-skipped';

  const handleApplyToAllClick = () => {
    if (
      window.confirm(
        'This will copy this image\'s metadata settings to all other images, replacing any existing metadata. Continue?'
      )
    ) {
      onApplyToAll();
    }
  };

  const handleApplyMetadataClick = () => {
    if (
      window.confirm('Apply metadata to this image? This action cannot be undone.')
    ) {
      onApplyMetadata();
    }
  };

  const handleResetMetadataClick = () => {
    if (
      window.confirm('Reset metadata? This will allow you to edit and re-apply metadata to this image.')
    ) {
      onResetMetadata?.();
    }
  };

  return (
    <div className="mt-2 border border-gray-200 rounded-md overflow-hidden">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={faRocket}
            className={`text-xs ${isExpanded ? 'text-primary-600' : 'text-gray-400'}`}
          />
          <span className="text-xs font-medium text-gray-700">
            Boost Options
          </span>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full font-mono">
            {enabledCount}/3
          </span>
          <FontAwesomeIcon
            icon={isExpanded ? faChevronDown : faChevronRight}
            className="text-gray-400 text-xs ml-1"
          />
        </div>
        {isBoostComplete && (
          <span className="text-xs text-success flex items-center gap-1">
            <FontAwesomeIcon icon={faCheck} />
            Applied
          </span>
        )}
      </button>

      {/* Accordion Body */}
      {isExpanded && (
        <div className="p-4 space-y-4 bg-white border-t border-gray-200">
          {/* Geo-tag Section */}
          <GeoTagSection
            enabled={metadataOptions.geoTagEnabled}
            onEnabledChange={(enabled) =>
              onMetadataChange({ ...metadataOptions, geoTagEnabled: enabled })
            }
            geoTag={metadataOptions.geoTag}
            onGeoTagChange={(geoTag) =>
              onMetadataChange({ ...metadataOptions, geoTag })
            }
            outputFormat={image.outputFormat}
            disabled={isBoostComplete}
          />

          <hr className="border-gray-200" />

          {/* Title/Description Section */}
          <TitleDescSection
            enabled={metadataOptions.titleDescEnabled}
            onEnabledChange={(enabled) =>
              onMetadataChange({ ...metadataOptions, titleDescEnabled: enabled })
            }
            titleDesc={metadataOptions.titleDesc}
            onTitleDescChange={(titleDesc) =>
              onMetadataChange({ ...metadataOptions, titleDesc })
            }
            disabled={isBoostComplete}
          />

          <hr className="border-gray-200" />

          {/* Copyright Section */}
          <CopyrightSection
            enabled={metadataOptions.copyrightEnabled}
            onEnabledChange={(enabled) =>
              onMetadataChange({ ...metadataOptions, copyrightEnabled: enabled })
            }
            copyright={metadataOptions.copyright}
            onCopyrightChange={(copyright) =>
              onMetadataChange({ ...metadataOptions, copyright })
            }
            disabled={isBoostComplete}
          />

          <hr className="border-gray-200" />

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Show Apply Metadata button when not yet applied */}
            {!isBoostComplete && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApplyMetadataClick}
                  disabled={!hasAnyMetadata || isProcessing}
                  icon={isProcessing ? faSpinner : faCheck}
                >
                  {isProcessing ? 'Applying...' : 'Apply Metadata'}
                </Button>

                {/* Apply to All Images Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleApplyToAllClick}
                  disabled={!hasAnyMetadata || isProcessing}
                  icon={faCopy}
                  className={!hasAnyMetadata ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Apply to All Images
                </Button>
              </>
            )}

            {/* Show Reset button when metadata has been applied */}
            {isBoostComplete && onResetMetadata && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetMetadataClick}
                icon={faRotateLeft}
              >
                Reset & Edit Metadata
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

