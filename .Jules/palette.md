# Palette's Journal

## 2026-01-15 - Clickable Rows for Toggles
**Learning:** Users (and Fitts's Law) prefer large hit targets. Small toggle switches are hard to click precisely.
**Action:** Always wrap toggle switches in a clickable container (like a button or label) that includes the description text.

## 2026-02-14 - Inline Form Labels
**Learning:** Quick-setting panels often duplicate controls found in modals but frequently miss standard form label associations (`htmlFor`/`id`), making them harder to use and less accessible.
**Action:** Always check inline "mini-settings" panels for missing label associations, especially for small inputs like color pickers and sliders.

## 2025-05-21 - Reactive Modal State in Zustand
**Learning:** Components rendering modals based on Zustand store state MUST explicitly subscribe to that state slice (e.g. `isSummaryOpen`). Using `store.getState()` in props passes the initial value but fails to trigger re-renders when the state changes.
**Action:** Always verify parent components subscribe to boolean visibility flags for their child modals.
