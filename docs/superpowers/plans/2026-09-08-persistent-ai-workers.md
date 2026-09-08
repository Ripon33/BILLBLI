# Persistent AI Workers

## Goal

Transform BILLBLI Work into persistent specialized AI workers that help users perform ongoing professional/business work under explicit human control.

BILLBLI Work remains the existing governed Work Engine. Workers specialize the existing Work entity rather than introducing a separate AI-worker execution system.

## Architecture

A persistent worker is a specialized `works` record.

Worker identity:
- `worker_type`
- `worker_name`
- `worker_context`

Existing Work fields remain authoritative:
- title
- goal
- status
- priority
- autonomy
- authorization
- lifecycle
- authenticated ownership

Initial worker types:

- `hr_assistant`
- `accountant`
- `digital_marketer`
- `sales_assistant`
- `operations_manager`
- `customer_support`
- `research_analyst`
- `custom`

Worker context is descriptive context only. It must never override permission, authorization, ownership, or lifecycle rules.

No separate `ai_workers` table in V1.

No separate vector/conversational memory subsystem in V1.

No unrestricted external-tool execution.

No automatic background worker activity in V1.

## Worker Profiles

Create central worker profile definitions containing:

- type
- displayName
- description
- defaultInstructions
- capabilities

Capabilities describe what a worker is designed to help with.

Capability does not equal authorization.

Existing task-level `assigned_capability` remains compatible.

Custom Worker accepts a natural-language definition. V1 does not expose arbitrary manual capability configuration.

## Persistent Worker Workspace

Each worker has a persistent workspace showing:

- worker identity
- specialization
- goal
- current Work
- recent results
- Ask Worker composer

Ask Worker is an interaction/context layer, not a second execution engine.

Flow:

User message
→ worker context
→ BILLBLI intelligence
→ existing permission evaluation
→ authorization when required
→ existing Work lifecycle
→ result

The existing distinction between AI recommendation, human decision, human authorization, execution, and verification must remain intact.

## Global Constraints

1. Do not change existing Work lifecycle semantics.
2. Do not weaken existing authorization rules.
3. Do not weaken authenticated ownership/server-side authorization.
4. Worker capability must never imply execution permission.
5. Do not introduce unrestricted autonomous execution.
6. Preserve localStorage history behavior and automatic migration.
7. Preserve existing Work creation compatibility.
8. Maintain responsive desktop/tablet/mobile UI.
9. Avoid horizontal overflow.
10. Maintain BILLBLI Minimal White/Light Product visual language.
11. Avoid excessive gradients, glassmorphism, neon effects, shadows, or dashboard clutter.
12. Existing tests must continue passing.
13. New behavior must be covered by tests before implementation is considered complete.

## Tech Stack

- Next.js
- React
- TypeScript
- Supabase
- existing BILLBLI Work Engine
- existing repository/API architecture
- existing test framework

## Spec Path

Persistent AI Worker product specification established during BILLBLI design session.

## Task 1 — Worker Domain + Persistence

### Objective

Introduce the worker domain model and persist worker identity/context on the existing `works` entity.

### Requirements

1. Define `WorkerType`.
2. Define worker profile metadata.
3. Add `worker_type`, `worker_name`, and `worker_context` to `works`.
4. Preserve existing rows through safe migration defaults.
5. Persist worker fields through the repository.
6. Return worker fields from repository reads.
7. Preserve authenticated `user_id` ownership.
8. Never accept arbitrary client ownership.
9. Preserve existing Work lifecycle and permission semantics.
10. Ensure worker context cannot be used as authority.

### TDD

RED:
- worker type/profile tests
- persistence tests
- migration/schema tests
- ownership tests

GREEN:
- implement minimum required domain/persistence code

VERIFY:
- targeted tests
- complete test suite
- build

Commit:

`feat: add persistent worker domain`

## Task 2 — AI Workforce API + Creation UI

### Objective

Create persistent workers through an explicit, governed creation flow.

### Creation Flow

1. Select specialization.
2. Enter worker name.
3. Define goal.
4. Select autonomy.
5. Create Worker.

### Requirements

- Validate all required fields server-side.
- Authenticated user is always authoritative for ownership.
- Worker type must be one of the defined worker types.
- Custom worker requires a meaningful natural-language definition.
- Autonomy remains governed by existing Work permission semantics.
- Do not create an independent execution path.
- Preserve existing Work creation API compatibility.
- Provide clear validation/error states.
- Maintain responsive UI.

### TDD

RED:
- API validation tests
- authenticated ownership tests
- worker creation tests
- UI rendering/interaction tests

GREEN:
- implement API/UI

VERIFY:
- targeted tests
- complete test suite
- build

Commit:

`feat: add AI workforce creation flow`

## Task 3 — Persistent Worker Workspace

### Objective

Provide a persistent workspace for each specialized worker.

### Requirements

Worker workspace displays:

- identity
- specialization
- goal
- current Work
- recent results
- Ask Worker

Ask Worker must route through existing BILLBLI intelligence and Work governance.

It must not:

- bypass authorization
- execute restricted actions
- introduce a second lifecycle
- create unrestricted background activity
- create an independent memory subsystem

### TDD

RED:
- workspace rendering tests
- worker context tests
- Ask Worker routing/governance tests
- authorization regression tests

GREEN:
- implement workspace

VERIFY:
- targeted tests
- complete test suite
- production build

Commit:

`feat: add persistent worker workspace`

## Task 4 — Final Verification

Run:

```bash
npm test -- --run
npm run build
git diff
git status --short
git log --oneline -5
