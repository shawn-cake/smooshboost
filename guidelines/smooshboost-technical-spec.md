# SmooshBoost - Technical Specification

**Tagline:** Smoosh & Boost Images

## Architecture Overview

SmooshBoost follows a streamlined processing pipeline with auto-compression and per-image metadata:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   UPLOAD    │ →  │   SMOOSH    │ →  │    BOOST    │ →  Download
│   Phase     │    │   (Auto)    │    │  (Per Image)│
└─────────────┘    └─────────────┘    └─────────────┘
     Files          Auto-compress      🚀 Accordion
     Validation     Engine routing     per image
                    Size reduction     GPS, Copyright
```

### Workflow

| Phase | Description |
|-------|-------------|
| **Smoosh** | ✅ Auto-compress on upload |
| **Boost** | ✅ Per-image metadata injection |

### Streamlined Processing

1. **Upload** — Files added to queue
2. **Auto-Compress** — Compression starts automatically
3. **Per-Image Boost** — Each image has a 🚀 accordion with metadata options
4. **Apply Metadata** — Click per image, fields become read-only
5. **Download** — Individual or ZIP download

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 18 with TypeScript 5.9 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Compression | @jsquash libraries (MozJPEG, OxiPNG, WebP via WASM) - dynamically imported |
| Metadata (JPG/WebP) | piexifjs (EXIF writing) |
| Metadata (PNG) | png-chunk-text, png-chunks-encode, png-chunks-extract (tEXt chunks) |
| Geo Parsing | Google Maps link regex (no API required) |
| ZIP Generation | JSZip |
| Icons | FontAwesome |
| Toasts | Sonner |
| Hosting | Static (Vercel, Netlify, etc.) |

---

## Design Tokens (Tailwind CSS v4)

> **Note:** This project uses **Tailwind CSS v4** with CSS-based theme configuration in `src/styles/index.css` (using `@theme` blocks), not a JavaScript `tailwind.config.js` file. The token values below are provided as reference.

### Color Tokens

| Token | Value |
|-------|-------|
| `--color-primary` | `#4074A8` |
| `--color-primary-50` | `#EBF1F7` |
| `--color-primary-100` | `#D1E0EE` |
| `--color-primary-200` | `#A3C1DD` |
| `--color-primary-700` | `#2D5276` |
| `--color-primary-900` | `#1A3044` |
| `--color-accent` | `#F2A918` |
| `--color-accent-50` | `#FEF7E6` |
| `--color-accent-100` | `#FDE9B8` |
| `--color-accent-700` | `#B87D0E` |
| `--color-success` | `#059669` |
| `--color-success-light` | `#D1FAE5` |
| `--color-error` | `#DC2626` |
| `--color-error-light` | `#FEE2E2` |
| `--color-gray-50` | `#F9FAFB` |
| `--color-gray-100` | `#F3F4F6` |
| `--color-gray-200` | `#E5E7EB` |
| `--color-gray-300` | `#D1D5DB` |
| `--color-gray-400` | `#9CA3AF` |
| `--color-gray-500` | `#6B7280` |
| `--color-gray-600` | `#4B5563` |
| `--color-gray-700` | `#374151` |
| `--color-gray-800` | `#1F2937` |
| `--color-gray-900` | `#111827` |

### Typography Tokens

| Token | Value |
|-------|-------|
| `--font-sans` | `Roboto Mono, SF Mono, Fira Code, Consolas, monospace` (body font) |
| `--font-mono` | `Roboto Mono, SF Mono, Fira Code, Consolas, monospace` (same as sans) |
| `--font-heading` | `Syne, sans-serif` (headings only, via `font-heading` utility) |

**Fluid root font-size:** `clamp(16px, calc(16px + (100vw - 1024px) * 3.2 / 176), 19.2px)` — scales from 100% at ≤1024px to 120% at ≥1200px.

**Font size downshift convention:** Roboto Mono body text is downshifted one Tailwind class (text-sm → text-xs, text-base → text-sm, text-lg → text-base). Syne headings are NOT downshifted.

### Spacing, Radius, Shadow Tokens

| Token | Value |
|-------|-------|
| `--spacing-1` | `0.25rem` (4px at base) |
| `--spacing-2` | `0.5rem` (8px at base) |
| `--spacing-3` | `0.75rem` (12px at base) |
| `--spacing-4` | `1rem` (16px at base) |
| `--spacing-5` | `1.25rem` (20px at base) |
| `--spacing-6` | `1.5rem` (24px at base) |
| `--spacing-8` | `2rem` (32px at base) |
| `--spacing-10` | `2.5rem` (40px at base) |
| `--spacing-12` | `3rem` (48px at base) |
| `--radius-sm` | `4px` |
| `--radius-DEFAULT` | `6px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.05)` |
| `--shadow-DEFAULT` | `0 1px 3px rgba(0, 0, 0, 0.1)` |
| `--shadow-md` | `0 4px 6px rgba(0, 0, 0, 0.1)` |
| `--shadow-lg` | `0 10px 15px rgba(0, 0, 0, 0.1)` |
| `--shadow-xl` | `0 25px 50px rgba(0, 0, 0, 0.25)` |
| `--transition-duration` | `150ms` |
| `--transition-timing` | `ease-in-out` |

---

## Data Structures

### Image Item
```typescript
interface ImageItem {
  id: string;                              // Unique identifier (UUID)
  file: File;                              // Original file object
  name: string;                            // Original filename
  originalSize: number;                    // Size in bytes
  inputFormat: 'png' | 'jpg' | 'webp';     // Detected input format
  outputFormat: 'png' | 'mozjpg' | 'webp'; // Target output format

  // Processing state
  status: ImageStatus;
  engine: 'tinypng' | 'oxipng' | 'mozjpeg' | 'webp' | null;  // CompressionEngine type

  // Smoosh phase results
  compressedSize: number | null;
  compressedBlob: Blob | null;

  // Boost phase tracking
  boostStatus: BoostStatus;
  boostError: string | null;

  // Final results
  finalBlob: Blob | null;                  // After metadata injection
  thumbnail: string | null;                // Data URL for preview

  // Metadata applied
  metadata: AppliedMetadata | null;
  metadataWarnings: string[];              // Format compatibility warnings

  // Error handling
  error: string | null;
}

type ImageStatus =
  | 'queued'
  | 'compressing'
  | 'compressed'       // Awaiting Boost phase
  | 'boosting'
  | 'complete'
  | 'error';

type BoostStatus =
  | 'pending'          // Not yet boosted
  | 'boosting'         // Currently injecting metadata
  | 'boosted'          // Metadata successfully applied
  | 'boost-skipped'    // User skipped Boost phase
  | 'boost-failed';    // Metadata injection failed

interface AppliedMetadata {
  geoTag: GeoTag | null;
  copyright: string | null;
  title: string | null;
  description: string | null;
}

interface GeoTag {
  latitude: number;
  longitude: number;
  altitude?: number;
  address?: string;              // Human-readable address
  source?: 'manual' | 'maps-link' | 'places-api';  // How coordinates were obtained
}
```

### Metadata Options (User Input)
```typescript
interface MetadataOptions {
  geoTagEnabled: boolean;
  geoTag: {
    mapsLink: string;            // Google Maps/Place URL for parsing
    address: string;             // User input (autocomplete) or parsed
    latitude: number | null;
    longitude: number | null;
  };

  copyrightEnabled: boolean;
  copyright: {
    text: string;                // e.g., "© 2026 Client Name"
    author: string;              // e.g., "Client Name"
  };

  titleDescEnabled: boolean;
  titleDesc: {
    title: string;
    description: string;
  };
}
```

### App State

> **Note:** There is no single `AppState` interface. State is managed via composable React hooks:
> - `useImageQueue` — image list, add/remove/update operations
> - `useCompression` — auto-compression on upload, engine routing, progress
> - `useMetadataInjection` — per-image metadata injection via accordion UI
> - `useDownload` — individual file download and ZIP archive generation
>
> Each hook encapsulates its own state and exposes actions/selectors to the `App.tsx` component.

### Client Preset (Future)
```typescript
interface ClientPreset {
  id: string;
  name: string;                  // e.g., "Acme Corp"
  createdAt: Date;
  updatedAt: Date;
  
  defaultMetadata: {
    copyright: string;
    geoTag: GeoTag | null;
  };
}
```

---

## API Integration Details

### TinyPNG API

#### Authentication
```
Authorization: Basic base64(api:YOUR_API_KEY)
```

#### Compress Request
```http
POST https://api.tinify.com/shrink
Content-Type: image/png
Authorization: Basic [base64 encoded key]

[binary image data]
```

#### Response (Success)
```json
{
  "input": {
    "size": 1478,
    "type": "image/png"
  },
  "output": {
    "size": 912,
    "type": "image/png",
    "width": 100,
    "height": 100,
    "ratio": 0.617,
    "url": "https://api.tinify.com/output/..."
  }
}
```

#### Quota Tracking
```
Response Header: Compression-Count: 42
```

On 429 error or `Compression-Count >= 500`:
- Set `tinypngQuotaExhausted = true`
- Route subsequent PNG→PNG to Squoosh
- Notify user

### Google Maps Link Parsing (Primary - No API Cost)

Extract coordinates from Google Maps/Place URLs without API calls.

```typescript
interface ParsedCoordinates {
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * Parse Google Maps/Place URL to extract coordinates
 * Supports multiple URL patterns:
 * - maps.google.com/?q=LAT,LNG
 * - google.com/maps/@LAT,LNG,ZOOM
 * - google.com/maps/place/NAME/@LAT,LNG
 * - Plus codes: google.com/maps/place/849V+XW
 */
function parseGoogleMapsLink(url: string): ParsedCoordinates | null {
  // Pattern 1: @LAT,LNG format (most common)
  const atPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
  const atMatch = url.match(atPattern);
  if (atMatch) {
    return {
      latitude: parseFloat(atMatch[1]),
      longitude: parseFloat(atMatch[2]),
    };
  }

  // Pattern 2: ?q=LAT,LNG format
  const qPattern = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
  const qMatch = url.match(qPattern);
  if (qMatch) {
    return {
      latitude: parseFloat(qMatch[1]),
      longitude: parseFloat(qMatch[2]),
    };
  }

  // Pattern 3: !3d LAT !4d LNG format (embedded maps)
  const embedPattern = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/;
  const embedMatch = url.match(embedPattern);
  if (embedMatch) {
    return {
      latitude: parseFloat(embedMatch[1]),
      longitude: parseFloat(embedMatch[2]),
    };
  }

  // Pattern 4: ll=LAT,LNG format (legacy)
  const llPattern = /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
  const llMatch = url.match(llPattern);
  if (llMatch) {
    return {
      latitude: parseFloat(llMatch[1]),
      longitude: parseFloat(llMatch[2]),
    };
  }

  return null; // Could not parse coordinates
}

/**
 * Validate parsed coordinates are within valid ranges
 */
function validateCoordinates(coords: ParsedCoordinates): boolean {
  return (
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
}
```

### Google Places API (Optional Enhancement)

For address autocomplete functionality (requires API key).

#### Address Autocomplete
```javascript
const autocomplete = new google.maps.places.Autocomplete(inputElement, {
  types: ['address'],
  fields: ['formatted_address', 'geometry']
});

autocomplete.addListener('place_changed', () => {
  const place = autocomplete.getPlace();
  const lat = place.geometry.location.lat();
  const lng = place.geometry.location.lng();
});
```

#### Geocoding (Address → Coordinates)
```javascript
async function geocodeAddress(address: string): Promise<GeoTag> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
  );
  const data = await response.json();

  if (data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry.location;
    return {
      latitude: lat,
      longitude: lng,
      address: data.results[0].formatted_address,
      source: 'places-api'
    };
  }
  throw new Error('Address not found');
}
```

### @jsquash Client-Side Compression

Compression codecs are dynamically imported from `@jsquash` packages (WASM-based, runs in browser):

#### MozJPEG Encoding
```typescript
const { encode } = await import('@jsquash/jpeg');
const result = await encode(imageData, { quality: 75, progressive: true, ... });
```

#### WebP Encoding
```typescript
const { encode } = await import('@jsquash/webp');
const result = await encode(imageData, { quality: 75 });
```

#### OxiPNG Optimization (Fallback for PNG)
```typescript
const { optimise } = await import('@jsquash/oxipng');
const result = await optimise(pngBuffer, { level: 2 });
```

---

## Metadata Injection Implementation

### Format Capabilities Matrix

| Metadata Type | JPG/MozJPG | PNG | WebP |
|---------------|------------|-----|------|
| Geo-tagging (GPS coordinates) | ✅ Full support via EXIF | ❌ No support | ✅ Full support via EXIF chunk |
| Copyright | ✅ Full support via EXIF | ✅ Supported via tEXt chunks | ✅ Full support via EXIF chunk |
| Title/Description | ✅ Full support via EXIF | ✅ Supported via tEXt chunks | ✅ Full support via EXIF chunk |

**Technical Notes:**
- **JPG/MozJPG:** Full EXIF support including GPS coordinates via piexifjs
- **PNG:** Text metadata via tEXt chunks (copyright, title, description) but no GPS coordinate support
- **WebP:** Full EXIF support including GPS coordinates via EXIF chunk injection

---

### Format Capability Validation

```typescript
interface FormatCapabilities {
  geoTag: boolean;
  copyright: boolean;
  titleDesc: boolean;
}

const FORMAT_CAPABILITIES: Record<string, FormatCapabilities> = {
  jpg: { geoTag: true, copyright: true, titleDesc: true },
  mozjpg: { geoTag: true, copyright: true, titleDesc: true },
  png: { geoTag: false, copyright: true, titleDesc: true },
  webp: { geoTag: true, copyright: true, titleDesc: true },
};

interface ValidationResult {
  warnings: string[];
}

function validateMetadataForFormat(
  metadata: MetadataOptions,
  outputFormat: string
): ValidationResult {
  const warnings: string[] = [];
  const capabilities = FORMAT_CAPABILITIES[outputFormat] || FORMAT_CAPABILITIES.jpg;

  // Check if geo-tagging is enabled but format doesn't support it
  if (metadata.geoTagEnabled && metadata.geoTag.latitude && metadata.geoTag.longitude) {
    if (!capabilities.geoTag) {
      warnings.push(
        `PNG does not support GPS coordinates. Switch to JPG or WebP for geo-tagged images, or disable geo-tagging to proceed.`
      );
    }
  }

  return { warnings };
}
```

---

### GPS Coordinate Injection (JPG/WebP via piexifjs)

```javascript
import piexif from 'piexifjs';

function injectGeoTag(jpegBlob: Blob, geoTag: GeoTag): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dataUrl = reader.result as string;

        // Convert decimal degrees to degrees/minutes/seconds
        const latDMS = decimalToDMS(Math.abs(geoTag.latitude));
        const lngDMS = decimalToDMS(Math.abs(geoTag.longitude));

        const exifObj = piexif.load(dataUrl);

        // Set GPS data
        exifObj.GPS = {
          [piexif.GPSIFD.GPSLatitudeRef]: geoTag.latitude >= 0 ? 'N' : 'S',
          [piexif.GPSIFD.GPSLatitude]: latDMS,
          [piexif.GPSIFD.GPSLongitudeRef]: geoTag.longitude >= 0 ? 'E' : 'W',
          [piexif.GPSIFD.GPSLongitude]: lngDMS,
        };

        if (geoTag.altitude !== undefined) {
          exifObj.GPS[piexif.GPSIFD.GPSAltitude] = [Math.abs(geoTag.altitude), 1];
          exifObj.GPS[piexif.GPSIFD.GPSAltitudeRef] = geoTag.altitude >= 0 ? 0 : 1;
        }

        const exifBytes = piexif.dump(exifObj);
        const newDataUrl = piexif.insert(exifBytes, dataUrl);

        // Convert back to blob
        const newBlob = dataURLtoBlob(newDataUrl);
        resolve(newBlob);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(jpegBlob);
  });
}

function decimalToDMS(decimal: number): [[number, number], [number, number], [number, number]] {
  const degrees = Math.floor(decimal);
  const minutesDecimal = (decimal - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60 * 100);

  return [[degrees, 1], [minutes, 1], [seconds, 100]];
}
```

### Copyright Injection (JPG via piexifjs)

```javascript
function injectCopyright(jpegBlob: Blob, copyright: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dataUrl = reader.result as string;
        const exifObj = piexif.load(dataUrl);

        exifObj['0th'] = exifObj['0th'] || {};
        exifObj['0th'][piexif.ImageIFD.Copyright] = copyright;
        exifObj['0th'][piexif.ImageIFD.Artist] = copyright.replace(/©\s*\d{4}\s*/, '');

        const exifBytes = piexif.dump(exifObj);
        const newDataUrl = piexif.insert(exifBytes, dataUrl);
        const newBlob = dataURLtoBlob(newDataUrl);
        resolve(newBlob);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(jpegBlob);
  });
}
```

### Title/Description Injection (JPG via piexifjs)

```javascript
function injectTitleDescription(
  jpegBlob: Blob,
  title: string,
  description: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dataUrl = reader.result as string;
        const exifObj = piexif.load(dataUrl);

        exifObj['0th'] = exifObj['0th'] || {};
        exifObj['0th'][piexif.ImageIFD.ImageDescription] = description;
        exifObj['0th'][piexif.ImageIFD.XPTitle] = title;

        const exifBytes = piexif.dump(exifObj);
        const newDataUrl = piexif.insert(exifBytes, dataUrl);
        const newBlob = dataURLtoBlob(newDataUrl);
        resolve(newBlob);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(jpegBlob);
  });
}
```

---

### PNG Text Chunk Injection (via png-chunk-text)

PNG supports text metadata via tEXt chunks but does NOT support GPS coordinates.

```javascript
import { encode as encodePng } from 'png-chunks-encode';
import { decode as decodePng } from 'png-chunks-extract';
import textChunk from 'png-chunk-text';

async function injectPngTextMetadata(
  pngBlob: Blob,
  metadata: { copyright?: string; title?: string; description?: string }
): Promise<Blob> {
  const buffer = await pngBlob.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);

  // Extract existing chunks
  const chunks = decodePng(uint8Array);

  // Find the position before IEND chunk
  const iendIndex = chunks.findIndex(chunk => chunk.name === 'IEND');

  // Create text chunks for metadata
  const textChunks = [];

  if (metadata.copyright) {
    textChunks.push(textChunk.encode('Copyright', metadata.copyright));
  }

  if (metadata.title) {
    textChunks.push(textChunk.encode('Title', metadata.title));
  }

  if (metadata.description) {
    textChunks.push(textChunk.encode('Description', metadata.description));
  }

  // Insert text chunks before IEND
  chunks.splice(iendIndex, 0, ...textChunks);

  // Re-encode PNG
  const newPngData = encodePng(chunks);
  return new Blob([newPngData], { type: 'image/png' });
}
```

---

### WebP EXIF Chunk Injection (via RIFF chunk manipulation)

WebP supports full EXIF metadata including GPS coordinates via EXIF chunk injection. The actual implementation performs manual binary RIFF chunk manipulation rather than using a library like `node-webpmux`:

1. **Parse WebP RIFF container** to find or create the VP8X chunk
2. **Build EXIF data** using piexifjs (via `buildExifBytes` from `jpgMetadata.ts`)
3. **Remove existing EXIF chunks** to avoid duplicates
4. **Set VP8X EXIF flag** to indicate EXIF data is present
5. **Create VP8X chunk if missing** (required for simple lossy/lossless WebP files that lack extended features)
6. **Inject new EXIF chunk** after the VP8X chunk in the RIFF container

The EXIF payload itself is constructed using piexifjs (the same library used for JPG metadata), which builds a standard EXIF byte sequence containing GPS coordinates, copyright, title, and description fields. This EXIF byte sequence is then wrapped in a RIFF "EXIF" chunk and inserted into the WebP binary structure.

---

### Metadata Text Sanitization

All text metadata is sanitized before injection to prevent malformed data and ensure compatibility:

```typescript
/**
 * Maximum character limits for metadata fields
 * Based on IPTC/XMP standards and SEO best practices
 */
const METADATA_LIMITS = {
  title: 100,       // IPTC recommends 64, Google indexes ~70
  description: 500, // IPTC allows 2000, SEO recommends 150-160
  copyright: 200,   // No standard, 200 is sufficient
  author: 150,      // Handles long business/photographer names
};

/**
 * Sanitizes text for safe metadata injection:
 * - Removes control characters (0x00-0x1F, 0x7F)
 * - Optionally preserves newlines/tabs for descriptions
 * - Normalizes multiple spaces to single space
 * - Trims whitespace and enforces max length
 */
function sanitizeText(
  text: string,
  maxLength: number,
  allowNewlines = false
): string {
  let sanitized = text;

  if (allowNewlines) {
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  } else {
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, ' ');
  }

  sanitized = sanitized.replace(/  +/g, ' ');
  return sanitized.trim().slice(0, maxLength);
}
```

---

### Combined Metadata Injection (All Formats)

```javascript
interface MetadataInjectionResult {
  blob: Blob;
  applied: AppliedMetadata;
  warnings: string[];
}

async function injectAllMetadata(
  blob: Blob,
  format: 'jpg' | 'mozjpg' | 'png' | 'webp',
  options: MetadataOptions
): Promise<MetadataInjectionResult> {
  const applied: AppliedMetadata = {
    geoTag: null,
    copyright: null,
    title: null,
    description: null,
  };

  // Validate format capabilities and collect warnings
  const normalizedFormat = format === 'mozjpg' ? 'jpg' : format;
  const { warnings } = validateMetadataForFormat(options, normalizedFormat);

  let currentBlob = blob;

  // Handle JPG/MozJPG - Full EXIF support
  if (normalizedFormat === 'jpg') {
    if (options.geoTagEnabled && options.geoTag.latitude && options.geoTag.longitude) {
      currentBlob = await injectGeoTag(currentBlob, {
        latitude: options.geoTag.latitude,
        longitude: options.geoTag.longitude,
        address: options.geoTag.address,
      });
      applied.geoTag = {
        latitude: options.geoTag.latitude,
        longitude: options.geoTag.longitude,
        address: options.geoTag.address,
      };
    }

    if (options.copyrightEnabled && options.copyright.text) {
      currentBlob = await injectCopyright(currentBlob, options.copyright.text);
      applied.copyright = options.copyright.text;
    }

    if (options.titleDescEnabled) {
      currentBlob = await injectTitleDescription(
        currentBlob,
        options.titleDesc.title,
        options.titleDesc.description
      );
      applied.title = options.titleDesc.title;
      applied.description = options.titleDesc.description;
    }
  }

  // Handle PNG - Text metadata only, NO GPS support
  else if (format === 'png') {
    const pngMetadata: { copyright?: string; title?: string; description?: string } = {};

    if (options.copyrightEnabled && options.copyright.text) {
      pngMetadata.copyright = options.copyright.text;
      applied.copyright = options.copyright.text;
    }

    if (options.titleDescEnabled) {
      pngMetadata.title = options.titleDesc.title;
      pngMetadata.description = options.titleDesc.description;
      applied.title = options.titleDesc.title;
      applied.description = options.titleDesc.description;
    }

    if (Object.keys(pngMetadata).length > 0) {
      currentBlob = await injectPngTextMetadata(currentBlob, pngMetadata);
    }

    // Note: GPS coordinates are NOT injected for PNG - warning already added
  }

  // Handle WebP - Full EXIF support including GPS
  else if (format === 'webp') {
    const webpMetadata: {
      geoTag?: GeoTag;
      copyright?: string;
      title?: string;
      description?: string;
    } = {};

    if (options.geoTagEnabled && options.geoTag.latitude && options.geoTag.longitude) {
      webpMetadata.geoTag = {
        latitude: options.geoTag.latitude,
        longitude: options.geoTag.longitude,
        address: options.geoTag.address,
      };
      applied.geoTag = webpMetadata.geoTag;
    }

    if (options.copyrightEnabled && options.copyright.text) {
      webpMetadata.copyright = options.copyright.text;
      applied.copyright = options.copyright.text;
    }

    if (options.titleDescEnabled) {
      webpMetadata.title = options.titleDesc.title;
      webpMetadata.description = options.titleDesc.description;
      applied.title = options.titleDesc.title;
      applied.description = options.titleDesc.description;
    }

    if (Object.keys(webpMetadata).length > 0) {
      currentBlob = await injectWebpExifMetadata(currentBlob, webpMetadata);
    }
  }

  return { blob: currentBlob, applied, warnings };
}
```

---

## Compression Routing

Routing is based solely on the output format (not the input format):

```typescript
type CompressionEngine = 'tinypng' | 'oxipng' | 'mozjpeg' | 'webp';

function getCompressionEngine(
  _inputFormat: InputFormat,
  outputFormat: OutputFormat
): CompressionEngine {
  switch (outputFormat) {
    case 'png':
      return tinypngQuotaExhausted ? 'oxipng' : 'tinypng';
    case 'mozjpg':
      return 'mozjpeg';
    case 'webp':
      return 'webp';
    default:
      return 'webp';
  }
}
```

---

## Processing Pipeline

### Hook-Based Architecture

The processing pipeline uses composable React hooks rather than batch processing functions:

#### `useCompression` Hook
- **Auto-starts compression** when new images are added to the queue
- Processes images **sequentially** (one at a time)
- Uses `getCompressionEngine()` to select the appropriate engine based on output format
- Updates each image's status (`compressing` -> `compressed` or `error`) as processing completes
- Tracks TinyPNG quota exhaustion and falls back to OxiPNG for PNG output

#### `useMetadataInjection` Hook
- Handles **per-image metadata injection** via the accordion UI in each queue item
- Each image has its own "Boost" accordion (`ImageMetadataAccordion.tsx`) with metadata fields
- User fills in metadata fields (geo-tag, copyright, title/description) per image
- Clicking "Apply" on an individual image injects metadata and locks fields to read-only
- There is **no batch boost button** -- each image is boosted independently
- Boost errors are non-fatal: the compressed image remains downloadable without metadata

#### `useDownload` Hook
- Provides individual file download per image
- Provides ZIP archive download for all completed images via JSZip

#### `useImageQueue` Hook
- Manages the image list state (add, remove, update)
- Tracks per-image status, metadata, and processing results

---

## File Validation

File validation uses a two-layer approach for security:
1. **MIME type validation** - Quick check of file.type
2. **Magic byte validation** - Verifies actual file content matches expected format

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_BATCH_SIZE = 20;
const VALID_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// Magic bytes for format verification
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]; // PNG header
const JPEG_MAGIC = [0xff, 0xd8, 0xff]; // JPEG header
const RIFF_MAGIC = [0x52, 0x49, 0x46, 0x46]; // "RIFF" for WebP
const WEBP_MAGIC = [0x57, 0x45, 0x42, 0x50]; // "WEBP" at bytes 8-11

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates file magic bytes to prevent spoofed file extensions
 */
async function validateMagicBytes(file: File): Promise<boolean> {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const isPNG = PNG_MAGIC.every((byte, i) => bytes[i] === byte);
  if (isPNG) return true;

  const isJPEG = JPEG_MAGIC.every((byte, i) => bytes[i] === byte);
  if (isJPEG) return true;

  // Check for WebP (RIFF header at 0-3, WEBP at 8-11)
  const isRIFF = RIFF_MAGIC.every((byte, i) => bytes[i] === byte);
  const isWEBP = WEBP_MAGIC.every((byte, i) => bytes[i + 8] === byte);
  return isRIFF && isWEBP;
}

async function validateFile(file: File): Promise<ValidationResult> {
  const errors: string[] = [];

  if (file.size > MAX_FILE_SIZE) {
    errors.push(`"${file.name}" exceeds 5MB limit (${formatBytes(file.size)})`);
  }

  if (!VALID_TYPES.includes(file.type)) {
    errors.push(`"${file.name}" is not a supported format (PNG, JPG, or WebP only)`);
  }

  // Verify magic bytes match claimed type
  const validMagicBytes = await validateMagicBytes(file);
  if (!validMagicBytes) {
    errors.push(`"${file.name}" file content does not match its extension`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateBatch(files: File[], existingCount: number): ValidationResult {
  const errors: string[] = [];
  
  if (existingCount + files.length > MAX_BATCH_SIZE) {
    errors.push(`Batch limit is ${MAX_BATCH_SIZE} images. You have ${existingCount} and are adding ${files.length}.`);
  }
  
  files.forEach(file => {
    const result = validateFile(file);
    errors.push(...result.errors);
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## ZIP Download

```typescript
import JSZip from 'jszip';

async function downloadAsZip(images: ImageItem[]): Promise<void> {
  const zip = new JSZip();
  
  const completed = images.filter(
    img => img.status === 'complete' && img.finalBlob
  );
  
  completed.forEach(img => {
    const outputFilename = getOutputFilename(img.filename, img.outputFormat);
    zip.file(outputFilename, img.finalBlob!);
  });
  
  const content = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `smooshboost-${Date.now()}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

function getOutputFilename(original: string, outputFormat: string): string {
  const baseName = original.replace(/\.[^/.]+$/, '');
  
  switch (outputFormat) {
    case 'webp':
      return `${baseName}.webp`;
    case 'mozjpg':
      return `${baseName}.jpg`;
    case 'png':
    default:
      return `${baseName}.png`;
  }
}
```

---

## Savings Calculation

```typescript
interface Savings {
  percentage: string;
  absolute: string;
  savedBytes: number;
}

function calculateSavings(originalSize: number, compressedSize: number): Savings {
  const savedBytes = originalSize - compressedSize;
  const percentage = ((savedBytes / originalSize) * 100).toFixed(0);
  
  return {
    percentage: `${percentage}%`,
    absolute: `${formatBytes(originalSize)} → ${formatBytes(compressedSize)}`,
    savedBytes
  };
}

function calculateTotalSavings(images: ImageItem[]): Savings {
  const completed = images.filter(img => img.status === 'complete');
  
  const totalOriginal = completed.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressed = completed.reduce((sum, img) => sum + (img.compressedSize || 0), 0);
  
  return calculateSavings(totalOriginal, totalCompressed);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
```

---

## Component Structure

```
src/
├── main.tsx
├── app/
│   ├── App.tsx
│   ├── types.ts                           # All TypeScript types & constants
│   ├── components/
│   │   ├── download/
│   │   │   └── DownloadSection.tsx
│   │   ├── format/
│   │   │   └── FormatSelector.tsx         # Format mode + Boost Only toggle
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── metadata/
│   │   │   ├── MetadataPanel.tsx           # Wrapper for metadata sections
│   │   │   ├── GeoTagSection.tsx
│   │   │   ├── CopyrightSection.tsx
│   │   │   └── TitleDescSection.tsx
│   │   ├── processing/
│   │   │   └── ProcessingButtons.tsx       # Compression progress display
│   │   ├── queue/
│   │   │   ├── ImageQueue.tsx
│   │   │   ├── QueueItem.tsx              # Individual image in queue
│   │   │   ├── StatusIndicator.tsx        # Status icon/spinner
│   │   │   ├── MetadataStatusBadges.tsx   # Geo/Copyright/Title badges
│   │   │   └── ImageMetadataAccordion.tsx # Per-image Boost accordion
│   │   ├── summary/
│   │   │   └── SummaryBar.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Spinner.tsx
│   │   └── upload/
│   │       └── UploadZone.tsx             # Drag/drop + file picker
│   ├── hooks/
│   │   ├── index.ts                       # Re-exports all hooks
│   │   ├── useCompression.ts              # Auto-compression on upload
│   │   ├── useDownload.ts                 # Individual & ZIP download
│   │   ├── useFileValidation.ts           # MIME + magic byte validation
│   │   ├── useImageQueue.ts               # Image state management
│   │   └── useMetadataInjection.ts        # Per-image metadata injection
│   ├── services/
│   │   ├── compression/
│   │   │   ├── compressionRouter.ts       # Engine selection & routing
│   │   │   ├── squooshService.ts          # @jsquash WASM encoders
│   │   │   └── tinypngService.ts          # TinyPNG API client
│   │   ├── metadata/
│   │   │   ├── metadataInjector.ts        # Format router & sanitization
│   │   │   ├── jpgMetadata.ts             # EXIF injection via piexifjs
│   │   │   ├── pngMetadata.ts             # tEXt chunk injection
│   │   │   └── webpMetadata.ts            # RIFF/EXIF chunk injection
│   │   └── download/
│   │       └── zipService.ts              # ZIP archive generation
│   └── utils/
│       ├── detectFormat.ts                # MIME type detection
│       ├── fileHelpers.ts                 # Thumbnails, downloads, decode
│       ├── formatBytes.ts                 # Byte formatting
│       ├── generateId.ts                  # UUID generation
│       └── googleMapsParser.ts            # Google Maps URL parsing
├── styles/
│   └── index.css                          # Tailwind CSS v4 theme config
├── types/
│   └── metadata-libs.d.ts                 # Type defs for external libs
└── test/
    └── setup.ts                           # Test setup with mocks
```

---

## Environment Variables

```env
# .env
TINYPNG_API_KEY=your_tinypng_key
```

> **Note:** The `TINYPNG_API_KEY` is loaded via `loadEnv` in `vite.config.ts` (not a `VITE_`-prefixed variable exposed to the client). In production, a Vercel serverless function at `api/tinypng/[...path].ts` proxies requests to the TinyPNG API, keeping the API key server-side.

---

## Error Types

```typescript
type ErrorType =
  | 'file_too_large'
  | 'invalid_format'
  | 'batch_limit_exceeded'
  | 'quota_exceeded'
  | 'network_error'
  | 'url_fetch_failed'
  | 'compression_failed'
  | 'metadata_injection_failed'      // Technical error during EXIF/chunk write
  | 'geocoding_failed'               // Address lookup failed
  | 'geocoding_parse_failed'         // Google Maps link couldn't be parsed
  | 'coordinate_out_of_range';       // Lat/long outside valid range

type WarningType =
  | 'metadata_format_unsupported';   // Format doesn't support requested metadata (non-blocking)

interface AppNotification {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  errorType?: ErrorType;
  warningType?: WarningType;
  message: string;
  dismissable: boolean;
  autoDismiss: number | false;
}

// Note: metadata_format_unsupported generates a WARNING notification, not an error.
// Processing continues even when this warning is triggered.

// Boost errors are non-fatal: image is still downloadable (compressed, without metadata)
```

---

## Browser Compatibility

### Required APIs
- File API
- Drag and Drop API
- Fetch API
- Blob / URL.createObjectURL
- Web Workers
- WebAssembly

### Minimum Versions
- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

---

## Performance Considerations

1. **Thumbnail generation:** Create at upload time, not during render
2. **Concurrent processing:** Max 3 images simultaneously
3. **Web Worker:** Run Squoosh compression off main thread
4. **Memory management:** Revoke object URLs when no longer needed
5. **Lazy metadata:** Only inject if options are enabled
6. **Progress indication:** Update UI during long operations
7. **Dynamic WASM imports:** Compression codecs (@jsquash/jpeg, @jsquash/webp, @jsquash/oxipng) are dynamically imported at runtime to reduce initial bundle size
8. **React.memo optimization:** QueueItem component uses React.memo with useCallback handlers to prevent unnecessary re-renders when other queue items update
