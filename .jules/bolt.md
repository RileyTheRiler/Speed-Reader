## 2025-05-20 - High Frequency Store Updates
**Learning:** React components subscribed to high-frequency Zustand store updates (like 'currentIndex' changing 10x/sec) cause excessive re-renders.
**Action:** Use 'store.subscribe' and imperative DOM/Canvas updates for high-frequency data, keeping it out of the React render cycle.
