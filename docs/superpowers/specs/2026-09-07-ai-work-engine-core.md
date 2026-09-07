# BILLBLI AI Work Engine Core Specification

## Status

Approved architectural direction.

## Vision

BILLBLI is an AI workforce that can understand objectives, research, reason, plan, execute authorized work, verify results, and report outcomes.

The Work Engine is the reusable execution foundation underneath future HR, Finance, Operations, Sales, Marketing, Research, and other capabilities.

## Core Principle

A user gives BILLBLI an objective rather than a sequence of implementation instructions.

BILLBLI transforms that objective into structured work:

User Objective → Work → Plan → Tasks → Permission → Execution → Verification → Result → Audit.

## Scope of v1

The first Work Engine implementation provides:

- Persistent work representation.
- Structured work plans.
- Persistent tasks.
- Task dependencies.
- Task lifecycle states.
- Work-level status derived from task progress.
- Task ownership by authenticated user.
- Existing BILLBLI task classification compatibility.
- Clear interfaces for future agents and tools.
- Structured execution results.
- Verification state.
- Audit-event boundaries.

## Explicitly Out of Scope for v1

The first implementation does not implement:

- HR workflows.
- Accounting workflows.
- Payroll.
- Banking.
- External financial transactions.
- Email execution.
- Calendar execution.
- External integrations.
- Autonomous AI agents.
- Tool execution against third-party systems.
- Company memory/vector search.
- Advanced approval UI.
- Multi-user teams.
- Automatic migration of existing localStorage history.

Those capabilities will build on the Work Engine later.

## Existing BILLBLI Components to Reuse

The current repository already contains:

- `lib/task-engine.ts`
- `lib/task-result.ts`
- `lib/task-routing.ts`
- `lib/intent-engine.ts`
- Decision infrastructure under `lib/decision-*.ts`
- Research infrastructure under `lib/research-*.ts`

The Work Engine must extend these capabilities instead of creating a second task system.

## Work Model

A Work represents a user-level objective.

Required concepts:

- `id`
- `user_id`
- `title`
- `goal`
- `status`
- `priority`
- timestamps

Work status must represent at least:

- `draft`
- `ready`
- `running`
- `waiting_input`
- `waiting_approval`
- `completed`
- `failed`
- `cancelled`

## Work Plan Model

A Work Plan represents BILLBLI's structured strategy for achieving a Work objective.

Required concepts:

- `id`
- `work_id`
- `objective`
- `status`
- timestamps

A Work must be able to have an ordered or dependency-aware collection of tasks.

## Task Model

The existing `BillbliTask` is the starting conceptual model.

The persistent Work Task must support:

- `id`
- `work_id`
- optional `parent_task_id`
- `title`
- `description`
- `status`
- `sequence`
- dependencies
- assigned agent/capability
- autonomy level
- execution metadata
- timestamps

The existing task lifecycle remains compatible:

- `ready`
- `needs_input`
- `waiting_approval`
- `running`
- `completed`
- `failed`

New persistence must not silently change the meaning of these existing states.

## Autonomy

The Work Engine recognizes four autonomy levels:

### AUTO

BILLBLI may perform the action without human approval when the user's permissions and policy allow it.

### REVIEW

BILLBLI prepares the action and result for human review.

### APPROVAL

BILLBLI must receive explicit authorization before execution.

### RESTRICTED

The action requires stronger safeguards and explicit authorization. The system must not treat ordinary approval as sufficient for inherently high-risk operations.

The autonomy level is a policy input, not authorization by itself.

## Authorization Principle

BILLBLI must distinguish:

- what an agent can technically do,
- what the user has permitted,
- what company policy permits,
- what the current action's risk level permits.

The client must never be trusted to supply or override the authenticated `user_id`.

All persistent user-owned Work Engine records must be linked to the authenticated user.

## Dependencies

Tasks may depend on other tasks.

A task is executable only when all required dependencies are satisfied.

Dependency evaluation must prevent:

- execution before prerequisites complete,
- circular dependency creation,
- execution of failed prerequisites without an explicit recovery path.

## Execution State

The first Work Engine version models execution state but does not yet implement arbitrary external tool execution.

Execution must eventually support:

- queued
- running
- succeeded
- failed
- retryable failure
- blocked

The Work Engine must preserve enough structured state for future workers/agents to resume work safely.

## Results

Each executable task may produce a structured result.

A result must distinguish:

- success
- failure
- blocked
- incomplete

Results must not be represented only as free-form assistant text.

## Verification

Completion and verification are separate concepts.

A task must not be described to the user as successfully completed merely because an execution function returned.

Future execution workers will provide verification evidence.

The Work Engine should support at least:

- `unverified`
- `verified`
- `verification_failed`

## Audit Boundary

Meaningful Work Engine state changes must have an audit-event boundary.

Future audit records should capture:

- actor
- work
- task
- event type
- relevant metadata
- timestamp

The initial implementation may establish the domain interface before implementing the complete audit infrastructure.

## User Ownership

All persistent Work Engine data is user-owned.

Required security model:

- authenticated user identity comes from the server-side auth context,
- records reference the authenticated user,
- Row Level Security protects user-owned records,
- users cannot read or modify another user's work,
- system definitions remain separate from user-owned records.

## Existing Data Compatibility

Existing localStorage history is not automatically migrated.

Existing task classification behavior should continue to work.

The new Work Engine should be introduced without breaking existing research, study, decision, and task behavior.

## Future Architecture

The Work Engine is intentionally designed to become the execution layer for:

- Research Agent
- Decision Agent
- HR Agent
- Finance Agent
- Operations Agent
- Sales Agent
- Marketing Agent
- future specialist capabilities

Agents will eventually consume Work Tasks and invoke controlled tools through separate permission and execution layers.

## Long-Term Execution Loop

Understand → Research → Analyze → Plan → Permission → Execute → Verify → Record → Report.

## Non-Goals

The Work Engine is not itself:

- a chatbot,
- an accounting system,
- an HRIS,
- a CRM,
- a banking system,
- an unrestricted autonomous agent.

It is the shared orchestration and execution foundation that allows those capabilities to be built consistently.

## Success Criteria

The Work Engine core is successful when:

1. A user-owned objective can be represented as Work.
2. Work can contain a structured plan.
3. Plans can contain persistent tasks.
4. Tasks can express dependencies.
5. Task lifecycle transitions are explicit and testable.
6. Autonomy is represented independently from authentication.
7. User ownership is enforced server-side and through RLS.
8. Results and verification are separate concepts.
9. Existing task behavior remains compatible.
10. Future agents and tools can consume the Work Engine without redesigning its core model.
