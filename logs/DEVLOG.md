# Development Log

A narrative chronicle of the project journey - the decisions, discoveries, and pivots that shaped the work.

---

## Related Documents

📊 **[CHANGELOG](./CHANGELOG.md)** - Technical changes and version history
📈 **[STATE](./STATE.md)** - Current project state and metrics

> **For AI Agents:** This file tells the story of *why* decisions were made. Before starting work, read **Current Context** section. For technical details of *what* changed, see CHANGELOG.md.

---

## Current Context

**Last Updated:** 2026-02-04

### Project State
- **Project:** SmooshBoost
- **Version:** v0.0.1
- **Active Branch:** `main`
- **Phase:** v1.0 Feature Complete - Smoosh + Boost workflow ready

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
- [ ] Deploy to production

### Known Risks & Blockers
- TinyPNG API key currently in vite.config.ts (dev-only); needs serverless function for production
- PNG format does not support GPS coordinates - warning shown to users

---

## Daily Log - Newest First

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
