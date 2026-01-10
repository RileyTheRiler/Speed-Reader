## 2024-05-22 - Semantic Toggle Switches
**Learning:** Found a pattern of using `div` elements with `onClick` handlers for toggle switches, which breaks accessibility for screen reader and keyboard users.
**Action:** Use native `<button role="switch">` elements with `aria-checked` state and proper labelling for all future toggle implementations.
