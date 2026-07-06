# Sentinel OS — Architectural Deviations Log

> **Document Class:** Engineering Governance Log  
> **Status:** Active / Authoritative  
> **Purpose:** Record all places where the runnable implementation deviates from, simplifies, or substitutes for the paper architecture specifications, per Master Build Prompt rule #5 and ADR-013.

---

## 1. Zero-Cost Technology Strategy (ADR-013)

### DEV-001: Local LLM with Cloud Fallback Interface
- **Specification:** The corpus references enterprise cloud LLMs (Groq `llama-3.3-70b-versatile`, OpenAI GPT-4o) across `08_AGENT_SPECIFICATIONS.md` and `10_PROMPT_ENGINEERING.md`.
- **Deviation / Substitution:** We implement an LLM wrapper supporting local Ollama (`llama3` / `mistral`) as the default zero-cost execution path, while maintaining a pluggable cloud interface (Groq / OpenAI API) via environment variables.
- **Rationale:** Satisfies ADR-013 (Zero-Cost / Local-First Stack) and allows standalone local execution without requiring paid API keys or external network connectivity.

### DEV-002: Simplified Secrets Management
- **Specification:** `12_SECURITY.md` (Horizon 2 / Enterprise Security) specifies HashiCorp Vault, SPIFFE/SPIRE identity attestation, and Hardware Security Modules (HSMs) for secret storage and service authentication.
- **Deviation / Substitution:** We implement environment-variable injection (`.env` and Docker Compose environment variables) with strict schema validation at service startup.
- **Rationale:** HashiCorp Vault, SPIFFE/SPIRE, and HSMs are Horizon 2 enterprise features out of scope for a local MVP (per Prompt rule #5 and #11).

### DEV-003: Simplified Knowledge & Memory Architecture
- **Specification:** `11_KNOWLEDGE_SYSTEM.md` describes a 21-layer enterprise memory architecture involving specialized graph databases, multi-tiered caching, and complex episodic/semantic memory segregation.
- **Deviation / Substitution:** We simplify the knowledge system to what is load-bearing for the MVP: relational SQL fact storage in PostgreSQL (`knowledge_records`, `audit_records`, `case_history`) combined with a single vector/embedding table (using `pgvector` or cosine similarity over JSON array embeddings) for historical RCA and plan matching.
- **Rationale:** Ensures sub-50ms query latency and low resource overhead while fully satisfying the learning loop requirements (ADR-005, Master Context §4).

### DEV-004: In-Process Tool / MCP Layer Serving
- **Specification:** `09_TOOLING_AND_MCP.md` describes tools served via Model Context Protocol (MCP) servers, potentially as independent containerized microservices.
- **Deviation / Substitution:** Tool functions (`inventory_query`, `purchase_order_query`, `supplier_lookup`, `business_system_write`, etc.) are implemented as stateless, schema-validated Python modules exposed behind an MCP-compatible interface inside the orchestration service and simulator.
- **Rationale:** Reduces container sprawl and network latency while preserving clean architectural boundaries and strict port/adapter testability.
