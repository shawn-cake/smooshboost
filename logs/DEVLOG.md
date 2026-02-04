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
- **Phase:** Initial development - MVP complete with TinyPNG integration

### Current Objectives
- [x] Implement TinyPNG API integration
- [x] Create dual-mode format selector (match/convert)
- [x] Add footer with branding
- [x] Install Log File Genius documentation system
- [x] Document Log File Genius installation in logs
- [x] Create ADR for Log File Genius adoption (ADR-001)

### Known Risks & Blockers
- TinyPNG API key currently in vite.config.ts (dev-only); needs serverless function for production

---

## Daily Log - Newest First

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
