## 2026-01-04 - [Optimization] Transient Updates for Canvas Animation
**Learning:** Using React state for high-frequency animations (like 60fps canvas drawing) causes unnecessary overhead due to Virtual DOM reconciliation.
**Action:** Use `store.subscribe` (Zustand) or similar subscription mechanism to listen for changes and update the DOM/Canvas imperatively via `ref`, bypassing React's render cycle for the animation loop. Ideally, keep React for the structure and imperative code for the high-speed updates.
