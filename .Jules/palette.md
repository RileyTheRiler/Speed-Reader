## 2024-05-23 - Accessibility Improvements
**Learning:** Icon-only buttons (like Play, Pause, Reset) are invisible to screen readers without `aria-label`. Standard `<label>` wrapping around inputs is not always sufficient or cleaner than explicit `htmlFor` association, especially for color pickers where the visual label might be styled separately.
**Action:** Always add `aria-label` to icon-only buttons. Use `id` and `htmlFor` for explicit label association on form inputs to ensure robust accessibility.
