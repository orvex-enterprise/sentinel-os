# Sentinel OS — Authoritative Master Runbook & Operational Guide

This runbook provides comprehensive instructions for deploying, operating, testing, and troubleshooting **Sentinel OS**, an autonomous multi-agent business execution platform designed for enterprise supply chain resilience.

---

## 1. System Architecture & Topology

Sentinel OS is built as an event-driven monorepo architecture enforcing strict domain separation, append-only cryptographic audit trails, and human-in-the-loop interlock controls.

```mermaid
graph TD
    subgraph Event Ingestion Layer
        WMS[WMS / Simulator] -->|HTTP POST| APIGW[API Gateway :4000]
        WMS -->|Redis XADD| RS[Redis Stream: sentinel:events:inventory]
    end

    subgraph Core Platform Layer
        APIGW <-->|WebSocket & REST| MCO[Mission Control Dashboard :3000]
        APIGW -->|XADD| RS
        ORCH[LangGraph Orchestration Engine :5000] <-->|XREAD / XADD| RS
    end

    subgraph Storage & Audit Layer
        ORCH <-->|AsyncPostgresSaver & Ledger| PG[(PostgreSQL 16 :5432)]
        APIGW <-->|Idempotency Cache| RD[(Redis 7 :6379)]
    end

    subgraph LLM & AI Layer
        ORCH <-->|JSON Structured Output| OLLAMA[Local Ollama / Cloud LLM]
    end
```

### Key Components
- **`services/api-gateway` (Port 4000)**: Express/TypeScript REST & WebSocket API Gateway. Enforces Bearer token authentication, Zod schema validation, Redis-backed idempotency keys, and WebSocket state broadcast.
- **`services/orchestration` (Port 5000)**: Python 3.12 / LangGraph multi-agent state machine. Implements a cyclical 8-node execution pipeline (`monitor`, `detect`, `investigate`, `plan`, `execute`, `record`, `improve`) with resilient checkpointer fallbacks.
- **`apps/dashboard` (Port 3000)**: React 19 / Vite Mission Control interface featuring a dark-mode glassmorphism design, real-time WebSocket state synchronizer, markdown Root Cause Analysis (RCA) rendering, and one-click execution plan approval/rejection.
- **`ai/simulator`**: Turnkey anomaly generator dispatching WMS telemetry events across multiple supply chain failure scenarios.

---

## 2. Quickstart & Docker Compose Deployment

### Prerequisites
- Docker Engine & Docker Compose v2+
- Node.js v20+ and `pnpm` (for local development outside Docker)
- Python 3.12+ (for local orchestration debugging)

### One-Click Stack Startup
To launch the entire Sentinel OS platform in deterministic containerized environment:

```bash
# 1. Clone or enter workspace root
cd d:/project

# 2. Build and launch all services in detached mode
docker compose -f infra/docker-compose.yml up --build -d

# 3. Verify service health status
docker compose -f infra/docker-compose.yml ps
```

All containers are health-check gated:
1. `sentinel-postgres` initializes schema, triggers, and seed data (`seed/01_schema.sql` to `03_seed_data.sql`).
2. `sentinel-redis` boots in append-only persistence mode.
3. `sentinel-api-gateway` and `sentinel-orchestration` start once databases report healthy.
4. `sentinel-dashboard` serves the compiled UI at `http://localhost:3000`.

---

## 3. End-to-End Demonstration Script

Follow this sequence to observe autonomous AI detection, RCA synthesis, plan generation, human-in-the-loop interlock, and cryptographic audit trail verification.

### Step 1: Open Mission Control Dashboard
Navigate to `http://localhost:3000` in your web browser. Observe the top right status indicator: **`Live WMS Stream Connected`** (pulsing green indicator).

### Step 2: Inject Anomaly Scenario
Click the **`+ Inject Anomaly`** button in the dashboard sidebar, or run the turnkey script from the command line:

```bash
# Dispatch Stockout Risk Anomaly (SKU-9942, Z-Score: 3.84) via HTTP Gateway
python ai/simulator/event_generator.py --mode http --count 1
```

### Step 3: Observe Autonomous Pipeline Execution
Within 1-2 seconds, the dashboard will receive a real-time WebSocket update:
1. **`DETECTED`**: The rolling baseline engine calculates a Z-Score of `3.84` (exceeding the `2.50` threshold) and flags an anomaly score of `0.92`.
2. **`INVESTIGATING`**: The `investigate` node queries historical knowledge records and synthesizes a Root Cause Analysis hypothesis explaining the supplier delay.
3. **`PLAN_GENERATED`**: The `plan` node generates a structured execution plan (`PO_EXPEDITE`) with estimated financial impact ($1,000.00 USD) and contingency routing.
4. **`PENDING_APPROVAL`**: Because the financial impact exceeds autonomous safety thresholds or involves external supplier PO modification, the LangGraph checkpointer interlocks execution and yields control to the human operator.

### Step 4: Human-in-the-Loop Interlock (Approve / Reject)
In the Mission Control Dashboard:
- Review the rendered Markdown RCA and Execution Plan table.
- Click **`Approve Execution Plan`** to authorize remediation.
- Observe the case state transition to **`EXECUTING`** &rarr; **`RESOLVED`** &rarr; **`CLOSED_SUCCESS`**.

Alternatively, approve via cURL:
```bash
curl -X POST http://localhost:4000/api/v1/cases/case_sim_demo/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tok_live_demo_8849201948210" \
  -H "Idempotency-Key: idem_demo_approve_001" \
  -d '{"approvalToken": "tok_live_demo_8849201948210", "approvedBy": "operator@sentinel.ai", "comment": "Approved via command line runbook"}'
```

### Step 5: Verify Cryptographic Audit Trail
Click the **`Audit Trail`** tab in the dashboard or inspect PostgreSQL directly:
```bash
docker exec -it sentinel-postgres psql -U sentinel -d sentinel_db -c "SELECT audit_id, actor, action_performed, new_status, timestamp FROM case_audit_log ORDER BY timestamp DESC LIMIT 10;"
```
Notice that every state transition is immutably recorded with cryptographic SHA-256 hash proofs and W3C traceparent correlation headers.

---

## 4. Troubleshooting & Operational Procedures

### A. Resetting Database State
If you need to wipe all transaction history and reset to clean seed data:
```bash
docker compose -f infra/docker-compose.yml down -v
docker compose -f infra/docker-compose.yml up --build -d
```

### B. Inspecting Redis Event Stream
To monitor raw WMS stock updates and agent messages flowing through Redis:
```bash
docker exec -it sentinel-redis redis-cli -a redis_secret XREAD COUNT 10 STREAMS sentinel:events:inventory 0
```

### C. Switching LLM Providers (Local Ollama vs. Cloud API)
The orchestration engine defaults to local Ollama (`qwen2.5-coder:7b` or `llama3`) for zero-cost local execution. To switch to cloud providers (OpenAI or Groq):
1. Edit `infra/docker-compose.yml` under `sentinel-orchestration` environment variables:
   ```yaml
   LLM_PROVIDER: openai # or groq
   OPENAI_API_KEY: sk-your-api-key-here
   OPENAI_MODEL_NAME: gpt-4o-mini
   ```
2. Restart the orchestration service:
   ```bash
   docker compose -f infra/docker-compose.yml restart sentinel-orchestration
   ```

### D. Verification of Idempotency Guarantees
Sentinel OS strictly prevents duplicate execution. Re-transmitting an approval or event with the same `Idempotency-Key` header will return cached responses without executing duplicate database mutations or PO expedites:
```bash
# First attempt (200 OK - Executed)
curl -i -X POST http://localhost:4000/api/v1/cases/test_case_1/approve -H "Authorization: Bearer tok_live_demo_8849201948210" -H "Idempotency-Key: idem_test_99" -d '{"approvalToken":"tok_live_demo_8849201948210"}'

# Second attempt (200 OK - Cached Idempotent Replay, zero side-effects)
curl -i -X POST http://localhost:4000/api/v1/cases/test_case_1/approve -H "Authorization: Bearer tok_live_demo_8849201948210" -H "Idempotency-Key: idem_test_99" -d '{"approvalToken":"tok_live_demo_8849201948210"}'
```

---
*Sentinel OS v1.0.0 — Lead Autonomous Engineering Agent Architecture Corpus Certified.*
