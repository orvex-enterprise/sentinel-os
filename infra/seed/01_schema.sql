-- ============================================================================
-- Sentinel OS — Core PostgreSQL 16 DDL Schema (01_schema.sql)
-- Governing Specs: 04_DATABASE.md §7, §14, §18, §20; 08_AGENT_SPECIFICATIONS.md §15.2
-- Purpose: Authoritative persistent operational memory of autonomous execution
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- 1. ENUMERATIONS
-- ============================================================================

CREATE TYPE case_status AS ENUM (
    'DETECTED',
    'INVESTIGATING',
    'PLAN_GENERATED',
    'AWAITING_APPROVAL',
    'APPROVED',
    'EXECUTING',
    'EXECUTION_FAILED',
    'CLOSED_SUCCESS',
    'CLOSED_REJECTED',
    'CLOSED_FAILED'
);

CREATE TYPE anomaly_severity AS ENUM (
    'CRITICAL',
    'HIGH',
    'MEDIUM',
    'LOW'
);

CREATE TYPE domain_type AS ENUM (
    'INVENTORY',
    'SALES',
    'PRODUCTION',
    'LOGISTICS',
    'FINANCE'
);

CREATE TYPE anomaly_type AS ENUM (
    'STOCKOUT_RISK',
    'RECEIVING_DISCREPANCY',
    'UNEXPLAINED_VARIANCE',
    'SUPPLIER_DELAY',
    'OVERSTOCK'
);

CREATE TYPE decision_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'SUPERSEDED'
);

CREATE TYPE execution_stage AS ENUM (
    'INITIALIZING',
    'IN_PROGRESS',
    'COMPLETING',
    'COMPLETE',
    'PARTIAL_FAILURE',
    'FAILED'
);

CREATE TYPE execution_status AS ENUM (
    'RUNNING',
    'PAUSED',
    'RETRYING',
    'DONE',
    'ERROR'
);

CREATE TYPE action_status AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'SUCCESS',
    'FAILED',
    'SKIPPED'
);

CREATE TYPE risk_level AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);

CREATE TYPE knowledge_type AS ENUM (
    'BASELINE_UPDATE',
    'ROOT_CAUSE_PATTERN',
    'RESOLUTION_EFFECTIVENESS',
    'SUPPLIER_RELIABILITY',
    'THRESHOLD_ADJUSTMENT'
);

CREATE TYPE actor_type AS ENUM (
    'AGENT',
    'OPERATOR',
    'SYSTEM'
);

CREATE TYPE user_role AS ENUM (
    'VIEWER',
    'APPROVER',
    'ADMIN'
);

CREATE TYPE timeline_milestone AS ENUM (
    'CASE_CREATED',
    'OBSERVATION_COMPLETE',
    'DETECTION_COMPLETE',
    'INVESTIGATION_STARTED',
    'INVESTIGATION_COMPLETE',
    'PLAN_GENERATED',
    'APPROVAL_REQUESTED',
    'PLAN_APPROVED',
    'PLAN_REJECTED',
    'REPLAN_REQUESTED',
    'EXECUTION_STARTED',
    'ACTION_COMPLETE',
    'ACTION_FAILED',
    'EXECUTION_COMPLETE',
    'VERIFICATION_PASSED',
    'KNOWLEDGE_UPDATED',
    'CASE_CLOSED'
);

-- ============================================================================
-- 2. SEQUENTIAL ID GENERATION (§20.3)
-- ============================================================================

CREATE TABLE id_sequences (
    entity_type VARCHAR(50) PRIMARY KEY,
    last_value INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. DOMAIN SUPPORT TABLES (§7.9, §7.10)
-- ============================================================================

CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_id VARCHAR(20) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMPTZ
);

-- ============================================================================
-- 4. AGGREGATE ROOT & CORE TABLES (§7.1 - §7.8)
-- ============================================================================

CREATE TABLE business_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_id VARCHAR(20) NOT NULL UNIQUE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    domain domain_type NOT NULL DEFAULT 'INVENTORY',
    status case_status NOT NULL DEFAULT 'DETECTED',
    anomaly_type anomaly_type NOT NULL,
    severity anomaly_severity NOT NULL DEFAULT 'MEDIUM',
    detection_confidence FLOAT NOT NULL CHECK (detection_confidence >= 0.0 AND detection_confidence <= 1.0),
    schema_version VARCHAR(20) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Optional fields populated as case progresses
    affected_entities JSONB,
    baseline_delta FLOAT,
    detector_version VARCHAR(20),
    detection_payload JSONB,
    detected_at TIMESTAMPTZ,
    root_cause_hypothesis TEXT,
    investigation_confidence FLOAT CHECK (investigation_confidence >= 0.0 AND investigation_confidence <= 1.0),
    evidence_chain JSONB,
    investigator_version VARCHAR(20),
    investigated_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    approval_decision VARCHAR(10) CHECK (approval_decision IN ('APPROVED', 'REJECTED')),
    approval_comment TEXT,
    approved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

CREATE TABLE business_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES business_cases(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    source_agent VARCHAR(50) NOT NULL,
    schema_version VARCHAR(20) NOT NULL,
    correlation_id UUID NOT NULL,
    payload JSONB NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE case_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES business_cases(id) ON DELETE CASCADE,
    milestone timeline_milestone NOT NULL,
    description TEXT NOT NULL,
    agent VARCHAR(50) NOT NULL,
    metadata JSONB,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_id VARCHAR(20) NOT NULL UNIQUE,
    case_id UUID NOT NULL REFERENCES business_cases(id) ON DELETE CASCADE,
    plan_version INTEGER NOT NULL CHECK (plan_version >= 1),
    recommendation_summary TEXT NOT NULL,
    confidence_score FLOAT NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    risk_score FLOAT NOT NULL CHECK (risk_score >= 0.0 AND risk_score <= 1.0),
    reasoning_summary TEXT NOT NULL,
    evidence JSONB NOT NULL,
    alternative_decisions JSONB,
    status decision_status NOT NULL DEFAULT 'PENDING',
    created_by VARCHAR(50) NOT NULL,
    schema_version VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_decisions_case_version UNIQUE (case_id, plan_version)
);

CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_id VARCHAR(20) NOT NULL UNIQUE,
    case_id UUID NOT NULL UNIQUE REFERENCES business_cases(id) ON DELETE CASCADE,
    decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE RESTRICT,
    current_stage execution_stage NOT NULL DEFAULT 'INITIALIZING',
    current_status execution_status NOT NULL DEFAULT 'RUNNING',
    total_actions INTEGER NOT NULL CHECK (total_actions > 0),
    completed_actions INTEGER NOT NULL DEFAULT 0 CHECK (completed_actions >= 0),
    failed_actions INTEGER NOT NULL DEFAULT 0 CHECK (failed_actions >= 0),
    retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
    checkpoint_state JSONB,
    result JSONB,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    duration_ms INTEGER CHECK (duration_ms >= 0),
    version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_id VARCHAR(20) NOT NULL UNIQUE,
    execution_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES business_cases(id) ON DELETE CASCADE,
    priority_order INTEGER NOT NULL CHECK (priority_order >= 1),
    action_type VARCHAR(50) NOT NULL,
    action_key VARCHAR(100) NOT NULL,
    parameters JSONB NOT NULL,
    expected_outcome TEXT NOT NULL,
    risk_level risk_level NOT NULL DEFAULT 'MEDIUM',
    required_approval_tier VARCHAR(20),
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    status action_status NOT NULL DEFAULT 'PENDING',
    system_response JSONB,
    failure_reason TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    duration_ms INTEGER CHECK (duration_ms >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_actions_execution_order UNIQUE (execution_id, priority_order)
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES business_cases(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    actor VARCHAR(100) NOT NULL,
    actor_type actor_type NOT NULL,
    before_snapshot JSONB,
    after_snapshot JSONB NOT NULL,
    correlation_id UUID NOT NULL,
    metadata JSONB,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE knowledge_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES business_cases(id) ON DELETE CASCADE,
    knowledge_type knowledge_type NOT NULL,
    domain VARCHAR(50) NOT NULL,
    entity_key VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    structured_data JSONB NOT NULL,
    confidence FLOAT NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
    embedding vector(768),
    version VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ
);

-- ============================================================================
-- 5. SIMULATION BOUNDARY TABLES (§7.11, §7.12, §18)
-- ============================================================================

CREATE TABLE scenario_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    domain VARCHAR(50) NOT NULL,
    anomaly_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    event_sequence JSONB NOT NULL,
    expected_outcome JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scenario_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES scenario_templates(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('RUNNING', 'COMPLETE', 'FAILED', 'CANCELLED')),
    triggered_by VARCHAR(100) NOT NULL,
    linked_case_id UUID REFERENCES business_cases(id) ON DELETE SET NULL,
    run_config JSONB,
    run_result JSONB,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. ERP / WMS INVENTORY LEDGER TABLES (Tool Proxy Execution Targets §15.2)
-- ============================================================================

CREATE TABLE inventory_items (
    sku VARCHAR(64) PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    current_stock INTEGER NOT NULL CHECK (current_stock >= 0),
    reserved_stock INTEGER NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
    reorder_point INTEGER NOT NULL CHECK (reorder_point >= 0),
    reorder_quantity INTEGER NOT NULL CHECK (reorder_quantity > 0),
    unit_cost DECIMAL(10, 2) NOT NULL CHECK (unit_cost >= 0),
    supplier_id VARCHAR(64) NOT NULL,
    lead_time_days INTEGER NOT NULL CHECK (lead_time_days > 0),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier_slas (
    supplier_id VARCHAR(64) PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contracted_lead_time_days INTEGER NOT NULL CHECK (contracted_lead_time_days > 0),
    on_time_delivery_rate FLOAT NOT NULL CHECK (on_time_delivery_rate >= 0.0 AND on_time_delivery_rate <= 1.0),
    expedite_fee_usd DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_orders (
    po_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id VARCHAR(64) NOT NULL REFERENCES supplier_slas(supplier_id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    status VARCHAR(30) NOT NULL CHECK (status IN ('OPEN', 'PARTIALLY_RECEIVED', 'CLOSED', 'CANCELLED', 'PENDING')),
    order_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expected_delivery TIMESTAMPTZ NOT NULL,
    actual_delivery TIMESTAMPTZ
);

CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID NOT NULL REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
    sku VARCHAR(64) NOT NULL REFERENCES inventory_items(sku),
    ordered_quantity INTEGER NOT NULL CHECK (ordered_quantity > 0),
    received_quantity INTEGER NOT NULL DEFAULT 0 CHECK (received_quantity >= 0),
    unit_price_usd DECIMAL(10, 2) NOT NULL CHECK (unit_price_usd >= 0)
);

CREATE TABLE warehouse_receipts (
    receipt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID REFERENCES purchase_orders(po_id) ON DELETE SET NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    sku VARCHAR(64) NOT NULL REFERENCES inventory_items(sku),
    quantity_received INTEGER NOT NULL CHECK (quantity_received >= 0),
    quantity_damaged INTEGER NOT NULL DEFAULT 0 CHECK (quantity_damaged >= 0),
    dock_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    operator_badge VARCHAR(64) NOT NULL
);

-- ============================================================================
-- 7. COMPATIBILITY VIEWS (§15_IMPLEMENTATION_MASTER_PLAN.md §21.1)
-- ============================================================================

CREATE OR REPLACE VIEW cases AS
SELECT
    id,
    domain::VARCHAR(64) AS domain,
    ('Anomaly Case ' || public_id)::VARCHAR(255) AS title,
    status::text::case_status AS status,
    severity::text::anomaly_severity AS severity,
    (affected_entities->0->>'sku')::VARCHAR(64) AS sku,
    COALESCE(baseline_delta, 0.0)::DECIMAL(8, 4) AS z_score,
    root_cause_hypothesis AS root_cause_summary,
    (SELECT row_to_json(d.*)::JSONB FROM decisions d WHERE d.case_id = business_cases.id ORDER BY d.plan_version DESC LIMIT 1) AS execution_plan,
    (approval_comment)::VARCHAR(255) AS approval_token,
    (SELECT display_name FROM users WHERE id = approved_by)::VARCHAR(128) AS approved_by,
    approved_at,
    (CASE WHEN approval_decision = 'REJECTED' THEN approval_comment ELSE NULL END) AS rejection_reason,
    version,
    created_at,
    updated_at
FROM business_cases;

CREATE OR REPLACE VIEW case_events AS
SELECT
    id,
    case_id,
    event_type::VARCHAR(128) AS event_type,
    source_agent::VARCHAR(64) AS source_agent,
    payload,
    occurred_at AS created_at
FROM business_events
WHERE case_id IS NOT NULL;
