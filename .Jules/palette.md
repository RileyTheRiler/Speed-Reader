# Palette's Journal

## 2026-01-15 - Clickable Rows for Toggles
**Learning:** Users (and Fitts's Law) prefer large hit targets. Small toggle switches are hard to click precisely.
**Action:** Always wrap toggle switches in a clickable container (like a button or label) that includes the description text.

## 2026-02-14 - Inline Form Labels
**Learning:** Quick-setting panels often duplicate controls found in modals but frequently miss standard form label associations (`htmlFor`/`id`), making them harder to use and less accessible.
**Action:** Always check inline "mini-settings" panels for missing label associations, especially for small inputs like color pickers and sliders.

## 2026-05-24 - Toggle Button State vs Modal Trigger
**Learning:** A common anti-pattern is using `getState()` in click handlers for UI toggles without subscribing the parent component to the state change. This breaks the reactivity chain—the button changes the store state, but the component responsible for rendering the modal (e.g., `App.tsx`) never re-renders to show it.
**Action:** When a button toggles a global UI state (like `isSummaryOpen`), ensure the component responsible for rendering the resulting UI (like the Modal) is explicitly subscribed to that state via the store hook.

## 2026-05-24 - ARIA for Icon-Only Toggle Buttons
**Learning:** Icon-only buttons used for modes (like Zen Mode) or dialog triggers (Summary) are often implemented as generic buttons with tooltips. They miss critical screen reader context: `aria-pressed` for boolean toggles and `aria-haspopup`/`aria-expanded` for modal triggers.
**Action:** Audit icon-only buttons. If it stays on/off, add `aria-pressed`. If it opens a menu/dialog, add `aria-expanded` and `aria-haspopup`.
