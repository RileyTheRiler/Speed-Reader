# Palette's Journal

## 2026-01-15 - Clickable Rows for Toggles
**Learning:** Users (and Fitts's Law) prefer large hit targets. Small toggle switches are hard to click precisely.
**Action:** Always wrap toggle switches in a clickable container (like a button or label) that includes the description text.

## 2026-02-14 - Inline Form Labels
**Learning:** Quick-setting panels often duplicate controls found in modals but frequently miss standard form label associations (`htmlFor`/`id`), making them harder to use and less accessible.
**Action:** Always check inline "mini-settings" panels for missing label associations, especially for small inputs like color pickers and sliders.

## 2026-10-25 - Toggle Buttons vs Modal Triggers
**Learning:** Toggle buttons (like Zen Mode) need `aria-pressed`, but buttons that open modals (like Summary) need `aria-haspopup="dialog"` and `aria-expanded`. Using the wrong one confuses screen reader users about what will happen.
**Action:** Always distinguish between "switching a state" and "opening a panel" when choosing ARIA attributes.
