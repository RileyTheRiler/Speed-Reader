## 2026-01-08 - Accessible Toggle Implementation
**Learning:** React state toggles implemented as divs are inaccessible to keyboard users and screen readers.
**Action:** Always use `<button role="switch" aria-checked={state} onClick={toggle}>` for binary settings.
