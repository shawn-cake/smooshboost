import type { Savings, MetadataSummary, ImageItem } from '../../types';
import { formatBytes } from '../../utils';

interface SummaryBarProps {
  savings: Savings;
  completedCount: number;
  totalCount: number;
  metadataSummary?: MetadataSummary;
  pngCount?: number;
  geoTagEnabled?: boolean;
  images?: ImageItem[];
}

// Format display names
const FORMAT_LABELS: Record<string, string> = {
  jpg: 'JPG',
  png: 'PNG',
  mozjpg: 'MozJPG',
  webp: 'WebP',
};

export function SummaryBar({
  savings,
  completedCount,
  totalCount,
  metadataSummary,
  pngCount = 0,
  geoTagEnabled = false,
  images = [],
}: SummaryBarProps) {
  const allComplete = completedCount === totalCount && totalCount > 0;

  // Build format conversion summary
  const getFormatSummaryText = () => {
    if (images.length === 0) return null;

    // Group by input → output format
    const conversions: Record<string, number> = {};
    for (const img of images) {
      const key = `${img.inputFormat}→${img.outputFormat}`;
      conversions[key] = (conversions[key] || 0) + 1;
    }

    const parts: string[] = [];
    for (const [key, count] of Object.entries(conversions)) {
      const [input, output] = key.split('→');
      const inputLabel = FORMAT_LABELS[input] || input.toUpperCase();
      const outputLabel = FORMAT_LABELS[output] || output.toUpperCase();
      parts.push(`${count} ${inputLabel} → ${outputLabel}`);
    }

    return parts.length > 0 ? parts.join(', ') : null;
  };

  // Build metadata summary text
  const getMetadataSummaryText = () => {
    if (!metadataSummary) return null;
    const parts: string[] = [];
    if (metadataSummary.geoTaggedCount > 0) {
      parts.push(`${metadataSummary.geoTaggedCount} geo-tagged`);
    }
    if (metadataSummary.copyrightCount > 0) {
      parts.push(`${metadataSummary.copyrightCount} with copyright`);
    }
    if (metadataSummary.titleCount > 0) {
      parts.push(`${metadataSummary.titleCount} with titles`);
    }
    return parts.length > 0 ? parts.join(' · ') : null;
  };

  const formatText = getFormatSummaryText();
  const metadataText = getMetadataSummaryText();

  // Show PNG geo-tag warning if geo-tagging is enabled and there are PNGs
  const showPngGeoWarning = geoTagEnabled && pngCount > 0;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Images</p>
            <p className="text-lg font-semibold text-gray-900 font-mono">
              {completedCount}/{totalCount}
            </p>
          </div>

          {savings.originalSize > 0 && (
            <>
              <div className="h-8 w-px bg-gray-300" />

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Original</p>
                <p className="text-lg font-semibold text-gray-900 font-mono">
                  {formatBytes(savings.originalSize)}
                </p>
              </div>

              <div className="text-gray-400">→</div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Compressed</p>
                <p className="text-lg font-semibold text-green-600 font-mono">
                  {formatBytes(savings.compressedSize)}
                </p>
              </div>

              <div className="h-8 w-px bg-gray-300" />

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Saved</p>
                <p className="text-lg font-semibold text-green-600 font-mono">
                  {savings.percentage}%
                </p>
              </div>
            </>
          )}
        </div>

        {allComplete && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              All complete
            </span>
          </div>
        )}
      </div>

      {/* Format conversion summary row */}
      {formatText && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <span className="font-medium">Format:</span> {formatText}
          </p>
        </div>
      )}

      {/* Metadata summary row */}
      {metadataText && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <span className="font-medium">Metadata:</span> {metadataText}
          </p>
        </div>
      )}

      {/* PNG geo-tag warning */}
      {showPngGeoWarning && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-amber-600">
            <span className="font-medium">⚠ Note:</span> {pngCount} PNG image{pngCount !== 1 ? 's' : ''} cannot have geo-location data. PNG does not support GPS coordinates.
          </p>
        </div>
      )}
    </div>
  );
}
