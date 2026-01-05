## 2024-05-23 - Accessibility of Toggles
**Learning:** Interactive toggles implemented as `div` elements exclude keyboard and screen reader users.
**Action:** Always use `<button role="switch" aria-checked={boolean}>` for toggle switches to ensure native accessibility.
