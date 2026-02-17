export interface ParsedCoordinates {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface ParseResult {
  coordinates: ParsedCoordinates | null;
  isShortUrl: boolean;
}

/**
 * Check if URL is a shortened Google Maps URL
 */
export function isShortGoogleMapsUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.includes('goo.gl/maps') ||
    trimmed.includes('maps.app.goo.gl') ||
    trimmed.includes('g.co/maps')
  );
}

/**
 * Parse Google Maps/Place URL or raw coordinates to extract coordinates
 * Supports multiple URL patterns:
 * - maps.google.com/?q=LAT,LNG
 * - google.com/maps/@LAT,LNG,ZOOM
 * - google.com/maps/place/NAME/@LAT,LNG
 * - !3d LAT !4d LNG format (embedded maps)
 * - ll=LAT,LNG format (legacy)
 * - Raw coordinates: "35.59096, -82.5610" (comma-separated)
 *
 * Note: Shortened URLs (goo.gl/maps, maps.app.goo.gl) cannot be parsed directly
 * due to browser CORS restrictions. Users need to use the full URL.
 */
export function parseGoogleMapsLink(url: string): ParsedCoordinates | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();

  // Pattern 0: Raw comma-separated coordinates (e.g., "35.59096, -82.5610")
  // This handles copy/paste from Google Maps right-click
  const rawCoordsPattern = /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/;
  const rawMatch = trimmed.match(rawCoordsPattern);
  if (rawMatch) {
    const coords = {
      latitude: parseFloat(rawMatch[1]),
      longitude: parseFloat(rawMatch[2]),
    };
    if (validateCoordinates(coords)) {
      return coords;
    }
  }

  // Pattern 1: @LAT,LNG format (most common)
  const atPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
  const atMatch = trimmed.match(atPattern);
  if (atMatch) {
    const coords = {
      latitude: parseFloat(atMatch[1]),
      longitude: parseFloat(atMatch[2]),
    };
    if (validateCoordinates(coords)) {
      return coords;
    }
  }

  // Pattern 2: ?q=LAT,LNG format
  const qPattern = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
  const qMatch = trimmed.match(qPattern);
  if (qMatch) {
    const coords = {
      latitude: parseFloat(qMatch[1]),
      longitude: parseFloat(qMatch[2]),
    };
    if (validateCoordinates(coords)) {
      return coords;
    }
  }

  // Pattern 3: !3d LAT !4d LNG format (embedded maps)
  const embedPattern = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/;
  const embedMatch = trimmed.match(embedPattern);
  if (embedMatch) {
    const coords = {
      latitude: parseFloat(embedMatch[1]),
      longitude: parseFloat(embedMatch[2]),
    };
    if (validateCoordinates(coords)) {
      return coords;
    }
  }

  // Pattern 4: ll=LAT,LNG format (legacy)
  const llPattern = /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
  const llMatch = trimmed.match(llPattern);
  if (llMatch) {
    const coords = {
      latitude: parseFloat(llMatch[1]),
      longitude: parseFloat(llMatch[2]),
    };
    if (validateCoordinates(coords)) {
      return coords;
    }
  }

  // Pattern 5: place/LAT,LNG format
  const placePattern = /place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/;
  const placeMatch = trimmed.match(placePattern);
  if (placeMatch) {
    const coords = {
      latitude: parseFloat(placeMatch[1]),
      longitude: parseFloat(placeMatch[2]),
    };
    if (validateCoordinates(coords)) {
      return coords;
    }
  }

  return null; // Could not parse coordinates
}

/**
 * Validate parsed coordinates are within valid ranges
 */
export function validateCoordinates(coords: ParsedCoordinates): boolean {
  return (
    !isNaN(coords.latitude) &&
    !isNaN(coords.longitude) &&
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(
  latitude: number,
  longitude: number
): string {
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lngDir = longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(latitude).toFixed(4)}° ${latDir}, ${Math.abs(longitude).toFixed(4)}° ${lngDir}`;
}

