# Sentinel AI — Architecture Decision Records

> **Document Class:** Architecture Decision Record (ADR) Register
> **Audience:** Engineering, Architecture
> **Status:** Accepted — Version 1.0
> **Last Updated:** 2026-07-03
> **Parent Documents:** [00_MASTER_CONTEXT.md](./00_MASTER_CONTEXT.md) · [01_PROJECT_VISION.md](./01_PROJECT_VISION.md)

This document is the constitutional source of truth for all technical implementation decisions made in Sentinel AI. Every decision below is **Accepted** and binding. Changes require a superseding ADR, not an in-place edit.

---

## ADR-001 — Event-Driven Architecture

**Status:** Accepted  
**Date:** 2026-07-03

### Context

Sentinel AI operates a continuous Monitor → Detect → Investigate → Plan → Execute → Record → Improve loop. Agents are specialized and independently owned. The system must support concurrent processing, partial failures, and future horizontal scale. A synchronous, request-response coupling between agents would introduce tight temporal coupling, single-threaded bottlenecks, and cascading failure modes.

### Decision

Sentinel AI adopts an **event-driven architecture** as its inter-agent communication backbone. All significant state changes and agent outputs are published as discrete, typed business events on a shared event bus. Agents subscribe to event types relevant to their function; they do not call other agents directly.

### Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Direct REST/RPC calls between agents | Creates temporal coupling; caller must wait; cascading failures propagate synchronously |
| Shared database polling | High latency; creates coupling through schema; unscalable polling overhead |
| Synchronous LangGraph node chaining only | Adequate for the workflow graph but insufficient for cross-system and cross-boundary signalling |

### Consequences

#### Positive Effects
- Agents are temporally decoupled: producer and consumer operate independently.
- New consumers can be added without modifying producers.
- Failed consumers can replay from the event log without data loss.
- The event log provides an auditable, ordered history of every system state change.

#### Trade-offs
- Eventual consistency rather than immediate consistency between agent states.
- Debugging event-driven systems requires distributed tracing tooling.
- Schema governance for events requires discipline (see ADR-009).

### Future Review Criteria

Review if event throughput exceeds the capacity of the chosen broker, or if operational complexity of an event bus outweighs its benefits during the hackathon phase where a single-process graph may be sufficient.

---

## ADR-002 — Five-Layer Architecture

**Status:** Accepted  
**Date:** 2026-07-03

### Context

The system must cleanly separate concerns across five distinct responsibilities: data ingestion, business event processing, AI agent orchestration, external system integration, and operator-facing presentation. Without explicit layer boundaries, agents will accumulate responsibilities, integration code will bleed into orchestration logic, and the system will become unmaintainable.

### Decision

Sentinel AI is structured into **five architectural layers**, each with a single, bounded responsibility:

| Layer | Responsibility |
|---|---|
| **1. Data Ingestion Layer** | Ingest, normalize, and emit raw operational data as structured events |
| **2. Event Processing Layer** | Route, filter, and transform business events; enforce the Standard Business Event Schema |
| **3. Agent Orchestration Layer** | Host and execute the LangGraph workflow; manage agent state and transitions |
| **4. Integration Layer** | Translate agent actions into calls against external business systems; enforce idempotency |
| **5. Presentation Layer** | Surface operator-facing views: anomaly alerts, execution plans, approval interface, audit log |

Each layer communicates with adjacent layers only through defined contracts. No layer skips a layer to access a non-adjacent one.

### Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Flat microservice mesh | No enforcement of directional dependency; circular calls are possible |
| Three-layer (ingest / process / present) | Collapses orchestration and integration; creates an unmanageable agent layer |
| Monolithic single-process, no layers | Violates separation of concerns; cannot scale or test independently |

### Consequences

#### Positive Effects
- Each layer can be independently tested, deployed, and scaled.
- Layer boundaries make onboarding straightforward: contributors know exactly where a change belongs.
- Integration changes (new ERP connector) do not touch orchestration logic.

#### Trade-offs
- Inter-layer contracts must be maintained; schema drift between layers requires coordinated migration.
- Initial scaffolding investment before any business logic is visible.

### Future Review Criteria

Review if a new domain requires a fundamentally different data flow that cannot be expressed within the five layers without force-fitting.

---

## ADR-003 — Warehouse Operations as Initial Domain

**Status:** Accepted  
**Date:** 2026-07-03

### Context

The system must demonstrate a complete autonomous execution cycle within the 48-hour hackathon constraint. Multiple business domains were evaluated. A domain was needed that produces structured, measurable data; has well-defined anomaly classes; has bounded, auditable corrective actions; and whose business value is immediately legible to a non-technical evaluator.

### Decision

**Warehouse / Inventory Operations** is the exclusive domain for the hackathon MVP. All agents, data models, simulated data, and integration surfaces are scoped to inventory events, SKU-level baselines, stock transaction anomalies, and inventory corrective actions.

### Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Sales performance monitoring | Less structured data; anomaly definitions are more ambiguous; corrective actions span external channels |
| Manufacturing / production monitoring | Higher domain complexity; equipment telemetry integration out of scope |
| Logistics / supply chain | Relevant as evidence in investigation, but execution actions require third-party systems |
| Finance / P&L monitoring | Abstract, delayed signals; not demonstrable within 48 hours |

### Consequences

#### Positive Effects
- Full agent specialization within one well-understood domain.
- Realistic simulated data can be seeded with high fidelity.
- Evaluators from any operational background immediately understand the problem and the solution.

#### Trade-offs
- Architecture must be intentionally domain-agnostic at its core so that future domains (ADR-002 Layer 1–3) do not require structural rework.
- Domain-specific terminology must not leak into shared schemas or orchestration logic.

### Future Review Criteria

Review when beginning Horizon 1 domain expansion (sales, production). If adding a new domain requires changes to the orchestration layer, the domain abstraction boundary has been violated and must be corrected.

---

## ADR-004 — Business Case as Core Business Object

**Status:** Accepted  
**Date:** 2026-07-03

### Context

The execution loop spans seven agents and multiple state transitions. A persistent, shared state object is required to carry the full context of a detected anomaly through the complete lifecycle: from first detection to final audit record. Without a shared object, each agent would pass only a subset of prior context, losing evidence chains and creating audit gaps.

### Decision

A **Business Case** is the core business object of Sentinel AI. Every detected anomaly instantiates a Business Case. The Business Case is the single unit of work that traverses the entire execution pipeline.

A Business Case contains:

| Field Group | Contents |
|---|---|
| **Identity** | Case ID, domain, created timestamp, status |
| **Detection Record** | Anomaly type, severity, affected entities, detection timestamp, baseline delta |
| **Investigation Record** | Root cause hypothesis, confidence score, evidence chain, investigator agent version |
| **Execution Plan** | Ordered list of proposed actions, expected outcomes, risk levels, required approval tier |
| **Approval Record** | Approver identity, decision, timestamp, optional rejection reason |
| **Execution Record** | Per-action execution status, timestamps, system responses, idempotency keys |
| **Audit Record** | Immutable, append-only log of every state transition in the case lifecycle |

The Business Case is immutable at the field level; new information is appended, not overwritten (consistent with ADR-001 event-driven append and Master Context §8.4).

### Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Passing agent outputs as separate message payloads | Prior context is lost at each hop; no single retrievable unit of work |
| Storing state in each agent independently | No coherent view of a case; audit reconstruction requires querying multiple stores |
| LangGraph state dict only | Sufficient for in-process workflow but not for persistence, audit, or cross-service access |

### Consequences

#### Positive Effects
- Any agent can access the full prior context of a case without cross-agent calls.
- A single query retrieves the complete lifecycle of any operational incident.
- The audit requirement (Master Context §8.4) is satisfied by design.

#### Trade-offs
- Business Case schema must be versioned carefully; breaking changes affect every agent.
- Large evidence chains may produce heavy objects; storage strategy must account for this.

### Future Review Criteria

Review if Business Case objects consistently exceed acceptable size thresholds, indicating that evidence chains should be stored as references rather than inline.

---

## ADR-005 — Execution Orchestrator Pattern

**Status:** Accepted  
**Date:** 2026-07-03

### Context

Multiple agents must execute in a defined order with conditional branching (e.g., human rejection routes back to re-planning; execution failure triggers a rollback path). Without a dedicated orchestrator, coordination logic disperses into individual agents, creating a distributed coordination problem that is difficult to reason about, test, and modify.

### Decision

An **Execution Orchestrator** is the single component responsible for advancing a Business Case through its lifecycle stages. The orchestrator holds the state machine for a Business Case, decides which agent to invoke at each step, passes Business Case context to each agent, and processes agent outputs to determine the next transition.

The orchestrator is implemented as a LangGraph workflow (see ADR-006). It does not contain business logic — it contains only routing logic. Business logic lives within the agents it invokes.

### Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Choreography-only (agents trigger the next agent via events) | Coordination logic is implicit and distributed; lifecycle is difficult to inspect or modify |
| Separate orchestration service per domain | Premature decomposition; one domain in MVP; operational overhead unjustified |
| Human-in-the-loop polling without an orchestrator | No durable state machine; approval events are lost if the process restarts |

### Consequences

#### Positive Effects
- The full lifecycle of a Business Case is visible in a single place.
- Adding a new step (e.g., a second-level approval) requires a change in one component.
- Failure recovery is deterministic: the orchestrator knows the last confirmed state.

#### Trade-offs
- The orchestrator is a single point of coordination; its availability affects all active cases.
- Routing logic must remain free of business logic; discipline required to maintain this boundary.

### Future Review Criteria

Review if concurrent case volume requires parallel orchestrator instances. At that point, orchestrator state must be fully externalized and distributed coordination primitives introduced.

---

## ADR-006 — Single LangGraph Workflow

**Status:** Accepted  
**Date:** 2026-07-03

### Context

The orchestrator (ADR-005) requires a durable, inspectable state machine capable of conditional branching, human-in-the-loop interruption, and state persistence across async boundaries. The chosen solution must support: graph-based workflow definition, first-class human approval checkpoints, persistent state, and Python-native agent integration.

### Decision

The Execution Orchestrator is implemented as a **single LangGraph workflow**. The workflow graph models the Business Case lifecycle as a directed graph of nodes (agents) and edges (transitions). The human approval step is implemented as a LangGraph interrupt node, suspending graph execution until the operator decision event is received.

Nodes in the graph correspond directly to agents: Monitor, Detect, Investigate, Plan, Approve (interrupt), Execute, Record, Improve.

### Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Custom state machine (hand-rolled) | More development time; no built-in persistence or interrupt support |
| Prefect / Airflow | Batch-oriented; not designed for sub-minute, real-time agent workflows |
| Temporal | Production-grade; operational complexity exceeds hackathon constraints |
| Multiple LangGraph workflows (one per agent) | Unnecessary decomposition; single coherent workflow is more transparent |

### Consequences

#### Positive Effects
- Graph structure directly mirrors the documented execution loop.
- LangGraph built-in interrupt mechanism satisfies the human approval requirement without custom polling.
- State is persisted by LangGraph checkpointer; workflow survives process restarts.
- The graph is introspectable: the current node of any active case is always known.

#### Trade-offs
- LangGraph is a dependency with its own release cycle; breaking changes require workflow migration.
- Single workflow graph means all agents share the same graph schema; changes require graph-level testing.

### Future Review Criteria

Review if the workflow graph grows beyond ~15 nodes, at which point decomposing into sub-graphs becomes appropriate. Also review if concurrent case volume exposes LangGraph checkpointer throughput limits.

---

## ADR-007 — Stateless Capabilities

**Status:** Accepted  
**Date:** 2026-07-03

### Context

Master Context §8.5 mandates horizontal scalability as a constraint. Agents that hold in-process state cannot be horizontally scaled without session affinity, which reintroduces single-instance constraints. Individual agent capabilities must be independently scalable.

### Decision

All agent **capabilities** — the units of work that individual agents perform — are **stateless**. A capability receives its full required context in its input, performs its function, and returns its output. It does not retain state between invocations. All state lives in the Business Case object (ADR-004), managed by the orchestrator (ADR-005).

This covers: LLM inference calls, tool executions (inventory queries, supplier lookups), anomaly scoring functions, and plan generation steps — all are pure functions over their inputs.

### Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Stateful agent objects with in-memory cache | Prevents horizontal scaling; state lost on restart |
| Agent-local databases | Creates per-agent data silos; violates single source of truth for Business Case |
| Shared in-memory store (Redis as a shortcut) | Introduces distributed cache invalidation complexity prematurely |

### Consequences

#### Positive Effects
- Any capability instance can handle any request without warm-up or session setup.
- Horizontal scaling is additive: add instances without routing logic.
- Capability testing is straightforward: given input X, output Y is deterministic.

#### Trade-offs
- Capabilities that require repeated context must carry that context in their input, increasing payload size.
- Caching opportunities must be implemented as explicit, external caches — not implicit instance state.

### Future Review Criteria

Review if capability input payloads grow large enough to introduce meaningful latency overhead. At that point, a context reference pattern (capability receives a case ID and fetches only what it needs) should replace full-context injection.

---

## ADR-008 — Human Approval Gateway

**Status:** Accepted  
**Date:** 2026-07-03

### Context

Master Context §6.3 establishes that humans are the final authority on policy and that every corrective action requires human approval before execution. The system must implement a hard gateway between plan generation and execution that cannot be bypassed by any agent or configuration.

### Decision

A **Human Approval Gateway** is a mandatory, non-skippable node in the LangGraph workflow positioned between the Plan Agent and the Execute Agent. The workflow halts at this node and cannot advance to execution by any programmatic path. Advancement requires an explicit operator decision event (approve or reject) delivered through the operator interface.

Properties of the gateway:
- **Durable:** If the process restarts, the workflow resumes at the gateway, not before or after.
- **Audited:** The approval event (approver, decision, timestamp, optional comment) is written to the Business Case audit record before execution begins.
- **Rejection-routed:** A rejection returns the workflow to the Plan Agent with the rejection reason as input for re-planning, or closes the case as rejected if re-planning is declined.
- **Non-configurable bypass:** No configuration flag, environment variable, or agent output can skip this gateway.

### Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Confidence-threshold auto-approval | Violates Master Context §6.3; autonomy over execution boundary is not delegable to the model |
| Soft gateway (can be disabled in dev mode) | Creates a flag that will be left enabled; safety properties must not have on/off switches |
| Approval via API call without UI | Acceptable for programmatic tests; the operator interface is required for the MVP |

### Consequences

#### Positive Effects
- Human authority over execution is enforced by workflow graph topology, not by convention.
- The approval record is always present in the audit trail before any execution record.
- Operators can reject and provide feedback, which feeds the re-planning path.

#### Trade-offs
- The execution cycle cannot complete without a human present at the approval step.
- For future high-confidence, low-risk actions, a policy-gated auto-approval tier may be needed. This requires a new ADR to supersede this one for that action class only.

### Future Review Criteria

Review when operator trust scores (Master Context §7.3) reach levels that justify exploring a tiered autonomy model. Any such model must be defined as a new, explicit policy tier — not as a modification of the existing gateway.

---

## ADR-009 — Standard Business Event Schema

**Status:** Accepted  
**Date:** 2026-07-03

### Context

An event-driven architecture (ADR-001) requires that all events published to the event bus conform to a common structure. Without a standard schema, consumers must handle heterogeneous event shapes, event routing logic becomes complex, and the audit log becomes inconsistent.

### Decision

All events in Sentinel AI conform to a **Standard Business Event Schema** with the following mandatory envelope:

| Field | Type | Description |
|---|---|---|
| `event_id` | UUID | Globally unique event identifier |
| `event_type` | string (enum) | Namespaced event type identifier (e.g., `sentinel.inventory.anomaly.detected`) |
| `schema_version` | semver string | Schema version of the payload |
| `timestamp` | ISO 8601 UTC | Event creation timestamp |
| `source_agent` | string | Identifier of the emitting agent |
| `case_id` | UUID (nullable) | Associated Business Case ID, if applicable |
| `correlation_id` | UUID | Trace identifier for distributed logging |
| `payload` | object | Event-type-specific data; schema governed by `event_type` and `schema_version` |

Event type namespacing follows: `sentinel.<domain>.<entity>.<verb>` (e.g., `sentinel.inventory.stocklevel.anomaly_detected`).

All event schemas are defined in the shared schemas package (ADR-012). Breaking changes to any schema increment the major version and require a migration path.

### Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Ad hoc per-agent message formats | No interoperability; every consumer implements bespoke parsing |
| CloudEvents specification | Appropriate for production; envelope overhead for hackathon scope; adopt in Horizon 2 |
| JSON Schema without a registry | Insufficient governance; no versioning discipline enforced |

### Consequences

#### Positive Effects
- Any agent can consume any event type with identical envelope parsing.
- The `case_id` field enables correlation of all events for a given Business Case across the full lifecycle.
- Schema versioning enables non-breaking evolution of payload structures.

#### Trade-offs
- All agents must import the shared schemas package; changes to the envelope are a system-wide breaking change.
- `schema_version` enforcement requires validation at publish time, adding a small overhead.

### Future Review Criteria

Review when event volume requires schema registry infrastructure (e.g., Confluent Schema Registry). Adopt CloudEvents as the envelope standard at Horizon 2 when external system integrations are introduced.

---

## ADR-010 — Mission Control Dashboard

**Status:** Accepted  
**Date:** 2026-07-03

### Context

The operator needs a single, unified interface to observe active Business Cases, review anomaly details and investigation findings, inspect execution plans, approve or reject actions, and access the audit log. The presentation layer (ADR-002, Layer 5) must serve all of these functions without requiring the operator to switch between multiple tools.

### Decision

The **Mission Control Dashboard** is the single operator-facing web application. It consolidates all operator functions into one interface with the following primary views:

| View | Function |
|---|---|
| **Live Operations Feed** | Real-time stream of active Business Cases, their current stage, and severity |
| **Case Detail View** | Full Business Case context: anomaly, investigation, plan, with approve/reject action |
| **Execution Status View** | Real-time per-action execution progress for approved cases |
| **Audit Log View** | Immutable, searchable record of completed cases |

The dashboard connects to the backend via a WebSocket or SSE channel for real-time updates. All operator actions (approve, reject, comment) are submitted as events through the standard event schema (ADR-009).

The dashboard is a read-heavy, action-sparse interface. It does not contain business logic; it renders Business Case state and submits operator decisions.

### Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| CLI-only operator interface | Insufficient for non-technical operators; unacceptable for a live demo |
| Embedded Jupyter notebook | Not an operator tool; development artifact only |
| Third-party dashboard (Retool, etc.) | Dependency on external service; insufficient control over approval UX fidelity |

### Consequences

#### Positive Effects
- Operators have one place to go; no context switching required.
- Real-time updates mean the operator sees case progression without manual refresh.
- The approval gateway (ADR-008) is surfaced through a purpose-built UI, maximizing clarity.

#### Trade-offs
- A dedicated frontend requires frontend development capacity within the 48-hour constraint.
- WebSocket session management adds backend complexity.

### Future Review Criteria

Review when multi-tenant, role-based access is required (Horizon 2). At that point, the dashboard must integrate with an authentication system and support view filtering by operator role and business scope.

---

## ADR-011 — Monorepo Architecture

**Status:** Accepted  
**Date:** 2026-07-03

### Context

Sentinel AI consists of multiple components: frontend application, backend services, AI agent packages, shared schemas, and infrastructure configuration. These components share type definitions, business event schemas, and utility libraries. Managing them as separate repositories introduces version drift between shared packages, cross-repository dependency management overhead, and friction in making cross-cutting changes.

### Decision

All Sentinel AI components are developed within a **single monorepo**, structured as a `pnpm` workspace (TypeScript/Node components) with Python packages co-located under a `/services` directory.

Top-level structure:

```
/
├── apps/          # Deployable frontend applications (Mission Control Dashboard)
├── services/      # Deployable backend services and agent orchestration
├── packages/      # Shared libraries (schemas, utilities, types)
├── infra/         # Infrastructure-as-code (Docker Compose, deployment configs)
├── docs/          # All architecture and product documentation
└── scripts/       # Development and CI/CD tooling
```

All packages within `packages/` are internal dependencies consumed by `apps/` and `services/`. No package in this monorepo is published to a public registry.

### Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Polyrepo (one repo per service) | Cross-cutting schema changes require coordinated multi-repo PRs; version drift is immediate |
| Monorepo with Nx or Turborepo | Build graph complexity exceeds hackathon setup time; `pnpm` workspaces are sufficient |
| All code in a single flat directory | No separation of deployable units; CI/CD targeting becomes impossible |

### Consequences

#### Positive Effects
- Schema and type changes are atomic: one commit, all consumers updated simultaneously.
- A single CI pipeline can validate all components together.
- Developers have full context of the system in a single checkout.

#### Trade-offs
- Repository size grows with the full system history of all components.
- Developers must understand workspace tooling (`pnpm`, workspace protocols) to contribute.

### Future Review Criteria

Review at Horizon 2 when independent service deployment cadences diverge significantly. If the Dashboard and the Agent Orchestration Service need different release cycles and the monorepo atomic deployment model becomes a constraint, service extraction may be appropriate.

---

## ADR-012 — Shared Schemas Package

**Status:** Accepted  
**Date:** 2026-07-03

### Context

The Standard Business Event Schema (ADR-009) and the Business Case object (ADR-004) must be consumed by multiple components: frontend, backend API, agent services, and integration layer. Without a single canonical schema definition, type drift between components is inevitable and event-handling bugs emerge at runtime rather than at compile time.

### Decision

A **`@sentinel/schemas`** package in `/packages/schemas` is the single source of truth for all shared data contracts. This package exports:

- Business Event envelope type and all typed payload schemas
- Business Case type with all sub-record types
- Agent input and output types for every agent in the workflow
- API request and response types for the operator-facing HTTP/WebSocket API

All schema definitions are authored in **TypeScript types and Zod schemas**. Zod schemas serve dual purpose: compile-time type inference and runtime validation. Python services import the canonical JSON Schema exports generated from the TypeScript source.

No component may define its own version of a type that exists in `@sentinel/schemas`. Duplication of shared types is a build-time lint error.

### Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| OpenAPI spec as schema source of truth | Adequate for HTTP API; does not cover internal event schemas or Business Case structure |
| Protobuf / gRPC | Well-suited for cross-language contracts; toolchain complexity not justified at hackathon scale |
| JSON Schema only | No compile-time type safety in TypeScript consumers |
| Each service owns its own types | Inevitable drift; cross-service contract bugs discovered at runtime |

### Consequences

#### Positive Effects
- Type errors between components surface at compile time, not at runtime.
- Zod validation at event publish and consume boundaries enforces schema correctness end to end.
- A single change to a shared type immediately surfaces all affected consumers across the monorepo.

#### Trade-offs
- All components must build `@sentinel/schemas` before compiling; adds a build-order dependency.
- JSON Schema export pipeline for Python services must be maintained; automation required.

### Future Review Criteria

Review if Python services diverge significantly from TypeScript components in schema requirements. At that point, a language-neutral schema definition language (e.g., Protobuf) may be justified as the canonical source.

---

## ADR-013 — Zero-Cost Technology Strategy

**Status:** Accepted  
**Date:** 2026-07-03

### Context

The hackathon operates under a zero or near-zero budget constraint. All infrastructure, services, and tooling must be free-tier, open-source, or locally runnable. The technology stack must also be deployable within the 48-hour window without requiring provisioned cloud infrastructure.

### Decision

Sentinel AI adopts a **zero-cost technology strategy** for the hackathon phase. All technology choices satisfy at minimum one of: open-source self-hosted, free-tier cloud service, or local-only runtime.

Canonical technology selections:

| Component | Technology | Cost Basis |
|---|---|---|
| Agent orchestration | LangGraph (Python, open-source) | Free / open-source |
| LLM inference | Groq API free tier or Ollama (local) | Free tier / local |
| Event bus | In-process Python event emitter or Redis (local Docker) | Local |
| Persistence | SQLite (local) or Supabase free tier | Free |
| Frontend framework | Next.js or Vite (open-source) | Free / open-source |
| Containerisation | Docker Compose | Free / open-source |
| Package management | pnpm (open-source) | Free / open-source |
| CI | GitHub Actions (free tier) | Free tier |

All LLM API keys required are scoped to free-tier usage. If inference cost exceeds free limits during the demonstration, a local Ollama fallback must be pre-configured and tested.

### Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| AWS / GCP / Azure hosted services | Cost; provisioning time within 48 hours |
| OpenAI API (paid) | Cost; dependency on a paid key without a free-tier fallback |
| Managed Kafka (Confluent Cloud) | Free tier is adequate but adds external dependency; local Redis is simpler for MVP |

### Consequences

#### Positive Effects
- Zero infrastructure spend during development and demonstration.
- All dependencies can be validated and frozen before the hackathon begins.
- Local-only operation ensures the demo works without network dependencies during presentation.

#### Trade-offs
- Free-tier rate limits (especially LLM inference) constrain the maximum number of live demonstration cycles.
- Local Docker Compose setup requires a reasonably capable development machine.

### Future Review Criteria

Review immediately upon beginning Horizon 2 (real system integrations). At that point, managed cloud infrastructure replaces local Docker Compose, and this ADR is superseded by a production infrastructure ADR.

---

## ADR-014 — Vertical Slice Development

**Status:** Accepted  
**Date:** 2026-07-03

### Context

The 48-hour constraint eliminates the possibility of building a fully horizontal foundation before vertical features. A purely horizontal approach risks delivering a technically complete foundation with no demonstrable vertical capability. Sentinel AI must deliver one complete, end-to-end demonstration by the deadline.

### Decision

Development proceeds as **vertical slices**: each slice delivers a thin but complete path through all five architectural layers (ADR-002) for one specific user-facing capability, in priority order.

Slice priority for the hackathon:

| Priority | Slice | Deliverable |
|---|---|---|
| 1 | Anomaly Detection | Monitor → Detect → event emitted → case created → case visible in UI |
| 2 | Root Cause Investigation | Detect event → Investigate → root cause displayed in UI |
| 3 | Execution Plan Generation | Investigation → Plan → plan visible and approvable in UI |
| 4 | Human Approval Gateway | Approval UI → approval event → workflow advances |
| 5 | Action Execution | Approved plan → Execute → execution status visible in UI |
| 6 | Audit Record | Execution complete → Record → audit log entry visible in UI |
| 7 | Baseline Improvement | Execution outcome → Improve → baseline updated |

Each slice is independently demonstrable. If the team runs out of time, all completed slices remain functional. No slice leaves the system in an unrunnable state.

### Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Horizontal layered development | Risk of complete foundation with no demonstrable vertical capability |
| Feature-branch per agent, merged at end | Integration risk concentrated at end; high probability of integration failure under time pressure |
| Agent-first, UI-last | A backend-only demo without operator UI fails the approval gateway demonstration |

### Consequences

#### Positive Effects
- A working demo exists as early as Slice 1 completion.
- Scope management is straightforward: each slice is a discrete, deferrable unit.
- Integration between layers is validated continuously, not at the end.

#### Trade-offs
- Each slice requires temporary scaffolding (stub implementations of downstream components) that must be replaced by subsequent slices. Stub discipline is required.
- Cross-slice refactoring may be needed as later slices reveal design issues in earlier ones.

### Future Review Criteria

This decision is specific to the hackathon development methodology. Post-hackathon development transitions to a sprint-based delivery model. This ADR is retired at the end of the hackathon phase.

---

*These decisions are the engineering constitution of Sentinel AI. When implementation choices conflict with these ADRs, the ADR governs. When an ADR must change, a superseding ADR is written — not an in-place modification.*
