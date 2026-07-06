# Sentinel OS — Hackathon Demo & Evaluation Guide

> **Document Class:** Evaluation & Demo Walkthrough  
> **Status:** Authoritative  
> **Target Audience:** Hackathon Judges, Technical Evaluators

---

## 🎯 Welcome, Hackathon Judges!

This guide is structured to help you evaluate Sentinel OS in **under 3 minutes**. 

We have designed Sentinel OS around three core evaluation pillars:
1. **Innovation:** Moving from passive, read-only ERP alerts to autonomous, multi-agent remediation workflows.
2. **Technical Depth:** Implementing compiled LangGraph state machines, Model Context Protocol (MCP) tooling, and pgvector cosine similarity learning loops.
3. **Practical Impact:** Sub-5 minute resolution latency with strict human-in-the-loop safety governance.

---

## ⚡ Step-by-Step Evaluation Walkthrough

### Step 1: Access the Mission Control Dashboard
With the Docker environment running (see **[Setup Guide](Setup.md)**), navigate your browser to:
👉 **[http://localhost:3000](http://localhost:3000)**

You will be greeted by the dark-mode glassmorphism Mission Control Dashboard displaying real-time supply chain telemetry, inventory health metrics, and active audit logs.

---

### Step 2: Observe Autonomous Event Ingestion
By default, the **Turnkey Stream Simulator** ([ai/simulator](../ai/simulator)) runs in the background, publishing simulated WMS stock updates to the Redis stream `sentinel:events:inventory` every 2 seconds.

Observe the live **Audit Trail / Live Activity Feed** on the dashboard. You will see normal baseline stock ticks (`SKU-1002`) processing cleanly without triggering false alarms.

---

### Step 3: Evaluate Scripted Anomaly Scenarios (DEC-002)

Sentinel OS includes three pre-scripted crisis scenarios designed to demonstrate autonomous root-cause analysis and multi-step remediation planning.

#### 🚨 Scenario A: Warehouse Stockout Alert (`SKU-INT-001`)
- **What Happens:** Demand surges unexpectedly at Warehouse W-01 while an inbound shipment from Apex Logistics suffers a 5-day delivery delay. Inventory drops below the safety stock threshold ($Z$-score: `3.84`, Anomaly Score: `0.92`).
- **AI Agent Response:**
  1. **Detect Agent:** Catches the statistical deviation and flags case status as `DETECTED`.
  2. **Investigate Agent:** Executes MCP tool `purchase_order_query()` to inspect supplier EDI logs, discovering the 5-day carrier delay. Queries `pgvector` to find similar historical stockouts.
  3. **Plan Agent:** Synthesizes an emergency remediation plan: *Expedite 100 units via air freight from backup Warehouse W-02 and issue credit memo.* Calculates Risk Score: **12% (Low)**.
- **Judge Action:** Click on the active case card in the UI. Review the AI-generated Root Cause Summary and step-by-step execution plan.

#### 📦 Scenario B: Receiving Discrepancy (`SKU-REC-002`)
- **What Happens:** An inbound shipment arrives at Warehouse W-02 with a **20% unit shortage** compared to the EDI invoice ($Z$-score: `2.95`).
- **AI Agent Response:**
  1. **Investigate Agent:** Cross-references WMS receiving logs against supplier EDI invoice manifests.
  2. **Plan Agent:** Drafts an automated reconciliation plan: *Quarantine received batch, automatically generate vendor debit memo for missing units, and trigger expedited replacement PO.* Risk Score: **18% (Low-Medium)**.
- **Judge Action:** Observe how the system distinguishes between physical loss and administrative invoice errors without human intervention.

#### 🚚 Scenario C: Supplier SLA Breach (`SKU-SUP-003`)
- **What Happens:** A critical high-tech component experiences a lead-time violation exceeding contractual SLA terms by 4 days ($Z$-score: `3.10`).
- **AI Agent Response:**
  1. **Investigate Agent:** Queries supplier SLA contracts and evaluates alternative pre-approved suppliers via MCP `supplier_lookup()`.
  2. **Plan Agent:** Recommends temporary volume reallocation to Backup Supplier B with expected financial impact calculation ($12,400 USD).
- **Judge Action:** Review the financial exposure estimate automatically calculated by the AI before approval.

---

### Step 4: Test the Non-Bypassable Human Safety Gate

A critical differentiator of Sentinel OS is **AI Governance**. Unlike basic AI wrappers that blindly execute API calls or suggest unverified text, Sentinel OS enforces a strict architectural gate:

1. When viewing any formulated plan in the UI, notice the case status is **`AWAITING_APPROVAL`**.
2. Review the proposed actions, target SKUs, and expected outcomes.
3. Click the glowing **[✅ Approve Plan]** button.
4. **What Happens Under the Hood:**
   - The UI generates a secure cryptographic token and sends an idempotent POST request to `/api/v1/cases/:id/approve`.
   - The **Execute Agent** wakes up, validates the approval token, and executes `business_system_write()` to mutate database inventory levels.
   - The **Record & Improve Agent** generates an embedding of the resolved case and stores it in `pgvector`.
   - Notice the case status transitions instantly to **`RESOLVED`**, and the live inventory charts update in real-time!

---

## 🏆 Scoring Alignment Checklist for Judges

| Judging Criteria | Where to Verify in Sentinel OS |
| :--- | :--- |
| **1. Innovation & Originality** | Autonomous multi-agent LangGraph orchestration replacing passive legacy ERP spreadsheets (**[Architecture Guide](Architecture.md)**). |
| **2. Technical Complexity** | 5-agent LangGraph compiled state machine, MCP tool adapters, pgvector vector search, and Redis stream processing. |
| **3. Practical Impact** | Reduces supply chain anomaly resolution time from days to under 5 minutes while preventing AI hallucination damage via UI approval gates. |
| **4. Polish & UX** | Dark-mode glassmorphism dashboard, real-time WebSocket state updates, sub-second response times, and turnkey Docker deployment. |
