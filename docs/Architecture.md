# Sentinel OS — System Architecture & Technical Specifications

> **Document Class:** Technical Architecture Specification  
> **Status:** Authoritative  
> **Target Audience:** Hackathon Judges, Systems Architects, Core Developers

---

## 1. High-Level Architecture Overview

Sentinel OS is engineered as an event-driven, multi-agent microservices ecosystem. It bridges real-time warehouse telemetry with generative AI reasoning while strictly isolating LLM non-determinism from production database mutations.

```mermaid
graph TB
    subgraph Frontend Layer
        UI["💻 Mission Control Dashboard (React / Vite / Vanilla CSS)"]
    end

    subgraph API & Gateway Layer
        GW["🌐 API Gateway & WebSocket Hub (Node.js / Express / TypeScript)"]
        REDIS["⚡ Redis Stream & Pub/Sub (Event Broker)"]
    end

    subgraph AI Orchestration Layer
        ORCH["🧠 LangGraph Orchestration Service (Python / FastAPI / LangGraph)"]
        MCP["🛠️ Model Context Protocol (MCP) Tool Adapters"]
        LLM["🤖 LLM Engine (Ollama / OpenAI / Groq / Mock Mode)"]
    end

    subgraph Data & Simulation Layer
        SIM["🎲 Turnkey Stream Simulator (Python Event Generator)"]
        PG[("🐘 PostgreSQL + pgvector (Relational & Vector Knowledge Base)")]
    end

    SIM -->|wms.stock_update| REDIS
    REDIS -->|Stream Consumer| GW
    GW <-->|WebSocket State Stream| UI
    GW -->|REST / HTTP Trigger| ORCH
    ORCH <-->|Tool Execution| MCP
    MCP <-->|SQL / Vector Queries| PG
    ORCH <-->|Inference| LLM
    GW <-->|CRUD & Case State| PG
```

---

## 2. The LangGraph Multi-Agent State Machine

Unlike conventional chatbot interfaces or simple linear chains, Sentinel OS models anomaly resolution as a deterministic **LangGraph State Graph** ([services/orchestration/graph](../services/orchestration/graph)).

```mermaid
stateDiagram-v2
    [*] --> MonitorDetect: WMS Event Ingestion
    
    state MonitorDetect {
        [*] --> EvaluateZScore
        EvaluateZScore --> AnomalyDetected: Z-Score > 3.0
        EvaluateZScore --> NormalBaseline: Z-Score <= 3.0
    }

    NormalBaseline --> [*]: Log & Terminate
    
    AnomalyDetected --> Investigate: Transition Case State

    state Investigate {
        [*] --> QueryEDILogs
        QueryEDILogs --> CheckSupplierSLA
        CheckSupplierSLA --> QuerypgvectorHistory
        QuerypgvectorHistory --> SynthesizeRootCause
    }

    Investigate --> FormulatePlan: Root Cause Established

    state FormulatePlan {
        [*] --> DraftRemediationSteps
        DraftRemediationSteps --> CalculateRiskScore
        CalculateRiskScore --> EstimateFinancialImpact
    }

    FormulatePlan --> AwaitingHumanApproval: Emit UI Alert

    state AwaitingHumanApproval {
        [*] --> OperatorReview
        OperatorReview --> Approved: Click Approve in UI
        OperatorReview --> Rejected: Click Reject in UI
    }

    Rejected --> [*]: Abort Plan & Archive
    
    Approved --> ExecuteRemediation: Token Validated

    state ExecuteRemediation {
        [*] --> MutateInventory
        MutateInventory --> IssuePOReallocation
        IssuePOReallocation --> EmitAuditLog
    }

    ExecuteRemediation --> RecordAndImprove: Execution Confirmed

    state RecordAndImprove {
        [*] --> GenerateCaseEmbedding
        GenerateCaseEmbedding --> IndexInpgvector
        IndexInpgvector --> RecalculateBaseline
    }

    RecordAndImprove --> [*]: Closed-Loop Resolved
```

---

## 3. Model Context Protocol (MCP) Tooling Architecture

To prevent LLM hallucination and maintain strict architectural boundaries, all tool execution occurs through schema-validated adapters inspired by the **Model Context Protocol (MCP)** ([services/orchestration/tools](../services/orchestration/tools)).

### Core Tool Adapters:
1. `inventory_query()`: Queries real-time stock levels, safety stock thresholds, and reorder points across warehouses.
2. `supplier_lookup()`: Retrieves supplier SLA terms, historical lead times, and active purchase orders.
3. `purchase_order_query()`: Evaluates pending shipment EDI logs and transit milestones.
4. `business_system_write()`: The *only* mutating tool in the system. Required to pass an explicit human approval token (`approvalToken`) before modifying database records.
5. `case_history_vector_search()`: Performs cosine similarity search against `pgvector` embeddings to retrieve top-3 historical anomaly resolutions.

---

## 4. Closed-Loop Learning with PostgreSQL & pgvector

Sentinel OS implements a self-improving memory architecture per [ADR-005](../Doc/15_ARCHITECTURE_DECISIONS.md) and [DEV-003](../DEVIATIONS.md).

```mermaid
sequenceDiagram
    participant Event as WMS Event
    participant Orch as LangGraph Agent
    participant PG as PostgreSQL (pgvector)
    participant UI as Mission Control UI

    Event->>Orch: Trigger Anomaly (SKU-INT-001)
    Orch->>PG: SELECT embedding <=> query_vector LIMIT 3
    PG-->>Orch: Return similar historical case (Resolved via Expedited Freight)
    Orch->>Orch: Formulate Plan using Historical Precedent
    Orch->>UI: Request Human Approval (Risk Score: 12%)
    UI->>Orch: Operator Approves (Token Validated)
    Orch->>PG: UPDATE inventory & INSERT audit_records
    Orch->>PG: INSERT INTO case_history (sku, root_cause, resolution, vector_embedding)
    Note over PG: Future anomalies now benefit from this resolution!
```

---

## 5. Single-Source Type Safety Strategy

To eliminate schema drift between our TypeScript frontend/gateway and Python AI backend, Sentinel OS utilizes a monorepo schema pipeline:

1. Authoritative domain interfaces and validation rules are defined in **[packages/schemas/src/index.ts](../packages/schemas/src/index.ts)**.
2. The build script **[export-json-schema.ts](../packages/schemas/src/export-json-schema.ts)** compiles TypeScript types into JSON Schema artifacts.
3. Python microservices import these generated schemas to enforce strict Pydantic/FastAPI request validation.

---

## 6. Security & Governance (DEV-002)

- **Non-Bypassable Approval Gates:** External database mutation via `business_system_write()` is cryptographically blocked unless accompanied by a valid operator token generated by UI confirmation.
- **Idempotency Enforcement:** All state transitions and approval requests require unique `Idempotency-Key` headers (§12.4) to prevent double-execution during network retries.
- **Zero-Cost / Local-First Privacy:** By supporting local Ollama execution ([DEV-001](../DEVIATIONS.md)), sensitive enterprise inventory data never leaves the local VPC or hardware boundary.
