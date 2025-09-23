# tsDice Project Constitution

This document defines principles that guide planning and implementation work for tsDice. All specifications, plans, tasks, and code changes should conform to these principles.

## 1. Code Quality & Reliability


- Prefer small, composable functions with clear inputs/outputs.
- No unhandled exceptions; guard against null/undefined and bad inputs.
- Avoid tight coupling between UI, state, and generators. Keep configuration generation pure when possible.
- Log user-facing errors clearly; use console warnings sparingly during development only.

## 2. Performance


- Target 60 FPS on mid-range laptops for common presets.
- Keep bundle size minimal; load libraries from `libs/` only as needed.
- Debounce or throttle expensive UI interactions.
- Avoid unnecessary re-initialization of the tsParticles engine.

## 3. Accessibility (a11y)


- Maintain keyboard navigability for all interactive controls.
- Use ARIA attributes for custom components and ensure focus states are visible.
- Provide sufficient color contrast across light/dark themes.

## 4. UX Consistency


- Keep the “glassmorphism” look and feel consistent across buttons, modals, and sliders.
- Prefer progressive disclosure: show advanced controls only when relevant.
- Preserve user choices (theme, intensity, history) across sessions when reasonable.

## 5. Testing & Validation


- Manual testing is acceptable; document test steps for new features.
- Validate that new presets do not throw runtime errors and that sliders/controls behave within their ranges.
- Record a GIF or short note for complex UX flows when helpful.

## 6. Documentation


- Update `README.md` for user-visible features and noteworthy changes.
- Add short inline comments for non-obvious logic (especially randomization and chaos scaling).

## 7. Governance & Decision Records


- When making non-trivial changes, add a short “Decision Note” to the spec/plan describing trade-offs and rationale.
- Prefer reversible decisions; document rollback steps when introducing large UX changes.

---

Last updated: ${DATE}
