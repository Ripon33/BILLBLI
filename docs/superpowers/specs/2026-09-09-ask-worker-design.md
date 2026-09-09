# Ask Worker V1 — Design Specification

## 1. Purpose

Ask Worker makes a persistent BILLBLI Worker the natural-language front door to BILLBLI's existing intelligence system.

A user asks a Worker for help. BILLBLI automatically determines which existing intelligence capability is appropriate, uses the Worker identity and professional context, and returns a governed intelligence response.

Ask Worker is an orchestration and interaction layer. It is not a second execution engine.

## 2. Core principle

AI proposes and analyzes.

The human remains authoritative for consequential decisions.

When a concrete action is appropriate:

AI proposes Work → human reviews/edits → human explicitly creates Work → existing Work Engine governs the resulting Work.

Worker capability does not equal permission, authorization, or execution authority.

## 3. Automatic BILLBLI routing

The user does not have to select Research, Study, Decision, or Work manually.

BILLBLI determines the appropriate path from the user's request and Worker context.

Possible paths include:

- Research
- Study
- Decision
- Work
- combinations of the above when needed

The routing layer must reuse existing BILLBLI intelligence capabilities rather than duplicate their business logic.

## 4. Progressive transparency

BILLBLI should expose meaningful progress without exposing implementation details.

Examples:

- Understanding your question
- Researching relevant evidence
- Comparing options
- Preparing recommendation

Simple requests may show little or no routing detail.

More consequential requests should provide enough transparency for the user to understand what BILLBLI did.

## 5. Worker context

Ask Worker may use:

- worker identity
- worker specialization
- worker goal
- worker context
- worker capabilities

Worker context must never grant authority or override:

- ownership
- permission
- authorization
- Work lifecycle
- human decision requirements

## 6. Response model

A response may contain these sections as appropriate:

- Answer
- Analysis
- Evidence
- Recommendation
- Uncertainty / Missing information
- Suggested next step
- Suggested Work
- Decision required

Sections are adaptive. Not every response needs every section.

## 7. Insufficient evidence

Insufficient information is a first-class outcome.

BILLBLI must not fabricate evidence or imply that research occurred when it did not.

When evidence is insufficient, the response should distinguish:

Known → Missing → Needed → Recommended next step

The system may identify the research or data needed next.

## 8. Evidence model

Evidence is adaptive.

For simple requests, a concise evidence summary is sufficient.

For research-heavy or consequential requests, the response should be able to expose:

- key findings
- relevant sources
- conflicts or contradictory evidence
- uncertainty
- access to underlying research where supported by the existing system

## 9. Decision handling

When BILLBLI determines that a consequential decision is involved, it should present a Decision Brief.

A Decision Brief may include:

- options
- evidence
- trade-offs
- recommendation
- confidence or uncertainty
- what would change the recommendation

BILLBLI must not make the final consequential human decision.

The user explicitly chooses the decision or chooses to defer.

Existing Decision and Authorization Engine semantics remain authoritative.

## 10. Work proposals

When a useful concrete action emerges, Ask Worker may propose Work.

The proposal should be editable before creation.

Example fields:

- title
- goal
- autonomy

The user explicitly chooses Create Work or Not now.

No Work record is created merely because the AI proposed one.

After explicit creation, the existing Work Engine governs the Work lifecycle, permission, authorization, and execution behavior.

## 11. API boundary

The intended endpoint is:

POST /api/work/[id]/ask

The server flow is:

authenticate
→ load Worker through authenticated ownership
→ validate Worker
→ build Worker context
→ route request
→ invoke existing intelligence capability
→ compose governed response
→ return response

The endpoint must not directly execute external actions.

## 12. Memory and persistence

V1 does not introduce a separate persistent conversation-memory subsystem.

Persistent continuity comes from:

- Worker identity
- worker context
- associated Work
- existing BILLBLI research/study/decision information

Transient request/response state may be used where necessary.

## 13. Safety and governance boundaries

Ask Worker V1 must not:

- autonomously execute external actions
- send emails
- modify external systems
- make financial transactions
- make medical decisions
- make legal decisions
- terminate employees
- bypass authorization
- bypass the Work Engine
- create a second execution lifecycle

## 14. Testing requirements

Tests must cover:

- authenticated Worker ownership
- missing Worker
- invalid request
- Worker context usage
- routing decisions
- progressive status behavior
- insufficient evidence
- adaptive evidence
- decision-required responses
- preservation of human decision authority
- Work proposal generation
- editable Work proposal
- explicit Work creation
- rejection of direct execution
- preservation of existing Work Engine behavior

## 15. Success criteria

Ask Worker V1 is successful when a user can:

1. Open a persistent Worker.
2. Ask a natural-language professional question.
3. Have BILLBLI automatically determine the appropriate intelligence path.
4. Receive a useful, governed response.
5. Understand meaningful progress without seeing internal implementation details.
6. See evidence appropriate to the importance of the request.
7. Be told what information is missing when evidence is insufficient.
8. Receive a structured Decision Brief when a consequential decision is involved.
9. Remain the final decision-maker for consequential decisions.
10. Review and edit a proposed Work before explicitly creating it.
11. Have all created Work remain governed by the existing Work Engine.

## 16. Scope boundary

Ask Worker V1 does not introduce autonomous background workers, external execution, new authorization semantics, new Work lifecycle semantics, or a separate memory architecture.

The existing BILLBLI engines and governance remain the source of truth.
