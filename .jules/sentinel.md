## 2025-02-18 - [DoS Protection via Input Sanitization]
**Vulnerability:** Unbounded input text could lead to browser freezes (DoS) when tokenizing or rendering.
**Learning:** Client-side processing of large texts requires strict limits even if no backend exists. 50k chars is a safe balance for this app's architecture.
**Prevention:** Always sanitize and truncate inputs at the entry point (Store or Parser).
