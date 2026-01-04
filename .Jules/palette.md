## 2024-05-23 - Accessibility Improvements for Control Components
**Learning:** Custom toggle switches implemented as `div`s are inaccessible to keyboard users and screen readers. They lack focus states and semantic meaning.
**Action:** Replace custom `div` toggles with `<button role="switch" aria-checked={state} />`. This provides built-in keyboard focus and announces state changes correctly to screen readers. Also ensure all icon-only buttons have descriptive `aria-label`s.
