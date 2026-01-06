## 2024-05-24 - Accessible Toggles
**Learning:** `div` elements with `onClick` handlers are invisible to keyboard users and screen readers, making standard settings controls inaccessible.
**Action:** Always implement toggles using `<button role="switch" aria-checked={boolean}>` to ensure focusability and semantic state communication.
