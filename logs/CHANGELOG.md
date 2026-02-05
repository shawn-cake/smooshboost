# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Related Documents

📖 **[DEVLOG](./DEVLOG.md)** - Development narrative and decision rationale
📐 **[ADRs](./adr/)** - Architectural decision records
📊 **[STATE](./STATE.md)** - Current project state and metrics

> **For AI Agents:** This file is a concise technical record of changes. For context on *why* decisions were made, see DEVLOG.md. For current project state, see DEVLOG.md → Current Context section.

---

## [Unreleased]

### Added
- **README.md** for GitHub repository with project overview, features, and usage guide. Files: `README.md`.
- **Magic byte file validation** - Two-layer security validation (MIME type + magic byte verification) to prevent spoofed file uploads. Files: `src/app/hooks/useFileValidation.ts`.
- **Metadata text sanitization** - Control character removal and length limits for all metadata fields (title: 100, description: 500, copyright: 200, author: 150). Files: `src/app/services/metadata/metadataInjector.ts`.
- **Boost Phase** - Complete metadata injection system with geo-tagging, copyright, author, title, and description. Files: `src/app/services/metadata/`, `src/app/hooks/useMetadataInjection.ts`.
- **Per-image metadata** - Each image has its own 🚀 Boost Options accordion with individual metadata controls. Files: `src/app/components/queue/ImageMetadataAccordion.tsx`, `src/app/components/metadata/`.
- **Auto-compression** - Images compress automatically on upload (no button click required). Files: `src/app/hooks/useCompression.ts`, `src/app/App.tsx`.
- **Info tooltip** in top right corner explaining the tool's purpose. Files: `src/app/components/layout/Header.tsx`.
- **Metadata status badges** showing geo-tag, copyright, and title status per image. Files: `src/app/components/queue/MetadataStatusBadges.tsx`.
- **Google Maps link parser** for extracting GPS coordinates from URLs. Files: `src/app/utils/googleMapsParser.ts`.
- **Format conversion summary** in SummaryBar showing output format breakdown. Files: `src/app/components/summary/SummaryBar.tsx`.
- **Read-only mode** for metadata fields after Apply Metadata with Reset button. Files: `src/app/components/metadata/GeoTagSection.tsx`, `src/app/components/metadata/CopyrightSection.tsx`, `src/app/components/metadata/TitleDescSection.tsx`.
- Log File Genius documentation system. Files: `logs/`, `.augment/rules/`, `.logfile-config.yml`.
- Footer component with version number. Files: `src/app/components/layout/Footer.tsx`.
- Sticky footer layout. Files: `src/app/App.tsx`.
- SVG logo in header. Files: `src/assets/logo.svg`, `src/app/components/layout/Header.tsx`.

### Changed
- **Workflow simplified** - Removed Smoosh Only mode, merged into default flow with optional per-image Boost. Files: `src/app/types.ts`, `src/app/App.tsx`.
- **Per-image metadata options** - Each image stores its own MetadataOptions instead of global settings. Files: `src/app/types.ts`, `src/app/hooks/useImageQueue.ts`.
- **Boost accordion header** - Rocket icon with enabled count (e.g., "🚀 Boost Options (2/3)"). Files: `src/app/components/queue/ImageMetadataAccordion.tsx`.
- **PNG geo-location disabled** - Shows warning message only, no checkbox for unsupported format. Files: `src/app/components/metadata/GeoTagSection.tsx`.
- Format selector now inline with label. Files: `src/app/components/format/FormatSelector.tsx`.
- Format dropdown always reserves space (no layout shift). Files: `src/app/components/format/FormatSelector.tsx`.
- Header now uses SVG logo instead of text. Files: `src/app/components/layout/Header.tsx`.
- Download button shows "Download" for single image, "Download All (n)" for multiple. Files: `src/app/components/download/DownloadSection.tsx`, `src/app/App.tsx`.
- Single image downloads directly instead of as ZIP. Files: `src/app/App.tsx`.
- Header padding-top increased to `var(--spacing-12)`. Files: `src/app/components/layout/Header.tsx`.
- Updated guidelines documents to match current workflow. Files: `guidelines/smooshboost-quick-reference.md`, `guidelines/smooshboost-project-knowledge.md`, `guidelines/smooshboost-technical-spec.md`.
- **Dynamic WASM imports** - Compression codecs (@jsquash/jpeg, @jsquash/webp, @jsquash/oxipng) are now dynamically imported to reduce initial bundle size. Files: `src/app/services/compression/squooshService.ts`.
- **React.memo optimization** - QueueItem component uses React.memo with useCallback handlers to prevent unnecessary re-renders. Files: `src/app/components/queue/QueueItem.tsx`, `src/app/components/queue/ImageQueue.tsx`.
- **TypeScript 5.9** - Upgraded from 5.6.2 to 5.9.3 with stricter ArrayBuffer typing. Files: `package.json`, `src/app/services/compression/squooshService.ts`, `src/app/services/metadata/pngMetadata.ts`.
- **TinyPNG API key security** - Moved API key from hardcoded value to environment variable via .env.local. Files: `vite.config.ts`, `.env.local`, `.env.example`, `README.md`.
- **UI container styling** - Upload Zone and Format Selector wrapped in light blue container with border. Files: `src/app/App.tsx`.

### Removed
- Explicit "Compress Images" button (replaced with auto-compression). Files: `src/app/App.tsx`.
- Global MetadataPanel (replaced with per-image accordions). Files: `src/app/App.tsx`.
- WorkflowModeToggle component usage. Files: `src/app/App.tsx`.
- "Add coordinates to enable geo-tagging" alert. Files: `src/app/components/metadata/GeoTagSection.tsx`.
- Variables messaging ({year}, {client}) for Copyright field. Files: `src/app/components/metadata/CopyrightSection.tsx`.
- Old claude-plan.md file. Files: `guidelines/claude-plan.md`.

### Fixed
- Icon-only buttons now center icons properly (removed margin when no visible text). Files: `src/app/components/ui/Button.tsx`.
- Title metadata injection now uses proper EXIF field (DocumentName). Files: `src/app/services/metadata/`.
- Google Maps link auto-fill for geo-coordinates. Files: `src/app/utils/googleMapsParser.ts`.

---

## [0.0.1] - 2026-02-04

### Added
- Initial SmooshBoost application with image compression. Files: `src/app/`.
- TinyPNG API integration with Vite dev proxy. Files: `vite.config.ts`, `src/app/services/compression/tinypngService.ts`.
- Dual-mode format selector (Keep Original / Convert to). Files: `src/app/components/format/FormatSelector.tsx`, `src/app/types.ts`.
- Header with tagline. Files: `src/app/components/layout/Header.tsx`.
- Upload zone for batch image processing. Files: `src/app/components/upload/UploadZone.tsx`.
- Image queue with compression progress. Files: `src/app/hooks/useImageQueue.ts`.
- Squoosh WASM compression (mozjpeg, webp, oxipng). Files: `src/app/services/compression/`.
