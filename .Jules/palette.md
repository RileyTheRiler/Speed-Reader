## 2024-05-23 - Accessibility of Color Inputs
**Learning:** Color input fields (`<input type="color">`) are often implemented with adjacent visual labels but lack programmatic association, making them inaccessible to screen reader users who cannot determine which color property they are modifying.
**Action:** Always provide explicit `id` attributes to color inputs and corresponding `for` (or `htmlFor` in React) attributes to their labels to ensure they are properly linked and accessible.
