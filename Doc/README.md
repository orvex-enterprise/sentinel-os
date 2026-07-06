# Sentinel OS — Master Engineering Specification Index

> **Document Class:** Central Documentation Index  
> **Status:** Authoritative  
> **Purpose:** Provide structured navigation across all 19 engineering specifications, architecture logs, and governance records in the Sentinel OS monorepo.

---

## 📚 Categorized Reading Paths

### 1. For Hackathon Judges & Technical Evaluators
Start here for rapid evaluation of system innovation, architecture, and live demo workflows:
- **[../README.md](../README.md)**: Executive summary, system value proposition, and 60-second quickstart.
- **[../docs/Architecture.md](../docs/Architecture.md)**: LangGraph state machine diagrams, MCP tooling, and pgvector vector search.
- **[../docs/Demo.md](../docs/Demo.md)**: Step-by-step hackathon evaluation walkthrough and anomaly scenarios.
- **[../docs/Setup.md](../docs/Setup.md)**: Turnkey Docker Compose setup and local development instructions.
- **[13_DEMO_SCRIPT.md](13_DEMO_SCRIPT.md)**: Authoritative specification for Scenarios A, B, and C.

### 2. For Systems Architects & AI Engineers
Deep technical specifications governing our multi-agent AI loop and database schemas:
- **[00_MASTER_CONTEXT.md](00_MASTER_CONTEXT.md)**: Core architectural principles, domain boundaries, and system goals.
- **[03_ARCHITECTURE.md](03_ARCHITECTURE.md)**: System topology, container layout, and network boundaries.
- **[04_DATABASE.md](04_DATABASE.md)**: PostgreSQL relational schemas, triggers, and pgvector embedding tables.
- **[07_WORKFLOW_ENGINE.md](07_WORKFLOW_ENGINE.md)**: LangGraph state graph mechanics, checkpoints, and transitions.
- **[08_AGENT_SPECIFICATIONS.md](08_AGENT_SPECIFICATIONS.md)**: Prompts, tool access, and responsibilities for all 5 specialized agents.
- **[09_TOOLING_AND_MCP.md](09_TOOLING_AND_MCP.md)**: Model Context Protocol (MCP) tool definitions and schema adapters.
- **[10_PROMPT_ENGINEERING.md](10_PROMPT_ENGINEERING.md)**: System prompts, chain-of-thought instructions, and guardrails.
- **[11_KNOWLEDGE_SYSTEM.md](11_KNOWLEDGE_SYSTEM.md)**: Vector memory indexing, cosine similarity search, and baseline recalculation.

### 3. For Backend & Frontend Developers
Specifications governing API endpoints, WebSockets, security, and observability:
- **[02_PRODUCT_REQUIREMENTS.md](02_PRODUCT_REQUIREMENTS.md)**: Load-bearing functional requirements (REQ-01 through REQ-05).
- **[05_API_SPEC.md](05_API_SPEC.md)**: REST endpoints, request/response payloads, and authentication headers.
- **[06_CAPABILITY_SPECIFICATIONS.md](06_CAPABILITY_SPECIFICATIONS.md)**: Functional capability breakdown across domain modules.
- **[12_SECURITY.md](12_SECURITY.md)**: Approval token attestation, idempotency keys, and RBAC governance.
- **[13_OBSERVABILITY.md](13_OBSERVABILITY.md)**: WebSocket state streaming, audit trails, and structured logging.
- **[14_DEPLOYMENT.md](14_DEPLOYMENT.md)**: Container orchestration, resource limits, and production deployment.

### 4. Engineering Governance & Architecture Logs
Authoritative records of engineering trade-offs and design resolutions:
- **[../DECISIONS_LOG.md](../DECISIONS_LOG.md)**: Resolution of placeholder documents and underspecified requirements.
- **[../DEVIATIONS.md](../DEVIATIONS.md)**: Architectural adaptations for local-first zero-cost Ollama execution.
- **[../RUNBOOK.md](../RUNBOOK.md)**: Operational runbook and troubleshooting procedures.
- **[15_ARCHITECTURE_DECISIONS.md](15_ARCHITECTURE_DECISIONS.md)**: Architecture Decision Records (ADRs 001 through 013).
- **[15_IMPLEMENTATION_MASTER_PLAN.md](15_IMPLEMENTATION_MASTER_PLAN.md)**: Master implementation phases and verification milestones.
