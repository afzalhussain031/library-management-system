
## Highest-impact improvements (do first)



## Login/signup flow improvements (product + UX)

6. Add email verification before full account activation
- What to change: On signup, create inactive user, send verification link/token, activate on confirmation.
- Why: Reduces fake accounts, improves contactability, enables safer password reset journey.

7. Add forgot-password and reset-password flow
- What to change: Endpoints for requesting reset token and confirming reset, plus UI screens/modal states.
- Why: Essential for real-world usability; currently there is no recovery path.

8. Add optional MFA for staff/admin accounts
- What to change: TOTP-based second factor or email OTP for elevated roles.
- Why: Staff accounts are higher risk and currently only protected by password login.

9. Improve client-side form validation and guidance
- What to change: Add instant validation for username format, password strength meter, confirm-password match, clear field-level errors.
- Why: Current modal mainly surfaces general errors in AuthModal.tsx, which hurts completion rates.

10. Add a proper loading and disabled state strategy
- What to change: Debounce submit, disable repeated submits, show clear pending/success/failure status.
- Why: Avoid duplicate requests and improve confidence in slow-network scenarios.

## Architecture and consistency fixes

11. Unify to one auth API layer
- What to change: Remove or deprecate legacy API module and use one service consistently.
- Why: You currently have duplicated auth logic in apiClient.ts and api.ts, which can drift and cause bugs.


13. Make authentication state validity-aware, not presence-only
- What to change: Treat user as authenticated only if access token is present and unexpired, or refresh succeeds.
- Why: Current check in apiClient.ts only checks existence, not validity.

14. Handle refresh race conditions
- What to change: Use a refresh mutex/queue so parallel 401 responses trigger one refresh request and replay queued requests after success.
- Why: Prevents token refresh storms and random logout behavior under concurrency.

15. Replace hard browser redirect on auth failure with controlled logout flow
- What to change: Instead of direct location redirect, call centralized logout and route with React Router.
- Why: Current hard redirect at apiClient.ts can create abrupt UX and state inconsistencies.

## Backend domain and policy enhancements

16. Add account status checks (active, suspended, deleted)
- What to change: Customize token obtain flow to reject suspended/inactive users with clear messages.
- Why: Needed for admin governance and safer lifecycle management.

17. Add normalized identifier strategy
- What to change: Normalize username/email (trim, lowercase where relevant), enforce uniqueness policy.
- Why: Prevents duplicate logical identities and login confusion.

18. Add authentication audit logs
- What to change: Log signup, login success/failure, token refresh anomalies, lockouts, staff account creation.
- Why: Critical for incident response and security monitoring.

## Accessibility and frontend quality additions

19. Improve modal accessibility
- What to change: Add aria-modal, labelledby, focus trap, initial focus, return focus on close, keyboard-safe tab loops.
- Why: Current modal has dialog role but can be improved for keyboard/screen-reader users in AuthModal.tsx.

20. Add i18n-ready error messages and consistent error mapping
- What to change: Standardize backend error shapes and map them to field errors in UI, not one general string.
- Why: Better clarity and easier localization later.

## Testing and reliability additions

21. Add auth test coverage
- What to add: Backend tests for register validation, token obtain/refresh, rate limit behavior, role restrictions; frontend tests for modal validation and auth state transitions.
- Why: Auth is high-risk; current tests are minimal and auth regressions are expensive.

22. Add security regression checklist in CI
- What to add: Check for debug mode, allow-all CORS, hardcoded secrets, and token-policy config in CI pipeline.
- Why: Prevents accidental insecure deploys.

---

Recommended implementation order:
1. Security hardening: token storage, rotation, CORS/debug/secrets, rate limiting.
2. Core account flows: password reset, email verification, improved validation.
3. Architecture cleanup: single API service, remove stale invite-code paths, better auth-state logic.
4. UX and accessibility polish.
5. Tests and CI guardrails.

If you want, I can next turn this into a concrete implementation checklist mapped to exact files and endpoint contracts for your project.