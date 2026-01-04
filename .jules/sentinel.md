## 2024-02-12 - Missing Input Limits and Headers
**Vulnerability:**
1. Potential Denial of Service (DoS) via unrestricted input length in the main text area.
2. Missing security headers in deployment configuration (`vercel.json`), exposing the application to clickjacking and other attacks.

**Learning:**
React applications, while generally secure against XSS, are still vulnerable to resource exhaustion (DoS) if inputs are not limited. Also, client-side only apps still need server-side configuration (like headers) to be fully secure, often managed via deployment config files like `vercel.json` in Vercel.

**Prevention:**
- Always enforce `maxLength` on text inputs.
- Always include `Content-Security-Policy`, `X-Frame-Options`, and `X-Content-Type-Options` headers in deployment configuration.
