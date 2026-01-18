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
