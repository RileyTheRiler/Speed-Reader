## 2024-05-22 - Input Length & DoS Protection
**Vulnerability:** Client-side file parsing (PDF/EPUB) and text input had no length limits, allowing memory exhaustion (DoS) via large inputs.
**Learning:** Client-side apps are vulnerable to "zip bomb" style attacks where a small file expands to massive text, crashing the browser.
**Prevention:** Enforce `MAX_INPUT_LENGTH` at the entry point (parsing loop) and sanitization layer.
## 2025-02-18 - [DoS Protection via Input Sanitization]
**Vulnerability:** Unbounded input text could lead to browser freezes (DoS) when tokenizing or rendering.
**Learning:** Client-side processing of large texts requires strict limits even if no backend exists. 50k chars is a safe balance for this app's architecture.
**Prevention:** Always sanitize and truncate inputs at the entry point (Store or Parser).
## 2024-05-22 - [Missing Security Utilities]
**Vulnerability:** Input sanitization and length limits were missing from file parsing and text input, risking DoS and potential injection.
**Learning:** Security utilities like `sanitizeInput` and `MAX_INPUT_LENGTH` were referenced in project memory but absent in the codebase.
**Prevention:** Verify existence of referenced security modules before assuming they are active.
## 2025-01-16 - DoS Prevention via Input Truncation
**Vulnerability:** The application was vulnerable to Denial of Service (DoS) and memory exhaustion attacks because it read entire files (PDF/EPUB) into memory without any length limits. It also accepted unlimited text input into the state store.
**Learning:** Client-side applications are not immune to DoS. Loading a 1GB text file into a string variable can crash the browser tab, leading to poor UX and potential loss of unsaved work. Security in client-side apps often aligns with performance and stability.
**Prevention:** Implemented a centralized `MAX_INPUT_LENGTH` (5MB) and a `sanitizeInput` utility. Applied this limit during file parsing (truncating early) and when setting input text in the store. This ensures the application remains responsive even with malicious or accidental large inputs.
## 2025-02-12 - Missing Security Headers
**Vulnerability:** The application lacked HTTP security headers (X-Frame-Options, X-Content-Type-Options, etc.) which leaves it vulnerable to clickjacking, MIME sniffing, and other common web attacks.
**Learning:** Static site deployments (like Vercel) often default to open configurations. Security headers must be explicitly configured in platform-specific config files (vercel.json) or edge middleware.
**Prevention:** Always verify and configure `vercel.json` or `netlify.toml` with standard security headers as part of the initial project setup.

## 2025-02-18 - Corrupt Security Modules & Duplicate Logic
**Vulnerability:** Core security files (security.ts, fileParser.ts) and the main store (useReaderStore.ts) contained duplicate code blocks and conflicting constant definitions due to merge corruption, rendering the application unbuildable and security controls (DoS limits, sanitization) undefined/broken.
**Learning:** Syntax errors in security modules are "Denial of Service" vulnerabilities in themselves. Always verify file integrity after merges.
**Prevention:** Use pnpm build and pnpm lint in CI/CD pipelines to catch duplicate declarations and syntax errors immediately.
