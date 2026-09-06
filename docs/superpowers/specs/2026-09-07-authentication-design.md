# BILLBLI Authentication Design

Date: 2026-09-07
Status: Approved

## Goal
Add secure authentication to BILLBLI so users have private accounts, protected workspace access, profiles, user-owned activity, approvals, and a foundation for future execution capabilities.

## Authentication
- Email + password
- Google sign-in
- Supabase Auth is the authentication provider.
- Google and email/password identities should use the same BILLBLI account when supported by Supabase identity linking.

## Public Access
Public routes:
- /
- /sign-in
- /sign-up
- /forgot-password
- /auth/callback
The main BILLBLI workspace requires authentication. Unauthenticated protected access redirects to /sign-in.

## Registration
Required: full name, email, password.
Optional: profile photo, company/business name, job role, country.
Onboarding remains short; optional profile completion can happen later.

## Email Verification
Email/password accounts must verify their email before entering the protected workspace. Support verification, resend verification, and clear unverified-account messaging. Google users use the verified Google identity.

## Existing History
Existing localStorage history remains untouched and is not automatically migrated. New authenticated activity will be associated with the authenticated user.

## Workspace
Navigation:
- Home
- Research
- Study
- Decisions
- Tasks
- History
- Settings
- Profile
- Sign out

The existing BILLBLI input, intent, research, study, decision, and task architecture remains intact.

## User-Owned Data
Initial account-owned resources:
- Profile
- Research history
- Study history
- Decisions
- Tasks
- Task results
- Approvals
- Account settings

User-owned database records are associated with the authenticated Supabase user I