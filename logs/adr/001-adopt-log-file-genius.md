# ADR-001: Adopt Log File Genius for Project Documentation

**Status:** Accepted
**Date:** 2026-02-04
**Deciders:** Development team
**Related:** Log File Genius v0.2.0

---

## Context

SmooshBoost is an image optimization tool built with React, TypeScript, and Vite. As the project grows, we need a structured way to document decisions, track changes, and maintain context for AI coding assistants. Traditional documentation approaches either become bloated (consuming too much AI context window) or too sparse (lacking critical decision history).

---

## Decision

We will adopt Log File Genius as our project documentation system, using:
- **CHANGELOG.md** for technical change tracking (what changed)
- **DEVLOG.md** for decision narratives (why it changed)
- **STATE.md** for current project status (what's happening now)
- **ADRs** for architectural decisions (how we decided)

Configuration: solo-developer profile with Augment assistant integration.

---

## Consequences

### Positive
- 93% reduction in AI context bloat compared to verbose documentation
- Structured format helps AI assistants understand project history quickly
- Clear separation between facts (CHANGELOG) and narrative (DEVLOG)
- Scalable archiving strategy keeps logs lean over time
- Multi-agent coordination support via STATE.md

### Negative
- Requires discipline to maintain logs consistently
- Initial learning curve for the documentation structure
- Additional files to manage in the repository

### Neutral
- Adds `.augment/rules/` directory with AI assistant rules
- Requires updating logs after each significant change

---

## Alternatives Considered

### Alternative 1: No structured documentation
**Rejected because:** Leads to context loss, repeated questions from AI assistants, and difficulty onboarding new developers.

### Alternative 2: Traditional README-only approach
**Rejected because:** README files become bloated over time, consuming excessive AI context without providing structured access to specific information.

### Alternative 3: Wiki or external documentation
**Rejected because:** Separates documentation from code, making it harder to keep in sync and less accessible to AI assistants.

---

## Notes

- Installation completed via git submodule: `.log-file-genius/`
- Configuration stored in `.logfile-config.yml`
- AI rules automatically installed to `.augment/rules/`
- Documentation: `.log-file-genius/docs/log_file_how_to.md`

