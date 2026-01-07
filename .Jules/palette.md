## 2025-01-07 - Reactivity vs. Performance in Zustand
**Learning:** Directly accessing `store.getState()` in render methods avoids subscriptions but breaks reactivity for UI toggles (like side panels). This pattern should only be used for high-frequency updates (e.g. animation loops), not for standard UI state.
**Action:** Use standard hook selectors (e.g., `const { value } = useStore()`) for UI elements that need to update on state change.
