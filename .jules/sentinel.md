## 2024-05-22 - Input Length & DoS Protection
**Vulnerability:** Client-side file parsing (PDF/EPUB) and text input had no length limits, allowing memory exhaustion (DoS) via large inputs.
**Learning:** Client-side apps are vulnerable to "zip bomb" style attacks where a small file expands to massive text, crashing the browser.
**Prevention:** Enforce `MAX_INPUT_LENGTH` at the entry point (parsing loop) and sanitization layer.
