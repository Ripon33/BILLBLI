# BILLBLI Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add secure Supabase authentication to BILLBLI with email/password, Google sign-in, protected workspace access, email verification, password reset, profiles, sessions, account deletion, and user-owned data foundations.

**Architecture:** BILLBLI will use Supabase Auth with @supabase/ssr for cookie-based Next.js sessions. Browser and server Supabase clients will be separate, server-side identity will control authorization, and existing BILLBLI intent, research, study, decision, task, and localStorage systems will remain intact.

**Tech Stack:** Next.js 15.5.24, React 19.1.1, TypeScript, Supabase Auth, @supabase/ssr 0.12.6, @supabase/supabase-js 2.115.0, Vitest.

**Spec:** docs/superpowers/specs/2026-09-07-authentication-design.md

## Global Constraints

- Authentication provider: Supabase Auth.
- Authentication methods: Email + Password and Google sign-in.
- Public routes: /, /sign-in, /sign-up, /forgot-password, /auth/callback.
- The main BILLBLI workspace requires authentication.
- Email/password accounts must verify their email before entering the protected workspace.
- Google users use the verified Google identity.
- Existing localStorage history remains untouched and is not automatically migrated.
- New authenticated activity is associated with the authenticated user.
- Protected APIs require authentication and return 401 Unauthorized when unauthenticated.
- User-owned database records use the authenticated Supabase user ID.
- Client-supplied user IDs must never determine ownership.
- Row Level Security protects user-owned database records.
- Privileged credentials remain server-side.
- Authentication never bypasses approval requirements.
- Support Remember me.
- Sign out terminates the session without deleting account data.
- Password reset uses a secure, time-limited email recovery flow.
- Account deletion requires explicit confirmation.
- Teams and shared workspaces are not part of v1.
- Do not create a second intent/task routing system.
- Use RED -> GREEN TDD for implementation.
- Do not modify unrelated functionality.

---

### Task 1: Supabase authentication dependencies

**Files:**
- Modify: package.json
- Modify: package-lock.json

- [ ] Verify @supabase/ssr and @supabase/supabase-js resolve with npm ls.
- [ ] Run npm test and confirm the existing suite remains green.
- [ ] Run git diff --check.
- [ ] Commit with: git add package.json package-lock.json && git diff --cached --check && git commit -m "chore: add Supabase auth dependencies"

### Task 2: Supabase browser and server clients

**Files:**
- Create: lib/supabase/client.ts
- Create: lib/supabase/server.ts
- Create: lib/supabase-client.test.ts

**Interfaces:**
- Browser createClient(): SupabaseClient.
- Server async createClient(): Promise<SupabaseClient>.
- Both require NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.

- [ ] RED: test missing Supabase configuration.
- [ ] Run: npm test -- lib/supabase-client.test.ts; expect failure because the modules do not exist.
- [ ] GREEN: implement createBrowserClient and createServerClient using @supabase/ssr and Next.js cookies.
- [ ] Run: npm test -- lib/supabase-client.test.ts; expect PASS.
- [ ] Run: npm run build.
- [ ] Commit the three files with: feat: add Supabase server and browser clients.

### Task 3: Authentication session refresh and route protection

**Files:**
- Create: proxy.ts
- Create: lib/auth-guard.ts
- Create: lib/auth-guard.test.ts

**Interfaces:**
- isProtectedPath(pathname: string): boolean.
- getRequiredUser(): Promise<User>.
- Protected paths: /workspace, /research, /study, /decisions, /tasks, /history, /settings, /profile.

- [ ] RED: test public versus protected path classification.
- [ ] Run: npm test -- lib/auth-guard.test.ts; expect failure.
- [ ] GREEN: implement exact path classification and server-confirmed identity using getUser or getClaims, never getSession for authorization.
- [ ] GREEN: implement proxy session refresh and redirect unauthenticated protected requests to /sign-in.
- [ ] Run: npm test -- lib/auth-guard.test.ts.
- [ ] Run: npm run build.
- [ ] Commit with: feat: add protected authentication routes.

### Task 4: Email signup and verification

**Files:**
- Create: app/sign-up/page.tsx
- Create: app/verify-email/page.tsx
- Create: lib/auth-sign-up.ts
- Create: lib/auth-sign-up.test.ts

**Interface:**
- signUpWithPassword(fullName: string, email: string, password: string): Promise<{ error: string | null }>.

- [ ] RED: test valid registration, required fields, and Supabase signup errors.
- [ ] Run: npm test -- lib/auth-sign-up.test.ts; expect failure.
- [ ] GREEN: implement Supabase password signup with full name metadata and email verification.
- [ ] GREEN: implement /sign-up and /verify-email with resend verification.
- [ ] Run focused tests and npm run build.
- [ ] Commit with: feat: add email signup and verification flow.

### Task 5: Password sign-in, Google sign-in, Remember me, and sign-out

**Files:**
- Create: app/sign-in/page.tsx
- Create: lib/auth-sign-in.ts
- Create: lib/auth-sign-out.ts
- Create: lib/auth-sign-in.test.ts

**Interfaces:**
- signInWithPassword(email: string, password: string, rememberMe: boolean): Promise<{ error: string | null }>.
- signInWithGoogle(): Promise<{ error: string | null }>.
- signOut(): Promise<{ error: string | null }>.

- [ ] RED: test password sign-in, Remember me, invalid credentials, Google OAuth, unverified users, and sign-out.
- [ ] Run: npm test -- lib/auth-sign-in.test.ts; expect failure.
- [ ] GREEN: implement the authentication services and /sign-in UI.
- [ ] Google OAuth callback target must be /auth/callback.
- [ ] Run focused tests and npm run build.
- [ ] Commit with: feat: add sign-in and session controls.

### Task 6: OAuth callback

**Files:**
- Create: app/auth/callback/route.ts
- Create: app/auth/callback/route.test.ts

- [ ] RED: test successful code exchange, missing code, and failed exchange.
- [ ] Run: npm test -- app/auth/callback/route.test.ts; expect failure.
- [ ] GREEN: exchange the OAuth code with the server Supabase client and redirect successful authentication to /workspace.
- [ ] Invalid or missing codes redirect safely to /sign-in.
- [ ] Run focused tests and npm run build.
- [ ] Commit with: feat: add OAuth callback.

### Task 7: Password recovery

**Files:**
- Create: app/forgot-password/page.tsx
- Create: app/auth/reset-password/page.tsx
- Create: lib/auth-password-reset.ts
- Create: lib/auth-password-reset.test.ts

**Interfaces:**
- requestPasswordReset(email: string): Promise<{ error: string | null }>.
- updatePassword(password: string): Promise<{ error: string | null }>.

- [ ] RED: test reset request, validation, password update, and Google-only handling.
- [ ] Run: npm test -- lib/auth-password-reset.test.ts; expect failure.
- [ ] GREEN: implement secure Supabase recovery and password update.
- [ ] Never display or email passwords.
- [ ] Run focused tests and commit with: feat: add password recovery flow.

### Task 8: Authenticated profile

**Files:**
- Create: app/profile/page.tsx
- Create: lib/auth-profile.ts
- Create: lib/auth-profile.test.ts

**Interfaces:**
- getCurrentProfile(): Promise<Profile>.
- updateCurrentProfile(input: ProfileUpdate): Promise<Profile>.
- Profile supports full name, profile photo, company/business name, job role, and country.

- [ ] RED: test authenticated profile ownership and rejection of client-supplied ownership IDs.
- [ ] Run: npm test -- lib/auth-profile.test.ts; expect failure.
- [ ] GREEN: implement server-side authenticated profile access and /profile.
- [ ] Run focused tests and npm run build.
- [ ] Commit with: feat: add authenticated user profile.

### Task 9: Separate public landing page from authenticated workspace

**Files:**
- Create: `app/workspace/page.tsx`
- Create: `app/workspace/layout.tsx`
- Create: `components/AuthNav.tsx`
- Create: `components/auth-nav.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- `/` is the public BILLBLI landing page.
- `/workspace` is the authenticated BILLBLI workspace.
- Existing BILLBLI input, intent, research, study, decision, task, result, and localStorage behavior remains intact.
- Authenticated workspace navigation exposes Home, Research, Study, Decisions, Tasks, History, Settings, Profile, and Sign out.
- The existing workspace implementation is moved to `/workspace` without redesigning or replacing its core input experience.

- [ ] RED: test that authenticated navigation renders Home, Research, Study, Decisions, Tasks, History, Settings, Profile, and Sign out.
- [ ] Run: `npm test -- components/auth-nav.test.tsx`; expect failure because `AuthNav` does not exist.
- [ ] GREEN: create `components/AuthNav.tsx` with the required navigation.
- [ ] GREEN: move the current workspace implementation from `app/page.tsx` into `app/workspace/page.tsx` without changing its existing behavior.
- [ ] GREEN: create a minimal public `app/page.tsx` landing page that links authenticated users to `/workspace` and unauthenticated users to `/sign-in`.
- [ ] GREEN: add authenticated navigation to the workspace without replacing the existing BILLBLI input experience.
- [ ] Run: `npm test -- components/auth-nav.test.tsx`.
- [ ] Run: `npm test`.
- [ ] Run: `npm run build`.
- [ ] Commit with: `feat: separate public landing page from workspace`.

### Task 10: User-owned data and RLS

**Files:**
- Create: supabase/migrations/202609070001_auth_user_data.sql
- Create: lib/auth-data-ownership.test.ts

- [ ] RED: test that authenticated identity, not client-supplied user_id, determines ownership.
- [ ] Run: npm test -- lib/auth-data-ownership.test.ts; expect failure.
- [ ] GREEN: add user_id references to auth.users, enable RLS, and use auth.uid() ownership policies.
- [ ] Do not migrate existing localStorage history.
- [ ] Run focused tests and commit with: feat: add authenticated data ownership foundation.

### Task 11: Settings and account deletion

**Files:**
- Create: app/settings/page.tsx
- Create: lib/auth-account.ts
- Create: lib/auth-account.test.ts

**Interface:**
- deleteCurrentAccount(): Promise<{ error: string | null }>.

- [ ] RED: test explicit deletion confirmation and rejection without confirmation.
- [ ] Run: npm test -- lib/auth-account.test.ts; expect failure.
- [ ] GREEN: delete the authenticated account and associated user-owned data, terminate the session, and return to /sign-in.
- [ ] Sign out must never delete data.
- [ ] Run focused tests and npm run build.
- [ ] Commit with: feat: add account settings and deletion.

### Task 12: Protect the existing research/task API

**Files:**
- Modify: app/api/research/route.ts
- Create: app/api/research/auth.test.ts

- [ ] RED: test unauthenticated requests return HTTP 401.
- [ ] Run: npm test -- app/api/research/auth.test.ts; expect failure.
- [ ] GREEN: require server-confirmed authentication before protected API execution.
- [ ] Preserve the existing task-engine routing and approval requirements.
- [ ] Run: npm test -- app/api/research/auth.test.ts app/api/research/route.test.ts.
- [ ] Run npm test and npm run build.
- [ ] Commit with: feat: protect research API with authentication.

### Task 13: Final verification

- [ ] Run npm test and confirm all tests pass.
- [ ] Run npm run build and confirm production build succeeds.
- [ ] Run git diff --check.
- [ ] Run git status --short and inspect for unintended changes.
- [ ] Review git log --oneline --decorate -15.
