# 02 PRODUCT REQUIREMENTS

> **Document Class:** Authoritative Requirements Specification  
> **Status:** Active / Authoritative (Resolved via DEC-001)  
> **Source:** Synthesized from `01_PROJECT_VISION.md`, `00_MASTER_CONTEXT.md` §4, and `03_ARCHITECTURE.md` §2.

---

## 1. System Goals & Core Functional Requirements

Sentinel OS is designed to fulfill five load-bearing operational requirements for autonomous enterprise supply chain resilience:

### REQ-01: Autonomous Anomaly Detection (Sub-5 Minute Latency)
- **Requirement:** The system must continuously ingest WMS stock updates, receiving logs, and supplier lead-time telemetry without human polling or intervention.
- **Specification:** When an inventory metric deviates from historical safety baselines with a statistical $Z$-score $> 3.0$ or Anomaly Score $> 0.80$, the system must automatically transition case state to `DETECTED` and initiate investigation within **5 minutes** of event occurrence.

### REQ-02: Data-Driven Root Cause Analysis (RCA)
- **Requirement:** The system must autonomously investigate root causes by cross-referencing multi-domain enterprise data.
- **Specification:** The Investigate agent must execute schema-validated Model Context Protocol (MCP) tools (`purchase_order_query`, `supplier_lookup`, `inventory_query`) to inspect EDI logs and carrier transit records. It must query historical case records via `pgvector` cosine similarity to achieve an RCA accuracy threshold $\ge 80\%$.

### REQ-03: Executable & Risk-Scored Remediation Planning
- **Requirement:** The system must generate actionable, multi-step execution plans rather than passive text alerts.
- **Specification:** The Plan agent must output a structured JSON plan containing specific action items (e.g., *Expedite Freight*, *Issue Credit Memo*, *Reallocate Supplier Volume*), target SKUs, estimated financial exposure in USD, and a quantitative **Risk Score** (0–100%).

### REQ-04: Non-Bypassable Human-in-the-Loop Approval Gate
- **Requirement:** AI agents must be cryptographically prevented from mutating external enterprise databases without explicit human operator authorization.
- **Specification:** All formulated plans must pause in an `AWAITING_APPROVAL` state. The UI must surface the plan with sub-2-second latency. Execution of the mutating MCP tool `business_system_write()` is strictly blocked unless accompanied by a valid cryptographic approval token emitted by an operator UI click.

### REQ-05: Closed-Loop Continuous Learning
- **Requirement:** The system must learn from every resolved anomaly to improve future RCA and planning recommendations.
- **Specification:** Upon case resolution, the Record & Improve agent must generate a vector embedding of the problem and successful resolution, indexing it into PostgreSQL via `pgvector`. It must automatically recalculate inventory safety baselines for the affected SKU.
