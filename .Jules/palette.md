# Palette's Journal

## 2026-01-15 - Clickable Rows for Toggles
**Learning:** Users (and Fitts's Law) prefer large hit targets. Small toggle switches are hard to click precisely.
**Action:** Always wrap toggle switches in a clickable container (like a button or label) that includes the description text.

## 2026-02-14 - Inline Form Labels
**Learning:** Quick-setting panels often duplicate controls found in modals but frequently miss standard form label associations (`htmlFor`/`id`), making them harder to use and less accessible.
**Action:** Always check inline "mini-settings" panels for missing label associations, especially for small inputs like color pickers and sliders.

## 2026-10-27 - Semantic Radio Groups
**Learning:** Button pairs representing mutually exclusive options (like "RSVP vs Pacer") are often implemented as separate buttons, confusing screen readers.
**Action:** Wrap these in `role="radiogroup"` and use `role="radio"` with `aria-checked` to communicate the relationship and state clearly.
