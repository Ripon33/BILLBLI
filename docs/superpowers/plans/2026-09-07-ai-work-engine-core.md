# AI Work Engine Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the persistent BILLBLI Work Engine that turns authenticated user objectives into structured, dependency-aware, testable work without yet implementing specialist business agents or external tool execution.

**Architecture:** Extend the existing BILLBLI task engine instead of creating a second task system. Add persistent Work, Work Plan, Work Task, Result, and execution-state abstractions with explicit ownership, lifecycle, dependency, autonomy, and verification boundaries.

**Tech Stack:** Next.js 15, TypeScript, Vitest, Supabase/PostgreSQL, Supabase RLS.

**Spec:** `docs/superpowers/specs/2026-09-07-ai-work-engine-core.md`

## Global Constraints

- Preserve existing `lib/task-engine.ts` behavior unless a test explicitly defines an intentional extension.
- Reuse existing task lifecycle semantics.
- Do not implement HR, Finance, Operations, Sales, Marketing, or external integrations in this phase.
- Do not implement unrestricted autonomous tool execution in this phase.
- Authenticated user ownership must be server-controlled.
- User-owned database records must use RLS.
- Existing localStorage history must remain untouched.
- Every implementation task must follow TDD: failing test, verify RED, minimal implementation, verify GREEN.
- Run focused tests before broader verification.
- Commit each independently testable task.

---

## Task 1: Define Work Engine domain types

**Files:**
- Create: `lib/work-engine.ts`
- Test: `lib/work-engine.test.ts`

**Interfaces:**
- Produces Work, WorkPlan, WorkTask, autonomy, execution, result, and verification types.
- Does not persist data yet.

- [ ] Write failing tests for the core types and valid lifecycle values.
- [ ] Run the focused test and verify RED.
- [ ] Implement the minimal domain types.
- [ ] Run the focused test and verify GREEN.
- [ ] Commit the task.

---

## Task 2: Add Work creation

**Files:**
- Modify: `lib/work-engine.ts`
- Modify: `lib/work-engine.test.ts`

**Interfaces:**
- Produces a pure `createWork` operation that creates a structured Work from an objective.
- Must not access the database.

- [ ] Write failing tests for objective-to-Work creation.
- [ ] Run focused tests and verify RED.
- [ ] Implement the minimal creation behavior.
- [ ] Run focused tests and verify GREEN.
- [ ] Commit the task.

---

## Task 3: Add Work Plan creation

**Files:**
- Modify: `lib/work-engine.ts`
- Modify: `lib/work-engine.test.ts`

**Interfaces:**
- Adds a Work Plan associated with a Work.
- Plan creation remains pure and deterministic for test purposes.

- [ ] Write failing tests.
- [ ] Verify RED.
- [ ] Implement minimal plan creation.
- [ ] Verify GREEN.
- [ ] Commit.

---

## Task 4: Represent persistent Work Engine records

**Files:**
- Create: `supabase/migrations/YYYYMMDD_work_engine_core.sql`
- Test: `lib/work-engine-schema.test.ts`

**Interfaces:**
- Add database tables for Work, Work Plans, Work Tasks, and task results/execution records as defined by the spec.
- Every user-owned record must reference `auth.users(id)`.

- [ ] Write failing schema-contract tests.
- [ ] Verify RED.
- [ ] Add the minimal migration.
- [ ] Verify GREEN.
- [ ] Review constraints and indexes.
- [ ] Commit.

---

## Task 5: Add Work Engine ownership and RLS

**Files:**
- Modify: `supabase/migrations/YYYYMMDD_work_engine_core.sql`
- Test: `lib/work-engine-ownership.test.ts`

**Interfaces:**
- User-owned Work Engine records must be readable and writable only by their owner.
- Ownership must cascade through Work → Plan/Task/Result relationships without trusting client-provided user IDs.

- [ ] Write failing ownership-policy tests.
- [ ] Verify RED.
- [ ] Add minimal RLS policies.
- [ ] Verify GREEN.
- [ ] Commit.

---

## Task 6: Add task dependency validation

**Files:**
- Modify: `lib/work-engine.ts`
- Test: `lib/work-engine-dependencies.test.ts`

**Interfaces:**
- Tasks may depend on other tasks.
- Dependency validation must reject self-dependencies and circular dependencies.
- Tasks cannot become executable while required prerequisites are incomplete.

- [ ] Write failing tests for valid and invalid dependencies.
- [ ] Verify RED.
- [ ] Implement minimal dependency validation.
- [ ] Verify GREEN.
- [ ] Commit.

---

## Task 7: Add explicit lifecycle transitions

**Files:**
- Modify: `lib/work-engine.ts`
- Test: `lib/work-engine-lifecycle.test.ts`

**Interfaces:**
- Provide explicit transition validation for Work and Task status changes.
- Invalid transitions must be rejected.
- Existing `BillbliTask` status semantics remain compatible.

- [ ] Write failing lifecycle tests.
- [ ] Verify RED.
- [ ] Implement transition validation.
- [ ] Verify GREEN.
- [ ] Commit.

---

## Task 8: Add autonomy policy representation

**Files:**
- Create: `lib/work-autonomy.ts`
- Test: `lib/work-autonomy.test.ts`

**Interfaces:**
- Represent `AUTO`, `REVIEW`, `APPROVAL`, and `RESTRICTED`.
- Determine whether a proposed task may execute based on its autonomy requirement and authorization input.
- This task does not execute external actions.

- [ ] Write failing tests for all four levels.
- [ ] Verify RED.
- [ ] Implement minimal policy evaluation.
- [ ] Verify GREEN.
- [ ] Commit.

---

## Task 9: Add structured execution results

**Files:**
- Create: `lib/work-execution.ts`
- Test: `lib/work-execution.test.ts`

**Interfaces:**
- Represent queued/running/succeeded/failed/blocked execution states.
- Represent structured task results.
- Separate execution completion from verification.

- [ ] Write failing tests.
- [ ] Verify RED.
- [ ] Implement minimal execution/result domain model.
- [ ] Verify GREEN.
- [ ] Commit.

---

## Task 10: Add verification state

**Files:**
- Modify: `lib/work-execution.ts`
- Test: `lib/work-execution.test.ts`

**Interfaces:**
- Represent `unverified`, `verified`, and `verification_failed`.
- Prevent a result from being reported as verified without explicit verification state.

- [ ] Write failing tests.
- [ ] Verify RED.
- [ ] Implement minimal verification handling.
- [ ] Verify GREEN.
- [ ] Commit.

---

## Task 11: Integrate existing task classification

**Files:**
- Modify: `lib/task-engine.ts`
- Modify: `lib/task-engine.test.ts`
- Modify: `lib/work-engine.ts`
- Test: `lib/work-engine-integration.test.ts`

**Interfaces:**
- Existing `createTask()` classification remains compatible.
- Work creation may use existing task classification when converting a user objective into initial Work Tasks.
- No existing intent/domain behavior should be removed.

- [ ] Write failing integration tests.
- [ ] Verify RED.
- [ ] Implement minimal integration.
- [ ] Verify GREEN.
- [ ] Commit.

---

## Task 12: Add Work Engine persistence service

**Files:**
- Create: `lib/work-repository.ts`
- Test: `lib/work-repository.test.ts`

**Interfaces:**
- Server-side persistence operations for authenticated Work records.
- Must never accept arbitrary client `user_id` as an authorization source.
- Uses existing Supabase server client.

- [ ] Write failing repository tests.
- [ ] Verify RED.
- [ ] Implement minimal repository operations.
- [ ] Verify GREEN.
- [ ] Commit.

---

## Task 13: Add Work Engine API contract

**Files:**
- Create: `app/api/work/route.ts`
- Test: `app/api/work/route.test.ts`

**Interfaces:**
- Authenticated endpoint for creating/reading user-owned Work.
- Unauthenticated requests return 401.
- User identity comes from server-side authentication.

- [ ] Write failing API tests.
- [ ] Verify RED.
- [ ] Implement minimal endpoint.
- [ ] Verify GREEN.
- [ ] Commit.

---

## Task 14: Integrate Work Engine with the workspace

**Files:**
- Modify: `app/workspace/page.tsx`
- Create/modify relevant workspace components.
- Test: workspace tests as needed.

**Interfaces:**
- Allow the user to create or inspect Work.
- Do not replace existing workspace functionality.
- Keep UI changes focused on the Work Engine core.

- [ ] Write failing UI tests.
- [ ] Verify RED.
- [ ] Implement minimal Work Engine UI.
- [ ] Verify GREEN.
- [ ] Commit.

---

## Task 15: Full verification

**Files:**
- No new implementation files unless verification exposes a defect.

- [ ] Run focused Work Engine tests.
- [ ] Run the complete test suite.
- [ ] Run `npm run build`.
- [ ] Inspect `git status`.
- [ ] Review database migration state.
- [ ] Verify no existing research/task behavior regressed.
- [ ] Only claim completion after fresh verification evidence.
