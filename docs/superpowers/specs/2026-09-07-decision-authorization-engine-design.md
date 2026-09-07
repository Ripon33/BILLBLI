# BILLBLI Decision & Authorization Engine

**Date:** 2026-09-07  
**Status:** Approved for implementation planning

## 1. Purpose

The Decision & Authorization Engine formalizes BILLBLI's human decision boundary and ensures that technical capability, autonomy, permission, human decision, and authorization remain separate concepts.

BILLBLI assists with research, analysis, recommendations, planning, and execution of authorized work. It must not silently convert an AI recommendation into a human decision or execute consequential work without the required human decision or authorization.

## 2. Architectural Principle

The Work Engine remains the single work orchestration model.

The Decision & Authorization Engine is a policy and state boundary used by the Work Engine before execution.

The execution flow is:

Goal → Plan → Capability Check → Permission Check → Human Decision Check → Tool Execution → Verification → Audit

A required human decision or authorization stops execution.

## 3. Existing Work Engine Integration

The existing Work Engine already represents:

- autonomy levels: `auto`, `review`, `approval`, `restricted`
- human-decision detection
- authorization requirements
- approval-gated lifecycle states

The new engine must formalize these concepts rather than create a competing authorization model.

Existing task-engine behavior must remain compatible.

## 4. Decision Concepts

The system must distinguish:

- `recommendation` — AI-generated recommendation
- `human_decision_required` — the system determines that human judgment is required
- `human_decision` — an explicit decision made by the human
- `human_authorization` — explicit authorization for an action
- `executed_action` — an action that actually reached execution

These concepts must never be treated as interchangeable.

## 5. Decision Classification

A proposed task may be evaluated as:

- `proceed` — no human decision or authorization is required
- `human_decision_required` — execution must pause until the human makes the required decision
- `authorization_required` — execution must pause until explicit authorization is recorded
- `blocked` — execution is prohibited

Consequential work must not be classified as freely executable merely because BILLBLI has the technical capability to perform it.

## 6. Human Decision Boundary

BILLBLI must preserve the human decision boundary for consequential actions.

Examples include decisions involving:

- employment
- significant financial consequences
- legal or compliance consequences
- safety
- medical matters
- sensitive personal matters
- destructive or irreversible actions
- significant external commitments
- rights, employment, finances, safety, or access

For these cases BILLBLI may research, analyze evidence, generate options, explain trade-offs, and prepare drafts, but it must not silently make the human decision.

## 7. Authorization States

The decision/authorization model must support explicit states:

- `not_required`
- `human_decision_required`
- `pending_approval`
- `approved`
- `rejected`
- `authorized`
- `blocked`

The implementation must define valid transitions and reject invalid transitions.

An `approved` state must not automatically mean that an external action was executed.

## 8. Execution Gate

Before execution, the Work Engine must evaluate the decision/authorization state.

Execution is allowed only when the decision engine explicitly returns an executable outcome.

If:

- a human decision is required,
- authorization is pending,
- authorization was rejected,
- the work is blocked,
- or required decision information is missing,

the execution gate must stop the action.

The system must fail closed rather than silently proceed.

## 9. Human Decision Preservation

When a human decision is required, BILLBLI should:

1. identify the decision boundary
2. explain why human judgment is required
3. present relevant evidence/options
4. present BILLBLI's recommendation separately
5. collect the human decision
6. collect authorization when separately required
7. record the resulting decision state
8. allow execution only after the required gate is satisfied

The system must never represent an AI recommendation as a completed human decision.

## 10. Autonomy and Authorization

Autonomy is a policy input, not authorization by itself.

The four existing autonomy levels remain:

- `auto`
- `review`
- `approval`
- `restricted`

`auto` does not override a human decision boundary.

`approval` requires explicit authorization.

`restricted` must remain blocked from ordinary execution.

Autonomy must never be used as a mechanism to bypass the decision engine.

## 11. Audit-Ready Decision Records

The decision engine must produce structured records suitable for the future audit system.

Records should preserve:

- work/task reference
- decision classification
- recommendation
- human decision, when provided
- authorization state
- decision actor
- decision timestamp
- resulting execution eligibility
- rejection/block reason when applicable

The model must keep AI-generated information distinct from human actions.

## 12. Ownership and Security

Authenticated identity must be established server-side.

The client must never be trusted as the source of:

- user identity
- authorization identity
- human decision identity
- execution permission

Decision and authorization records must be associated with the authenticated owner and protected by the same ownership principles as existing Work Engine data.

Authentication does not bypass authorization requirements.

## 13. Error Handling

The engine must fail closed for ambiguous or incomplete authorization information.

Invalid state transitions must return explicit errors.

A missing human decision must not be interpreted as approval.

A missing authorization must not be interpreted as authorization.

A rejected decision must not be interpreted as approval.

## 14. Testing Requirements

Tests must prove:

- routine authorized work can proceed
- human-decision-required work pauses
- approval-required work pauses
- restricted work is blocked
- an AI recommendation cannot become a human decision automatically
- an approval cannot be inferred from absence of rejection
- rejected authorization cannot reach execution
- missing authorization cannot reach execution
- invalid state transitions are rejected
- client-provided identity cannot authorize execution
- existing Work Engine and Task Engine behavior remains compatible

The most important invariant is:

**No required human decision or authorization may be bypassed to reach execution.**

## 15. Non-Goals

This phase does not implement:

- external purchasing
- financial transactions
- employment actions
- legal actions
- medical actions
- unrestricted autonomous tools
- external integrations
- advanced approval UI
- multi-user teams
- full audit infrastructure

Those capabilities may consume this engine later.

## 16. Success Criteria

The Decision & Authorization Engine is successful when BILLBLI has a single, testable, server-controlled boundary that determines whether work may proceed, must wait for human input, requires authorization, or must be blocked.

The resulting architecture must preserve the principle:

**BILLBLI does the work. You make the decisions.**
