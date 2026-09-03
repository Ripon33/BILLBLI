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