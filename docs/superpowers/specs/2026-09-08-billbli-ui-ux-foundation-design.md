# BILLBLI UI/UX Foundation Design

**Status:** Approved  
**Date:** 2026-09-08

## 1. Purpose

The BILLBLI UI/UX Foundation establishes a consistent, professional, responsive,
accessible product experience across the public landing page and authenticated
workspace.

The interface must communicate the BILLBLI product model:

> BILLBLI — AI that does the work.

The UI should make BILLBLI feel like a working AI system rather than a generic
AI chatbot or analytics dashboard.

Core experience:

> Research deeper. Decide better.

Human boundary:

> BILLBLI works for you. It does not decide for you.

---

## 2. Product Experience Principles

### 2.1 Command-first

The primary interaction is:

> Ask BILLBLI anything

Users should be able to start meaningful work from the command composer rather
than navigating through complicated forms.

### 2.2 Work-first

The authenticated workspace prioritizes:

1. Ask BILLBLI
2. Active Work
3. Needs Your Attention
4. Recent Work

The workspace must not become a generic dashboard dominated by decorative
statistics.

### 2.3 Decision-aware

The interface must clearly distinguish:

- AI recommendation
- Human decision required
- Human decision
- Human authorization
- Executed action
- Verification
- Final result

BILLBLI must never visually imply that an AI recommendation is itself a
human-approved decision.

### 2.4 Calm and professional

The visual language should feel:

- modern
- premium
- trustworthy
- spacious
- focused
- efficient

Avoid unnecessary visual complexity.

---

# 3. Visual Direction

## 3.1 Primary direction

The approved visual direction is:

**Option A — Minimal White / Light Product**

### Canvas

- White and soft-gray surfaces
- Near-black charcoal primary text
- Subtle secondary text
- BILLBLI green as the signature accent
- Thin, restrained borders
- Minimal shadows

### Typography

Use a modern, highly readable sans-serif.

Typography hierarchy must be clear without excessive font-size variation.

### Icons

Use simple line-based icons.

Icons should support navigation and comprehension rather than become
decorative elements.

### Motion

Use subtle, purposeful transitions.

Motion must never interfere with task completion.

Avoid:

- excessive gradients
- glassmorphism
- neon effects
- decorative animation
- excessive shadows
- unnecessary analytics visuals

---

# 4. Global Application Shell

Authenticated pages use a shared application shell.

Desktop structure:

    ┌──────────────────────────────────────────────────────┐
    │ BILLBLI                     Search Help Profile      │
    ├────────────────┬─────────────────────────────────────┤
    │                │                                     │
    │ Navigation     │           Main Workspace            │
    │                │                                     │
    │ Home           │                                     │
    │ Research       │                                     │
    │ Study          │                                     │
    │ Decisions      │                                     │
    │ Tasks          │                                     │
    │ History        │                                     │
    │                │                                     │
    │ ─────────────  │                                     │
    │ Settings       │                                     │
    │ Profile        │                                     │
    └────────────────┴─────────────────────────────────────┘

The shell should remain visually quiet so the active work receives priority.

---

# 5. Navigation

## 5.1 Hybrid sidebar

Navigation uses a hybrid sidebar.

### Expanded state

- BILLBLI branding
- Home
- Research
- Study
- Decisions
- Tasks
- History
- Settings
- Profile

### Collapsed state

Navigation becomes icon-only.

Tooltips identify icons when collapsed.

### Persistence

The user's expanded/collapsed preference persists across sessions.

### Desktop

Expanded by default.

### Tablet

The sidebar adapts according to available space.

### Mobile

Navigation becomes a drawer.

The main workspace receives priority.

---

# 6. Global Ask BILLBLI Composer

The Ask BILLBLI composer is the signature interaction of the product.

## 6.1 Home presentation

The home/landing experience uses a prominent composer.

Conceptual structure:

    ┌─────────────────────────────────────────────┐
    │ Ask BILLBLI anything...                    │
    │                                             │
    │ +  Research  Think  Study  Decision     ↑  │
    └─────────────────────────────────────────────┘

Supported contextual controls include:

- Add/context
- Research
- Think
- Study
- Decision
- Voice
- Send

Controls may adapt based on the user's request.

The implementation must remain BILLBLI-specific and must not copy any
reference design literally.

## 6.2 Contextual composer

Inside product pages, the composer becomes smaller and contextual.

Examples:

Research:

> Ask BILLBLI about this research...

Study:

> What would you like to understand?

Decision:

> Ask BILLBLI to analyze this decision...

The global entry point remains available throughout the product.

---

# 7. Landing Page

The landing page should communicate the product model quickly.

Primary messaging:

> Research deeper. Decide better.

Supporting positioning:

> AI that does the work.

The experience should visually communicate:

> Research → Reason → Plan → Work → Verify

The human boundary should be visible:

> BILLBLI works for you. It does not decide for you.

The landing page and authenticated workspace must feel like the same product.

---

# 8. Workspace

The workspace is command-first and work-first.

Priority order:

1. Ask BILLBLI
2. Active Work
3. Needs Your Attention
4. Recent Work

## 8.1 Active Work

Show meaningful ongoing work.

Work cards should communicate:

- work title
- current state
- progress where applicable
- task count where useful
- recent update
- next action

## 8.2 Needs Your Attention

This area surfaces:

- human decisions
- authorization requests
- blocked work
- failures requiring action
- other consequential user actions

## 8.3 Recent Work

Chronological recent work provides continuity without turning the page into
an analytics dashboard.

---

# 9. Product Page Architecture

BILLBLI product areas are connected parts of one work lifecycle.

The primary flow is:

> Ask BILLBLI
> → Research
> → Findings
> → Decision Brief
> → Decision
> → Tasks
> → Execution
> → Verification
> → History

## 9.1 Research

Research experience:

> Request → Sources → Evidence → Synthesis → Decision Brief

The UI should make evidence and synthesis understandable.

## 9.2 Study

Study is educational and question-driven.

The entry experience should ask:

> What would you like to understand?

## 9.3 Decisions

Decision Center surfaces:

- Needs your attention
- Recommendations
- Human decision required
- Previous decisions

AI recommendations must remain visibly distinct from human decisions.

## 9.4 Tasks

Tasks communicate execution state:

- queued
- working
- waiting
- completed
- failed
- blocked

Results and verification should be visible where appropriate.

## 9.5 History

History provides:

- chronological work
- search
- filters
- accessible previous activity

---

# 10. Component Foundation

## 10.1 Buttons

Use a small, consistent button system.

### Primary

For the primary action.

### Secondary

For supporting actions.

### Quiet

For low-emphasis actions such as cancel.

### Destructive

For irreversible or destructive actions.

Do not introduce unnecessary button variants.

---

# 11. Status System

Status must communicate state through icon + text and not color alone.

Core states:

- Working
- Waiting
- Needs your decision
- Needs approval
- Completed
- Failed
- Blocked

Status presentation should be consistent across Work, Decisions, Tasks and
related surfaces.

---

# 12. Cards

Cards are used only when grouping improves comprehension.

Cards should prioritize:

- clear title
- state
- useful metadata
- progress where applicable
- next action

Avoid large collections of decorative cards.

---

# 13. Empty States

Empty states should guide the user toward the next useful action.

Example:

> No research yet
>
> Start with a question or objective.

Provide an appropriate Ask BILLBLI or primary action.

Empty states must not feel like dead ends.

---

# 14. Loading States

Loading states should communicate meaningful progress where possible.

Example:

> Researching...
>
> ✓ Understanding your objective  
> ● Gathering evidence  
> ○ Comparing findings  
> ○ Preparing synthesis

Avoid unexplained endless spinners for meaningful multi-step work.

---

# 15. Error States

Errors must use human-readable language.

Preferred pattern:

> Something went wrong
>
> BILLBLI couldn't complete this step.
>
> [ Try again ]

Technical information may be exposed separately when useful for debugging,
but must not replace the user-facing explanation.

---

# 16. Decision UX

Decision UI must follow the Decision & Authorization Engine semantics.

## Recommendation

Example:

> BILLBLI recommends
>
> Option B
>
> Based on:
> - Evidence A
> - Evidence B
> - Evidence C

The UI must clearly identify this as an AI recommendation.

## Human decision

Example:

> Your decision
>
> [ Choose Option A ]
> [ Choose Option B ]

The user makes the decision.

## Authorization

Authorization is separate:

> Decision  
> ✓ Option B selected
>
> Authorization  
> Pending
>
> [ Approve ] [ Reject ]

After authorization:

> Authorization  
> ✓ Authorized
>
> Execution  
> Ready

The UI must not merge recommendation, decision, authorization and execution
into one state.

---

# 17. Responsive Foundation

The product is mobile-first.

Responsive behavior must preserve the same product model across:

- desktop
- tablet
- mobile

## 17.1 Desktop

Use the hybrid sidebar and provide enough horizontal space for work-focused
layouts.

## 17.2 Tablet

Adapt navigation and content density rather than simply shrinking desktop
layouts.

## 17.3 Mobile

Use:

- mobile header
- hamburger navigation
- drawer navigation
- full-width composer
- one-column work cards
- touch-friendly controls
- vertically prioritized content

Avoid horizontal scrolling wherever reasonably possible.

The mobile experience must be intentionally designed rather than being a
desktop layout squeezed into a smaller viewport.

---

# 18. Accessibility

Accessibility is a core foundation requirement.

The implementation must provide:

- semantic HTML
- keyboard navigation
- visible focus states
- accessible form labels
- screen-reader-friendly navigation
- sufficient text contrast
- appropriate ARIA labels
- reduced-motion support
- non-color-only state communication
- correct disabled states
- correct loading states

Interactive elements must remain usable with keyboard and touch input.

---

# 19. Interaction Rules

The UI should make the next useful action obvious.

General priority:

1. Understand what BILLBLI is doing
2. Understand what requires the user
3. Take the appropriate action
4. Inspect results
5. Continue work

Avoid forcing users to navigate unnecessarily between related states.

---

# 20. Security and Human Boundary Presentation

UI must reflect the underlying authorization architecture.

The interface must never:

- present AI recommendations as human decisions
- imply authorization when only recommendation exists
- allow client-visible state to imply execution authority
- hide a required human decision
- suggest that capability automatically means authorization

When a consequential action requires a human decision, the UI must clearly
communicate that BILLBLI is waiting for the user.

---

# 21. Local Storage and Existing History

The UI foundation must not alter existing localStorage history behavior.

Authenticated product activity remains subject to the existing authenticated
ownership architecture.

No automatic migration of existing localStorage history is introduced by the
UI foundation.

---

# 22. Performance

The UI should prioritize:

- fast initial rendering
- minimal unnecessary client-side work
- lightweight visual effects
- responsive interaction
- predictable loading behavior

Visual polish must not come at the expense of product responsiveness.

---

# 23. Verification Requirements

Before UI Foundation implementation is considered complete, verify:

### Desktop

- Landing
- Workspace
- Navigation
- Ask BILLBLI composer
- Research
- Study
- Decisions
- Tasks
- History

### Tablet

- Sidebar adaptation
- Composer
- Cards
- Forms
- Content density

### Mobile

- Navigation drawer
- Composer
- Work cards
- Decision actions
- Forms
- No unintended horizontal overflow

### Accessibility

- Keyboard navigation
- Focus states
- Form labels
- Status semantics
- Reduced motion
- Color-independent state communication

### Regression

Existing:

- Authentication
- Research
- Work Engine
- Decision & Authorization Engine

must continue to pass their existing tests.

---

# 24. Out of Scope

This UI Foundation does not introduce:

- new AI capabilities
- new Work Engine behavior
- new authorization rules
- external tool execution
- HR workflows
- financial workflows
- legal workflows
- medical workflows
- team collaboration
- advanced analytics dashboards
- unrestricted autonomous execution

The foundation changes presentation and interaction architecture without
changing the underlying safety model.

---

# 25. Success Criteria

The BILLBLI UI/UX Foundation is successful when:

1. BILLBLI feels like one coherent product across landing and workspace.
2. Users can start work immediately through Ask BILLBLI.
3. Active work receives more visual priority than decorative information.
4. Navigation is predictable and persistent.
5. Research, Study, Decisions, Tasks and History feel connected.
6. Human decisions and authorization states are unmistakable.
7. The product works naturally on desktop, tablet and mobile.
8. Accessibility is built into the component foundation.
9. Existing functionality and safety boundaries remain intact.
10. The interface feels minimal, professional, modern and trustworthy.

---

# 26. Core Product UX Statement

> BILLBLI does the work.
>
> You make the decisions.
