## 2024-05-22 - [Missing Security Utilities]
**Vulnerability:** Input sanitization and length limits were missing from file parsing and text input, risking DoS and potential injection.
**Learning:** Security utilities like `sanitizeInput` and `MAX_INPUT_LENGTH` were referenced in project memory but absent in the codebase.
**Prevention:** Verify existence of referenced security modules before assuming they are active.
