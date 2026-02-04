# SmooshBoost MVP Implementation Plan

## Overview
Create a React + Vite + TypeScript image compression tool matching the brand-guidelines-manager structure, with MVP features only (compression, no metadata injection).

## Target Directory
`/Users/shawnhiatt/Documents/GitHub/smooshboost`

## MVP Features
- Image upload (drag/drop + file picker)
- Max 10 images per batch
- Output format selection (PNG→PNG, JPG→MozJPG, JPG→WebP, PNG→WebP)
- Compression via Squoosh (client-side WASM) - TinyPNG integration deferred
- Download compressed images (individual + ZIP)
- Skip metadata injection (Boost phase)

---

## Project Structure (Matching brand-guidelines-manager)

```
smooshboost/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
├── .gitignore
├── .env.example
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.tsx                    # React entry point
│   │
│   ├── app/
│   │   ├── App.tsx                 # Main app component
│   │   ├── types.ts                # Core TypeScript interfaces
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Header.tsx
│   │   │   │
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   │
│   │   │   ├── upload/
│   │   │   │   └── UploadZone.tsx
│   │   │   │
│   │   │   ├── format/
│   │   │   │   └── FormatSelector.tsx
│   │   │   │
│   │   │   ├── queue/
│   │   │   │   ├── ImageQueue.tsx
│   │   │   │   ├── QueueItem.tsx
│   │   │   │   └── StatusIndicator.tsx
│   │   │   │
│   │   │   ├── summary/
│   │   │   │   └── SummaryBar.tsx
│   │   │   │
│   │   │   └── download/
│   │   │       └── DownloadSection.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useImageQueue.ts
│   │   │   ├── useCompression.ts
│   │   │   ├── useFileValidation.ts
│   │   │   └── useDownload.ts
│   │   │
│   │   ├── services/
│   │   │   ├── compression/
│   │   │   │   ├── compressionRouter.ts
│   │   │   │   └── squooshService.ts
│   │   │   │
│   │   │   └── download/
│   │   │       └── zipService.ts
│   │   │
│   │   └── utils/
│   │       ├── fileHelpers.ts
│   │       ├── formatBytes.ts
│   │       ├── generateId.ts
│   │       └── detectFormat.ts
│   │
│   └── styles/
│       └── index.css
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3.4 |
| Compression | @jsquash/jpeg, @jsquash/webp, @jsquash/oxipng (WASM) |
| ZIP | jszip |
| Icons | FontAwesome |
| Toasts | Sonner |
| Font | Roboto (Google Fonts CDN) |

---

## Implementation Steps

### Step 1: Initialize Vite Project
```bash
cd /Users/shawnhiatt/Documents/GitHub/smooshboost
npm create vite@latest . -- --template react-ts
```

### Step 2: Install Dependencies
```bash
npm install @jsquash/jpeg @jsquash/webp @jsquash/oxipng jszip sonner \
  @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome

npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
```

### Step 3: Configure Tailwind
Create `tailwind.config.ts` with design tokens:
- Primary: #4074A8 (Cake Blue)
- Accent: #F2A918 (Cake Yellow)
- Gray scale from guidelines
- Font: Roboto
- Spacing: 8px base grid

### Step 4: Configure Vite for WASM
```typescript
// vite.config.ts - exclude jSquash from optimization
optimizeDeps: {
  exclude: ['@jsquash/jpeg', '@jsquash/webp', '@jsquash/oxipng']
}
```

### Step 5: Create Type Definitions
```typescript
// src/app/types.ts
export type InputFormat = 'png' | 'jpg';
export type OutputFormat = 'png' | 'mozjpg' | 'webp';
export type ImageStatus = 'queued' | 'compressing' | 'complete' | 'error';

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  inputFormat: InputFormat;
  outputFormat: OutputFormat;
  status: ImageStatus;
  thumbnail: string | null;
  compressedBlob: Blob | null;
  compressedSize: number | null;
  error: string | null;
}
```

### Step 6: Build Utilities
- `generateId.ts` - crypto.randomUUID()
- `formatBytes.ts` - Human-readable file sizes
- `detectFormat.ts` - Determine PNG vs JPG from MIME
- `fileHelpers.ts` - Thumbnail generation, download helpers

### Step 7: Build Compression Services
- `squooshService.ts` - jSquash encoder wrappers
- `compressionRouter.ts` - Route to correct encoder based on format

### Step 8: Build Custom Hooks
- `useFileValidation.ts` - Validate files (5MB max, 10 batch limit)
- `useImageQueue.ts` - Manage image state array
- `useCompression.ts` - Process queue with status updates
- `useDownload.ts` - Individual and ZIP downloads

### Step 9: Build UI Components (bottom-up)
1. **Primitives**: Button, Select, Spinner
2. **Layout**: Header
3. **Upload**: UploadZone (drag/drop + file picker)
4. **Format**: FormatSelector
5. **Queue**: ImageQueue, QueueItem, StatusIndicator
6. **Summary**: SummaryBar
7. **Download**: DownloadSection

### Step 10: Assemble App.tsx
Wire up all hooks and components:
- Auto-start compression on file upload
- Display queue with real-time status
- Show savings summary
- Enable downloads when complete

### Step 11: Start Dev Server
```bash
npm run dev
```

---

## Compression Routing Logic

| Input | Output | Engine |
|-------|--------|--------|
| PNG | PNG | oxipng (Squoosh) |
| JPG | MozJPG | jpeg (Squoosh) |
| JPG | WebP | webp (Squoosh) |
| PNG | WebP | webp (Squoosh) |

*TinyPNG integration deferred - all compression via client-side WASM for MVP*

---

## Validation Rules
- Max file size: 5MB per image
- Max batch size: 10 images
- Valid formats: PNG, JPG/JPEG only

---

## Key Design Tokens (from guidelines)

```
Colors:
  primary: #4074A8
  accent: #F2A918
  gray-50: #F9FAFB through gray-900: #111827

Typography:
  font-family: 'Roboto', sans-serif

Spacing (8px grid):
  space-1: 4px, space-2: 8px, space-3: 12px, space-4: 16px...

Layout:
  max-width: 720px centered
```

---

## Verification Plan
1. Upload single PNG - verify compression and download
2. Upload single JPG - verify MozJPG conversion
3. Upload 10 images (batch limit) - verify all process
4. Try uploading 11th image - verify rejection with toast
5. Try uploading 6MB file - verify rejection
6. Test format switching before upload
7. Download individual files
8. Download all as ZIP
9. Clear queue and start fresh
10. Verify savings percentages display correctly

---

## Files to Preserve
The following files already exist in the target directory and should be preserved:
- `guidelines.md`
- `smooshboost-technical-spec.md`
- `smooshboost-quick-reference.md`
- `smooshboost-project-knowledge.md`
