# Palette's Journal

## 2026-01-15 - Clickable Rows for Toggles
**Learning:** Users (and Fitts's Law) prefer large hit targets. Small toggle switches are hard to click precisely.
**Action:** Always wrap toggle switches in a clickable container (like a button or label) that includes the description text.

## 2026-02-14 - Inline Form Labels
**Learning:** Quick-setting panels often duplicate controls found in modals but frequently miss standard form label associations (`htmlFor`/`id`), making them harder to use and less accessible.
**Action:** Always check inline "mini-settings" panels for missing label associations, especially for small inputs like color pickers and sliders.

## 2025-05-20 - Toggle Button State Visibility
**Learning:** Toggle buttons (like "Zen Mode") that lack immediate, obvious visual state changes (like a color shift) leave users guessing if the action succeeded, especially if the mode change is subtle.
**Action:** Always add `aria-pressed` and a distinct active visual style (e.g., background color change) to toggle buttons.
