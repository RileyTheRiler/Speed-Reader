## 2024-05-22 - Direct Store Subscription for High-Frequency Updates
**Learning:** For high-frequency animations (like 600 WPM text rendering), standard React state updates cause excessive re-rendering.
**Action:** Use `store.subscribe` to listen for changes and update DOM refs (canvas, progress bars) directly, bypassing the React render cycle entirely.
