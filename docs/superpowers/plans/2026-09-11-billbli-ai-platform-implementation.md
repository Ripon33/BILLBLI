# BILLBLI AI Platform Implementation Plan

**Date:** 2026-09-11  
**Status:** Approved for implementation  
**Product:** BILLBLI  
**Primary direction:** OpenAI as the underlying AI provider, BILLBLI as the product, intelligence, governance, and workflow layer.

## 1. Objective

Migrate BILLBLI from the current mixed Gemini/OpenAI AI implementation to a provider-neutral AI capability architecture with OpenAI as the initial and primary provider.

The migration must preserve existing BILLBLI behavior, governance, authentication, Work Engine semantics, Research behavior, Study behavior, Decision Intelligence behavior, history behavior, and user-facing product language.

Users must experience BILLBLI rather than provider/model names.

## 2. Core Architecture

The target architecture is:

User
↓
BILLBLI Product Experience
↓
AI Capability Layer
↓
Intent / Capability Router
↓
Provider Adapter
↓
OpenAI API
↓
BILLBLI Processing / Governance
↓
BILLBLI Result

The AI provider must remain an implementation detail.

The application must not expose provider model IDs as user-facing product concepts.

## 3. Intelligence Modes

BILLBLI should use product-level intelligence modes:

- Auto
- Fast
- Balanced
- Best Quality

These modes must map internally to provider/model policies.

Provider model IDs must remain server-side implementation details.

## 4. Global Constraints

Do not:

- change Decision & Authorization Engine semantics
- change Work Engine lifecycle semantics
- bypass authenticated ownership checks
- create Work automatically from AI recommendations
- allow AI recommendations to become authorization
- add direct external execution
- add autonomous background workers in V1
- create a second execution engine
- create a second persistent chat/memory subsystem
- expose provider/model IDs to users
- remove existing localStorage history behavior
- break automatic history migration
- silently backfill old Work records
- introduce horizontal overflow
- replace the existing Work Engine with a new workflow system

All AI actions remain subject to BILLBLI governance and explicit human control.

## 5. Existing Work Governance Must Remain Unchanged

Existing Work Engine statuses remain:

- draft
- ready
- running
- waiting_input
- waiting_approval
- completed
- failed
- cancelled

Existing autonomy levels remain:

- auto
- review
- approval
- restricted

Existing authorization states remain:

- not_required
- required
- authorized

Existing human-decision protection remains intact.

The AI platform migration must not modify these semantics.

## 6. Task 1 — Establish AI Capability Contracts

### Goal

Create the provider-neutral foundation before migrating existing features.

### Files

Create:

- `lib/ai/capability.ts`
- `lib/ai/provider.ts`
- `lib/ai/model-policy.ts`

Create tests:

- `lib/ai/capability.test.ts`
- `lib/ai/model-policy.test.ts`

### Capability contract

Define product-level capabilities such as:

- text generation
- structured JSON generation
- reasoning
- research synthesis
- image generation
- audio generation
- transcription

Only capabilities required by currently migrated features need to be active initially.

### Provider contract

Define a provider-neutral interface so product code does not directly depend on OpenAI SDK objects.

The interface must support:

- text generation
- structured JSON generation
- capability selection
- intelligence mode selection
- provider-independent result handling

### Model policy

Create a centralized server-side policy that maps:

- Auto
- Fast
- Balanced
- Best Quality

to approved provider/model configurations.

Do not scatter model IDs throughout feature code.

### TDD

First write failing tests for:

- capability contract behavior
- intelligence mode policy
- unsupported capability handling
- provider-independent request shape

Run:

`npx vitest run lib/ai/capability.test.ts lib/ai/model-policy.test.ts`

Implement the minimum code required.

Run the same tests again.

Then run:

`npx vitest run`

Commit:

`feat: add provider-neutral AI capability layer`

## 7. Task 2 — Add OpenAI Provider Adapter

### Goal

Centralize OpenAI API access.

### File

Create:

- `lib/ai/openai-provider.ts`

Add tests:

- `lib/ai/openai-provider.test.ts`

The provider must:

- use `OPENAI_API_KEY`
- keep the API key server-side
- use the Responses API where appropriate
- normalize provider responses into BILLBLI capability results
- handle HTTP failures consistently
- support request timeout behavior
- avoid exposing raw provider implementation details to UI code

The provider must not become a second business-logic layer.

### TDD

Write failing provider tests first.

Test:

- successful text response
- structured JSON response
- HTTP error
- empty response
- timeout/error normalization
- intelligence mode routing

Run focused tests.

Then run the complete regression suite.

Commit:

`feat: add OpenAI AI provider`

## 8. Task 3 — Migrate AI JSON Generation

### Current State

`lib/ai-json.ts` currently calls OpenAI directly and falls back to Gemini.

The migration must remove that fallback while preserving the public function contract.

### Target

Refactor:

- `lib/ai-json.ts`

to use the new AI capability/provider layer.

`generateJsonWithAI(prompt)` must remain compatible with existing callers unless tests prove a necessary contract change.

It must:

- use BILLBLI AI capability contracts
- use OpenAI through the provider layer
- preserve JSON cleanup behavior
- preserve useful error handling
- never require Gemini

### Tests

Update/add tests for:

- OpenAI success
- valid JSON
- fenced JSON cleanup
- provider failure
- missing OpenAI configuration
- empty AI response

Remove Gemini-specific test expectations only after equivalent OpenAI behavior is covered.

Run:

`npx vitest run lib/ai-json.test.ts`

Then:

`npx vitest run`

Commit:

`refactor: migrate AI JSON generation to OpenAI provider`

## 9. Task 4 — Migrate Research

### Goal

Move Research from Gemini-dependent execution to the provider-neutral AI layer while preserving the existing Research pipeline.

Existing Research architecture must remain:

question
↓
classification
↓
routing
↓
web research
↓
research synthesis
↓
Research result

Tavily/web research behavior must remain separate from the AI provider.

### Files

Inspect and modify only the necessary Research files, including:

- `app/api/research/route.ts`
- `lib/research-runner.ts`
- existing Research tests
- relevant prompt-injection tests

The Research runner must use the provider abstraction for synthesis.

### Important

Do not remove Tavily.

Do not change Research routing semantics.

Do not change prompt-injection protections.

Do not change language handling.

Do not change Research result structure unless tests require it.

### Tests

Cover:

- OpenAI synthesis
- Tavily failure
- provider failure
- prompt injection handling
- requested output language
- research result structure
- Study route compatibility

Update existing tests that currently mock Gemini so they mock the provider boundary instead.

Run:

`npx vitest run app/api/research`

Then:

`npx vitest run`

Commit:

`refactor: migrate Research to AI capability layer`

## 10. Task 5 — Migrate Study and Decision Intelligence

### Study

Study must continue using its existing prompts and response transformation.

Only the AI provider boundary changes.

Preserve:

- explanation
- examples
- practice questions
- requested language
- JSON validation
- existing error handling

### Decision Intelligence

Migrate AI generation used by Decision Intelligence to the capability layer.

Preserve:

- decision framing
- evidence
- recommendation
- uncertainty
- human decision requirement
- authorization distinction
- Work proposal behavior

AI recommendation must never become authorization.

### Tests

Write/update failing tests before implementation.

Verify:

- Study generation
- malformed JSON handling
- Decision generation
- recommendation behavior
- human decision governance

Run focused tests.

Then:

`npx vitest run`

Commit:

`refactor: migrate Study and Decision Intelligence to OpenAI`

## 11. Task 6 — Migrate Ask BILLBLI and Ask Worker

### Ask BILLBLI

Ask BILLBLI remains the orchestration/context layer.

Target flow:

User
↓
Ask BILLBLI
↓
intent
↓
capability route
↓
Research / Study / Decision / Work
↓
synthesis
↓
BILLBLI result

Do not create a separate AI execution engine.

### Ask Worker

Ask Worker remains an orchestration layer over the existing Worker and Work Engine.

Preserve:

- worker context
- worker specialization
- governance
- human decision detection
- proposal review
- explicit Create Work
- existing `/api/work`
- existing authorization model

AI Worker recommendations must not execute external actions.

### Tests

Verify:

- Ask BILLBLI routing
- Ask Worker routing
- worker context preservation
- research routing
- work proposal generation
- human authorization requirements
- no direct execution
- provider failure handling

Run:

`npx vitest run`

Commit:

`refactor: migrate Ask BILLBLI and Ask Worker to AI platform`

## 12. Task 7 — Remove Gemini Completely

Only after all previous migrations pass:

Remove:

- `@google/genai`
- `GEMINI_API_KEY` runtime dependency
- Gemini imports
- Gemini model arrays
- Gemini fallback logic
- Gemini-specific error messages
- Gemini-specific mocks

Update tests to use provider-neutral/OpenAI mocks.

Update configuration/documentation where Gemini is referenced.

Run the inventory:

`grep -RniE 'GoogleGenAI|@google/genai|GEMINI_API_KEY|generativelanguage|gemini' --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude='*.backup' --exclude='*.backup2' --exclude='*.before-multilingual' app lib components package.json`

Expected result:

No active Gemini implementation references.

Historical documentation or backup files excluded by the command do not count as runtime dependencies.

Remove the dependency only after tests are green.

Run:

`npm install`

Then:

`npx vitest run`

Commit:

`refactor: remove Gemini dependency`

## 13. Task 8 — Full Verification

Run:

`npx vitest run`

Then:

`npm run build`

Then inspect:

`git status --short`

Then inspect recent commits:

`git log -5 --oneline --decorate`

Run the final Gemini inventory.

Verify:

- build succeeds
- tests pass
- no Gemini runtime dependency remains
- OpenAI API key is server-side
- provider abstraction is used by migrated features
- model IDs are centralized
- Work Engine semantics are unchanged
- Decision & Authorization semantics are unchanged
- Research behavior remains intact
- Study behavior remains intact
- Ask Worker remains governed
- no direct external execution exists
- existing history behavior remains intact
- no unintended UI changes were introduced

Commit any final cleanup separately:

`chore: finalize OpenAI AI platform migration`

## 14. Production Verification

Before production deployment:

- verify `OPENAI_API_KEY` exists in the production environment
- verify required Tavily configuration remains available
- verify Supabase configuration remains available
- verify no Gemini secret is required
- deploy
- test authenticated Research
- test Study
- test Decision Intelligence
- test Ask BILLBLI
- test Ask Worker
- test Work proposal creation
- verify Work autonomy/authorization persistence
- verify no external execution occurs

If production fails, diagnose the actual failing endpoint and server log before changing code.

Do not infer production failures from unrelated historical logs.

## 15. UI Requirements

Maintain BILLBLI's approved product language.

Users should see:

- BILLBLI
- Ask BILLBLI
- Ask Worker
- Auto
- Fast
- Balanced
- Best Quality

Do not expose:

- Gemini
- OpenAI
- GPT model IDs
- provider implementation names

Maintain the approved visual direction:

- white/light product UI
- restrained green accents
- charcoal text
- minimal shadows
- responsive layout
- no horizontal overflow
- no excessive gradients
- no excessive glass effects
- no neon visual treatment
- no clutter

## 16. Security Requirements

All provider API calls must be server-side.

Never expose:

- `OPENAI_API_KEY`
- provider credentials
- internal provider configuration
- unrestricted provider endpoints

Existing authenticated ownership checks remain mandatory.

AI output must not bypass:

- authorization
- human decision requirements
- Work Engine lifecycle
- ownership/RLS

## 17. Billing Boundary

AI provider migration must not couple customer payments directly to OpenAI.

BILLBLI billing remains a future product layer:

Customer
↓
BILLBLI subscription/credits
↓
BILLBLI usage ledger
↓
AI capability usage
↓
OpenAI provider

Payment integration is not part of this migration.

## 18. TDD Rule

For every implementation task:

1. Write or update a failing test.
2. Run the focused test and confirm failure.
3. Implement the smallest change.
4. Run the focused test and confirm success.
5. Run the relevant regression tests.
6. Review the diff.
7. Commit the completed task separately.

Do not make broad untested changes.

## 19. Final Architecture

The completed system should conceptually be:

BILLBLI
├── Product Experience
├── Intelligence
│   ├── Ask BILLBLI
│   ├── Research
│   ├── Study
│   └── Decisions
├── Work
│   ├── AI Workforce
│   ├── Tasks
│   └── History
├── Create
│   ├── Create
│   ├── Knowledge
│   └── Voice
└── AI Platform
    ├── Capability Contracts
    ├── Intent/Capability Router
    ├── Model Policy
    ├── OpenAI Provider
    ├── Governance
    └── Usage/Billing Boundary

## 20. Success Criteria

The migration is successful when:

1. BILLBLI uses a provider-neutral AI capability layer.
2. OpenAI is the active AI provider.
3. Gemini is no longer required at runtime.
4. Gemini SDK dependency is removed.
5. Research works without Gemini.
6. Study works without Gemini.
7. Decision Intelligence works without Gemini.
8. Ask BILLBLI works through the new layer.
9. Ask Worker works through the new layer.
10. Work governance remains unchanged.
11. Human authorization remains distinct from AI recommendation.
12. No external execution is introduced.
13. Existing tests pass.
14. Production build passes.
15. Provider/model implementation details remain hidden from users.
16. BILLBLI remains the product abstraction users trust.

## 21. Architectural Principle

> OpenAI provides intelligence infrastructure. BILLBLI provides the product, intelligence experience, governance, workflow, and value.

BILLBLI must remain the abstraction users trust regardless of which underlying model or provider is selected.
