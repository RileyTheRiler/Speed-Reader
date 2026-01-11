## 2025-01-11 - Input Sanitization & Length Limiting
**Vulnerability:** User input was passed directly to the `tokenize` function without any validation or sanitization.
**Learning:** Even in client-side applications, processing large strings synchronously can lead to Denial of Service (DoS) by freezing the browser tab.
**Prevention:** Implemented `sanitizeInput` which truncates input to 50,000 characters and removes control characters before processing. This defends against DoS and potential injection risks.
