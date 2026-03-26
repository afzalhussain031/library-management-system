## Plan: Secure Refresh Cookie Migration

Migrate from frontend-managed refresh tokens (localStorage) to backend-managed HttpOnly cookie refresh tokens, while keeping the access token short-lived in frontend memory only. This reduces XSS token theft risk and keeps API auth compatible with existing JWT Bearer access-token usage.

**Steps**
1. Phase 1 - Backend cookie auth foundation
2. Add refresh cookie settings in backend settings (cookie name, secure flag by environment, httponly true, samesite lax, path restriction, max age aligned with refresh lifetime).
3. Implement custom token obtain/refresh views in library app that: (a) set refresh token in Set-Cookie on login, (b) return access token in response body, (c) read refresh token from cookie on refresh endpoint, and (d) rotate cookie if refresh token rotation is enabled later. *depends on 2*
4. Implement logout endpoint that clears refresh cookie server-side; frontend logout should call it best-effort. *parallel with step 6*
5. Wire custom JWT endpoints in root URLs to replace default SimpleJWT obtain/refresh routes. *depends on 3*
6. Tighten CORS config for credentials by disabling allow-all origins and whitelisting explicit frontend origins for development/production. *parallel with step 4*
7. Phase 2 - Frontend token model transition
8. Refactor token manager to store only access token in memory (module variable) and remove refresh-token APIs/storage keys usage.
9. Update axios client(s) to use withCredentials true so refresh cookie is sent automatically; keep Authorization header injection from in-memory access token. *depends on 8*
10. Update 401 interceptor refresh flow to call refresh endpoint with empty body and consume new access token from response body; remove refresh-token lookups and storage.
11. Update auth service login/register/logout flows to align with new contract (login receives access and cookie is set by browser, logout calls backend cookie-clear endpoint, then clear in-memory access + user state). *depends on 4, 10*
12. Remove dead constants/types and localStorage refresh-token references across auth context/services; keep user profile persistence decisions explicit (either keep CURRENT_USER in localStorage or also move to memory).
13. Phase 3 - Security hardening and compatibility
14. Add CSRF strategy for cookie-backed refresh/logout endpoints: either DRF CSRF-protected session-compatible flow for those endpoints, or explicit anti-CSRF token approach; document chosen approach and why.
15. Add environment-driven production flags (secure cookies true, strict origin list, debug false, host restrictions) and local dev defaults that still work on localhost over HTTP.
16. Phase 4 - Validation
17. Validate login, page reload, silent refresh, expired access handling, logout, and multi-tab behavior with in-memory access model.
18. Add/update automated tests for custom token views (cookie set/cleared, refresh-from-cookie success/failure, missing-cookie path).

**Relevant files**
- /backend/config/settings.py - add cookie + CORS + environment configuration.
- /backend/config/urls.py - route custom token obtain/refresh/logout views.
- /backend/library/views.py - implement cookie-aware token obtain/refresh/logout API views.
- /backend/library/serializers.py - optional serializer customization if excluding refresh from body explicitly.
- /backend/library/urls.py - include logout endpoint if app-level routing preferred.
- /frontend/src/utils/tokenManager.ts - move access token to in-memory storage, remove refresh token APIs.
- /frontend/src/services/apiClient.ts - withCredentials, 401 refresh logic, login/logout adjustments.
- /frontend/src/auth/AuthProvider.tsx - initialization/login/logout behavior with in-memory access token.
- /frontend/src/constants/index.ts - remove refresh storage key and adjust auth constants.
- /frontend/src/types/index.ts - adjust LoginResponse shape if backend stops returning refresh in JSON.

**Verification**
1. Backend unit/API tests: login sets HttpOnly refresh cookie, refresh endpoint reads cookie and returns new access token, logout clears cookie.
2. Browser devtools checks: refresh cookie appears under Cookies with HttpOnly and SameSite=Lax; refresh token not present in localStorage/sessionStorage.
3. End-to-end auth flow: login -> call protected endpoint -> force access expiry -> interceptor refreshes successfully -> original request retries.
4. Negative cases: missing/expired refresh cookie triggers 401 and frontend signs user out cleanly.
5. Cross-origin behavior: frontend origin in allowed list, withCredentials requests succeed, preflight passes.

**Decisions**
- Access token storage: in-memory only (selected).
- Refresh token policy: HttpOnly cookie with SameSite=Lax (selected).
- Included scope: JWT login/refresh/logout contract changes across backend+frontend.
- Excluded scope: replacing JWT with server sessions or introducing OAuth providers.

**Further Considerations**
1. CSRF handling choice for refresh/logout cookie endpoints should be finalized before coding to avoid insecure defaults.
2. If preserving seamless reload UX is required, run a silent refresh call on app bootstrap to rehydrate in-memory access token from refresh cookie.
3. If horizontal scaling or token revocation is needed later, consider enabling refresh rotation + blacklist in SimpleJWT and updating cookie rewrite logic.
