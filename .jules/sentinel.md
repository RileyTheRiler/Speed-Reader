# Sentinel Journal

## 2024-05-22 - [DoS Prevention]
**Vulnerability:** Unbounded text input allowed users to paste massive strings, potentially causing browser freeze (DoS).
**Learning:** Client-side apps are vulnerable to DoS via large inputs if not validated before processing.
**Prevention:** Enforced `MAX_INPUT_LENGTH` and added input sanitization to remove control characters.
