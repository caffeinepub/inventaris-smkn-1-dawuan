# Specification

## Summary
**Goal:** Display the school logo on the Login page, reading it from localStorage settings (the same source used by Layout.tsx).

**Planned changes:**
- Update `frontend/src/pages/Login.tsx` to read the school logo from localStorage settings
- Display the logo prominently above the login form
- Show a fallback placeholder/icon when no logo has been uploaded, consistent with how it appears in the sidebar

**User-visible outcome:** Users will see the school logo above the login form when visiting the login page, matching the logo shown in the sidebar after logging in.
