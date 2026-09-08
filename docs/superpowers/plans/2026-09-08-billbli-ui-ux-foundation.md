# BILLBLI UI/UX Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved BILLBLI UI/UX Foundation as a coherent, responsive, accessible product shell and interaction system without changing the underlying AI, Work Engine, authorization, or security semantics.

**Architecture:** Establish a small reusable UI foundation first, then apply it to the shared application shell, navigation, command composer, landing page, workspace, and product pages. Keep product behavior and domain logic in existing modules while presentation and interaction behavior live in focused UI components. Preserve the existing Decision & Authorization Engine and Work Engine boundaries.

**Tech Stack:** Next.js 15 App Router, React, TypeScript, existing BILLBLI components/styles, existing test framework, existing authentication and Work Engine architecture.

**Spec:** `docs/superpowers/specs/2026-09-08-billbli-ui-ux-foundation-design.md`

## Global Constraints

- Use the approved **Option A — Minimal White / Light Product** visual direction.
- Use a **hybrid sidebar**, expanded by default on desktop, collapsible to icon-only, persistent, and drawer-based on mobile.
- Make **Ask BILLBLI** the signature command-first interaction.
- Keep landing and authenticated workspace visually connected.
- Prioritize Ask BILLBLI, Active Work, Needs Your Attention, and Recent Work.
- Preserve the distinction between AI recommendation, human decision, human authorization, execution, and verification.
- Do not modify the underlying Decision & Authorization Engine semantics.
- Do not modify Work Engine lifecycle semantics.
- Do not introduce unrestricted autonomous execution.
- Do not introduce HR, financial, legal, medical, destructive-action, or external-tool workflows.
- Do not alter existing localStorage history behavior or introduce automatic migration.
- Preserve authenticated ownership and server-side authorization.
- Use TDD: write a failing focused test first, verify RED, implement minimally, verify GREEN.
- Run focused tests before broader regression tests.
- Use semantic HTML and accessible interaction patterns.
- Do not rely on color alone to communicate state.
- Support desktop, tablet, and mobile without unintended horizontal overflow.
- Avoid excessive gradients, glassmorphism, neon effects, decorative animation, excessive shadows, and dashboard clutter.
- Keep visual effects lightweight and purposeful.

---

## File Structure

The implementation should prefer focused responsibilities:

- `components/ui/*` — reusable visual primitives and interaction primitives.
- `components/BillbliShell.tsx` — authenticated application shell.
- `components/BillbliSidebar.tsx` — responsive hybrid navigation.
- `components/AskBillbliComposer.tsx` — reusable command composer.
- `components/WorkStatus.tsx` — consistent work-state presentation.
- `components/WorkCard.tsx` — focused work summary presentation.
- `components/DecisionState.tsx` — recommendation/decision/authorization presentation.
- `components/EmptyState.tsx` — reusable guided empty state.
- `components/LoadingState.tsx` — meaningful work/loading presentation.
- `components/ErrorState.tsx` — human-readable error presentation.
- `app/page.tsx` — public BILLBLI landing experience.
- `app/workspace/page.tsx` — authenticated command-first workspace.
- Existing Research/Study/Decision/Task/History pages — apply the shared foundation without rewriting their domain logic.
- Existing test files or focused new test files — verify each independently testable behavior.

Before modifying any existing file, inspect its current implementation and preserve established behavior.

---

# Task 1: Establish UI Foundation Tokens and Base Primitives

**Files:**
- Create or modify the existing global styling/token file discovered during implementation.
- Create focused reusable primitives under `components/ui/` only where an existing equivalent does not already exist.
- Test: focused UI primitive test file.

**Interfaces:**
- Consumes: existing Next.js/React styling architecture.
- Produces: stable visual tokens and reusable primitives for later tasks.

- [ ] **Step 1: Inspect existing global styles and UI components.**
- [ ] **Step 2: Write failing tests for required primitive behavior.**
- [ ] **Step 3: Run the focused tests and verify RED.**
- [ ] **Step 4: Implement the minimal token/primitives foundation.**
- [ ] **Step 5: Verify focused tests GREEN.**
- [ ] **Step 6: Run `git diff --check`.**
- [ ] **Step 7: Commit with `feat: establish BILLBLI UI foundation`.**

---

# Task 2: Build the Responsive BILLBLI Sidebar

**Files:**
- Create: `components/BillbliSidebar.tsx`
- Create/modify: focused sidebar test file.
- Modify: global/navigation styles only where required.

**Interfaces:**
- Consumes: existing authenticated navigation routes.
- Produces: expanded/collapsed desktop navigation and mobile drawer behavior.

- [ ] **Step 1: Write failing tests for navigation labels, active route semantics, collapse behavior, and mobile drawer behavior.**
- [ ] **Step 2: Run focused sidebar tests and verify RED.**
- [ ] **Step 3: Implement the minimal hybrid sidebar.**
- [ ] **Step 4: Add persisted expanded/collapsed preference without changing authentication behavior.**
- [ ] **Step 5: Add keyboard and screen-reader navigation semantics.**
- [ ] **Step 6: Run focused sidebar tests and verify GREEN.**
- [ ] **Step 7: Run `git diff --check`.**
- [ ] **Step 8: Commit with `feat: add responsive BILLBLI navigation`.**

---

# Task 3: Build the Shared Application Shell

**Files:**
- Create: `components/BillbliShell.tsx`
- Modify: authenticated layout/page entry points as required.
- Test: focused shell tests.

**Interfaces:**
- Consumes: `BillbliSidebar` and existing authenticated routes.
- Produces: consistent authenticated page shell with navigation, top utility area, and main content region.

- [ ] **Step 1: Write failing tests verifying the shell contains navigation and main content landmarks.**
- [ ] **Step 2: Run focused tests and verify RED.**
- [ ] **Step 3: Implement the shell around existing authenticated content.**
- [ ] **Step 4: Verify mobile/tablet layout semantics.**
- [ ] **Step 5: Run focused tests and verify GREEN.**
- [ ] **Step 6: Run existing authentication/workspace tests for regression.**
- [ ] **Step 7: Commit with `feat: add BILLBLI application shell`.**

---

# Task 4: Build the Ask BILLBLI Composer

**Files:**
- Create: `components/AskBillbliComposer.tsx`
- Create/modify: focused composer tests.
- Modify: existing command/input styling only where necessary.

**Interfaces:**
- Consumes: existing request/workflow entry behavior.
- Produces: reusable full-size and contextual Ask BILLBLI composer.

- [ ] **Step 1: Inspect the existing workspace command/input behavior.**
- [ ] **Step 2: Write failing tests for accessible input, contextual controls, submission, disabled/loading state, and keyboard behavior.**
- [ ] **Step 3: Run focused tests and verify RED.**
- [ ] **Step 4: Implement the minimal reusable composer.**
- [ ] **Step 5: Add responsive desktop/mobile presentation.**
- [ ] **Step 6: Verify no existing request behavior is changed.**
- [ ] **Step 7: Run focused tests and verify GREEN.**
- [ ] **Step 8: Commit with `feat: add Ask BILLBLI composer`.**

---

# Task 5: Establish Work Status, Cards, Empty, Loading, and Error Components

**Files:**
- Create: `components/WorkStatus.tsx`
- Create: `components/WorkCard.tsx`
- Create: `components/EmptyState.tsx`
- Create: `components/LoadingState.tsx`
- Create: `components/ErrorState.tsx`
- Test: focused component tests.

**Interfaces:**
- Consumes: existing Work Engine state values.
- Produces: consistent user-facing work states without changing domain state.

- [ ] **Step 1: Write failing tests covering every approved work status.**
- [ ] **Step 2: Write failing tests confirming status meaning is not communicated by color alone.**
- [ ] **Step 3: Write failing tests for empty, loading, and error content.**
- [ ] **Step 4: Run focused tests and verify RED.**
- [ ] **Step 5: Implement minimal reusable components.**
- [ ] **Step 6: Run focused tests and verify GREEN.**
- [ ] **Step 7: Commit with `feat: add BILLBLI work state components`.**

---

# Task 6: Build Decision-Aware Presentation Components

**Files:**
- Create: `components/DecisionState.tsx`
- Test: focused decision UI tests.

**Interfaces:**
- Consumes: existing Decision & Authorization Engine domain state.
- Produces: presentation that distinguishes recommendation, human decision, authorization, and execution readiness.

- [ ] **Step 1: Write failing tests proving AI recommendation and human decision are rendered as separate concepts.**
- [ ] **Step 2: Write failing tests proving approval is not presented as authorization unless the underlying state says so.**
- [ ] **Step 3: Write failing tests for pending human decision and pending authorization states.**
- [ ] **Step 4: Run focused tests and verify RED.**
- [ ] **Step 5: Implement minimal decision-aware presentation.**
- [ ] **Step 6: Verify the component cannot manufacture authorization state from client presentation data.**
- [ ] **Step 7: Run focused tests and verify GREEN.**
- [ ] **Step 8: Commit with `feat: add decision-aware UI states`.**

---

# Task 7: Redesign the Public Landing Page

**Files:**
- Modify: `app/page.tsx`
- Test: focused landing-page test.

**Interfaces:**
- Consumes: shared visual primitives and `AskBillbliComposer`.
- Produces: professional BILLBLI landing experience.

- [ ] **Step 1: Write failing tests for primary BILLBLI messaging, Ask BILLBLI entry point, and human-boundary messaging.**
- [ ] **Step 2: Run focused tests and verify RED.**
- [ ] **Step 3: Implement the approved light product composition.**
- [ ] **Step 4: Add the Research → Reason → Plan → Work → Verify product narrative.**
- [ ] **Step 5: Verify responsive behavior.**
- [ ] **Step 6: Run focused tests and verify GREEN.**
- [ ] **Step 7: Commit with `feat: redesign BILLBLI landing page`.**

---

# Task 8: Redesign the Authenticated Workspace

**Files:**
- Modify: `app/workspace/page.tsx`
- Modify: workspace-specific components as required.
- Test: focused workspace UI tests.

**Interfaces:**
- Consumes: existing Work Engine data and `AskBillbliComposer`.
- Produces: command-first workspace with Active Work, Needs Your Attention, and Recent Work.

- [ ] **Step 1: Write failing tests for the approved workspace hierarchy.**
- [ ] **Step 2: Write failing tests ensuring existing Work Engine behavior remains unchanged.**
- [ ] **Step 3: Run focused workspace tests and verify RED.**
- [ ] **Step 4: Implement the minimal new composition around existing data.**
- [ ] **Step 5: Add work cards and attention states.**
- [ ] **Step 6: Preserve existing work creation functionality.**
- [ ] **Step 7: Run focused tests and verify GREEN.**
- [ ] **Step 8: Commit with `feat: redesign BILLBLI workspace`.**

---

# Task 9: Apply the Foundation to Research, Study, Decisions, Tasks, and History

**Files:**
- Modify existing product-page files discovered during implementation.
- Reuse shared components rather than duplicating visual implementations.
- Test: focused page-level regression tests.

**Interfaces:**
- Consumes: existing domain pages and data.
- Produces: visually connected product areas.

- [ ] **Step 1: Write focused failing tests for shared shell/composer presence on applicable product pages.**
- [ ] **Step 2: Run focused tests and verify RED.**
- [ ] **Step 3: Apply shared shell and component foundation without changing domain logic.**
- [ ] **Step 4: Ensure Research follows Request → Sources → Evidence → Synthesis → Decision Brief presentation.**
- [ ] **Step 5: Ensure Study remains question/learning oriented.**
- [ ] **Step 6: Ensure Decisions uses the decision-aware components.**
- [ ] **Step 7: Ensure Tasks expose execution/result/verification states using shared components.**
- [ ] **Step 8: Ensure History supports its existing chronological/search/filter behavior without visual duplication.**
- [ ] **Step 9: Run focused tests and verify GREEN.**
- [ ] **Step 10: Commit with `feat: apply BILLBLI UI foundation across product pages`.**

---

# Task 10: Responsive and Accessibility Hardening

**Files:**
- Modify shared UI components and styles only where verification exposes an issue.
- Test: responsive/accessibility-focused tests.

**Interfaces:**
- Consumes: all previously implemented UI foundation components.
- Produces: verified desktop, tablet, and mobile behavior.

- [ ] **Step 1: Write failing tests for mobile drawer, touch-friendly controls, and absence of horizontal overflow.**
- [ ] **Step 2: Write failing tests for keyboard navigation and visible focus behavior.**
- [ ] **Step 3: Write failing tests for accessible labels and non-color-only status communication.**
- [ ] **Step 4: Run focused tests and verify RED.**
- [ ] **Step 5: Implement only the minimum responsive/accessibility fixes required.**
- [ ] **Step 6: Run focused tests and verify GREEN.**
- [ ] **Step 7: Run the existing test suite for regression.**
- [ ] **Step 8: Run `git diff --check`.**
- [ ] **Step 9: Commit with `fix: harden BILLBLI responsive accessibility UX`.**

---

# Task 11: Full UI Regression Verification

**Files:**
- No intended production changes.
- Test: existing full test suite plus UI-focused tests.

- [ ] **Step 1: Run the complete test suite.**
- [ ] **Step 2: Run the production build.**
- [ ] **Step 3: Verify authentication regression coverage.**
- [ ] **Step 4: Verify Research and Task regression coverage.**
- [ ] **Step 5: Verify Work Engine regression coverage.**
- [ ] **Step 6: Verify Decision & Authorization Engine regression coverage.**
- [ ] **Step 7: Run `git diff --check`.**
- [ ] **Step 8: Verify `git status --short` is clean.**
- [ ] **Step 9: Record exact test/build results before claiming completion.**

---

# Definition of Done

The UI Foundation is complete only when:

1. The approved light/minimal visual direction is implemented.
2. The hybrid sidebar works on desktop, tablet, and mobile.
3. Ask BILLBLI is a reusable signature interaction.
4. Landing and workspace feel like one product.
5. Workspace prioritizes active work and user attention.
6. Research, Study, Decisions, Tasks, and History use a coherent foundation.
7. Decision and authorization states remain semantically distinct.
8. Existing Work Engine and Decision & Authorization Engine behavior is unchanged.
9. Existing authentication behavior is unchanged.
10. Existing localStorage history behavior is unchanged.
11. Accessibility requirements are verified.
12. Responsive behavior is verified.
13. Full tests pass.
14. Production build passes.
15. Git working tree is clean.
16. No completion claim is made without fresh verification evidence.
