# Sentinel OS — Engineering Decisions Log

> **Document Class:** Engineering Governance Log  
> **Status:** Active / Authoritative  
> **Purpose:** Record engineering design resolutions for underspecified or placeholder documents in the corpus, per Master Build Prompt rule #6.

---

## 1. Resolution of Placeholder Documents

### DEC-001: Resolution of `02_PRODUCT_REQUIREMENTS.md`
- **Context:** The uploaded `02_PRODUCT_REQUIREMENTS.md` file is an empty placeholder (27 bytes).
- **Decision:** We derive the authoritative functional product requirements directly from `01_PROJECT_VISION.md`, `00_MASTER_CONTEXT.md` §4, and `03_ARCHITECTURE.md` §2 (System Goals G-01 through G-09). Specifically:
  1. **Autonomous Anomaly Detection**: Sub-5 minute detection of inventory stockouts, receiving discrepancies, and supplier delays without human polling.
  2. **Root Cause Synthesis**: Data-driven RCA hypothesis generation with >= 80% accuracy.
  3. **Actionable Execution Planning**: Generation of multi-step execution plans with risk scoring and expected outcomes.
  4. **Non-Bypassable Human Approval Gate**: Sub-2-second UI surfacing of plans requiring explicit human operator authorization before external system mutation.
  5. **Closed-Loop Learning**: Automatic baseline recalculation and knowledge record indexing upon case resolution.

### DEC-002: Resolution of `13_DEMO_SCRIPT.md`
- **Context:** The uploaded `13_DEMO_SCRIPT.md` file is an empty placeholder (18 bytes).
- **Decision:** We design the authoritative demo sequence around the three scripted anomaly scenarios defined in `01_PROJECT_VISION.md` §9 and `15_IMPLEMENTATION_MASTER_PLAN.md` §25.2:
  1. **Scenario A (Stockout Alert)**: SKU `SKU-INT-001` drops below safety stock threshold at Warehouse W-01 due to an unexpected demand spike. Monitor agent triggers Detect agent -> Investigate agent identifies PO delay -> Plan agent drafts expedited shipment plan -> Human approves via Dashboard -> Execute agent mutates inventory simulator -> Record & Improve agents update baseline.
  2. **Scenario B (Receiving Discrepancy)**: Shipment for SKU `SKU-REC-002` arrives with 20% missing units compared to invoice. System detects anomaly -> investigates supplier EDI logs -> drafts credit memo & replacement order plan -> Human approves -> executed & logged.
  3. **Scenario C (Supplier Lead-Time Delay)**: Supplier SLA violation detected on critical component `SKU-SUP-003`. System investigates alternate suppliers -> drafts reallocation plan -> Human approves -> executed & logged.
