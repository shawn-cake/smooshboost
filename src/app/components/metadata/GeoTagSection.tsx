import { useState } from 'react';
import type { MetadataOptions, OutputFormat } from '../../types';
import { FORMAT_CAPABILITIES } from '../../types';
import { parseGoogleMapsLink } from '../../utils/googleMapsParser';

interface GeoTagSectionProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  geoTag: MetadataOptions['geoTag'];
  onGeoTagChange: (geoTag: MetadataOptions['geoTag']) => void;
  outputFormat?: OutputFormat;
  disabled?: boolean;
}

export function GeoTagSection({
  enabled,
  onEnabledChange,
  geoTag,
  onGeoTagChange,
  outputFormat,
  disabled = false,
}: GeoTagSectionProps) {
  const [autoFilled, setAutoFilled] = useState(false);

  // Check if format supports geo-tagging
  const formatKey = outputFormat === 'mozjpg' ? 'jpg' : outputFormat || 'jpg';
  const supportsGeoTag = FORMAT_CAPABILITIES[formatKey]?.geoTag ?? true;

  // Handle maps link change - try to auto-parse on input
  const handleMapsLinkChange = (value: string) => {
    // Try to parse immediately
    const result = parseGoogleMapsLink(value);
    if (result) {
      setAutoFilled(true);
      // Update with parsed coordinates
      onGeoTagChange({
        ...geoTag,
        mapsLink: value,
        latitude: result.latitude,
        longitude: result.longitude,
        address: result.address,
      });
      // Clear auto-filled indicator after 2 seconds
      setTimeout(() => setAutoFilled(false), 2000);
    } else {
      // Just update the link, clear coordinates if invalid
      onGeoTagChange({
        ...geoTag,
        mapsLink: value,
        latitude: null,
        longitude: null,
      });
    }
  };

  const formatCoordinate = (value: number | null, isLat: boolean): string => {
    if (value === null) return '';
    const abs = Math.abs(value);
    const dir = isLat ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
    return `${abs.toFixed(4)}° ${dir}`;
  };

  const hasValidCoords =
    geoTag.latitude !== null && geoTag.longitude !== null;

  // Check if geo-location is enabled but incomplete (no valid coordinates)
  const isIncomplete = enabled && !hasValidCoords;

  // If format doesn't support geo-tagging (PNG), show only the warning message
  if (!supportsGeoTag) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 px-3 py-2 bg-accent-50 border border-accent-100 rounded-md">
          <span className="text-accent-700 text-sm">
            ⚠ PNG does not support GPS coordinates. Switch to JPG or WebP
            for geo-tagged images.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-60' : ''}`}>
      {/* Checkbox */}
      <label className={`flex items-center gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary-100 disabled:opacity-50"
        />
        <span className="text-sm font-medium text-gray-700">
          Add geo-location (Local SEO)
        </span>
      </label>

      {/* Expanded content */}
      {enabled && (
        <div className="ml-7 space-y-4">
          {/* Google Maps Link or Coordinates */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Google Maps Link or Coordinates:
            </label>
            <input
              type="text"
              value={geoTag.mapsLink}
              onChange={(e) => handleMapsLinkChange(e.target.value)}
              placeholder="Paste link or coordinates (e.g., 35.5951, -82.5515)"
              disabled={disabled}
              readOnly={disabled}
              className={`w-full px-3 py-2 text-sm border rounded-md
                       placeholder:text-gray-400 focus:border-primary focus:outline-none
                       focus:ring-2 focus:ring-primary-100
                       ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                       ${isIncomplete ? 'border-accent-400' : 'border-gray-300'}`}
            />
            {autoFilled && (
              <p className="text-xs text-success">✓ Coordinates auto-filled</p>
            )}
            {/* Disclaimer about shortened URLs */}
            <p className="text-xs text-gray-500">
              Shortened URLs (goo.gl, maps.app.goo.gl) cannot be parsed. Use the full URL from your browser address bar.
            </p>
          </div>

          {/* Current coordinates display with labels */}
          {hasValidCoords && (
            <div className="flex gap-6 text-sm font-mono text-primary bg-primary-50 px-3 py-2 rounded-md">
              <div>
                <span className="text-xs text-gray-500 font-sans">Latitude:</span>{' '}
                <span>{formatCoordinate(geoTag.latitude, true)}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-sans">Longitude:</span>{' '}
                <span>{formatCoordinate(geoTag.longitude, false)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

