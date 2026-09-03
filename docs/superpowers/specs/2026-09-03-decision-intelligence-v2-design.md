# BILLBLI Decision Intelligence v2 — Design Specification

## 1. Purpose

BILLBLI v2 upgrades the existing research workflow from source-backed AI analysis into a structured decision-intelligence system.

The core principle is:

> Source ≠ Evidence ≠ Claim ≠ Decision

BILLBLI should not simply collect sources and ask an AI model for an answer. It should transform researched information into traceable evidence, evaluate claims, score decision factors, and produce a transparent recommendation.

The existing research and source-intelligence system remains the foundation. v2 extends it rather than replacing it.

---

## 2. Current System Baseline

The current system performs:

1. User question intake.
2. Multi-angle Tavily research.
3. Source URL normalization and deduplication.
4. Source relevance scoring.
5. Source authority scoring.
6. Source directness scoring.
7. Evidence scoring.
8. Weak-source filtering.
9. Domain diversity control.
10. Selection of up to 12 sources.
11. OpenAI as the primary reasoning provider.
12. Gemini as fallback reasoning provider.
13. Structured analysis returned to the DecisionBox.
14. Recent research history in the workspace UI.

v2 must preserve this working foundation.

---

## 3. Target Architecture

```text
USER QUESTION
      ↓
QUESTION DECOMPOSITION
      ↓
RESEARCH PLAN
      ↓
MULTI-ANGLE SEARCH
      ↓
SOURCE INTELLIGENCE
  authority
  relevance
  directness
  freshness
  evidence quality
      ↓
CLAIM EXTRACTION
  Fact
  Inference
  Forecast
  Opinion
      ↓
EVIDENCE MATRIX
  Demand
  Economics
  Feasibility
  Competition
  Risk
  Regulation
      ↓
DECISION SCORING
      ↓
DECISION ENGINE
      ↓
VALIDATION
      ↓
DECISION OBJECT
      ↓
BILLBLI WORKSPACE
---

## 4. Core Data Contract

The conceptual research object is:

```text
research
├── question
├── decision
│   ├── recommendation
│   ├── score
│   ├── confidence
│   └── rationale
├── decision_factors[]
│   ├── name
│   ├── score
│   ├── weight
│   ├── evidence_strength
│   └── explanation
├── claims[]
│   ├── statement
│   ├── type
│   ├── confidence
│   └── evidence_ids[]
├── evidence[]
│   ├── id
│   ├── source_id
│   ├── claim
│   ├── polarity
│   ├── strength
│   └── verification
├── alternatives[]
│   ├── option
│   ├── score
│   ├── strengths[]
│   └── weaknesses[]
├── risks[]
├── assumptions[]
├── conflicts[]
├── reassessment_triggers[]
└── sources[]
---

## 5. Source, Evidence, Claim, Decision

### Source

A source is an external information location.

Examples include government publications, regulators, academic research, company filings, technical documentation, and established reporting.

Sources retain:

- URL
- title
- authority
- relevance
- directness
- evidence score
- authority type

### Evidence

Evidence is information extracted from a source that supports or challenges a claim.

Evidence must reference its originating source.

Evidence contains:

- unique ID
- source ID
- claim/evidence statement
- polarity
- strength
- verification classification

### Claim

A claim is a meaningful statement used by the reasoning system.

Claim types:

- fact
- inference
- forecast
- opinion

Claims reference the evidence IDs supporting them.

### Decision

A decision is the final recommendation generated from evaluated claims and decision factors.

A decision must remain distinct from individual sources, evidence items, and claims.
---

## 6. Evidence Classification

The system should distinguish:

| Type | Meaning |
|---|---|
| Verified fact | Directly supported by strong evidence |
| Multiple-source evidence | Corroborated by independent sources |
| Single-source evidence | Primarily supported by one source |
| Forecast | Forward-looking estimate or projection |
| Inference | Reasoning derived from evidence |
| Opinion | Subjective interpretation |
| Unverified claim | Insufficiently verified |

Forecasts, inferences, and opinions must not be presented as verified facts.
---

## 7. Decision Factors

Default factors:

| Factor | Weight |
|---|---:|
| Market / Demand | 25% |
| Economics / ROI | 20% |
| Feasibility | 15% |
| Competition | 10% |
| Risk | 15% |
| Regulation / Constraints | 15% |

Weights must total 100%.

Each factor contains:

- score
- weight
- evidence strength
- explanation
- supporting evidence IDs
- opposing evidence IDs when applicable

The system should support question-specific factor sets in the future.
---

## 8. Decision Score

The decision score is a normalized 0–100 weighted score:

```text
Decision Score =
Σ(Factor Score × (Factor Weight / 100))
---

## 9. Evidence Weighting

Evidence quality should be calculated from normalized component scores:

```text
Normalized Authority
× Normalized Relevance
× Normalized Directness
× Normalized Freshness
× Normalized Corroboration
---

## 10. Conflict Detection

Materially conflicting evidence must be represented explicitly.

Example:

```text
Source A → supports claim
Source B → contradicts claim
---

## 11. Decision States

The engine supports four primary decision states.

### Strong recommendation

Evidence is sufficiently strong, relevant, and consistent to support a clear recommendation.

### Directional recommendation

Evidence supports a direction, but meaningful uncertainty remains.

### Contested decision

Material evidence conflicts and the conflict cannot be confidently resolved.

### Insufficient evidence

Available evidence is too weak, sparse, irrelevant, or contradictory to support a responsible recommendation.

The system must never manufacture certainty simply because an AI model can produce confident language.

Decision state must be determined from evidence quality, conflict status, and decision confidence.

A lower-confidence result is preferable to an unsupported strong recommendation.
---

## 12. Decision Engine Rules

The decision engine converts evaluated evidence and decision factors into a transparent recommendation.

The engine must follow these rules:

1. Calculate each decision factor score independently.
2. Apply the factor weight to each factor.
3. Calculate the overall Decision Score.
4. Calculate Evidence Strength separately.
5. Evaluate material conflicts.
6. Determine the appropriate Decision State.
7. Generate the recommendation from the structured evidence and scores.
8. Preserve uncertainty when evidence is incomplete.
9. Never treat unsupported model-generated claims as evidence.
10. Never allow a single weak source to determine the recommendation.

### Recommendation Rules

A recommendation should include:

- recommended direction
- Decision Score
- Evidence Strength
- Confidence
- primary rationale
- strongest supporting evidence
- strongest opposing evidence
- major risks
- assumptions
- what would change the decision

### Evidence Guardrail

If the evidence does not support a reliable recommendation, the engine must return:

```text
INSUFFICIENT EVIDENCE
---

## 13. Validation

The validation layer checks the structured decision before it is returned to the BILLBLI workspace.

Validation must verify:

- required decision fields exist
- Decision Score is within 0–100
- factor weights total 100%
- factor scores are within valid bounds
- Evidence Strength is within 0–100
- Confidence is within 0–100
- every material claim references evidence
- every evidence item references a source
- source IDs are valid
- decision state is consistent with evidence quality
- material conflicts are represented
- recommendation does not contradict the structured decision state

### Validation Failure

If validation fails, the system must not present the result as a reliable decision.

The system should return a structured validation error and preserve enough information for debugging.

### Safety Principle

Validation is responsible for enforcing the research structure.

The reasoning model must not be allowed to bypass structural validation simply because it produces a plausible narrative.
---

## 14. Decision Object

The final decision must be returned as a structured object rather than an unstructured narrative.

The decision object should contain:

```text
decision
├── recommendation
├── state
├── score
├── evidence_strength
├── confidence
└── rationale

decision_factors[]
├── name
├── score
├── weight
├── evidence_strength
├── explanation
├── supporting_evidence_ids[]
└── opposing_evidence_ids[]

claims[]
├── id
├── statement
├── type
├── confidence
└── evidence_ids[]

evidence[]
├── id
├── source_id
├── claim
├── polarity
├── strength
└── verification

alternatives[]
├── option
├── score
├── strengths[]
└── weaknesses[]

risks[]
assumptions[]
conflicts[]
reassessment_triggers[]
sources[]
---

## 15. BILLBLI Workspace Integration

The existing BILLBLI workspace should consume the structured Decision Object rather than rendering raw model output.

The workspace should present the decision in a clear research-terminal interface.

### Primary Decision View

The primary view should expose:

- recommendation
- Decision State
- Decision Score
- Evidence Strength
- Confidence
- executive rationale

### Decision Factors

Each factor should expose:

- factor name
- score
- weight
- evidence strength
- explanation
- supporting evidence
- opposing evidence

### Evidence and Claims

The workspace should allow the user to trace:

```text
Decision
→ Factor
→ Claim
→ Evidence
→ Source