# 13 DEMO SCRIPT

> **Document Class:** Authoritative Demo & Scenario Specification  
> **Status:** Active / Authoritative (Resolved via DEC-002)  
> **Source:** Synthesized from `01_PROJECT_VISION.md` §9 and `15_IMPLEMENTATION_MASTER_PLAN.md` §25.2.

---

## 1. Scripted Anomaly Scenarios for Live Evaluation

This specification defines the three authoritative crisis scenarios designed for live hackathon judging and operator training.

### Scenario A: Warehouse Stockout Alert (`SKU-INT-001`)
- **Domain:** Inventory & Warehouse Management
- **Trigger Condition:** Sudden demand surge at Warehouse W-01 combined with an unexpected 5-day delivery delay from carrier Apex Logistics.
- **Statistical Deviation:** $Z$-Score: `3.84`, Anomaly Score: `0.92`, Current Stock: `15` units (Reorder Point: `150`).
- **Autonomous Agent Workflow:**
  1. **Detect Agent:** Ingests `wms.stock_update` event from Redis stream, flags severe threshold violation, and creates Case ID.
  2. **Investigate Agent:** Executes MCP tool `purchase_order_query()` on active POs, uncovering the 5-day carrier delay. Performs cosine similarity search in `pgvector`, discovering a similar stockout from Q1 resolved via air freight reallocation.
  3. **Plan Agent:** Formulates structured JSON plan: *Expedite 100 units from backup Warehouse W-02 via air freight and issue vendor credit memo.* Calculates Risk Score: **12% (Low Risk)** and Financial Exposure: **$4,500 USD**.
  4. **Human Approval Gate:** Surfaced on Dashboard. Operator verifies low risk and clicks **[✅ Approve Plan]**.
  5. **Execute & Record:** `business_system_write()` mutates WMS stock levels. Case embedding is indexed in `pgvector`.

### Scenario B: Receiving Discrepancy (`SKU-REC-002`)
- **Domain:** Receiving & Invoice Reconciliation
- **Trigger Condition:** Inbound shipment arrives at Warehouse W-02 with a **20% physical unit shortage** compared to the EDI 810 invoice manifest.
- **Statistical Deviation:** $Z$-Score: `2.95`, Anomaly Score: `0.81`.
- **Autonomous Agent Workflow:**
  1. **Investigate Agent:** Cross-references WMS dock receiving tallies against EDI invoice records via MCP tooling.
  2. **Plan Agent:** Drafts automated financial reconciliation plan: *Quarantine physical batch, automatically emit debit memo to supplier for 20% missing units, and trigger expedited replacement PO.* Risk Score: **18%**.
  3. **Human Approval Gate:** Operator confirms debit memo terms and approves.

### Scenario C: Supplier Lead-Time Delay (`SKU-SUP-003`)
- **Domain:** Supplier SLA Governance
- **Trigger Condition:** Supplier misses contractual delivery window by 4 days on critical high-tech assembly component.
- **Statistical Deviation:** $Z$-Score: `3.10`, Anomaly Score: `0.86`.
- **Autonomous Agent Workflow:**
  1. **Investigate Agent:** Queries supplier contract terms and evaluates pre-approved alternative suppliers via MCP `supplier_lookup()`.
  2. **Plan Agent:** Recommends temporary volume reallocation to Backup Supplier B with financial impact calculation ($12,400 USD).
  3. **Human Approval Gate:** Operator reviews alternative supplier terms and approves reallocation.
