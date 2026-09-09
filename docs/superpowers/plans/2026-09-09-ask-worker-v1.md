# Ask Worker V1 Implementation Plan

## Goal

Build the first governed Ask Worker experience for persistent BILLBLI workers.

Ask Worker receives a worker request, automatically routes it through existing BILLBLI intelligence, presents evidence and recommendations with appropriate uncertainty, preserves human decision authority, and optionally proposes editable Work.

Ask Worker is an orchestration and interaction layer. It is not a second execution engine, second Work lifecycle, autonomous background worker system, or independent authorization system.

## Task 1 — Map Existing Intelligence Interfaces

Confirm the exact interfaces for intent classification, answer routing, research, study, decision intelligence, task routing, and Work Engine. Reuse existing implementations rather than creating duplicate routing logic.

## Task 2 — Ask Worker Domain Contracts

Create lib/ask-worker.ts and lib/ask-worker.test.ts.

Define contracts for the request, automatic route, evidence level, evidence, recommendation, uncertainty, Decision Brief, Work proposal, and progressive response stages.

Tests must establish that AI recommendation is distinct from human decision, human authorization is distinct from recommendation, insufficient evidence is representable, and a Work proposal is not a created Work record.

## Task 3 — Governed Orchestration

Create lib/ask-worker-orchestrator.ts and lib/ask-worker-orchestrator.test.ts.

The orchestrator uses worker identity, specialization and goal; reuses classifyIntent, existing answer routing, Research, Study, Decision and Task capabilities; automatically selects the appropriate path; provides meaningful progressive stages; identifies missing evidence; adapts evidence detail to consequence; composes Decision Briefs; produces optional editable Work proposals; never creates Work implicitly; never executes external actions; never bypasses permission or authorization; and never creates a second Work lifecycle.

## Task 4 — Authenticated Ask Worker API

Create app/api/work/[id]/ask/route.ts and app/api/work/[id]/ask/route.test.ts.

Endpoint: POST /api/work/:id/ask

Request: {"message":"..."}

Authenticate through existing Supabase authentication, resolve the worker through authenticated ownership, reject missing or non-worker Work, reject malformed or empty requests, preserve worker context, never trust client user_id or authorization, and never execute external work.

## Task 5 — Ask Worker Workspace

Modify components/WorkerWorkspace.tsx. Supporting components may include AskWorkerResponse.tsx and AskWorkerProgress.tsx.

Requirements: functional composer, loading state, progress state, error state, response rendering, adaptive Answer/Analysis/Evidence/Recommendation/Uncertainty/Next Step sections, explicit AI recommendation labeling, responsive desktop/tablet/mobile layout, and no horizontal overflow.

## Task 6 — Human Decision Boundary

Verify that AI recommendations are explicitly labeled, human decisions remain separate, options/evidence/trade-offs/confidence/conditions can be presented, and AI cannot silently become the decision-maker.

Consequential requests must identify when human decision authority is required.

## Task 7 — Editable Work Proposal

Verify that proposed title, goal and autonomy can be reviewed/edited; displaying a proposal does not create Work; Work is created only after explicit user action; existing authenticated Work creation is reused; and existing Work lifecycle semantics remain unchanged.

## Task 8 — Full Verification

Run npm test -- --run, npm run build, git diff --check, and git status --short.

Verify Worker, repository, Work API, workspace, Ask Worker, Decision, Work Engine, authorization and ownership tests, plus no external execution, authorization bypass, or lifecycle changes.

## Safety Constraints

No autonomous background workers, external-system execution, email execution, external modification, financial transactions, medical decisions, legal decisions, employee termination decisions, destructive operations, second Work lifecycle, or separate persistent chat/memory subsystem.

Worker capabilities do not equal authorization. AI recommendation does not equal human authorization. Authenticated ownership remains authoritative.

## TDD Rule

For every implementation task: write the failing test, confirm RED, implement minimum behavior, confirm GREEN, run related regression tests, and commit the completed task separately.

## Commit Sequence

1. feat: add Ask Worker domain contracts
2. feat: add governed Ask Worker orchestration
3. feat: add authenticated Ask Worker API
4. feat: add Ask Worker workspace interaction
5. feat: preserve human decision boundary in Ask Worker
6. feat: add explicit Ask Worker Work proposals

Do not modify existing Decision & Authorization Engine semantics or Work Engine lifecycle.
