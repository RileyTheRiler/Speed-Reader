## 2025-05-24 - ReaderCanvas Performance
**Learning:** For high-frequency animations (like the speed reader canvas), standard Zustand hook selectors cause excessive React re-renders.
**Action:** Use `store.subscribe` with direct DOM manipulation via `ref`s (for canvas and progress bar) to bypass React's render cycle completely for the animation loop. Use `useShallow` for the component selection to ensure it only re-renders on stable state changes (like settings).
