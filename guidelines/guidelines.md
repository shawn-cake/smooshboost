# SmooshBoost - Design Guidelines

## Overview

This document defines the visual design system for SmooshBoost, an image optimization suite for Cake marketing agency. The design should feel professional, clean, and highly functional—prioritizing clarity and ease of use for batch image compression and metadata injection workflows.

---

## Color Palette

### Primary Colors

| Name | HEX | Usage |
|------|-----|-------|
| **Cake Blue** | `#4074A8` | Primary actions, active states, links, processing indicators, focus rings |
| **Cake Yellow** | `#F2A918` | Secondary actions, highlights, warnings, quota notifications |

### Blue Tints (for backgrounds, hover states, borders)

| Name | HEX | Usage |
|------|-----|-------|
| Blue 50 | `#EBF1F7` | Light backgrounds, hover states |
| Blue 100 | `#D1E0EE` | Selected item backgrounds, focus rings |
| Blue 200 | `#A3C1DD` | Borders, dividers on blue elements |
| Blue 700 | `#2D5276` | Darker text on blue, pressed states |
| Blue 900 | `#1A3044` | Deep contrast, headings on light backgrounds |

### Yellow Tints

| Name | HEX | Usage |
|------|-----|-------|
| Yellow 50 | `#FEF7E6` | Warning backgrounds, quota notification panels |
| Yellow 100 | `#FDE9B8` | Highlight backgrounds |
| Yellow 700 | `#B87D0E` | Warning text, darker accents |

### Grays (Neutral Palette)

| Name | HEX | Usage |
|------|-----|-------|
| Gray 50 | `#F9FAFB` | Page backgrounds |
| Gray 100 | `#F3F4F6` | Panel backgrounds, input backgrounds |
| Gray 200 | `#E5E7EB` | Borders, dividers |
| Gray 300 | `#D1D5DB` | Drop zone border, disabled states |
| Gray 400 | `#9CA3AF` | Placeholder text, muted icons, queued status |
| Gray 500 | `#6B7280` | Secondary text |
| Gray 600 | `#4B5563` | Body text (primary) |
| Gray 700 | `#374151` | Headings, labels |
| Gray 800 | `#1F2937` | Dark headings, high contrast text |
| Gray 900 | `#111827` | Maximum contrast text |

### Semantic Colors

| Name | HEX | Usage |
|------|-----|-------|
| Success | `#059669` | Complete status, savings display, successful operations |
| Success Light | `#D1FAE5` | Success backgrounds |
| Error | `#DC2626` | Error states, failed compression, destructive actions |
| Error Light | `#FEE2E2` | Error backgrounds |
| Warning | `#F2A918` | Warnings, quota alerts (uses Cake Yellow) |
| Info | `#4074A8` | Info states, processing (uses Cake Blue) |

---

## Typography

### Font Stack

- **Body Font:** Roboto Mono (Google Fonts) — used for all body text, labels, inputs, captions, and UI elements
- **Heading Font:** Syne (Google Fonts) — used exclusively for headings ("Upload Images", "Boost Options") via `font-heading` utility class
- **Monospace:** Roboto Mono, "SF Mono", "Fira Code", Consolas, monospace (same as body font; used for file sizes, coordinates, technical data)
- **Logo Font:** Syne Extra Bold (Google Fonts) — used as the design source for the SVG logo. "smoosh" is stylized in lowercase, "BOOST" in uppercase
- **CSS Variables:** `--font-sans` and `--font-mono` both map to Roboto Mono; `--font-heading` maps to Syne

### Fluid Scaling

The UI uses fluid scaling via `clamp()` on the root `font-size`:
- **≤ 1024px viewport:** 16px (100%)
- **≥ 1200px viewport:** 19.2px (120%)
- **Between:** Smooth linear interpolation
- All spacing tokens use `rem` units, so the entire UI scales proportionally with the root font-size
- The header logo uses a fixed `width` attribute and is unaffected by scaling

### Font Size Downshift Convention

Because Roboto Mono's monospaced glyphs read visually larger than proportional fonts, all body/UI text sizes are downshifted one level from their semantic Tailwind class:
- `text-lg` elements → use `text-base`
- `text-base` elements → use `text-sm`
- `text-sm` elements → use `text-xs`
- `text-xs` stays `text-xs`
- Syne heading text (`font-heading`) is NOT downshifted

### Type Scale

| Element | Tailwind Class | Font | Weight |
|---------|---------------|------|--------|
| H1 (Page Title, e.g. "Upload Images") | `text-2xl font-heading` | Syne | 600 (Semibold) |
| H2 (Section Title, e.g. "Boost Options") | `text-base font-heading` | Syne | 600 (Semibold) |
| Body / Labels | `text-xs` | Roboto Mono | 400–500 |
| Caption / Small Text | `text-xs` | Roboto Mono | 400 |
| Button (sm/md) | `text-xs` | Roboto Mono | 500 (Medium) |
| Button (lg) | `text-sm` | Roboto Mono | 500 (Medium) |
| Stats / Savings Display | `text-base font-mono` | Roboto Mono | 600 (Semibold) |

### Text Colors

- **Primary text:** Gray 800 (`#1F2937`)
- **Secondary text:** Gray 500 (`#6B7280`)
- **Muted/placeholder:** Gray 400 (`#9CA3AF`)
- **Links:** Cake Blue (`#4074A8`)
- **Error text:** Error (`#DC2626`)
- **Success text:** Success (`#059669`)

---

## Spacing System

Use an 8px base grid. All spacing tokens are `rem`-based so they scale with the fluid root font-size:

| Token | Value | Base px (at 16px root) | Usage |
|-------|-------|------------------------|-------|
| space-1 | 0.25rem | 4px | Tight spacing, inline elements |
| space-2 | 0.5rem | 8px | Small gaps, icon padding |
| space-3 | 0.75rem | 12px | Input padding, small margins |
| space-4 | 1rem | 16px | Standard gaps between elements |
| space-5 | 1.25rem | 20px | Section padding |
| space-6 | 1.5rem | 24px | Card padding, larger gaps |
| space-8 | 2rem | 32px | Section margins |
| space-10 | 2.5rem | 40px | Major section breaks |
| space-12 | 3rem | 48px | Page margins |

---

## Layout

### Overall Structure

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
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ BOOST-ONLY MODE INDICATOR (when active)                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ℹ️ Compression skipped - Images will keep original format   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ PROCESSING BUTTONS                                              │
│ [Compress Images]  or  [Add Metadata (Boost)]  [Skip & Download]│
│                                                                 │
│ METADATA OPTIONS (collapsible, collapsed by default)            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▸ Metadata Options (Optional - Boost Phase)          (0/3) │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ QUEUE                                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [thumb] filename.png                                       │ │
│ │         1.4 MB → 448 KB (68% smaller)                      │ │
│ │         ✓ Complete · TinyPNG                               │ │
│ │         📍 Geo: Not set · ©: Not set · 📝: Not set  [Edit] │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ [thumb] photo.jpg                                          │ │
│ │         Processing...                              ●       │ │
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

### Background

The page uses a radial gradient background on `body` with `min-height: 100vh`:
```css
background: radial-gradient(circle at 50% 30%, #ffffff, #fefeff, #f6f9fc, #e2ecf4, #d5e2ef, #d1e0ee, #d1e0ee, #cddded, #c0d4e8, #acc7e0, #a4c2dd, #a3c1dd);
```

### Dimensions

- **Content area max-width:** 45rem (~720px at base, ~864px at 120% scale, centered)
- **Minimum viewport:** 768px (tablet and up)
- **Header height:** 64px
- **Content scroll:** Independent scrolling with `overflow-y-auto`

---

## Components

### Buttons

**Primary Button**
- Background: Cake Blue (`#4074A8`)
- Text: White
- Border radius: 6px
- Padding: 10px 16px
- Hover: Blue 700 (`#2D5276`)
- Active: Blue 900 (`#1A3044`)

**Secondary Button**
- Background: White
- Border: 1px solid Gray 300 (`#D1D5DB`)
- Text: Gray 700 (`#374151`)
- Border radius: 6px
- Padding: 10px 16px
- Hover: Gray 50 (`#F9FAFB`) background

**Accent Button (for "Download All", key CTAs)**
- Background: Cake Yellow (`#F2A918`)
- Text: Gray 900 (`#111827`) — for accessibility
- Border radius: 6px
- Hover: Yellow 700 (`#B87D0E`)

**Ghost/Text Button**
- Background: Transparent
- Text: Cake Blue (`#4074A8`)
- Padding: 8px 12px
- Hover: Blue 50 (`#EBF1F7`) background

**Destructive Button**
- Background: Error (`#DC2626`)
- Text: White
- Hover: Darker red (`#B91C1C`)

**Icon-Only Button (for Download, Remove)**
- Background: White
- Border: 1px solid Gray 300 (`#D1D5DB`)
- Text: Gray 700 (`#374151`)
- Padding: 12px (px-3 py-2)
- Border radius: 6px
- Hover: Gray 50 (`#F9FAFB`) background
- Requires tooltip for accessibility

### Input Fields

- Background: White
- Border: 1px solid Gray 300 (`#D1D5DB`)
- Border radius: 6px
- Padding: 10px 12px
- Font size: 14px
- Focus: Border Cake Blue (`#4074A8`), box-shadow: 0 0 0 3px Blue 100 (`#D1E0EE`)
- Error: Border Error (`#DC2626`)
- Placeholder: Gray 400 (`#9CA3AF`)

### Text Areas

- Same styling as inputs
- Minimum height: 80px
- Resize: vertical

### Checkboxes / Toggles

- Unchecked: Gray 300 border, white background
- Checked: Cake Blue background, white checkmark
- Focus: Blue 100 ring

### Cards / Panels

- Background: White
- Border: 1px solid Gray 200 (`#E5E7EB`)
- Border radius: 8px
- Padding: 24px
- Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)

### Collapsible Sections

- Header: Gray 700 text, clickable with chevron icon
- Chevron rotates 90° when expanded
- Content area has subtle top border when expanded

### File Upload Zone

- Border: 2px dashed Gray 300 (`#D1D5DB`)
- Background: Gray 50 (`#F9FAFB`)
- Border radius: 8px
- Padding: 32px
- Hover/Drag active: Border Cake Blue, Background Blue 50
- Icon: Upload icon in Gray 400, turns Blue on hover

### Queue Item

- Background: White
- Border: 1px solid Gray 200 (`#E5E7EB`)
- Border radius: 8px
- Padding: 16px
- Thumbnail: 48px × 48px, border-radius 4px
- Hover: Gray 50 background

---

## Boost Workflow Components

### Boost Only Toggle

**Position:** Within the Format Selector area, shown only when no images are in the queue

**Layout:**
```
☐ Boost Only (skip compression)
```

**Styling:**
- Component: Checkbox toggle
- Font: 14px medium
- Color: Gray 600 (`#4B5563`)
- When checked: Primary Blue (`#4074A8`)

**Behavior:**
- Default: unchecked (compression + boost workflow)
- When checked, compression is skipped — images keep their original format
- Format selector is hidden when Boost Only is active
- Toggle is hidden once images are added to the queue

---

### Boost-Only Mode Indicator

**Trigger:** Appears when "Boost Only" mode is active and images are in queue

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ ℹ️ Compression skipped - Images will keep original      │
│    format                                               │
└─────────────────────────────────────────────────────────┘
```

**Styling:**
- Background: Blue 50 (`#EBF1F7`)
- Text: Primary Blue (`#4074A8`), 14px regular
- Border: 1px solid Blue 100 (`#D1E0EE`)
- Border radius: 6px
- Padding: 12px 16px
- Icon: `fa-info-circle` (16px)
- Position: Above queue, below upload zone

---

### Two-Step Processing Buttons

#### Step 1: "Compress Images" Button

**Appears:** After images uploaded, before compression

**Styling:**
- Background: Primary Blue (`#4074A8`)
- Text: White, 14px medium
- Padding: 12px 24px
- Border radius: 6px
- Hover: Blue 700 (`#2D5276`)
- Icon: `fa-compress` (left of text)

**During Compression:**
- Button changes to: `[Compressing... 1 of 5]` with spinner
- "Cancel" button appears (gray, bordered)

#### Step 2: "Add Metadata (Boost)" Button

**Appears:** After compression completes, replaces "Compress Images"

**Styling:**
- Background: Accent Yellow (`#F2A918`)
- Text: Gray 900 (`#111827`), 14px medium
- Padding: 12px 24px
- Border radius: 6px
- Hover: Yellow 700 (`#B87D0E`)
- Icon: `fa-tag` (left of text)
- Disabled state: 50% opacity when no metadata options enabled

#### "Skip & Download All" Button

**Appears:** Next to "Add Metadata (Boost)" button

**Styling:**
- Background: Transparent
- Text: Primary Blue (`#4074A8`)
- Border: 1px solid Primary Blue
- Padding: 10px 16px
- Hover: Blue 50 background
- Icon: `fa-download`

**Behavior:**
- Clicking "Boost" triggers metadata injection
- "Skip & Download All" proceeds directly to ZIP download
- Individual download buttons remain available per image

---

### Metadata Options Panel

#### Panel Header (Collapsed - Default State)

**Layout:**
```
▸ Metadata Options (Optional - Boost Phase)           (0/3)
```

**Styling:**
- Background: Gray 50 (`#F9FAFB`)
- Border: 1px solid Gray 200 (`#E5E7EB`)
- Border radius: 8px
- Padding: 16px 20px
- Text: Gray 800 (`#1F2937`), 16px semibold
- Chevron: Gray 500, rotates 90° when expanded
- Counter: Gray 500, shows "X/3 enabled options"
- Cursor: pointer
- Hover: Gray 100 background

#### Panel Body (Expanded State)

**Apply Settings Toggle:**
```
Apply settings:  ● To all images    ○ Per image
```

**Position:** Top of expanded panel, 20px padding below header

**Styling:**
- Font: 14px medium
- Default: "To all images" selected

**Behavior:**
- Switching to "Per image" clears global fields, shows per-image forms in queue
- Switching to "To all images" clears per-image fields
- Confirmation dialog if metadata already entered

---

#### Geo-Location Section

**Layout (Collapsed - Checkbox Only):**
```
☐ Add geo-location (Local SEO)
```

**Layout (Expanded):**
```
☑ Add geo-location (Local SEO)

  Google Maps/Place Link:
  [_____________________________________________]  🎯

  Or enter coordinates manually:
  Latitude: [_______] Longitude: [_______]

  Current: 35.5951° N, 82.5515° W
```

**Google Maps Link Field:**
- Label: "Google Maps/Place Link:" (Gray 700, 13px medium)
- Input: Text field, full width
- Placeholder: "Paste Google Maps or Google Place link here"
- Icon button (🎯): "Parse Location"
  - Background: Primary Blue
  - Icon: `fa-location-crosshairs`
  - Tooltip: "Extract coordinates from link"

**Manual Coordinate Entry:**
- Label: "Or enter coordinates manually:" (Gray 500, 13px regular)
- Two inputs side-by-side:
  - Latitude: Number input, placeholder "35.5951"
  - Longitude: Number input, placeholder "-82.5515"
- Validation: -90 to 90 for latitude, -180 to 180 for longitude
- Format: Decimal degrees

**Current Coordinates Display:**
- Format: `35.5951° N, 82.5515° W`
- Font: Roboto Mono, `text-xs`
- Color: Primary Blue
- Hidden until valid coordinates entered

**Google Maps Link Parsing:**
Extract from URL patterns:
- `maps.google.com/?q=LAT,LNG`
- `google.com/maps/@LAT,LNG,ZOOM`
- `google.com/maps/place/NAME/@LAT,LNG`
- Plus codes: `google.com/maps/place/849V+XW`

**Optional: Google Places API (Future Enhancement)**
- Address autocomplete with Google Places API
- Requires API key configuration
- Fallback to manual entry if not configured

---

#### Copyright Section

**Layout (Collapsed):**
```
☐ Add copyright notice
```

**Layout (Expanded):**
```
☑ Add copyright notice

  [© 2026 Cake Websites. All rights reserved.______]

  Variables: {year} {client}
  12 / 160 characters
```

**Input Field:**
- Type: Text input, full width
- Placeholder: "© 2026 Cake Websites. All rights reserved."
- Max length: 160 characters
- Character counter: `X / 160 characters` (Gray 500, 12px)

**Template Variables Helper:**
- Text: "Variables: {year} {client}" (Gray 500, 12px)
- Position: Below input
- Tooltip on hover:
  - `{year}` → Current year (2026)
  - `{client}` → Client name (future preset feature)

---

#### Title & Description Section

**Layout (Collapsed):**
```
☐ Add title & description (Image SEO)
```

**Layout (Expanded):**
```
☑ Add title & description (Image SEO)

  Title:
  [_____________________________________________]
  0 / 60 characters (recommended max)

  Description:
  [_____________________________________________]
  [_____________________________________________]
  0 / 160 characters (recommended max)
```

**Title Field:**
- Type: Text input, full width
- Placeholder: "Professional landscape photo by Cake Websites"
- Max length: 60 characters (soft limit, SEO recommendation)
- Character counter: `X / 60 characters (recommended max)` (Gray 500, 12px)
- Counter turns Yellow 700 if >60, Error Red if >100

**Description Field:**
- Type: Textarea, 3 rows
- Placeholder: "High-quality image of the Blue Ridge Mountains landscape looking west during sunset in Autumn."
- Max length: 160 characters (soft limit)
- Character counter: `X / 160 characters (recommended max)` (Gray 500, 12px)
- Counter turns Yellow 700 if >160, Error Red if >300
- Resize: Vertical only

---

### Per-Image Metadata Controls

#### Queue Item - Collapsed (Default)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [thumb] filename.png                                    │
│         1.4 MB → 448 KB (68% smaller)                   │
│         ✓ Compressed · TinyPNG                          │
│         📍 Geo: Not set · ©: Not set · 📝: Not set      │
│                                               [Edit]    │
└─────────────────────────────────────────────────────────┘
```

**Metadata Status Badges:**
- Position: Below compression details
- Font: 13px regular
- Color: Gray 500 (not set), Primary Blue (set)
- Format:
  - `📍 Geo: Not set` / `📍 Geo: 35.59°N, 82.55°W`
  - `©: Not set` / `©: © 2026 Client`
  - `📝: Not set` / `📝: Title set`
- "Not set" in Gray 400, set values in Primary Blue

**"Edit" Button:**
- Position: Bottom right
- Background: Transparent
- Text: Primary Blue, 13px medium
- Icon: `fa-pen-to-square`
- Hover: Blue 50 background

---

#### Queue Item - Expanded with Form (Per Image Mode)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [thumb] filename.png                                    │
│         1.4 MB → 448 KB (68% smaller)                   │
│         ✓ Compressed · TinyPNG                          │
├─────────────────────────────────────────────────────────┤
│ METADATA FOR THIS IMAGE                                 │
│                                                         │
│ ☑ Geo-location                                          │
│   Lat: [35.5951] Long: [-82.5515] [Map Link____]       │
│                                                         │
│ ☑ Copyright                                             │
│   [© 2026 Client Name_____________________________]    │
│                                                         │
│ ☐ Title & Description                                   │
│                                                         │
│                                   [Cancel] [Save]       │
└─────────────────────────────────────────────────────────┘
```

**Form Container:**
- Background: Gray 50 (`#F9FAFB`)
- Border top: 1px solid Gray 200
- Padding: 20px
- Margin top: 12px

**Form Title:**
- Text: "METADATA FOR THIS IMAGE"
- Font: 12px semibold, uppercase
- Color: Gray 600
- Letter spacing: 0.05em

**Compact Field Layout:**
- Input padding: 8px 10px (25% smaller than global)
- Font: 13px
- Geo-location: Inline lat/long/link fields
- Copyright: Single line input
- Title & Description: Collapsed by default

**Format Compatibility (Per-Image):**

If image format doesn't support metadata type, **disable** checkbox:

```
☑ Geo-location                    (Available)
☐ Copyright                       (Disabled - PNG format)
☑ Title & Description             (Available)
```

**Disabled Checkbox:**
- Opacity: 0.5
- Cursor: not-allowed
- Tooltip: "PNG format does not support this metadata type"

**Action Buttons:**

**"Cancel":**
- Background: Transparent
- Text: Gray 600
- Border: 1px solid Gray 300
- Padding: 8px 16px
- Hover: Gray 100 background
- Action: Collapse form, discard changes

**"Save":**
- Background: Primary Blue
- Text: White
- Padding: 8px 16px
- Hover: Blue 700
- Action: Save to image state, collapse, update badges

---

### Queue Item - After Metadata Applied

#### Collapsed View with Applied Metadata

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [thumb] filename.png                                    │
│         1.4 MB → 448 KB (68% smaller)                   │
│         ✓ Complete · TinyPNG · Geo-tagged               │
│         📍 35.59°N, 82.55°W · © Client · 📝 Title  [▾]  │
└─────────────────────────────────────────────────────────┘
```

**Metadata Badges (Applied):**
- Color: Success Green (`#059669`)
- Font: 13px medium
- Truncation:
  - Geo: 2 decimal places
  - Copyright: First 20 chars + `...`
  - Title: Just indicator `📝 Title`

---

#### Expandable Metadata Details

**Click badge row to expand:**

```
┌─────────────────────────────────────────────────────────┐
│ [thumb] filename.png                                    │
│         1.4 MB → 448 KB (68% smaller)                   │
│         ✓ Complete · TinyPNG                            │
│         ▾ Metadata Applied                         [↓]  │
├─────────────────────────────────────────────────────────┤
│   📍 Geo-location: 35.5951° N, 82.5515° W              │
│   © Copyright: © 2026 Client Name. All rights...       │
│   📝 Title: Professional landscape photo                │
│      Description: High-quality image optimized...      │
└─────────────────────────────────────────────────────────┘
```

**Expanded Details:**
- Background: White
- Border top: 1px solid Gray 200
- Padding: 16px 20px
- Font: 13px regular
- Color: Gray 700
- Icon: 16px, Gray 400
- Chevron rotates 90° when expanded
- Description truncated to 50 chars, full text on hover

---

### Processing Status - Boost Phase

#### During Metadata Injection

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [thumb] filename.png                                    │
│         1.4 MB → 448 KB (68% smaller)                   │
│         Boosting... Adding metadata               ●     │
└─────────────────────────────────────────────────────────┘

[Boosting... 1 of 5]                            [Cancel]
```

**Status:**
- Text: "Boosting... Adding metadata"
- Spinner: Primary Blue, 16px
- Progress footer: `[Boosting... X of Y]`
- Cancel available

---

#### Boost Error

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [thumb] filename.png                                    │
│         1.4 MB → 448 KB (68% smaller)                   │
│         ✗ Metadata failed: EXIF write error    [Retry]  │
└─────────────────────────────────────────────────────────┘
```

**Error State:**
- Icon: `fa-xmark`, Error Red
- Message: Brief error description
- Retry button available
- Image still downloadable (compressed, no metadata)

---

### Summary Bar (with Metadata Statistics)

**After Boost:**

```
┌─────────────────────────────────────────────────────────┐
│ 5 images · 8.2 MB → 2.1 MB · 74% total savings         │
│ Metadata: 5 geo-tagged · 5 with copyright · 3 titles   │
└─────────────────────────────────────────────────────────┘
```

**Metadata Summary Line:**
- Font: 13px regular
- Color: Gray 600
- Position: Below savings summary
- Format: `X geo-tagged · Y with copyright · Z with titles`
- Only show counts for enabled types

---

### Download Section (with Metadata Indicators)

**After Boost:**

```
┌─────────────────────────────────────────────────────────┐
│ DOWNLOAD SECTION                                        │
│                                                         │
│ [Download All with Metadata (ZIP)]  [Clear Queue]      │
│                                                         │
│ Or download individually:                               │
│ • filename.png (448 KB, geo-tagged) [↓]                 │
│ • photo.jpg (612 KB, geo-tagged, ©) [↓]                 │
└─────────────────────────────────────────────────────────┘
```

**"Download All" Button:**
- Text: "Download All with Metadata (ZIP)"
- If no metadata applied: "Download All (ZIP)"
- Background: Accent Yellow
- Icon: `fa-file-zipper`

**Individual Downloads:**
- Format: `filename.ext (size, metadata-tags)`
- Tags: `geo-tagged`, `©`, `title`

---

### Toast/Notifications

Implemented using **Sonner** library for consistent toast notifications.

- Background: Gray 800 (`#1F2937`)
- Text: White
- Border radius: 8px
- Padding: 12px 16px
- Position: Bottom right
- Success variant: Left border 4px Success
- Error variant: Left border 4px Error
- Warning variant: Left border 4px Cake Yellow

#### Boost-Specific Toast Messages

**Boost Started:**
```
[ℹ] Adding metadata to 5 images...
```
- Type: Info, 2s duration, auto-dismiss

**Boost Complete (Success):**
```
[✓] Metadata added to 5 images
    5 geo-tagged · 5 with copyright
```
- Type: Success, 4s duration, auto-dismiss

**Boost Partial Success:**
```
[⚠] Metadata added to 4 of 5 images
    1 failed - see queue for details
```
- Type: Warning, 6s duration, manual dismiss

**Boost Failed:**
```
[✗] Metadata injection failed
    Network error - check connection and retry
```
- Type: Error, 8s duration, manual dismiss

### Metadata Format Warnings

Inline warning banners displayed in the Metadata Options Panel when format capabilities don't match selected options. These are **non-blocking warnings** - users can still process images.

**Warning Trigger Conditions:**
- User enables geo-tagging AND selects PNG output format (PNG does not support GPS coordinates)

**Warning Style:**
- Background: Yellow 50 (`#FEF7E6`)
- Text: Yellow 700 (`#B87D0E`)
- Border: 1px solid Yellow 100 (`#FDE9B8`)
- Border radius: 6px
- Padding: 12px 16px
- Icon: `fa-exclamation-triangle` (Warning icon)

**Warning Message:**
```
⚠ PNG does not support GPS coordinates. Switch to JPG or WebP for geo-tagged images, or disable geo-tagging to proceed.
```

**Behavior:**
- Warning appears inline within the geo-tagging section when conditions are met
- Warning does NOT block form submission or processing
- User can proceed with processing (geo-tagging will be skipped for PNG outputs)
- Warning disappears when user changes output format to JPG/WebP or disables geo-tagging

**Format Capabilities Reference:**

| Metadata Type | JPG/MozJPG | PNG | WebP |
|---------------|------------|-----|------|
| Geo-tagging (GPS) | ✅ Full EXIF | ❌ No support | ✅ Full EXIF |
| Copyright | ✅ Full EXIF | ✅ tEXt chunks | ✅ Full EXIF |
| Title/Description | ✅ Full EXIF | ✅ tEXt chunks | ✅ Full EXIF |

---

## Status Indicators

| Status | Visual | Color | Description |
|--------|--------|-------|-------------|
| Queued | Circle outline | Gray 400 | Waiting to process |
| Compressing | Spinner | Cake Blue | Smoosh phase active |
| Boosting | Spinner + tag | Cake Blue | Boost phase active |
| Complete | Checkmark | Success | All processing done |
| Error | X icon | Error | Processing failed |

### Queue Item States

**Queued state:**
```
[thumb] filename.png
        Waiting...                                  ○
```

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

## Icons

Use **FontAwesome** icons throughout.

### Common Icons

| Action | Icon |
|--------|------|
| Upload | `fa-upload` |
| Download | `fa-download` |
| Compress/Smoosh | `fa-compress` |
| Metadata/Boost | `fa-tag` |
| Delete/Remove | `fa-trash` |
| Retry | `fa-rotate-right` |
| Expand/Collapse | `fa-chevron-down` / `fa-chevron-right` |
| Close | `fa-times` |
| Check/Success | `fa-check` |
| Error | `fa-xmark` |
| Warning | `fa-exclamation-triangle` |
| Info | `fa-info-circle` |
| Image | `fa-image` |
| Location/Geo | `fa-location-dot` |
| Location Parse | `fa-location-crosshairs` |
| Copyright | `fa-copyright` |
| File | `fa-file` |
| ZIP | `fa-file-zipper` |
| Link/URL | `fa-link` |
| Clear | `fa-broom` |
| Edit | `fa-pen-to-square` |
| Title/Description | `fa-align-left` |
| Cancel | `fa-ban` |
| Save | `fa-floppy-disk` |

### Icon Sizes

- Small (inline): 12px
- Default: 16px
- Medium: 20px
- Large (empty states): 48px

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| shadow-sm | 0 1px 2px rgba(0, 0, 0, 0.05) | Subtle lift |
| shadow | 0 1px 3px rgba(0, 0, 0, 0.1) | Cards, queue items |
| shadow-md | 0 4px 6px rgba(0, 0, 0, 0.1) | Elevated elements |
| shadow-lg | 0 10px 15px rgba(0, 0, 0, 0.1) | Modals, popovers |
| shadow-xl | 0 25px 50px rgba(0, 0, 0, 0.25) | Large modals |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 4px | Badges, thumbnails, small elements |
| radius | 6px | Buttons, inputs |
| radius-md | 8px | Cards, panels, upload zone |
| radius-lg | 12px | Modals, large containers |

---

## States

### Interactive Element States

1. **Default** — Base appearance
2. **Hover** — Slight background/color change
3. **Focus** — Blue outline ring (for accessibility)
4. **Active/Pressed** — Darker shade
5. **Disabled** — 50% opacity, cursor not-allowed
6. **Loading** — Spinner icon, disabled interaction

### Processing Status Display

Display in queue item:
- **Queued:** "Waiting..." with circle outline, Gray 400
- **Compressing:** "Compressing..." with spinner, Cake Blue
- **Boosting:** "Adding metadata..." with spinner, Cake Blue
- **Complete:** File size savings with checkmark, Success
- **Error:** Error message with retry link, Error

---

## Responsive Considerations

While designed for desktop/tablet (768px minimum), ensure:
- Upload zone remains usable on smaller screens
- Queue items stack properly
- Buttons remain tappable (44x44px minimum)
- Content area scrolls independently

---

## Accessibility

- Minimum touch target: 44x44px
- Focus states visible on all interactive elements
- Color contrast minimum 4.5:1 for text
- Form labels associated with inputs
- Error messages linked to fields via aria-describedby
- Keyboard navigation support for all interactions
- Tooltips on icon-only buttons

---

## Animation & Transitions

- Duration: 150ms for micro-interactions, 200ms for larger transitions
- Easing: ease-in-out for most, ease-out for enters, ease-in for exits
- Properties to animate: opacity, transform, background-color, border-color
- Avoid animating width/height (use transform: scale instead)
- Progress spinners: Infinite rotation, 1s duration

### Boost-Specific Animation Timings

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Panel expand/collapse | Height | 200ms | ease-in-out |
| Chevron rotation | Transform | 150ms | ease-out |
| Queue item expand | Height | 200ms | ease-in-out |
| Metadata badge appear | Opacity + translateY | 300ms | ease-out |
| Warning banner slide | translateY | 200ms | ease-out |
| Form field focus | Border color | 150ms | ease |
| Button hover | Background | 150ms | ease |
| Per-image form slide | Height + opacity | 250ms | ease-in-out |

---

## Shared Form Components

### ControlledInput

Text input with consistent styling.

```
inputClass = 'w-full px-3 py-2.5 bg-white border border-[#D1D5DB] rounded-md text-sm
              text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#4074A8]
              focus:outline-none focus:ring-3 focus:ring-[#D1E0EE]'
```

### ControlledTextarea

Multiline text with same styling as input.

### Checkbox

Toggle with label for metadata options.

### Section

Collapsible accordion section with ARIA `aria-expanded` attribute.

- Chevron rotates 90° when expanded
- Content area has subtle top border when expanded

---

## Design Principles

1. **Clarity over cleverness** — Every element should have obvious purpose
2. **Generous whitespace** — Don't crowd the interface
3. **Progressive disclosure** — Collapse complexity (metadata options), reveal on demand
4. **Consistent patterns** — Same action = same appearance everywhere
5. **Informative feedback** — Always show processing status (toast notifications, inline status)
6. **Error prevention** — Validate file types and sizes before processing
7. **Accessibility first** — Tooltips for icons, ARIA attributes, keyboard navigation
8. **Efficiency focused** — Batch operations, minimal clicks to complete workflow
