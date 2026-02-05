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

## Workflow

Complete optimization: auto-compress images, then optionally add metadata per image.
```
Upload → [Auto-Compress] → [🚀 Boost per image] → Download
```

---

## Streamlined Workflow

### Phase 1: Smoosh (Compression)
Strip images down to optimal file size using intelligent compression routing.

- **Auto-starts on upload** — No button click required
- Compression removes existing metadata (clean slate)
- Automatic engine selection based on format
- Batch processing up to 20 images
- Progress shown in status bar

### Phase 2: Boost (Metadata Injection)
Selectively inject metadata per image via the 🚀 accordion.

- **Per-image configuration** — Each image has its own Boost accordion
- Geo-tagging for local SEO (JPG/WebP only, disabled for PNG)
- Copyright and Author (separate fields)
- Title and description with character counters
- **Apply Metadata** button per image
- **Apply to All Images** to copy settings across batch
- **Read-only after apply** with Reset option
- Client presets for repeated workflows (future)

```
WORKFLOW DIAGRAM

Upload Images
    ↓
[FORMAT SELECTOR]
(hidden once images are in queue)
    ↓
┌─────────────────────────────────────────────┐
│ [AUTO-COMPRESS]                             │
│ Compression starts automatically            │
│ Progress shown in status bar                │
│ Metadata stripped (clean slate)             │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ [QUEUE WITH 🚀 BOOST ACCORDIONS]            │
│ Each image shows:                           │
│   ├── Thumbnail + filename                  │
│   ├── Status + savings                      │
│   └── 🚀 Boost Options accordion            │
│                                             │
│ Click accordion to configure:               │
│   ├── Geo-location (JPG/WebP only)          │
│   ├── Copyright + Author                    │
│   └── Title + Description                   │
│                                             │
│ [Apply Metadata] per image                  │
│ [Apply to All Images] to copy settings      │
│ [Reset & Edit Metadata] after applying      │
└─────────────────────────────────────────────┘
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

#### Metadata Status Badges (Per Image)
Below compression details, show metadata status:
- `📍 Geo: Not set` / `📍 Geo: 35.59°N, 82.55°W`
- `©: Not set` / `©: © 2026 Client`
- `📝: Not set` / `📝: Title set`

**Badge Colors:**
- Not set: Gray 400
- Set: Primary Blue (before boost) / Success Green (after boost)

#### Per-Image Metadata Editing
- "Edit" button on each queue item (Per Image mode)
- Expandable inline form with compact fields
- "Save" and "Cancel" buttons
- Form collapses after save

#### Expandable Metadata Details
- Click badge row to expand full metadata view
- Shows complete values (not truncated)
- Chevron indicator for expand/collapse state

### 4. Metadata Options Panel (Boost Phase)
Collapsible panel (collapsed by default) with checkbox-enabled options.

#### Metadata Application Modes

**Apply to All (Default):**
- Global metadata settings applied to entire batch
- Single form for all images
- Inline warning banners for format compatibility issues

**Per Image:**
- Expandable form per queue item
- Each image can have different metadata
- Format-specific validation per image
- "Edit" button on each queue item

#### Geo-tagging

**Primary Method: Google Maps/Place Link Parsing (No API Cost)**
- Paste Google Maps or Google Place URL
- Click "Parse Location" button to extract coordinates
- Supports URL patterns:
  - `maps.google.com/?q=LAT,LNG`
  - `google.com/maps/@LAT,LNG,ZOOM`
  - `google.com/maps/place/NAME/@LAT,LNG`
  - Plus codes

**Alternative Method: Manual Coordinate Entry**
- Latitude field: -90 to 90 (decimal degrees)
- Longitude field: -180 to 180 (decimal degrees)

**Optional Enhancement: Google Places API**
- Address autocomplete (requires API key)
- Auto-populated coordinates from address
- Fallback to manual entry if not configured

**Current Coordinates Display:**
- Format: `35.5951° N, 82.5515° W`
- Monospace font, Primary Blue color

#### Copyright/Attribution
- Text field for copyright notice
- Template variables: `{year}`, `{client}`
- Example: "© {year} {client}. All rights reserved."
- Character counter: X / 160 characters

#### Title & Description
- Title field: 60 character soft limit (SEO recommendation)
- Description textarea: 160 character soft limit
- Character counters with color indicators:
  - Normal: Gray
  - Over soft limit: Yellow 700
  - Over hard limit: Error Red
- SEO guideline tooltip

#### Client Presets (Future)
- Save metadata configurations per client
- Quick-select dropdown
- Edit/delete preset management

#### Format Compatibility Warnings

When metadata type isn't supported by output format:

**Apply to All Mode:**
- Inline warning banner in geo-tagging section
- Yellow background, warning icon
- Non-blocking: user can still process

**Per Image Mode:**
- Disabled checkbox for unsupported metadata types
- Tooltip explaining limitation

### 5. Summary Statistics
After batch completion, display:
- Total original size
- Total compressed size
- Total savings percentage (primary)
- Total savings in MB/KB (secondary)

**Metadata Summary Line (after Boost):**
- Format: `Metadata: X geo-tagged · Y with copyright · Z with titles`
- Only show counts for enabled/applied metadata types
- Font: 13px regular, Gray 600

### 6. Download Options
- **Individual downloads** - Button per image with metadata indicators
- **Download all as ZIP** - Single button for entire batch
  - Button text: "Download All with Metadata (ZIP)" (if metadata applied)
  - Button text: "Download All (ZIP)" (if no metadata)
- **Filename handling:**
  - Preserve original filenames
  - Change extension if format changed
  - Optional: SEO-friendly rename (slugify)

**Individual Download List:**
- Format: `filename.ext (size, metadata-tags)`
- Tags shown: `geo-tagged`, `©`, `title`

### 7. Error Handling

**Blocking Errors (stop processing):**
- **File too large:** Display notification if image exceeds 5MB
- **Invalid format:** Notify if uploaded file is not PNG/JPG
- **API quota exceeded:** Automatically switch to Squoosh, notify user
- **Network errors:** Display retry option
- **URL fetch failures:** Show which URLs failed to import
- **Metadata injection failed:** Technical error during EXIF/chunk write
- **Geocoding failed:** Show address lookup errors

**Non-Blocking Warnings (processing continues):**
- **Metadata format unsupported:** When format doesn't support requested metadata (e.g., PNG + GPS). Display inline warning, skip unsupported metadata, continue processing.

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
│ PROCESSING BUTTONS                                              │
│ [Add Metadata (Boost)] [Skip & Download]                       │
│                                                                 │
│ METADATA OPTIONS (collapsible, collapsed by default)            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▸ Metadata Options (Optional - Boost Phase)          (0/3) │ │
│ │ ─────────────────────────────────────────────────────────── │ │
│ │ Apply settings: ● To all images  ○ Per image               │ │
│ │                                                             │ │
│ │ ☑ Add geo-location (Local SEO)                             │ │
│ │   Google Maps/Place Link: [_______________] [🎯]           │ │
│ │   Or manually: Lat [____] Long [____]                      │ │
│ │   Current: 35.5951° N, 82.5515° W                          │ │
│ │                                                             │ │
│ │ ☑ Add copyright notice                                     │ │
│ │   [© 2026 Client Name. All rights reserved.]               │ │
│ │                                                             │ │
│ │ ☐ Add title & description (Image SEO)                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ QUEUE                                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [thumb] filename.png                                       │ │
│ │         1.4 MB → 448 KB (68% smaller)                      │ │
│ │         ✓ Compressed · TinyPNG                             │ │
│ │         📍 Geo: 35.59°N · ©: Client · 📝: Title     [Edit] │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ [thumb] photo.jpg                                          │ │
│ │         Boosting... Adding metadata                  ●     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ SUMMARY BAR                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 5 images · 8.2 MB → 2.1 MB · 74% total savings             │ │
│ │ Metadata: 5 geo-tagged · 5 with copyright · 3 with titles  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ DOWNLOAD SECTION                                                │
│   [Download All with Metadata (ZIP)]    [Clear Queue]           │
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

**Compressing state:**
```
[thumb] filename.png
        Compressing...                              ●
```

**Compressed (awaiting Boost):**
```
[thumb] filename.png
        1.4 MB → 448 KB (68% smaller)
        ✓ Compressed · TinyPNG
        📍 Geo: Not set · ©: Not set · 📝: Not set  [Edit]
```

**Boosting state:**
```
[thumb] filename.png
        1.4 MB → 448 KB (68% smaller)
        Boosting... Adding metadata                 ●
```

**Complete (with metadata):**
```
[thumb] filename.png
        1.4 MB → 448 KB (68% smaller)
        ✓ Complete · TinyPNG · Geo-tagged
        📍 35.59°N · © Client · 📝 Title           [▾]
```

**Metadata Details (expanded):**
```
[thumb] filename.png
        1.4 MB → 448 KB (68% smaller)
        ✓ Complete · TinyPNG
        ▾ Metadata Applied                         [↓]
        ─────────────────────────────────────────────
        📍 Geo-location: 35.5951° N, 82.5515° W
        © Copyright: © 2026 Client Name. All rights...
        📝 Title: Professional landscape photo
           Description: High-quality image optimized...
```

**Compression error state:**
```
[thumb] filename.png
        ✗ Compression failed: Network error       [Retry]
```

**Boost error state:**
```
[thumb] filename.png
        1.4 MB → 448 KB (68% smaller)
        ✗ Metadata failed: EXIF write error       [Retry]
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

#### Google Maps Link Parsing (Primary - No API Cost)
Extract coordinates directly from Google Maps/Place URLs:
- URL patterns supported:
  - `maps.google.com/?q=LAT,LNG`
  - `google.com/maps/@LAT,LNG,ZOOM`
  - `google.com/maps/place/NAME/@LAT,LNG`
  - Plus codes: `google.com/maps/place/849V+XW`
- User pastes URL, clicks "Parse Location" button
- Coordinates extracted via regex parsing
- No API costs or rate limits

#### Google Places API (Optional Enhancement)
- Address autocomplete for geo-tagging
- Geocoding to convert address → coordinates
- Requires API key with Places and Geocoding enabled
- Fallback: Manual coordinate entry or Maps link parsing

#### Squoosh
- Use `@aspect-image/squoosh` or official WASM modules
- MozJPG encoder for JPG output
- WebP encoder for WebP output
- OxiPNG encoder for PNG fallback
- Run in Web Worker to prevent UI blocking

### Metadata Injection

#### Libraries by Format
- **JPG/JPEG:** piexifjs (full EXIF read/write)
- **PNG:** png-chunk-text / png-chunks-encode (tEXt chunks)
- **WebP:** node-webpmux (EXIF chunk injection)

#### Supported Metadata by Format

| Metadata Type | JPG/MozJPG | PNG | WebP |
|---------------|------------|-----|------|
| Geo-tagging (GPS) | ✅ Full support via EXIF | ❌ No support | ✅ Full support via EXIF chunk |
| Copyright | ✅ Full support via EXIF | ✅ Supported via tEXt chunks | ✅ Full support via EXIF chunk |
| Title/Description | ✅ Full support via EXIF | ✅ Supported via tEXt chunks | ✅ Full support via EXIF chunk |

**Technical Notes:**
- JPG and WebP have full EXIF support including GPS coordinates
- PNG supports text metadata via tEXt chunks but cannot store GPS coordinates
- GPS metadata is supported in JPG and WebP formats (not PNG)

#### Metadata Format Warnings (Non-Blocking)

When users enable metadata options that aren't supported by their selected output format, the UI displays inline warnings. Processing continues (non-blocking) and unsupported metadata is skipped.

**Warning Trigger:**
- Geo-tagging enabled + PNG output format selected

**Warning Style:**
- Background: Yellow 50 (`#FEF7E6`)
- Text: Yellow 700 (`#B87D0E`)
- Icon: Warning triangle

**Warning Message:**
```
PNG does not support GPS coordinates. Switch to JPG or WebP for geo-tagged images, or disable geo-tagging to proceed.
```

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
