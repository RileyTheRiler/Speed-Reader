# Palette's Journal

## 2026-01-15 - Clickable Rows for Toggles
**Learning:** Users (and Fitts's Law) prefer large hit targets. Small toggle switches are hard to click precisely.
**Action:** Always wrap toggle switches in a clickable container (like a button or label) that includes the description text.

## 2026-02-14 - Inline Form Labels
**Learning:** Quick-setting panels often duplicate controls found in modals but frequently miss standard form label associations (`htmlFor`/`id`), making them harder to use and less accessible.
**Action:** Always check inline "mini-settings" panels for missing label associations, especially for small inputs like color pickers and sliders.

## 2026-05-21 - Toggle Button State
**Learning:** Icon-heavy buttons (like "Zen Mode") often rely on color change for state but miss the semantic `aria-pressed` attribute, leaving screen readers unaware of the toggle state.
**Action:** Always pair visual state changes (bg-color) with `aria-pressed` on toggle buttons.
