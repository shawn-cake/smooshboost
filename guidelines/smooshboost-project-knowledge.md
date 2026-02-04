# SmooshBoost - Project Knowledge Document

**Tagline:** Smoosh & Boost Images

## Project Overview

**SmooshBoost** is a browser-based image optimization suite designed for digital marketing agencies. The tool follows a two-phase workflow: first compress images for web performance (Smoosh), then selectively inject SEO-relevant metadata (Boost).

### Core Purpose
Provide an efficient, agency-focused interface for batch image optimization that combines compression with strategic metadata injection for local SEO and proper attribution.

### Target Users
- **Primary:** Digital marketing agencies optimizing client images
- **Secondary:** Web developers and SEO specialists
- **Skill level:** Marketing professionals comfortable with web tools

---

## Two-Phase Workflow

### Phase 1: Smoosh (Compression)
Strip images down to optimal file size using intelligent compression routing.

- Compression removes existing metadata (clean slate)
- Automatic engine selection based on format
- Batch processing up to 20 images

### Phase 2: Boost (Metadata Injection)
Selectively re-inject only the metadata that matters for SEO and attribution.

- Geo-tagging for local SEO
- Copyright and attribution
- Title and description
- Client presets for repeated workflows

```
WORKFLOW DIAGRAM

Upload Images
    ↓
[SMOOSH PHASE]
Compress via TinyPNG/Squoosh
    ↓
Metadata stripped (clean slate)
    ↓
[BOOST PHASE]
Inject selected metadata
    ├── Geo-location (lat/long)
    ├── Copyright text
    ├── Title/Description
    └── Custom fields (future)
    ↓
Download optimized + tagged images
```

---

## Compression Routing Logic

### TinyPNG API
- **Use for:** PNG → PNG compression only
- **Fallback:** If monthly API quota (500 free compressions) is exhausted, route to Squoosh
- **API Key:** Environment variable or user-provided
- **File size limit:** 5MB per image

### Squoosh (Client-Side)
- **Use for:**
  - JPG → MozJPG
  - JPG → WebP
  - PNG → WebP
- **Also use when:** TinyPNG quota is exhausted (for PNG → PNG)
- **Execution:** Runs entirely client-side via WebAssembly
- **Settings:** Optimal/default quality settings (no user adjustment)

### Routing Decision Tree
```
INPUT IMAGE
    │
    ├── PNG file
    │   └── Output: PNG?
    │       ├── YES → TinyPNG API (if quota available)
    │       │         └── Quota exhausted? → Squoosh
    │       └── NO (WebP) → Squoosh
    │
    └── JPG/JPEG file
        └── Output: MozJPG or WebP → Squoosh
```

---

## Core Features

### 1. Image Upload
- **Drag and drop zone** - Primary upload method
- **File picker button** - Secondary method ("Select Files")
- **URL import** - Bulk URLs in a textarea (one URL per line)
- **Batch limit:** 20 images maximum per session
- **Supported input formats:** PNG, JPG, JPEG

### 2. Output Format Selection
- PNG → PNG (TinyPNG)
- JPG → MozJPG (Squoosh)
- JPG → WebP (Squoosh)
- PNG → WebP (Squoosh)

### 3. Compression Queue View
Display a list of queued images showing:
- Thumbnail preview
- Filename
- Original file size
- Status (Queued / Compressing / Boosting / Complete / Error)
- Compression engine used
- Savings after completion:
  - **Primary:** Percentage saved (e.g., "72% smaller")
  - **Secondary:** Absolute size reduction (e.g., "1.2 MB → 340 KB")

### 4. Metadata Options Panel (Boost Phase)
Collapsible panel with toggle-enabled options:

#### Geo-tagging
- Address input field with autocomplete (Google Places API)
- Auto-populated coordinates display
- Manual lat/long override option
- Apply to all images toggle

#### Copyright/Attribution
- Text field for copyright notice
- Template variables: `{year}`, `{client}`
- Example: "© {year} {client}. All rights reserved."

#### Title & Description
- Per-image or bulk apply
- Character count indicators
- SEO-friendly length guidelines

#### Client Presets (Future)
- Save metadata configurations per client
- Quick-select dropdown
- Edit/delete preset management

### 5. Summary Statistics
After batch completion, display:
- Total original size
- Total compressed size
- Total savings percentage (primary)
- Total savings in MB/KB (secondary)
- Metadata applied count

### 6. Download Options
- **Individual downloads** - Button per image
- **Download all as ZIP** - Single button for entire batch
- **Filename handling:**
  - Preserve original filenames
  - Change extension if format changed
  - Optional: SEO-friendly rename (slugify)

### 7. Error Handling
- **File too large:** Display notification if image exceeds 5MB
- **Invalid format:** Notify if uploaded file is not PNG/JPG
- **API quota exceeded:** Automatically switch to Squoosh, notify user
- **Network errors:** Display retry option
- **URL fetch failures:** Show which URLs failed to import
- **Metadata injection failed:** Indicate which images failed boost phase
- **Geocoding failed:** Show address lookup errors

---

## User Interface Requirements

### Design System Reference

For complete design specifications, see `smooshboost-guidelines.md`. Key tokens summarized below.

### Colors

```
Primary Colors:
Cake Blue:       #4074A8  (buttons, active states, processing)
Cake Yellow:     #F2A918  (warnings, quota notifications, accent CTAs)

Blue Tints:
Blue 50:         #EBF1F7  (hover backgrounds)
Blue 100:        #D1E0EE  (focus rings)
Blue 200:        #A3C1DD  (borders on blue elements)
Blue 700:        #2D5276  (pressed states)
Blue 900:        #1A3044  (deep contrast)

Yellow Tints:
Yellow 50:       #FEF7E6  (warning backgrounds)
Yellow 100:      #FDE9B8  (highlight backgrounds)
Yellow 700:      #B87D0E  (warning text)

Grays:
Gray 50:         #F9FAFB  (page background)
Gray 100:        #F3F4F6  (panel backgrounds)
Gray 200:        #E5E7EB  (borders, dividers)
Gray 300:        #D1D5DB  (drop zone border, disabled states)
Gray 400:        #9CA3AF  (placeholder text, muted icons)
Gray 500:        #6B7280  (secondary text)
Gray 600:        #4B5563  (body text primary)
Gray 700:        #374151  (headings, labels)
Gray 800:        #1F2937  (dark headings)
Gray 900:        #111827  (maximum contrast)

Semantic:
Success:         #059669  (complete status, savings display)
Success Light:   #D1FAE5  (success backgrounds)
Error:           #DC2626  (errors, failures)
Error Light:     #FEE2E2  (error backgrounds)
```

### Typography

- **Primary Font:** Roboto (Google Fonts)
- **Fallback:** -apple-system, BlinkMacSystemFont, Inter, "Segoe UI", sans-serif
- **Monospace:** Roboto Mono (file sizes, coordinates)
- Body text: 14px regular
- Headings: 16-24px semibold
- Savings percentage: 16px semibold, Success Green

### Spacing

- Base unit: 8px grid
- Common spacing: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px
- Generous whitespace throughout

### Component Patterns

- Border radius: 6px for buttons/inputs, 8px for cards/panels, 4px for badges
- Shadows: Minimal, `0 1px 3px rgba(0,0,0,0.1)` for elevation
- Focus states: 3px Blue 100 ring
- Transitions: 150ms ease for hover/focus states

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
│ SmooshBoost              [minimal branding]                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ UPLOAD ZONE                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ │              Drop images here                               │ │
│ │                    or                                       │ │
│ │              [Select Files]                                 │ │
│ │                                                             │ │
│ │  ▸ Import from URLs                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ METADATA OPTIONS (collapsible)                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☑ Add geo-location                                         │ │
│ │   [Address field with autocomplete        ]                │ │
│ │   35.5951° N, 82.5515° W                                   │ │
│ │                                                             │ │
│ │ ☑ Add copyright                                            │ │
│ │   [© 2026 Client Name. All rights reserved.]               │ │
│ │                                                             │ │
│ │ ☐ Add title/description                                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ QUEUE                                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [thumb] filename.png                                       │ │
│ │         1.4 MB → 448 KB (68% smaller)                      │ │
│ │         ✓ Complete · TinyPNG · Geo-tagged          [↓]     │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ [thumb] photo.jpg                                          │ │
│ │         Processing...                              ●       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ SUMMARY BAR                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 5 images · 8.2 MB → 2.1 MB · 74% total savings             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ DOWNLOAD SECTION                                                │
│         [Download All as ZIP]    [Clear Queue]                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Main content:** max-width 720px, centered with generous padding

### Status Indicators

| Status | Visual | Color |
|--------|--------|-------|
| Queued | Circle outline | Gray 400 |
| Compressing | Spinner | Cake Blue |
| Boosting | Spinner + tag icon | Cake Blue |
| Complete | Checkmark | Success |
| Error | X icon | Error |

### Queue Item States

**Processing state:**
```
[thumb] filename.png
        Compressing...                              ●
```

**Complete state:**
```
[thumb] filename.png
        1.4 MB → 448 KB (68% smaller)
        ✓ Complete · TinyPNG · Geo-tagged          [↓]
```

**Error state:**
```
[thumb] filename.png
        ✗ Compression failed: Network error       [Retry]
```

---

## Technical Requirements

### API Integrations

#### TinyPNG
- Endpoint: `https://api.tinify.com/shrink`
- Authentication: HTTP Basic Auth with API key
- Request: POST with image binary
- Response: JSON with compressed image URL
- Track `Compression-Count` header for quota monitoring

#### Google Places API (Optional)
- Address autocomplete for geo-tagging
- Geocoding to convert address → coordinates
- Requires API key with Places and Geocoding enabled

#### Squoosh
- Use `@aspect-image/squoosh` or official WASM modules
- MozJPG encoder for JPG output
- WebP encoder for WebP output
- OxiPNG encoder for PNG fallback
- Run in Web Worker to prevent UI blocking

### Metadata Injection

#### Library: piexifjs (for JPG/JPEG)
- Read/write EXIF data
- GPS coordinate injection
- Copyright and description fields

#### Supported Metadata by Format

| Format | GPS | Copyright | Title/Desc | Library |
|--------|-----|-----------|------------|---------|
| JPG | ✓ | ✓ | ✓ | piexifjs |
| PNG | ✗ | Limited | Limited | png-metadata |
| WebP | Limited | Limited | Limited | Custom XMP |

**Note:** GPS metadata is best supported in JPG. For local SEO use cases requiring geo-tagging, recommend JPG output format.

### State Management
- Track each image through both phases
- Calculate savings after compression
- Track which metadata options were applied
- Aggregate totals for summary

### File Handling
- FileReader API for local files
- Fetch API for URL imports
- Blob URLs for previews and downloads
- JSZip for batch ZIP generation

---

## Expansion Considerations

### Future Features (v2+)
- **Client presets:** Save and recall metadata configurations
- **Batch metadata templates:** Apply different metadata to image groups
- **Export report:** CSV/PDF summary for client deliverables
- **IPTC keywords:** Additional metadata for stock photo workflows
- **Filename slugification:** Auto-rename for SEO-friendly URLs
- **API mode:** Headless processing for automation
- **Team features:** Shared presets, usage tracking

### Extensibility Points
- Plugin architecture for new metadata types
- Additional compression engines
- Custom output formats
- Integration with DAM systems
- Webhook notifications on completion

---

## Session Behavior
- No persistent history (each visit is fresh)
- Client presets stored in localStorage (future)
- No user accounts required for core functionality
- Optional team features would require authentication (future)

---

## Deployment Context
- Static hosting (Vercel, Netlify, or custom server)
- Environment variables for API keys
- Optional backend proxy for API key security
- CORS considerations for URL imports

---

## File Naming Convention
- Compressed files keep original filename by default
- Extension changes only if format changes:
  - `photo.jpg` → `photo.jpg` (MozJPG)
  - `photo.jpg` → `photo.webp` (WebP conversion)
  - `image.png` → `image.webp` (WebP conversion)
  - `image.png` → `image.png` (TinyPNG)
- Future: Optional SEO-friendly slugification

---

## Success Metrics
- Images compress with expected savings (target: 50-80% reduction)
- Metadata injection completes without errors
- Clear indication of which optimizations were applied
- Easy batch download workflow
- Graceful handling of errors and edge cases
- Faster than manual optimization workflows
