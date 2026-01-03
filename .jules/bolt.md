## 2024-05-20 - [Zustand Canvas Optimization]
**Learning:** Using `useStore()` hook destructuring causes re-renders on *any* state change. For high-frequency updates (like 60fps or 10Hz text rendering), this kills performance.
**Action:** Use granular selectors for structural updates, and `store.subscribe()` inside `useEffect` for high-frequency imperative updates (like Canvas drawing). This bypasses React reconciliation completely for the "hot path".
