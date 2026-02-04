# SmooshBoost - Technical Specification

**Tagline:** Smoosh & Boost Images

## Architecture Overview

SmooshBoost follows a two-phase processing pipeline:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   UPLOAD    │ →  │   SMOOSH    │ →  │    BOOST    │ →  Download
│   Phase     │    │   Phase     │    │   Phase     │
└─────────────┘    └─────────────┘    └─────────────┘
     Files          Compression        Metadata
     URLs           Engine routing     Injection
     Validation     Size reduction     GPS, Copyright
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 18 with TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Compression | TinyPNG API + @aspect-image/squoosh (WASM) |
| Metadata | piexifjs (EXIF writing) |
| Geocoding | Google Places/Geocoding API (optional) |
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
  
  // Results
  compressedSize: number | null;
  compressedBlob: Blob | null;
  finalBlob: Blob | null;                  // After metadata injection
  thumbnail: string | null;                // Data URL for preview
  
  // Metadata applied
  metadata: AppliedMetadata | null;
  
  // Error handling
  error: string | null;
}

type ImageStatus = 
  | 'queued'
  | 'compressing'
  | 'compressed'
  | 'boosting'
  | 'complete'
  | 'error';

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
}
```

### Metadata Options (User Input)
```typescript
interface MetadataOptions {
  geoTagEnabled: boolean;
  geoTag: {
    address: string;             // User input (autocomplete)
    latitude: number | null;
    longitude: number | null;
    applyToAll: boolean;
  };
  
  copyrightEnabled: boolean;
  copyright: {
    text: string;                // e.g., "© 2026 Client Name"
    applyToAll: boolean;
  };
  
  titleDescEnabled: boolean;
  titleDesc: {
    title: string;
    description: string;
    applyToAll: boolean;
  };
}
```

### App State
```typescript
interface AppState {
  // Images
  images: ImageItem[];
  
  // Processing
  isProcessing: boolean;
  currentPhase: 'idle' | 'smoosh' | 'boost';
  
  // API state
  tinypngApiKey: string;
  tinypngQuotaExhausted: boolean;
  tinypngCompressionCount: number;
  
  // Metadata options
  metadataOptions: MetadataOptions;
  
  // UI state
  metadataPanelExpanded: boolean;
  urlImportExpanded: boolean;
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

### Google Places API (Optional)

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
      address: data.results[0].formatted_address
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

### GPS Coordinate Injection (piexifjs)

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

### Copyright Injection

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

### Title/Description Injection

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

### Combined Metadata Injection

```javascript
async function injectAllMetadata(
  blob: Blob,
  format: 'jpg' | 'png' | 'webp',
  options: MetadataOptions
): Promise<{ blob: Blob; applied: AppliedMetadata }> {
  const applied: AppliedMetadata = {
    geoTag: null,
    copyright: null,
    title: null,
    description: null,
  };
  
  // Only JPG has full EXIF support
  if (format !== 'jpg') {
    console.warn(`Limited metadata support for ${format}`);
    return { blob, applied };
  }
  
  let currentBlob = blob;
  
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
  
  return { blob: currentBlob, applied };
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

```typescript
async function processImage(
  image: ImageItem,
  state: AppState,
  callbacks: {
    onStatusChange: (status: ImageStatus, phase: string) => void;
    onError: (error: string) => void;
  }
): Promise<ImageItem> {
  const { onStatusChange, onError } = callbacks;
  
  try {
    // SMOOSH PHASE
    onStatusChange('compressing', 'smoosh');
    
    const engine = getCompressionEngine(image, state);
    let compressedBlob: Blob;
    
    if (engine === 'tinypng') {
      compressedBlob = await compressWithTinyPNG(image.file!, state.tinypngApiKey);
    } else {
      compressedBlob = await compressWithSquoosh(image.file!, image.outputFormat);
    }
    
    const compressedSize = compressedBlob.size;
    onStatusChange('compressed', 'smoosh');
    
    // BOOST PHASE
    onStatusChange('boosting', 'boost');
    
    const { blob: finalBlob, applied } = await injectAllMetadata(
      compressedBlob,
      image.outputFormat === 'mozjpg' ? 'jpg' : image.outputFormat,
      state.metadataOptions
    );
    
    onStatusChange('complete', 'complete');
    
    return {
      ...image,
      status: 'complete',
      phase: 'complete',
      engine,
      compressedSize,
      compressedBlob,
      finalBlob,
      metadata: applied,
    };
    
  } catch (error) {
    onError(error.message);
    return {
      ...image,
      status: 'error',
      phase: 'error',
      error: error.message,
    };
  }
}
```

---

## File Validation

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_BATCH_SIZE = 20;
const VALID_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateFile(file: File): ValidationResult {
  const errors: string[] = [];
  
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`"${file.name}" exceeds 5MB limit (${formatBytes(file.size)})`);
  }
  
  if (!VALID_TYPES.includes(file.type)) {
    errors.push(`"${file.name}" is not a supported format (PNG or JPG only)`);
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
│   │   ├── UploadZone/
│   │   │   ├── UploadZone.tsx
│   │   │   ├── DragDropArea.tsx
│   │   │   ├── FilePickerButton.tsx
│   │   │   └── UrlImportPanel.tsx
│   │   ├── MetadataPanel/
│   │   │   ├── MetadataPanel.tsx
│   │   │   ├── GeoTagSection.tsx
│   │   │   ├── CopyrightSection.tsx
│   │   │   ├── TitleDescSection.tsx
│   │   │   └── AddressAutocomplete.tsx
│   │   ├── ImageQueue/
│   │   │   ├── ImageQueue.tsx
│   │   │   ├── ImageQueueItem.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── SummaryBar.tsx
│   │   ├── DownloadSection.tsx
│   │   └── Notifications/
│   │       ├── NotificationContainer.tsx
│   │       └── NotificationToast.tsx
│   ├── hooks/
│   │   ├── useImageQueue.ts
│   │   ├── useCompression.ts
│   │   ├── useTinyPng.ts
│   │   ├── useSquoosh.ts
│   │   ├── useMetadataInjection.ts
│   │   ├── useGeocode.ts
│   │   └── useNotifications.ts
│   ├── utils/
│   │   ├── fileHelpers.ts
│   │   ├── compressionRouter.ts
│   │   ├── metadataInjector.ts
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
  | 'metadata_injection_failed'
  | 'geocoding_failed';

interface AppNotification {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  errorType?: ErrorType;
  message: string;
  dismissable: boolean;
  autoDismiss: number | false;
}
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
