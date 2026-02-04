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
- Log File Genius documentation system. Files: `logs/`, `.augment/rules/`, `.logfile-config.yml`.
- Footer component with version number. Files: `src/app/components/layout/Footer.tsx`.
- Sticky footer layout. Files: `src/app/App.tsx`.
- SVG logo in header. Files: `src/assets/logo.svg`, `src/app/components/layout/Header.tsx`.

### Changed
- Format selector now inline with label. Files: `src/app/components/format/FormatSelector.tsx`.
- Format dropdown always reserves space (no layout shift). Files: `src/app/components/format/FormatSelector.tsx`.
- Header now uses SVG logo instead of text. Files: `src/app/components/layout/Header.tsx`.
- Download button shows "Download" for single image, "Download All (n)" for multiple. Files: `src/app/components/download/DownloadSection.tsx`, `src/app/App.tsx`.
- Single image downloads directly instead of as ZIP. Files: `src/app/App.tsx`.
- Header padding-top increased to `var(--spacing-12)`. Files: `src/app/components/layout/Header.tsx`.

### Fixed
- Icon-only buttons now center icons properly (removed margin when no visible text). Files: `src/app/components/ui/Button.tsx`.

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
