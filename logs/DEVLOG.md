# Development Log

A narrative chronicle of the project journey - the decisions, discoveries, and pivots that shaped the work.

---

## Related Documents

📊 **[CHANGELOG](./CHANGELOG.md)** - Technical changes and version history
📈 **[STATE](./STATE.md)** - Current project state and metrics

> **For AI Agents:** This file tells the story of *why* decisions were made. Before starting work, read **Current Context** section. For technical details of *what* changed, see CHANGELOG.md.

---

## Current Context

**Last Updated:** 2026-02-07

### Project State
- **Project:** SmooshBoost
- **Version:** v0.1.0
- **Active Branch:** `main`
- **Phase:** Production-Ready - UI polish complete, ready for deployment

### Current Objectives
- [x] Implement TinyPNG API integration
- [x] Create dual-mode format selector (match/convert)
- [x] Add footer with branding
- [x] Install Log File Genius documentation system
- [x] **Complete Boost Phase** - Per-image metadata injection with geo-tagging, copyright, author, title, description
- [x] **Auto-compression workflow** - Images compress automatically on upload
- [x] **Per-image metadata accordions** - 🚀 Boost Options for each image in queue
- [x] **Read-only mode after Apply Metadata** - With Reset button to re-edit
- [x] **Format conversion summary** - Shows output format breakdown in SummaryBar
- [x] **README.md** - GitHub repository documentation
- [x] **Security Audit** - API key secured, magic byte validation, metadata sanitization
- [x] **Performance Optimization** - Dynamic WASM imports, React.memo, TypeScript 5.9
- [x] **Typography polish** - Spline Sans Mono for data elements, format labels on download buttons
- [ ] Deploy to production

### Known Risks & Blockers
- TinyPNG API key now in `.env.local` - needs serverless function for production (key not exposed to client)
- PNG format does not support GPS coordinates - warning shown to users

---

## Daily Log - Newest First

### 2026-02-07: UI Polish — Font Hierarchy, Fluid Scaling, Section Reorder

**The Situation:** SmooshBoost needed visual refinement — the font hierarchy was unclear, the UI didn't scale well across viewports, and the Boost Options section order needed adjustment.

**Changes Made:**
1. **Font hierarchy** — Spline Sans Mono as body font (`--font-sans`), Syne reserved for headings only (`--font-heading`). All body text downshifted one Tailwind size class for visual balance.
2. **Fluid scaling** — Root font-size scales from 16px (≤1024px) to 19.2px (≥1200px) via `clamp()`. Spacing tokens converted from px to rem.
3. **Radial gradient background** — Applied to body element.
4. **Boost Options reorder** — Copyright & Author moved after Title & Description (was second, now third).
5. **Removed SEO tooltip** — Info-circle icon and hover tooltip removed from Title & Description label.
6. **Version bump** — 0.0.1 → 0.1.0.
7. **Guidelines updated** — All four docs updated to reflect current typography, spacing, and layout.

**Files Changed:** `src/styles/index.css`, `src/app/components/metadata/TitleDescSection.tsx`, `src/app/components/metadata/MetadataPanel.tsx`, `src/app/components/queue/ImageMetadataAccordion.tsx`, `package.json`, `src/app/components/layout/Footer.tsx`, `guidelines/`

---

### 2026-02-05: WebP Import Support Added

**The Situation:** SmooshBoost already supported WebP as an output format for compression and metadata injection, but users could not import WebP files as input. This limited the tool's usefulness for workflows involving existing WebP images.

**The Challenge:** Adding WebP input support required updates across multiple layers: file validation (magic bytes), type definitions, format detection, and UI messaging.

**The Decision:** Implemented full WebP import support with the same security validation as PNG/JPG:
1. **Magic byte validation** - Added RIFF/WEBP header verification (bytes 0-3 for RIFF, bytes 8-11 for WEBP)
2. **InputFormat type** - Extended to include 'webp' alongside 'png' and 'jpg'
3. **MIME type validation** - Added 'image/webp' to valid types
4. **Format routing** - WebP inputs route to WebP output when "Keep Original" mode is selected
5. **UI updates** - Upload zone now accepts and displays WebP support

**Why This Matters:** Users can now bring existing WebP images into SmooshBoost for re-compression (optimization) and metadata injection. This completes the format support matrix - all three modern web image formats (PNG, JPG, WebP) are now supported as both input and output.

**Technical Notes:**
- WebP magic bytes use a 12-byte check: RIFF header at bytes 0-3, WEBP signature at bytes 8-11
- No changes needed to compression service - jSquash already supports WebP input via canvas decoding
- Metadata injection for WebP was already fully implemented

**Files Changed:** `src/app/types.ts`, `src/app/hooks/useFileValidation.ts`, `src/app/utils/detectFormat.ts`, `src/app/components/upload/UploadZone.tsx`, `guidelines/smooshboost-quick-reference.md`, `guidelines/smooshboost-technical-spec.md`, `guidelines/smooshboost-project-knowledge.md`

---

### 2026-02-05: Typography Polish & UI Refinements

**The Situation:** With SmooshBoost feature-complete and security-audited, we focused on UI polish to improve the visual hierarchy and data readability.

**The Challenge:** Technical data like file sizes, percentages, and coordinates were displayed in the same font as body text, making them harder to scan. Additionally, the download button didn't indicate what format the file would be downloaded as.

**The Decision:** Implemented three improvements:
1. **Spline Sans Mono font** - Added to Google Fonts import and CSS theme for monospace elements (initially Roboto Mono, later swapped to Spline Sans Mono)
2. **Monospace data elements** - Applied `font-mono` to file names, sizes, savings percentages, coordinates, progress counters, and metadata counts
3. **Format-aware download button** - Per-image download now shows format label (PNG, JPG, WebP) next to the download icon

**Why This Matters:** Monospace fonts improve data readability by ensuring consistent character widths. Users can quickly scan file sizes and percentages. The format label on download buttons provides clarity about what format each image will be downloaded as.

**The Fix:** Also resolved a layout shift issue where content would jump when the scrollbar appeared. Added `overflow-y: scroll` to the html element to always reserve scrollbar space.

**Files Changed:** `index.html`, `src/styles/index.css`, `src/app/components/queue/QueueItem.tsx`, `src/app/components/summary/SummaryBar.tsx`, `src/app/components/processing/ProcessingButtons.tsx`, `src/app/components/metadata/MetadataPanel.tsx`, `src/app/components/queue/ImageMetadataAccordion.tsx`

---

### 2026-02-04: Security & Performance Audit - Production Hardening

**The Situation:** With SmooshBoost feature-complete, we needed to audit for security vulnerabilities and performance optimizations before production deployment.

**The Challenge:** The audit revealed a critical security issue - the TinyPNG API key was hardcoded in `vite.config.ts`. Additionally, file validation relied only on MIME types (easily spoofed), and there were opportunities for bundle optimization.

**The Decision:** Implemented five priority improvements:
1. **CRITICAL: API Key Security** - Rotated the compromised key, moved to `.env.local`, used `loadEnv()` in Vite config, ran `git filter-branch` to remove key from history
2. **Magic byte validation** - Added actual file content verification (PNG: `89 50 4E 47`, JPEG: `FF D8 FF`) to prevent spoofed uploads
3. **Metadata sanitization** - Added text sanitization with character limits (title: 100, description: 500, copyright: 200, author: 150) to prevent malformed data
4. **Dynamic WASM imports** - Changed @jsquash imports from static to dynamic to reduce initial bundle by ~20KB
5. **React.memo optimization** - Wrapped QueueItem in memo() with useCallback handlers to prevent cascading re-renders

**Why This Matters:** Security audit found a production-blocking issue. API keys in source control can lead to unauthorized usage and billing. Magic byte validation prevents malicious file uploads disguised as images.

**Technical Notes:**
- TypeScript 5.9 introduced stricter `ArrayBuffer`/`Uint8Array` typing requiring explicit buffer copies
- File validation is now async (Promise-based) for magic byte reading
- Metadata sanitization strips control characters (0x00-0x1F, 0x7F) while preserving newlines in descriptions

**The Result:** Production-ready security posture with improved performance characteristics. Bundle size reduced, re-render cascades eliminated, and all user inputs sanitized.

**Files Changed:** `vite.config.ts`, `.env.local`, `.env.example`, `README.md`, `package.json`, `src/app/hooks/useFileValidation.ts`, `src/app/services/metadata/metadataInjector.ts`, `src/app/services/compression/squooshService.ts`, `src/app/services/metadata/pngMetadata.ts`, `src/app/components/queue/QueueItem.tsx`, `src/app/components/queue/ImageQueue.tsx`, `src/app/App.tsx`, `guidelines/`

---

### 2026-02-04: Completing the Boost Phase - v1.0 Feature Complete

**The Situation:** SmooshBoost's core compression (Smoosh) was working, but we needed the second phase (Boost) for SEO metadata injection - geo-tagging, copyright, author, title, and description.

**The Challenge:** How do we provide flexible metadata options per image without overwhelming users? The original design had a global metadata panel with explicit "Boost Images" button, but this felt disconnected from the image queue.

**The Decision:** Multiple UX iterations led to the final design:
1. **Auto-compression** - Images compress automatically on upload (no button)
2. **Per-image metadata** - Each image has its own 🚀 Boost Options accordion
3. **Accordion header** - Shows rocket icon with enabled count (e.g., "2/3")
4. **Read-only after apply** - Fields lock after "Apply Metadata" with Reset option
5. **PNG geo-tag disabled** - Warning message only (no checkbox for unsupported format)

**Why This Matters:** Users can configure metadata per image or apply settings to all images at once. The accordion keeps the queue clean while providing easy access to boost options.

**The Implementation:**
- Created `ImageMetadataAccordion` component with collapsible sections
- Built `GeoTagSection`, `CopyrightSection`, `TitleDescSection` components
- Added `useMetadataInjection` hook for processing
- Implemented metadata injection services for JPG (piexifjs), PNG (tEXt chunks), and WebP (EXIF chunks)
- Added Google Maps link parser for coordinate extraction

**The Result:** Complete Smoosh + Boost workflow ready for v1.0 release. Users can upload, auto-compress, configure per-image metadata, and download optimized images with SEO metadata.

**Files Changed:** `src/app/components/metadata/`, `src/app/components/queue/`, `src/app/services/metadata/`, `src/app/hooks/`, `README.md`, `guidelines/`

---

### 2026-02-04: Installing Log File Genius for Better AI Context Management

**The Situation:** SmooshBoost is a new image optimization tool with TinyPNG integration and a modern React UI. As development progresses, maintaining clear documentation for AI assistants becomes critical.

**The Challenge:** How do we keep development history organized without creating overhead? Traditional documentation becomes bloated and consumes too much of the AI's context window.

**The Decision:** Adopted Log File Genius methodology with CHANGELOG for technical changes, DEVLOG for decision narratives, STATE for current project status, and ADRs for architectural decisions.

**Why This Matters:** Log File Genius reduces AI context bloat by 93% while improving project memory. Structured logs mean AI assistants understand context without lengthy explanations.

**The Implementation:** Initialized git repository, added Log File Genius as a submodule, ran installer with solo-developer profile and Augment assistant configuration.

**The Result:** Clear structure for documenting work. Files created: `logs/`, `.augment/rules/`, `.logfile-config.yml`.

**Files Changed:** `logs/`, `.augment/rules/`, `.logfile-config.yml`

---

### 2026-02-04: Building the Format Selector UX

**The Situation:** Users needed to choose output format for compressed images, but the original dropdown was too simple and didn't support "keep original format" behavior.

**The Challenge:** How do we let users either keep original formats (PNG→PNG, JPG→JPG) OR convert all images to a single format, without confusing UI?

**The Decision:** Created a segmented control with "Keep Original" and "Convert to" buttons. The dropdown only appears when "Convert to" is selected. Used opacity-0 trick to prevent layout shift.

**Why This Matters:** Layout shift is distracting. By always rendering the dropdown but hiding it with opacity-0/pointer-events-none, the UI stays stable.

**The Result:** Clean, modern format selector that matches user mental model.

**Files Changed:** `src/app/components/format/FormatSelector.tsx`, `src/app/hooks/useImageQueue.ts`, `src/app/types.ts`

---

### 2026-02-04: Zero-Cost TinyPNG Integration for Local Development

**The Situation:** TinyPNG API provides excellent PNG/JPEG compression, but requires server-side calls (API key can't be exposed to browser).

**The Challenge:** How do we test TinyPNG integration locally without setting up a separate backend server?

**The Decision:** Used Vite's built-in dev server proxy. The proxy intercepts `/api/tinypng` requests and forwards them to `api.tinify.com` with the API key added server-side.

**Why This Matters:** Zero additional infrastructure. Works immediately in development. For production, we'll add a serverless function.

**The Result:** TinyPNG integration works locally. Automatic fallback to Squoosh (oxipng) if TinyPNG fails.

**Files Changed:** `vite.config.ts`, `src/app/services/compression/tinypngService.ts`, `src/app/services/compression/compressionRouter.ts`
