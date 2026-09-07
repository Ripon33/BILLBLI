# BILLBLI Decision & Authorization Engine Implementation Plan

> Follow TDD strictly: write a failing test first, verify RED, implement the minimum change, verify GREEN, then refactor only while GREEN.

## Goal

Formalize BILLBLI's Human Decision Boundary into a deterministic, fail-closed Decision & Authorization Engine between planning/permission evaluation and execution.

Core flow:

**Goal → Plan → Capability Check → Permission Check → Human Decision Check → Authorization → Tool Execution → Verification → Audit**

## Architecture Constraints

- Reuse the existing Work Engine; do not create a second Work Engine.
- Preserve existing WorkStatus lifecycle semantics.
- Preserve existing WorkExecution statuses.
- Preserve existing localStorage research/task history behavior.
- No external integrations.
- No unrestricted autonomous tool execution.
- Restricted operations must fail closed.
- Capability does not imply authorization.
- Server-side identity remains authoritative.

## Task 1 — Define Decision Domain Types

**Files:**
- Create `lib/work-decision.ts`
- Create `lib/work-decision.test.ts`

### TDD — RED

Add tests for the public decision-domain vocabulary before implementation.

Define these types:

```ts
export type WorkDecisionClassification =
  | "proceed"
  | "human_decision_required"
  | "authorization_required"
  | "blocked";

export type WorkAuthorizationState =
  | "not_required"
  | "human_decision_required"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "authorized"
  | "blocked";

export type WorkDecisionEvaluation = {
  classification: WorkDecisionClassification;
  authorization: WorkAuthorizationState;
  requiresHumanDecision: boolean;
  requiresAuthorization: boolean;
  canExecute: boolean;
  reason: string;
};
```

Run:

`npx vitest run lib/work-decision.test.ts`

Expected initial result: RED because the module does not exist yet.

### Implementation

Create the minimum domain types and pure structures required by the failing tests.

### Verification

Run the focused test again and confirm GREEN.

## Task 2 — Centralize Human Decision Boundary Classification

**Files:**
- Modify `lib/work-decision.ts`
- Modify `lib/work-decision.test.ts`

### TDD — RED

Add tests for `classifyHumanDecisionRequirement(title, goal)`.

The classifier must identify consequential human-decision areas including:
- employment decisions
- significant financial decisions
- legal/compliance decisions
- medical/safety decisions
- sensitive personal decisions
- destructive or irreversible actions
- significant external commitments
- rights/access decisions

Ordinary research and planning must not incorrectly require a human decision.

```ts
export type HumanDecisionRequirement = {
  required: boolean;
  reason: string;
};

export function classifyHumanDecisionRequirement(
  title: string,
  goal: string,
): HumanDecisionRequirement;
```

The classifier must be deterministic and local. No network calls or AI calls.

### Implementation

Create one centralized boundary classifier rather than expanding the existing keyword list in `work-engine.ts`.

### Verification

`npx vitest run lib/work-decision.test.ts`

## Task 3 — Define Safe Authorization State Transitions

**Files:**
- Modify `lib/work-decision.ts`
- Modify `lib/work-decision.test.ts`

### TDD — RED

Define:

```ts
export function transitionWorkAuthorization(
  current: WorkAuthorizationState,
  next: WorkAuthorizationState,
): WorkAuthorizationState;
```

Valid transitions include:
- `not_required → not_required`
- `human_decision_required → pending_approval`
- `pending_approval → approved`
- `pending_approval → rejected`
- `approved → authorized`

Reject privilege-escalating transitions such as:
- `not_required → authorized`
- `human_decision_required → authorized`
- `rejected → authorized`
- `blocked → authorized`
- `authorized → approved`
- `authorized → rejected`

Rejected and blocked states must never silently become executable authorization.

### Implementation

Implement a finite transition table with fail-closed validation. Invalid transitions must throw a deterministic error.

### Verification

`npx vitest run lib/work-decision.test.ts`

## Task 4 — Preserve Recommendation, Human Decision, and Authorization Separately

**Files:**
- Modify `lib/work-decision.ts`
- Modify `lib/work-decision.test.ts`

### TDD — RED

Represent decision records without assuming an AI recommendation is a human decision.

```ts
export type WorkDecisionRecord = {
  source: "ai" | "human";
  decision: string;
  authorization: WorkAuthorizationState;
};
```

Tests must verify:
- AI recommendations remain `source: "ai"`.
- Human decisions require explicit `source: "human"`.
- Authorization state is independently represented.
- A recommendation alone cannot produce `authorized`.
- `authorized` cannot be inferred merely because `source === "human"`.

Do not create a convenience API that silently converts an AI decision into a human decision.

### Implementation

Add only the smallest pure helpers required to construct and validate these records.

### Verification

`npx vitest run lib/work-decision.test.ts`

## Task 5 — Add the Fail-Closed Execution Gate

**Files:**
- Modify `lib/work-decision.ts`
- Modify `lib/work-decision.test.ts`

### TDD — RED

Define:

```ts
export type WorkExecutionGateResult = {
  allowed: boolean;
  reason: string;
  authorization: WorkAuthorizationState;
};

export function evaluateWorkExecutionGate(
  evaluation: WorkDecisionEvaluation,
): WorkExecutionGateResult;
```

Tests must verify:
- `proceed` + `not_required` → allowed
- `human_decision_required` → blocked
- `authorization_required` + `pending_approval` → blocked
- `authorization_required` + `approved` → blocked until explicitly authorized
- `authorization_required` + `authorized` → allowed
- `blocked` + `blocked` → blocked

The gate must fail closed for inconsistent combinations. For example, `canExecute: true` with a blocked authorization state must still return blocked.

### Implementation

Implement the pure execution gate.

### Verification

`npx vitest run lib/work-decision.test.ts`

## Task 6 — Integrate the Decision Engine With the Existing Work Engine

**Files:**
- Modify `lib/work-engine.ts`
- Modify `lib/work-engine.test.ts`
- Modify `lib/work-decision.ts`
- Modify `lib/work-decision.test.ts`

### TDD — RED

Add integration tests showing that a `BillbliWork` can be evaluated through the new decision layer.

The evaluator must inspect title and goal, classify the Human Decision Boundary, inspect autonomy/authorization, and return a `WorkDecisionEvaluation`.

Existing `WorkAuthorization` must remain `not_required | required | authorized`. Do not replace it with the richer Decision Engine authorization state union.

Existing Work Engine lifecycle behavior and tests must remain compatible.

### Implementation

Add a thin integration function that maps existing Work Engine state into the new decision model. Do not duplicate lifecycle logic.

### Verification

`npx vitest run lib/work-engine.test.ts lib/work-decision.test.ts`

## Task 7 — Put the Decision Gate Before Work Execution

**Files:**
- Modify `lib/work-execution.ts`
- Modify `lib/work-execution.test.ts`
- Modify `lib/work-decision.ts`
- Modify `lib/work-decision.test.ts`

### Compatibility Requirement

First inspect every current caller of `createExecution()` before changing its signature.

The execution boundary must require a successful Decision & Authorization Engine gate before an execution can be created or started.

Do not leave an alternate direct execution path that bypasses the gate.

### TDD — RED

Tests must prove:
- permitted work can execute
- human-decision-required work cannot execute
- pending approval cannot execute
- rejected work cannot execute
- blocked work cannot execute
- authorized work can execute
- existing execution statuses remain unchanged

### Implementation

Add the smallest safe gate at the execution boundary. No external tool execution is introduced.

### Verification

`npx vitest run lib/work-execution.test.ts lib/work-decision.test.ts`

## Task 8 — Add Adversarial Bypass Tests

**Files:**
- Modify `lib/work-decision.test.ts`
- Modify `lib/work-engine.test.ts`
- Modify `lib/work-execution.test.ts`

### TDD — RED

Explicitly test attempts to bypass the Human Decision Boundary.

Tests must cover:
- changing autonomy from `review` to `auto` does not erase an inherent human-decision requirement
- client-controlled authorization cannot bypass the gate
- `approved` cannot be treated as `authorized`
- `human_decision_required` cannot execute
- `blocked` cannot execute
- AI source cannot masquerade as human source
- direct execution cannot bypass the decision gate
- restricted work remains blocked from ordinary execution

These are security-boundary tests, not merely happy-path tests.

### Implementation

Make only the minimum changes necessary for all bypass tests to pass.

### Verification

`npx vitest run lib/work-decision.test.ts lib/work-engine.test.ts lib/work-execution.test.ts`

## Task 9 — Full Regression Verification

No new functionality should be added in this task.

### Focused Decision & Authorization Tests

```bash
npx vitest run lib/work-decision.test.ts lib/work-engine.test.ts lib/work-execution.test.ts
```

### Complete Test Suite

```bash
npm test -- --run
```

### Production Build

```bash
npm run build
```

### Repository State

```bash
git status --short
git log -5 --oneline --decorate
```

### Regression Review

Confirm existing Work Engine, execution, Research, Task Engine, and authentication tests remain green.

Confirm:
- no external integrations were added
- no unrestricted autonomous execution was added
- no localStorage migration was added
- no client-controlled authorization was added
- no second Work Engine was created
- AI recommendation and human decision remain distinct
- no execution path bypasses the decision gate
- restricted work remains fail-closed

## Commit Strategy

Commit each independently verified implementation task with focused messages.

Suggested commit messages:

```text
feat: define decision domain types
feat: centralize human decision boundary
feat: add authorization state transitions
feat: preserve decision authority boundaries
feat: add fail closed execution gate
feat: integrate decision engine with work engine
feat: gate work execution
test: add decision authorization bypass coverage
```

## Definition of Done

The Decision & Authorization Engine is complete only when:

1. Decision states are explicit.
2. Human Decision Boundary classification is centralized.
3. Authorization transitions are fail-closed.
4. AI recommendation, human decision, authorization, and execution remain distinct.
5. Execution cannot proceed without the required decision/authorization state.
6. Existing Work Engine lifecycle semantics remain intact.
7. Existing execution statuses remain intact.
8. Restricted work cannot bypass ordinary safeguards.
9. Ownership and authorization remain server-controlled.
10. Adversarial bypass tests pass.
11. Full test suite passes.
12. Production build passes.
13. Git status is reviewed.
