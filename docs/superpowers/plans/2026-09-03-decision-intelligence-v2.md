# BILLBLI Decision Intelligence V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade BILLBLI into a validated decision-intelligence pipeline with traceable evidence, claims, factor scores, conflicts, decision states, and structured recommendations.

**Spec:** `docs/superpowers/specs/2026-09-03-decision-intelligence-v2-design.md`

## Global Constraints

- Preserve the existing Tavily research pipeline.
- Reuse existing source-intelligence signals.
- Keep Source, Evidence, Claim, and Decision separate.
- Keep Decision Score, Evidence Strength, and Confidence separate.
- Material conflicts must be explicit.
- Weak evidence must never create artificial certainty.
- Preserve existing API compatibility and Recent Research.
- Never expose or commit API keys.
- Verify with TypeScript, tests, build, and diff checks.

---

## Implementation Tasks

### Task 0: Establish the Test Infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create temporarily: `lib/test-smoke.test.ts`

**Interfaces:**
- Produces: `npm test` using Vitest.
- Produces: a test environment for subsequent decision-intelligence tests.

- [ ] **Step 1: Add Vitest**

Run:

```bash
npm install -D vitest

### Task 1: Create the V2 Domain Model

**Files:**
- Create: `lib/decision-intelligence.ts`
- Create: `lib/decision-intelligence.test.ts`

**Requirements:**
- Keep Source, Evidence, Claim, and Decision separate.
- Define evidence, claim, factor, decision, alternative, and conflict types.
- Define explicit decision states.
- Validate factor weights and evidence/source references.
- Clamp scores to 0–100.

**Verification:**
`npm test -- lib/decision-intelligence.test.ts`
`npx tsc --noEmit --pretty false`

### Task 2: Extract Structured Evidence

**Files:**
- Modify: `lib/decision-intelligence.ts`
- Modify: `lib/decision-intelligence.test.ts`

**Requirements:**
- Convert researched source material into structured Evidence.
- Preserve source IDs.
- Capture claim text, polarity, evidence type, strength, and verification.
- Support fact, inference, forecast, and opinion.
- Never invent evidence absent from source material.

**Tests:**
- supporting evidence
- opposing evidence
- neutral evidence
- evidence type classification
- source reference preservation
- invalid/empty evidence

### Task 3: Add Claim Extraction

**Requirements:**
- Normalize Evidence into Claims.
- Assign stable claim IDs.
- Preserve claim-to-evidence references.
- Track claim type and confidence.
- Prevent unsupported claims from becoming verified facts.

### Task 4: Implement Evidence Scoring

**Requirements:**
Score evidence using:
- authority
- relevance
- directness
- freshness
- corroboration

Keep Evidence Strength separate from Decision Score and Confidence.

### Task 5: Implement Decision Factor Scoring

**Default weights:**
- Market / Demand: 25%
- Economics / ROI: 20%
- Feasibility: 15%
- Competition: 10%
- Risk: 15%
- Regulation / Constraints: 15%

Validate weights total 100% and calculate the weighted Decision Score.

### Task 6: Implement Conflict Detection

**Requirements:**
- Detect conflicting evidence.
- Preserve both sides.
- Link conflicts to claims/evidence.
- Classify minor versus material conflicts.
- Never silently select one conflicting source.

### Task 7: Implement the Decision Engine

**Decision states:**
- `INSUFFICIENT_EVIDENCE`
- `CONTESTED_DECISION`
- `DIRECTIONAL_RECOMMENDATION`
- `RECOMMENDATION`

**Requirements:**
- Produce recommendation, score, confidence, rationale, and state.
- Weak evidence must not create artificial certainty.
- Material conflicts must affect decision state.

### Task 8: Implement Decision Validation

**Requirements:**
Validate:
- source references
- evidence references
- claim references
- factor weights
- score bounds
- conflict references
- decision-state consistency
- required decision fields

### Task 9: Integrate the V2 Pipeline Into the Research API

**Files:**
- Modify: `app/api/research/route.ts`
- Modify: `lib/decision-intelligence.ts`

**Pipeline:**

`Question -> Research Plan -> Tavily Search -> Source Intelligence -> Evidence -> Claims -> Evidence Scoring -> Factors -> Conflicts -> Decision -> Validation -> API`

**Requirements:**
- Preserve existing Tavily research.
- Preserve API compatibility.
- Preserve existing source output.
- Never expose API keys.
- Preserve fallback behavior.

### Task 10: Upgrade DecisionBox

**Requirements:**
Display:
- Decision Score
- Evidence Strength
- Confidence
- Decision State
- Decision Factors
- Claims
- Evidence supporting/against
- Risks
- Assumptions
- Conflicts
- What would change the decision
- Research trail

Do not merge the three decision metrics.

### Task 11: Preserve Recent Research Workspace

**Requirements:**
- Keep Recent Research visible.
- Preserve saved research.
- Preserve new-research behavior.
- Preserve selection of previous research.
- Avoid workspace layout regressions.

### Task 12: End-to-End Verification

Run:

`npm test`

`npx tsc --noEmit --pretty false`

`npm run build`

`git diff --check`

`git status --short`

Confirm:

`Source -> Evidence -> Claim -> Factor -> Score -> Decision -> Validation -> Workspace`

All stages must be traceable, independently testable, and verified before production deployment.
