## 2025-05-24 - ReaderCanvas Performance
**Learning:** For high-frequency animations (like the speed reader canvas), standard Zustand hook selectors cause excessive React re-renders.
**Action:** Use `store.subscribe` with direct DOM manipulation via `ref`s (for canvas and progress bar) to bypass React's render cycle completely for the animation loop. Use `useShallow` for the component selection to ensure it only re-renders on stable state changes (like settings).
## 2024-05-23 - Zustand Subscription for High-Frequency Updates
**Learning:** Using `useReaderStore` hook selectors for high-frequency state changes (like `currentIndex` in a speed reader) causes excessive React re-renders, even with `React.memo`. The `useReaderStore()` hook triggers a re-render whenever the selected slice changes.
**Action:** For state that updates >10 times/second (like playback progress), exclude it from the component's hook selector. Instead, use `useReaderStore.subscribe()` inside a `useEffect` to imperatively update the DOM (via refs) or canvas. Use `useShallow` for the remaining stable selectors to minimize component re-renders.
## 2026-01-28 - ReadingProgress Optimization
**Learning:** React components displaying high-frequency text updates (e.g., "Word X of Y") can become performance bottlenecks if they re-render on every update. Imperative DOM updates via `useReaderStore.subscribe` and `ref.innerText` eliminate this overhead without sacrificing functionality.
**Action:** Always prefer imperative DOM updates for high-frequency text changes (progress counters, timers) to keep the React render loop idle during playback.
