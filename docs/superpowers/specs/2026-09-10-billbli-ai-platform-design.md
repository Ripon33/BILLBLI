# BILLBLI AI Platform — Product, AI & UX Architecture

**Date:** 2026-09-10  
**Status:** Proposed — awaiting final review  
**Product:** BILLBLI

---

## 1. Product Vision

BILLBLI is a global AI intelligence and work platform that helps people
and organizations:

> Research deeper. Decide better. Turn decisions into controlled work.

BILLBLI is not positioned as an OpenAI application, Gemini application,
chatbot wrapper, or collection of unrelated AI tools.

OpenAI is a V1 AI infrastructure/provider. BILLBLI owns the product
experience, capability layer, routing, governance, user experience,
workflows, usage economics, and customer relationship.

The product is worldwide-first and must not be positioned around a
single country, market, language, or geography.

---

## 2. Core Product Loop

The fundamental BILLBLI experience is:

    Ask
      ↓
    Understand
      ↓
    Research
      ↓
    Analyze
      ↓
    Recommend
      ↓
    Decide
      ↓
    Work
      ↓
    Verify

Not every request uses every stage.

BILLBLI should determine the appropriate capability while keeping the
experience simple for the user.

---

## 3. AI Capability Layer

Application features must not call a provider directly.

Target architecture:

    BILLBLI Feature
          ↓
    AI Capability Layer
          ↓
    Capability Router
          ↓
    Provider Interface
          ↓
    OpenAI Provider (V1)
          ↓
    OpenAI API

Initial capability boundaries:

- text generation
- structured generation
- reasoning/analysis
- research synthesis

Future capability modules:

- knowledge/file intelligence
- image creation and editing
- audio/realtime interaction
- transcription
- advanced tools and integrations

The abstraction must remain provider-neutral even though only OpenAI is
implemented initially.

---

## 4. Provider Architecture

V1 implements:

    Provider Interface
          ↓
    OpenAI Provider

Features must not depend on OpenAI model IDs.

Internal model selection belongs to BILLBLI's model policy layer.

Future providers can be added without rewriting Research, Study,
Decisions, Workers, or other application features.

Provider credentials remain server-side.

API keys must never be exposed to browser clients.

---

## 5. BILLBLI Intelligence Modes

The user-facing quality selector is:

- Auto
- Fast
- Balanced
- Best Quality

Descriptions:

### Auto
BILLBLI chooses the appropriate intelligence level.

### Fast
Optimized for speed and everyday work.

### Balanced
Balances reasoning quality, speed, and cost.

### Best Quality
Uses the strongest appropriate reasoning available for important work.

The actual provider and model remain implementation details.

The user must not be required to understand model IDs, token pricing, or
provider-specific terminology.

---

## 6. OpenAI Capability Mapping

BILLBLI may use OpenAI capabilities where they naturally fit the product.

### Intelligence

Used for:

- reasoning
- analysis
- recommendations
- structured outputs
- multilingual work
- professional knowledge tasks

### Research

Potential capabilities:

- web search
- evidence gathering
- source analysis
- synthesis
- file search
- research reports

### Knowledge

Future capabilities:

- document understanding
- file search
- semantic retrieval
- private business knowledge
- knowledge-grounded answers

### Create

Future capabilities:

- image generation
- image editing
- marketing creatives
- product visuals
- social media assets
- advertising concepts

### Voice

Future capabilities:

- speech input
- realtime interaction
- transcription
- meeting intelligence
- voice-based BILLBLI interaction

### Safety

Where appropriate, moderation and safety capabilities may be integrated
into the BILLBLI AI layer.

### Tools

Future tool capabilities may include:

- function calling
- custom tools
- MCP integrations
- controlled external services

All tool execution remains subject to BILLBLI governance.

---

## 7. Ask BILLBLI

Ask BILLBLI is the signature BILLBLI interaction.

Conceptual flow:

    User
      ↓
    Ask BILLBLI
      ↓
    Intent classification
      ↓
    Capability routing
      ↓
    Research / Study / Decision / Work / Create / Knowledge
      ↓
    BILLBLI synthesis
      ↓
    Recommendation or result
      ↓
    Optional next action

Ask BILLBLI is an orchestration/context layer.

It must not become a second execution engine.

No separate V1 chat-memory subsystem is introduced.

No autonomous background worker activity is introduced.

---

## 8. AI Workforce

BILLBLI Workers are persistent specialized AI workers.

Initial worker types:

- HR Assistant
- Accountant
- Digital Marketer
- Sales Assistant
- Operations Manager
- Customer Support
- Research Analyst
- Custom Worker

Workers use the existing Work Engine.

Worker context can guide behavior but cannot override authority.

Worker flow:

    Ask Worker
       ↓
    Understand request
       ↓
    Research / Analyze / Recommend
       ↓
    Optional Work Proposal
       ↓
    Human Review/Edit
       ↓
    Explicit Create Work
       ↓
    Existing Work Engine

No automatic external execution is introduced by this architecture.

---

## 9. Governance

BILLBLI must preserve the distinction between:

- AI recommendation
- human decision
- human authorization
- execution
- verification

AI output does not constitute authorization.

The AI layer cannot grant itself authority.

Consequential decisions continue through the existing Decision &
Authorization Engine.

Work lifecycle semantics remain owned by the existing Work Engine.

No provider migration may silently change governance semantics.

---

## 10. Research → Decision → Work

Approved integration:

    Research Result
          ↓
    DecisionBox
          ↓
    Suggested Work
          ↓
    Human reviews/edits title + goal
          ↓
    Explicit Create Work
          ↓
    Existing /api/work
          ↓
    Existing Work Engine

AI may propose Work.

AI must not automatically create Work.

---

## 11. Premium UI/UX Direction

BILLBLI should have a premium, professional, eye-catching interface
without becoming visually noisy.

Design language:

- clean white/light foundation
- BILLBLI green primary accent
- deep charcoal typography
- restrained neutral palette
- subtle borders
- refined medium-radius surfaces
- minimal shadows
- fast subtle transitions
- strong typography hierarchy
- excellent spacing
- responsive layouts
- accessible interaction states

Avoid:

- excessive gradients
- excessive glassmorphism
- neon visual effects
- giant decorative cards
- unnecessary animations
- excessive shadows
- visual clutter

The product should feel like a serious professional AI operating
environment rather than a generic chatbot.

---

## 12. Primary Navigation

Target information architecture:

    BILLBLI

    HOME

    INTELLIGENCE
      Ask BILLBLI
      Research
      Study
      Decisions

    WORK
      AI Workforce
      Tasks
      History

    CREATE
      Create
      Knowledge
      Voice

    SETTINGS
      Settings
      Profile

Future capabilities should not appear as empty navigation destinations
before they are implemented.

The existing responsive sidebar/drawer behavior should be preserved and
refined.

---

## 13. Core Screens

### Home

Command center for starting work.

Primary interaction:

    What are you trying to accomplish?

Recent research, decisions, Workers, and Work should be accessible from
the Home experience.

### Ask BILLBLI

The most polished signature experience.

Progressive stages may include:

    Understanding
    Researching
    Analyzing
    Preparing recommendation
    Next step

### Research

Professional research workspace with:

- research input
- sources
- evidence
- findings
- synthesis
- recommendation
- suggested Work

### Study

Learning and understanding workspace.

Flow:

    Topic
      ↓
    Explanation
      ↓
    Examples
      ↓
    Questions
      ↓
    Assessment

### Decisions

Decision-support workspace showing:

- decision question
- options
- evidence
- trade-offs
- recommendation
- human decision requirement

### AI Workforce

Directory of specialized Workers.

Each Worker should communicate:

- worker identity
- purpose
- capabilities
- status
- autonomy
- authorization state

### Worker Workspace

Professional workspace for interacting with a specific Worker.

The UI must clearly communicate what the Worker can propose and what
requires human control.

### Tasks

Use the existing task functionality and preserve its current semantics.

### History

Use existing Research/Study history behavior and preserve localStorage
compatibility and migration behavior.

### Knowledge

Future private knowledge workspace.

### Create

Future creative workspace for image/content generation.

### Voice

Future realtime/audio workspace.

---

## 14. BILLBLI Result Language

Outputs should emphasize:

- finding
- evidence
- analysis
- recommendation
- confidence where appropriate
- next step
- human decision requirement

Example:

    BILLBLI RECOMMENDATION

    Focus on Option B

    Evidence
    ...

    Why
    ...

    Suggested next step
    Create a planning Work

    [ Review & Edit ]

The UI should distinguish AI-generated recommendations from decisions
made by the human.

---

## 15. Knowledge Architecture

Knowledge is a future capability.

Potential architecture:

    User Files
        ↓
    BILLBLI Knowledge Layer
        ↓
    Retrieval
        ↓
    AI Analysis
        ↓
    Answer / Insight / Decision

The architecture should avoid introducing an unnecessary independent
memory system in V1.

---

## 16. Create Architecture

Create is a future capability.

Potential flow:

    User Intent
        ↓
    BILLBLI Create
        ↓
    Image / Content Capability
        ↓
    Provider
        ↓
    Generated Asset
        ↓
    User Review
        ↓
    Save / Export

Creation must remain separate from consequential Work execution.

---

## 17. Voice Architecture

Future voice flow:

    Voice Input
        ↓
    BILLBLI Voice
        ↓
    Transcription / Realtime
        ↓
    Ask BILLBLI
        ↓
    Capability Router
        ↓
    Result
        ↓
    Optional Voice Response

Voice is an interface to BILLBLI, not a separate intelligence system.

---

## 18. Usage and Monetization

BILLBLI should eventually own its own:

- subscriptions
- plans
- credits
- usage ledger
- provider-cost accounting

Customers purchase BILLBLI services/credits, not OpenAI API access.

Provider costs remain internal operating costs.

The AI Capability Layer should expose enough internal usage metadata to
support future BILLBLI billing and credit accounting without coupling
the UI to provider pricing.

Payment-provider integration is outside the first AI migration slice,
but the architecture must remain provider-agnostic.

---

## 19. Security and Privacy

Requirements:

- server-side provider credentials
- authenticated ownership checks
- existing Supabase RLS preserved
- no client-side provider secrets
- no AI-generated authorization
- no uncontrolled external execution
- explicit human approval for governed actions
- clear separation of user data and provider infrastructure

---

## 20. Migration from Gemini

Gemini remains temporarily during migration.

Migration sequence:

1. Establish AI provider abstraction.
2. Implement OpenAI provider.
3. Migrate ai-json functionality.
4. Migrate Research.
5. Migrate Study.
6. Migrate Decision Intelligence.
7. Migrate Ask BILLBLI.
8. Migrate Ask Worker.
9. Audit creative/audio capabilities.
10. Run complete regression suite.
11. Verify production behavior.
12. Remove active Gemini dependencies.
13. Remove @google/genai only after no active consumers remain.

Historical backup files are not considered active application
dependencies and should not be rewritten merely to remove historical
references.

---

## 21. Testing Strategy

Every migration slice must follow:

    RED
      ↓
    Minimum implementation
      ↓
    GREEN
      ↓
    Regression
      ↓
    Commit

Tests must cover:

- provider contracts
- model-policy routing
- quality modes
- structured output
- error handling
- authentication
- authorization
- governance
- Research behavior
- Study behavior
- Decision behavior
- Ask BILLBLI routing
- Ask Worker behavior
- Work proposal behavior

Existing Work Engine and Decision & Authorization semantics must remain
regression-tested.

---

## 22. Deployment Strategy

No large uncontrolled migration.

Each capability migration should:

1. pass focused tests
2. pass full regression
3. pass production build
4. commit independently
5. push
6. deploy
7. verify production behavior
8. only then proceed to the next capability

Environment configuration should be documented before production
migration.

Required V1 provider secret:

    OPENAI_API_KEY

It must only exist in secure server-side environments.

---

## 23. Non-Goals

The following are explicitly outside V1:

- autonomous background Workers
- unrestricted external execution
- automatic Work creation
- replacing the Work Engine
- replacing the Decision & Authorization Engine
- exposing provider/model IDs to users
- selling OpenAI API access
- building a separate V1 memory/chat subsystem
- implementing every OpenAI capability immediately
- country-specific product positioning
- replacing working functionality merely for cosmetic reasons

---

## 24. Success Criteria

The architecture is successful when:

1. BILLBLI can use OpenAI through a provider-neutral internal layer.
2. Application features no longer need direct provider knowledge.
3. Users experience BILLBLI rather than a visible underlying provider.
4. Auto/Fast/Balanced/Best Quality work consistently.
5. Research, Study, Decisions, Ask BILLBLI and Workers share one
   intelligence architecture.
6. Existing governance remains intact.
7. Research can propose controlled Work without automatic creation.
8. Existing Work Engine semantics remain unchanged.
9. The UI presents one coherent premium BILLBLI experience.
10. Future Knowledge, Create, Voice, and tools can be added without
    restructuring the core AI layer.
11. Gemini can eventually be removed cleanly after all active consumers
    are migrated.
12. The architecture supports BILLBLI's future independent usage and
    monetization layer.

---

## 25. Architectural Principle

The most important rule is:

> OpenAI provides intelligence infrastructure.
> BILLBLI provides the product, intelligence experience, governance,
> workflow, and value.

BILLBLI should remain the abstraction users trust regardless of which
underlying model or provider is selected.
