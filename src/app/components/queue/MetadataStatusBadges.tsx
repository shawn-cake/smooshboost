import type { AppliedMetadata, BoostStatus } from '../../types';

interface MetadataStatusBadgesProps {
  metadata: AppliedMetadata | null;
  boostStatus: BoostStatus;
}

export function MetadataStatusBadges({
  metadata,
  boostStatus,
}: MetadataStatusBadgesProps) {
  const isBoosted = boostStatus === 'boosted';

  // Format geo coordinates for display
  const formatGeo = () => {
    if (!metadata?.geoTag) return null;
    const { latitude, longitude } = metadata.geoTag;
    const latDir = latitude >= 0 ? 'N' : 'S';
    const lngDir = longitude >= 0 ? 'E' : 'W';
    return `${Math.abs(latitude).toFixed(2)}°${latDir}, ${Math.abs(longitude).toFixed(2)}°${lngDir}`;
  };

  // Format copyright for display (truncate if long)
  const formatCopyright = () => {
    if (!metadata?.copyright) return null;
    const text = metadata.copyright;
    return text.length > 20 ? `${text.substring(0, 20)}...` : text;
  };

  const geoValue = formatGeo();
  const copyrightValue = formatCopyright();
  const hasTitle = !!metadata?.title;

  // Determine colors based on boost status
  const getColor = (hasValue: boolean) => {
    if (!hasValue) return 'text-gray-400';
    return isBoosted ? 'text-success' : 'text-primary';
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {/* Geo badge */}
      <span className={getColor(!!geoValue)}>
        📍 Geo: {geoValue || 'Not set'}
      </span>

      <span className="text-gray-300">·</span>

      {/* Copyright badge */}
      <span className={getColor(!!copyrightValue)}>
        ©: {copyrightValue || 'Not set'}
      </span>

      <span className="text-gray-300">·</span>

      {/* Title badge */}
      <span className={getColor(hasTitle)}>
        📝: {hasTitle ? 'Title set' : 'Not set'}
      </span>
    </div>
  );
}

