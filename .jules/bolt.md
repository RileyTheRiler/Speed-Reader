## 2025-05-24 - ReaderCanvas Performance
**Learning:** For high-frequency animations (like the speed reader canvas), standard Zustand hook selectors cause excessive React re-renders.
**Action:** Use `store.subscribe` with direct DOM manipulation via `ref`s (for canvas and progress bar) to bypass React's render cycle completely for the animation loop. Use `useShallow` for the component selection to ensure it only re-renders on stable state changes (like settings).
## 2024-05-23 - Zustand Subscription for High-Frequency Updates
**Learning:** Using `useReaderStore` hook selectors for high-frequency state changes (like `currentIndex` in a speed reader) causes excessive React re-renders, even with `React.memo`. The `useReaderStore()` hook triggers a re-render whenever the selected slice changes.
**Action:** For state that updates >10 times/second (like playback progress), exclude it from the component's hook selector. Instead, use `useReaderStore.subscribe()` inside a `useEffect` to imperatively update the DOM (via refs) or canvas. Use `useShallow` for the remaining stable selectors to minimize component re-renders.

## 2025-05-24 - TextPanel Optimization
**Learning:** High-frequency updates (like current word highlighting) in a list of components causes excessive re-renders if using React state. Imperative DOM manipulation via `useReaderStore.subscribe` and `data-index` attributes bypasses this bottleneck efficiently.
**Action:** Apply this pattern to other high-frequency lists if found.
