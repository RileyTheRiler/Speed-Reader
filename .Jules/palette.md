# Palette's Journal

## 2026-01-15 - Clickable Rows for Toggles
**Learning:** Users (and Fitts's Law) prefer large hit targets. Small toggle switches are hard to click precisely.
**Action:** Always wrap toggle switches in a clickable container (like a button or label) that includes the description text.

## 2026-02-14 - Inline Form Labels
**Learning:** Quick-setting panels often duplicate controls found in modals but frequently miss standard form label associations (`htmlFor`/`id`), making them harder to use and less accessible.
**Action:** Always check inline "mini-settings" panels for missing label associations, especially for small inputs like color pickers and sliders.

## 2026-03-05 - Semantic Radio Groups in Modals
**Learning:** Visual toggle buttons that behave like mutually exclusive options often lack semantic `radiogroup` roles, confusing screen reader users about the available choices and current selection.
**Action:** When implementing mutually exclusive choices (like themes or modes), always use `role="radiogroup"` with `role="radio"` buttons and `aria-checked` attributes instead of generic `aria-pressed` buttons.
