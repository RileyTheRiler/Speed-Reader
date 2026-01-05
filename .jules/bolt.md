## 2024-05-23 - Transient Updates for High-Frequency State
**Learning:** React component re-renders are too expensive for 60fps or high-frequency updates (like a speed reader cursor). Zustand's `subscribe` method allows bypassing the React render cycle entirely for specific DOM/Canvas updates.
**Action:** For animation loops or rapid data changes, remove the changing value from the React hook selector and use `store.subscribe` to update Refs or Canvas directly.

## 2024-05-23 - Helper Function Stability
**Learning:** Defining helper functions inside React components (even if not memoized) can break `useCallback` optimizations or confuse the React Compiler/Linter if they are dependencies.
**Action:** Move pure helper functions outside of the component scope to ensure stability and avoid unnecessary recreation.
