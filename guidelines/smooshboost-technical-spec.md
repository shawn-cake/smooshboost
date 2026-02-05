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

## Design Tokens (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          DEFAULT: '#4074A8',
          50: '#EBF1F7',
          100: '#D1E0EE',
          200: '#A3C1DD',
          700: '#2D5276',
          900: '#1A3044',
        },
        accent: {
          DEFAULT: '#F2A918',
          50: '#FEF7E6',
          100: '#FDE9B8',
          700: '#B87D0E',
        },
        // Semantic Colors
        success: {
          DEFAULT: '#059669',
          light: '#D1FAE5',
        },
        error: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
        },
        // Grays
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Roboto', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
        mono: ['Roboto Mono', 'SF Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'sm': ['13px', { lineHeight: '20px' }],
        'base': ['14px', { lineHeight: '22px' }],
        'lg': ['16px', { lineHeight: '24px' }],
        'xl': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '12px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
      },
      transitionDuration: {
        'DEFAULT': '150ms',
        '200': '200ms',
      },
      transitionTimingFunction: {
        'DEFAULT': 'ease-in-out',
      },
    }
  }
}
```

---

## Data Structures

### Image Item
```typescript
interface ImageItem {
  id: string;                              // Unique identifier (UUID)
  file: File | null;                       // Original file object (null if from URL)
  sourceUrl: string | null;                // Source URL (null if uploaded)
  filename: string;                        // Original filename
  originalSize: number;                    // Size in bytes
  inputFormat: 'png' | 'jpg';              // Detected input format
  outputFormat: 'png' | 'mozjpg' | 'webp'; // Target output format

  // Processing state
  status: ImageStatus;
  phase: 'upload' | 'smoosh' | 'boost' | 'complete' | 'error';
  engine: 'tinypng' | 'squoosh' | null;

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
  };

  titleDescEnabled: boolean;
  titleDesc: {
    title: string;
    description: string;
  };
}
```

### App State
```typescript
interface AppState {
  // Images
  images: ImageItem[];

  // Workflow mode
  workflowMode: 'smoosh-boost' | 'smoosh-only' | 'boost-only';

  // Processing state
  isProcessing: boolean;
  currentPhase: 'idle' | 'smoosh' | 'boost';
  boostPhase: 'idle' | 'boosting' | 'complete' | 'error';

  // API state
  tinypngApiKey: string;
  tinypngQuotaExhausted: boolean;
  tinypngCompressionCount: number;

  // Metadata options (global)
  metadataOptions: MetadataOptions;

  // Metadata application mode
  metadataApplicationMode: 'apply-to-all' | 'per-image';

  // Per-image metadata storage (when metadataApplicationMode === 'per-image')
  perImageMetadata: Map<string, MetadataOptions>;  // Key = image.id

  // UI state
  metadataPanelExpanded: boolean;
  urlImportExpanded: boolean;
  expandedQueueItems: Set<string>;                  // Image IDs with expanded details
  editingMetadataForImage: string | null;           // Image ID currently being edited
}
```

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

### Squoosh Client-Side

#### MozJPG Encoding
```javascript
const result = await encode(imageData, {
  mozjpeg: {
    quality: 75,
  }
});
```

#### WebP Encoding
```javascript
const result = await encode(imageData, {
  webp: {
    quality: 80,
  }
});
```

#### PNG Optimization (Fallback)
```javascript
const result = await encode(imageData, {
  oxipng: {
    level: 2,
  }
});
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

### WebP EXIF Chunk Injection (via node-webpmux)

WebP supports full EXIF metadata including GPS coordinates via EXIF chunk injection.

```javascript
import WebP from 'node-webpmux';

async function injectWebpExifMetadata(
  webpBlob: Blob,
  metadata: {
    geoTag?: GeoTag;
    copyright?: string;
    title?: string;
    description?: string;
  }
): Promise<Blob> {
  const buffer = await webpBlob.arrayBuffer();
  const image = new WebP.Image();
  await image.load(Buffer.from(buffer));

  // Build EXIF data structure
  const exifData = buildExifData(metadata);

  // Set EXIF chunk
  await image.setExif(exifData);

  // Save and return as blob
  const outputBuffer = await image.save(null);
  return new Blob([outputBuffer], { type: 'image/webp' });
}

function buildExifData(metadata: {
  geoTag?: GeoTag;
  copyright?: string;
  title?: string;
  description?: string;
}): Buffer {
  // Use piexifjs to build EXIF structure, then extract raw bytes
  const exifObj = {
    '0th': {},
    'Exif': {},
    'GPS': {},
    '1st': {},
    'thumbnail': null
  };

  if (metadata.copyright) {
    exifObj['0th'][piexif.ImageIFD.Copyright] = metadata.copyright;
  }

  if (metadata.description) {
    exifObj['0th'][piexif.ImageIFD.ImageDescription] = metadata.description;
  }

  if (metadata.title) {
    exifObj['0th'][piexif.ImageIFD.XPTitle] = metadata.title;
  }

  if (metadata.geoTag) {
    const latDMS = decimalToDMS(Math.abs(metadata.geoTag.latitude));
    const lngDMS = decimalToDMS(Math.abs(metadata.geoTag.longitude));

    exifObj.GPS = {
      [piexif.GPSIFD.GPSLatitudeRef]: metadata.geoTag.latitude >= 0 ? 'N' : 'S',
      [piexif.GPSIFD.GPSLatitude]: latDMS,
      [piexif.GPSIFD.GPSLongitudeRef]: metadata.geoTag.longitude >= 0 ? 'E' : 'W',
      [piexif.GPSIFD.GPSLongitude]: lngDMS,
    };
  }

  const exifBytes = piexif.dump(exifObj);
  return Buffer.from(exifBytes, 'binary');
}
```

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

```typescript
function getCompressionEngine(
  image: ImageItem, 
  state: AppState
): 'tinypng' | 'squoosh' {
  const { inputFormat, outputFormat } = image;
  const { tinypngQuotaExhausted } = state;
  
  // PNG to PNG: prefer TinyPNG unless quota exhausted
  if (inputFormat === 'png' && outputFormat === 'png') {
    return tinypngQuotaExhausted ? 'squoosh' : 'tinypng';
  }
  
  // All other conversions: Squoosh
  return 'squoosh';
}
```

---

## Processing Pipeline

### Two-Step Workflow

The processing pipeline is now split into two explicit steps that require user action:

```typescript
// Step 1: Compression (Smoosh Phase) - automatic on upload
async function compressImages(
  images: ImageItem[],
  state: AppState,
  callbacks: {
    onImageStatusChange: (imageId: string, status: ImageStatus) => void;
    onImageError: (imageId: string, error: string) => void;
    onProgress: (completed: number, total: number) => void;
  }
): Promise<ImageItem[]> {
  const { onImageStatusChange, onImageError, onProgress } = callbacks;
  const results: ImageItem[] = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];

    try {
      onImageStatusChange(image.id, 'compressing');

      const engine = getCompressionEngine(image, state);
      let compressedBlob: Blob;

      if (engine === 'tinypng') {
        compressedBlob = await compressWithTinyPNG(image.file!, state.tinypngApiKey);
      } else {
        compressedBlob = await compressWithSquoosh(image.file!, image.outputFormat);
      }

      const compressedSize = compressedBlob.size;
      onImageStatusChange(image.id, 'compressed');

      results.push({
        ...image,
        status: 'compressed',
        phase: 'smoosh',
        engine,
        compressedSize,
        compressedBlob,
        boostStatus: 'pending',
      });
    } catch (error) {
      onImageError(image.id, error.message);
      results.push({
        ...image,
        status: 'error',
        phase: 'error',
        error: error.message,
      });
    }

    onProgress(i + 1, images.length);
  }

  return results;
}

// Step 2: Metadata Injection (Boost Phase) - triggered by "Add Metadata (Boost)" button
async function boostImages(
  images: ImageItem[],
  state: AppState,
  callbacks: {
    onImageStatusChange: (imageId: string, status: ImageStatus, boostStatus: BoostStatus) => void;
    onImageError: (imageId: string, error: string) => void;
    onProgress: (completed: number, total: number) => void;
  }
): Promise<ImageItem[]> {
  const { onImageStatusChange, onImageError, onProgress } = callbacks;
  const results: ImageItem[] = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];

    // Skip images that weren't successfully compressed
    if (image.status === 'error' || !image.compressedBlob) {
      results.push(image);
      onProgress(i + 1, images.length);
      continue;
    }

    try {
      onImageStatusChange(image.id, 'boosting', 'boosting');

      // Get metadata for this image (global or per-image based on mode)
      const metadata = getMetadataForImage(image.id, state);

      // Validate format capabilities
      const { warnings } = validateMetadataForFormat(metadata, image.outputFormat);

      // Inject metadata (skip unsupported types)
      const { blob: finalBlob, applied } = await injectAllMetadata(
        image.compressedBlob,
        image.outputFormat === 'mozjpg' ? 'jpg' : image.outputFormat,
        metadata
      );

      onImageStatusChange(image.id, 'complete', 'boosted');

      results.push({
        ...image,
        status: 'complete',
        phase: 'complete',
        boostStatus: 'boosted',
        finalBlob,
        metadata: applied,
        metadataWarnings: warnings,
      });
    } catch (error) {
      onImageError(image.id, error.message);
      results.push({
        ...image,
        boostStatus: 'boost-failed',
        boostError: error.message,
        // Image still downloadable with compressed blob
        finalBlob: image.compressedBlob,
      });
    }

    onProgress(i + 1, images.length);
  }

  return results;
}

// Helper: Get metadata for specific image based on application mode
function getMetadataForImage(imageId: string, state: AppState): MetadataOptions {
  if (state.metadataApplicationMode === 'per-image') {
    return state.perImageMetadata.get(imageId) || state.metadataOptions;
  }
  return state.metadataOptions;
}

// Helper: Save per-image metadata
function savePerImageMetadata(
  imageId: string,
  metadata: MetadataOptions,
  state: AppState
): void {
  state.perImageMetadata.set(imageId, metadata);
}

// Skip Boost - mark images as complete without metadata
function skipBoostPhase(images: ImageItem[]): ImageItem[] {
  return images.map(image => ({
    ...image,
    status: image.status === 'compressed' ? 'complete' : image.status,
    phase: image.phase === 'smoosh' ? 'complete' : image.phase,
    boostStatus: 'boost-skipped',
    finalBlob: image.compressedBlob || image.finalBlob,
  }));
}
```

---

## File Validation

File validation uses a two-layer approach for security:
1. **MIME type validation** - Quick check of file.type
2. **Magic byte validation** - Verifies actual file content matches expected format

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_BATCH_SIZE = 20;
const VALID_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

// Magic bytes for format verification
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]; // PNG header
const JPEG_MAGIC = [0xff, 0xd8, 0xff]; // JPEG header

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates file magic bytes to prevent spoofed file extensions
 */
async function validateMagicBytes(file: File): Promise<boolean> {
  const buffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const isPNG = PNG_MAGIC.every((byte, i) => bytes[i] === byte);
  if (isPNG) return true;

  const isJPEG = JPEG_MAGIC.every((byte, i) => bytes[i] === byte);
  return isJPEG;
}

async function validateFile(file: File): Promise<ValidationResult> {
  const errors: string[] = [];

  if (file.size > MAX_FILE_SIZE) {
    errors.push(`"${file.name}" exceeds 5MB limit (${formatBytes(file.size)})`);
  }

  if (!VALID_TYPES.includes(file.type)) {
    errors.push(`"${file.name}" is not a supported format (PNG or JPG only)`);
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
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── ProcessingButtons/              # Button controls
│   │   │   ├── ProcessingButtons.tsx
│   │   │   ├── BoostButton.tsx
│   │   │   └── SkipDownloadButton.tsx
│   │   ├── UploadZone/
│   │   │   ├── UploadZone.tsx
│   │   │   ├── DragDropArea.tsx
│   │   │   ├── FilePickerButton.tsx
│   │   │   └── UrlImportPanel.tsx
│   │   ├── MetadataPanel/
│   │   │   ├── MetadataPanel.tsx
│   │   │   ├── MetadataApplicationSelector.tsx # Apply to All / Per Image selector
│   │   │   ├── GeoTagSection.tsx
│   │   │   ├── GoogleMapsLinkParser.tsx    # NEW: Parse coords from Maps URLs
│   │   │   ├── CopyrightSection.tsx
│   │   │   ├── TitleDescSection.tsx
│   │   │   ├── AddressAutocomplete.tsx     # Optional: Google Places API
│   │   │   └── FormatWarningBanner.tsx     # NEW: Format compatibility warnings
│   │   ├── ImageQueue/
│   │   │   ├── ImageQueue.tsx
│   │   │   ├── ImageQueueItem.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── MetadataStatusBadges.tsx    # NEW: Geo/Copyright/Title status badges
│   │   │   ├── PerImageMetadataForm.tsx    # NEW: Inline per-image metadata form
│   │   │   └── ExpandableMetadataDetails.tsx # NEW: Expandable full metadata view
│   │   ├── SummaryBar.tsx                  # Updated: includes metadata summary
│   │   ├── DownloadSection.tsx             # Updated: metadata indicators
│   │   └── Notifications/
│   │       ├── NotificationContainer.tsx
│   │       └── NotificationToast.tsx
│   ├── hooks/
│   │   ├── useImageQueue.ts
│   │   ├── useWorkflowMode.ts              # NEW: Workflow mode state
│   │   ├── useCompression.ts
│   │   ├── useTinyPng.ts
│   │   ├── useSquoosh.ts
│   │   ├── useMetadataInjection.ts
│   │   ├── usePerImageMetadata.ts          # NEW: Per-image metadata management
│   │   ├── useGoogleMapsParser.ts          # NEW: Parse Maps links
│   │   ├── useGeocode.ts                   # Optional: Google Places API
│   │   └── useNotifications.ts
│   ├── utils/
│   │   ├── fileHelpers.ts
│   │   ├── compressionRouter.ts
│   │   ├── metadataInjector.ts
│   │   ├── googleMapsParser.ts             # NEW: URL parsing utilities
│   │   ├── geoHelpers.ts
│   │   └── zipGenerator.ts
│   └── types/
│       └── index.ts
├── workers/
│   └── compression.worker.ts
└── index.css
```

---

## Environment Variables

```env
# .env
VITE_TINYPNG_API_KEY=your_tinypng_key
VITE_GOOGLE_PLACES_API_KEY=your_google_key  # Optional
```

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
