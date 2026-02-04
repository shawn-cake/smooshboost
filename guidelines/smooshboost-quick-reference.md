# SmooshBoost - Quick Reference Card

**Tagline:** Smoosh & Boost Images

## What is SmooshBoost?
An image optimization suite for digital marketing agencies. Compress images for web performance (Smoosh), then inject SEO-relevant metadata (Boost).

---

## Two-Phase Workflow

```
Upload → SMOOSH (compress) → BOOST (metadata) → Download
```

| Phase | What Happens |
|-------|--------------|
| Smoosh | Compress via TinyPNG/Squoosh, strips existing metadata |
| Boost | Inject geo-tags, copyright, title/description |

---

## Compression Routing

| Input | Output | Engine |
|-------|--------|--------|
| PNG | PNG | TinyPNG API (Squoosh fallback) |
| PNG | WebP | Squoosh |
| JPG | MozJPG | Squoosh |
| JPG | WebP | Squoosh |

---

## Metadata Options (Boost Phase)

| Option | Format Support | SEO Value |
|--------|----------------|-----------|
| Geo-tagging | JPG only | Local SEO |
| Copyright | JPG (full), PNG/WebP (limited) | Attribution |
| Title/Description | JPG (full), PNG/WebP (limited) | Image search |

---

## Key Constraints

| Constraint | Value |
|------------|-------|
| Max batch size | 20 images |
| Max file size | 5 MB per image |
| Supported inputs | PNG, JPG, JPEG |
| Supported outputs | PNG, WebP, MozJPG |
| TinyPNG free quota | 500/month |

---

## Core Features

**Upload**
- [x] Drag and drop
- [x] File picker
- [x] Bulk URL import

**Smoosh (Compression)**
- [x] Auto engine routing
- [x] TinyPNG quota fallback
- [x] Savings display

**Boost (Metadata)**
- [x] Geo-tagging (address autocomplete)
- [x] Copyright text
- [x] Title/description
- [x] Apply to all toggle
- [ ] Client presets (future)

**Download**
- [x] Individual downloads
- [x] ZIP download
- [x] Filename preservation

---

## UI Sections

1. **Header** — Logo + tagline
2. **Upload Zone** — Drag/drop + file picker + URL import
3. **Metadata Panel** — Collapsible options (geo, copyright, title)
4. **Queue** — Images with status and savings
5. **Summary Bar** — Total savings
6. **Download Section** — ZIP + clear queue

---

## Status States

| Status | Icon | Color |
|--------|------|-------|
| Queued | ○ | Gray 400 (`#9CA3AF`) |
| Compressing | ● | Cake Blue (`#4074A8`) |
| Boosting | ● + tag | Cake Blue (`#4074A8`) |
| Complete | ✓ | Success (`#059669`) |
| Error | ✗ | Error (`#DC2626`) |

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
| Font | Roboto |
| Fallback | -apple-system, BlinkMacSystemFont, Inter, "Segoe UI", sans-serif |
| Mono | Roboto Mono |

### Spacing & Radii

| Token | Value |
|-------|-------|
| Base unit | 8px grid |
| radius-sm | 4px (badges) |
| radius | 6px (buttons, inputs) |
| radius-md | 8px (cards, panels) |
| radius-lg | 12px (modals) |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Build | Vite |
| Compression | TinyPNG + @aspect-image/squoosh |
| Metadata | piexifjs |
| Geocoding | Google Places API (optional) |
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

| Error | Cause |
|-------|-------|
| `file_too_large` | Exceeds 5MB |
| `invalid_format` | Not PNG/JPG |
| `batch_limit_exceeded` | More than 20 images |
| `quota_exceeded` | TinyPNG limit reached |
| `compression_failed` | Engine error |
| `metadata_injection_failed` | EXIF write error |
| `geocoding_failed` | Address lookup failed |

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
