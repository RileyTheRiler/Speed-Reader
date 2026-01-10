## 2026-01-10 - Zustand Subscription Optimization
**Learning:** Removing frequently changing state (like `currentIndex`) from the React component's selector and using `store.subscribe` manually allows for high-performance updates (60fps) without triggering React reconciliation. This is crucial for canvas-based or animation-heavy components.
**Action:** When optimizing animations driven by Zustand state, prefer manual subscriptions + refs over hook-based selectors for values that update on every frame.
