# SmooshBoost - Quick Reference Card

**Tagline:** Smoosh & Boost Images

## What is SmooshBoost?
An image optimization suite for digital marketing agencies. Compress images for web performance (Smoosh), then inject SEO-relevant metadata (Boost).

---

## Workflow

## Streamlined Workflow

```
Upload → [Auto-Compress] → [🚀 Boost per image] → Download
```

| Phase | What Happens | Trigger |
|-------|--------------|---------|
| Smoosh | Auto-compress, strips existing metadata | Automatic on upload |
| Boost | Configure geo-tags, copyright, title/description per image | Click 🚀 accordion |

**Boost Only toggle:** A checkbox that skips compression entirely. When enabled, images go straight to the Boost phase without being compressed.

---

## Compression Routing

| Input | Output | Engine |
|-------|--------|--------|
| PNG | PNG | TinyPNG API (OxiPNG fallback) |
| PNG | WebP | @jsquash/webp |
| PNG | MozJPG | @jsquash/jpeg |
| JPG | MozJPG | @jsquash/jpeg |
| JPG | WebP | @jsquash/webp |
| JPG | PNG | TinyPNG API (OxiPNG fallback) |
| WebP | WebP | @jsquash/webp |
| WebP | MozJPG | @jsquash/jpeg |
| WebP | PNG | TinyPNG API (OxiPNG fallback) |

---

## Metadata Options (Boost Phase)

| Metadata Type | JPG/MozJPG | PNG | WebP | SEO Value |
|---------------|------------|-----|------|-----------|
| Geo-tagging (GPS) | ✅ Full EXIF | ❌ No support | ✅ Full EXIF | Local SEO |
| Copyright | ✅ Full EXIF | ✅ tEXt chunks | ✅ Full EXIF | Attribution |
| Title/Description | ✅ Full EXIF | ✅ tEXt chunks | ✅ Full EXIF | Image search |

**Notes:**
- JPG and WebP have full EXIF support including GPS coordinates
- PNG supports text metadata via tEXt chunks but cannot store GPS coordinates
- GPS metadata is supported in JPG and WebP formats (not PNG)

---

## Key Constraints

| Constraint | Value |
|------------|-------|
| Max batch size | 20 images |
| Max file size | 5 MB per image |
| Supported inputs | PNG, JPG, JPEG, WebP |
| Supported outputs | PNG, WebP, MozJPG |
| TinyPNG free quota | 500/month |

---

## Core Features

**Upload**
- [x] Drag and drop
- [x] File picker

**Smoosh (Compression)**
- [x] Auto-compression on upload
- [x] Auto engine routing (MozJPG, OxiPNG, WebP)
- [x] Savings display per image
- [x] Progress indicator in status bar

**Boost (Metadata) - Per Image**
- [x] 🚀 Accordion per image in queue
- [x] Geo-tagging via Google Maps link parsing (no API cost)
- [x] Geo-tagging via manual coordinates
- [x] Copyright and Author fields (separate)
- [x] Title/description with character counters
- [x] Apply Metadata button per image
- [x] Apply to All Images button
- [x] Read-only mode after applying (with Reset option)
- [x] Format compatibility warnings (PNG no GPS)
- [ ] Client presets (future)

**Download**
- [x] Individual downloads per image
- [x] ZIP download ("Download All")
- [x] Filename preservation
- [x] Format conversion summary in summary bar

---

## UI Sections

1. **Header** — Logo + info tooltip (top right)
2. **Upload Zone** — Drag/drop + file picker
3. **Format Selector** — Format mode (hidden when images in queue)
4. **Queue** — Images with status, savings, 🚀 Boost accordion per image
5. **Processing Status** — Compression progress bar
6. **Summary Bar** — Total savings + format conversion info
7. **Download Section** — Download All + Clear Queue buttons

---

## Status States

| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| Queued | ○ | Gray 400 | Waiting to compress |
| Compressing | ● | Cake Blue | Compression in progress |
| Complete | ✓ | Success | Ready for Boost or download |
| Boosting | ● | Cake Blue | Applying metadata |
| Boosted | ✓ + tag | Success | Metadata applied |
| Boost Error | ✗ | Error | Metadata failed (image still downloadable) |
| Error | ✗ | Error | Compression failed |

---

## Boost Status States

| Status | Description |
|--------|-------------|
| `pending` | Not yet boosted |
| `boosting` | Currently injecting metadata |
| `boosted` | Metadata successfully applied |
| `boost-skipped` | User skipped Boost phase |
| `boost-failed` | Metadata injection failed |

---

## Design Tokens

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| Cake Blue | `#4074A8` | Primary actions, processing |
| Blue 50 | `#EBF1F7` | Hover backgrounds |
| Blue 100 | `#D1E0EE` | Focus rings |
| Blue 700 | `#2D5276` | Pressed states |
| Cake Yellow | `#F2A918` | Warnings, accent CTAs |
| Yellow 50 | `#FEF7E6` | Warning backgrounds |
| Yellow 700 | `#B87D0E` | Warning text |
| Success | `#059669` | Complete, savings |
| Error | `#DC2626` | Errors, failures |
| Gray 800 | `#1F2937` | Primary text |
| Gray 500 | `#6B7280` | Secondary text |
| Gray 300 | `#D1D5DB` | Borders |
| Gray 100 | `#F3F4F6` | Backgrounds |

### Typography

| Token | Value |
|-------|-------|
| Body Font | Spline Sans Mono (`--font-sans`, `--font-mono`) |
| Heading Font | Syne (`--font-heading`) — headings only |
| Scaling | Fluid: 100% at ≤1024px → 120% at ≥1200px via `clamp()` |
| Body text class | `text-xs` (downshifted from text-sm for mono visual sizing) |
| Heading classes | `text-2xl font-heading` (H1), `text-base font-heading` (H2) |

### Spacing & Radii

| Token | Value |
|-------|-------|
| Base unit | 8px grid (rem-based: 0.25rem–3rem) |
| radius-sm | 4px (badges) |
| radius | 6px (buttons, inputs) |
| radius-md | 8px (cards, panels) |
| radius-lg | 12px (modals) |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript 5.9 |
| Styling | Tailwind CSS |
| Build | Vite |
| Compression | TinyPNG + @jsquash libraries (MozJPEG, OxiPNG, WebP via WASM) |
| Metadata (JPG) | piexifjs (EXIF writing) |
| Metadata (PNG) | png-chunk-text (tEXt chunks) |
| Metadata (WebP) | Custom RIFF chunk manipulation (browser-native) |
| Geo Parsing | Google Maps link regex (primary, no API) |
| Geocoding | Google Places API (optional enhancement) |
| ZIP | JSZip |
| Icons | FontAwesome |
| Toasts | Sonner |

---

## File Output Naming

Original filename preserved. Extension changes if format changes:
- `photo.jpg` → `photo.jpg` (MozJPG)
- `photo.jpg` → `photo.webp` (WebP)
- `image.png` → `image.png` (TinyPNG)
- `image.png` → `image.webp` (WebP)

---

## Error Types

| Error | Cause | Type |
|-------|-------|------|
| `file_too_large` | Exceeds 5MB | Error |
| `invalid_format` | Not PNG/JPG/WebP | Error |
| `batch_limit_exceeded` | More than 20 images | Error |
| `quota_exceeded` | TinyPNG limit reached | Error |
| `compression_failed` | Engine error | Error |
| `metadata_injection_failed` | Technical error during EXIF/chunk write | Error |
| `metadata_format_unsupported` | Format doesn't support requested metadata (e.g., PNG + GPS) | Warning |
| `geocoding_failed` | Address lookup failed | Error |
| `geocoding_parse_failed` | Google Maps link couldn't be parsed | Error |
| `coordinate_out_of_range` | Lat/long outside valid range | Error |

**Notes:**
- `metadata_format_unsupported` is a non-blocking warning. Processing continues and unsupported metadata is skipped.
- Boost errors don't prevent download—images are still available (compressed, without metadata).

---

## Target Users

- Digital marketing agencies
- SEO specialists
- Web developers optimizing client assets

---

## Future Features (v2+)

- Client presets
- Batch metadata templates
- Export report (CSV/PDF)
- IPTC keywords
- Filename slugification
- API mode
- Team features
