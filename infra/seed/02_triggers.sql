-- ============================================================================
-- Sentinel OS — Indexes, Constraints & Triggers (02_triggers.sql)
-- Governing Specs: 04_DATABASE.md §11, §12, §13, §14, §15, §16, §25
-- Purpose: Authoritative index strategy, immutability enforcement, and FSM
-- ============================================================================

-- ============================================================================
-- 1. INDEX REGISTER (§12.3)
-- ============================================================================

-- business_cases
CREATE INDEX IF NOT EXISTS idx_bc_status ON business_cases (status);
CREATE INDEX IF NOT EXISTS idx_bc_warehouse_status ON business_cases (warehouse_id, status);
CREATE INDEX IF NOT EXISTS idx_bc_severity_status ON business_cases (severity, status);
CREATE INDEX IF NOT EXISTS idx_bc_created_at ON business_cases (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bc_domain_status ON business_cases (domain, status);
CREATE INDEX IF NOT EXISTS idx_bc_affected_entities ON business_cases USING GIN (affected_entities);

-- business_events
CREATE INDEX IF NOT EXISTS idx_be_case_id ON business_events (case_id);
CREATE INDEX IF NOT EXISTS idx_be_event_type ON business_events (event_type);
CREATE INDEX IF NOT EXISTS idx_be_occurred_at ON business_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_be_case_occurred ON business_events (case_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_be_correlation_id ON business_events (correlation_id);

-- case_timeline
CREATE INDEX IF NOT EXISTS idx_ct_case_id ON case_timeline (case_id);
CREATE INDEX IF NOT EXISTS idx_ct_case_occurred ON case_timeline (case_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_ct_milestone ON case_timeline (milestone);

-- decisions
CREATE INDEX IF NOT EXISTS idx_dec_case_id ON decisions (case_id);
CREATE INDEX IF NOT EXISTS idx_dec_status ON decisions (status);

-- executions
CREATE INDEX IF NOT EXISTS idx_exe_current_status ON executions (current_status);

-- actions
CREATE INDEX IF NOT EXISTS idx_act_execution_id ON actions (execution_id);
CREATE INDEX IF NOT EXISTS idx_act_case_id ON actions (case_id);
CREATE INDEX IF NOT EXISTS idx_act_status ON actions (status);

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_al_case_id ON audit_logs (case_id);
CREATE INDEX IF NOT EXISTS idx_al_event_type ON audit_logs (event_type);
CREATE INDEX IF NOT EXISTS idx_al_recorded_at ON audit_logs (recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_al_case_recorded ON audit_logs (case_id, recorded_at);

-- knowledge_records
CREATE INDEX IF NOT EXISTS idx_kr_entity_key ON knowledge_records (entity_key);
CREATE INDEX IF NOT EXISTS idx_kr_knowledge_type ON knowledge_records (knowledge_type);
CREATE INDEX IF NOT EXISTS idx_kr_entity_type ON knowledge_records (entity_key, knowledge_type);
CREATE INDEX IF NOT EXISTS idx_kr_embedding ON knowledge_records USING hnsw (embedding vector_cosine_ops);

-- ============================================================================
-- 2. TIMESTAMPS & UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bc_updated_at
    BEFORE UPDATE ON business_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_exe_updated_at
    BEFORE UPDATE ON executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_wh_updated_at
    BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_st_updated_at
    BEFORE UPDATE ON scenario_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_seq_updated_at
    BEFORE UPDATE ON id_sequences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. IMMUTABILITY / APPEND-ONLY ENFORCEMENT (§14.2, §15.1)
-- ============================================================================

CREATE OR REPLACE FUNCTION enforce_append_only()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Table % is append-only and cannot be modified or deleted.', TG_TABLE_NAME;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_logs_append_only
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION enforce_append_only();

CREATE TRIGGER trg_business_events_append_only
    BEFORE UPDATE OR DELETE ON business_events
    FOR EACH ROW EXECUTE FUNCTION enforce_append_only();

CREATE TRIGGER trg_case_timeline_append_only
    BEFORE UPDATE OR DELETE ON case_timeline
    FOR EACH ROW EXECUTE FUNCTION enforce_append_only();

-- ============================================================================
-- 4. TIMELINE MONOTONICITY TRIGGER (§14.1, §14.2)
-- ============================================================================

CREATE OR REPLACE FUNCTION enforce_timeline_monotonicity()
RETURNS TRIGGER AS $$
DECLARE
    max_occurred TIMESTAMPTZ;
BEGIN
    SELECT MAX(occurred_at) INTO max_occurred
    FROM case_timeline
    WHERE case_id = NEW.case_id;

    IF max_occurred IS NOT NULL AND NEW.occurred_at < max_occurred THEN
        RAISE EXCEPTION 'Timeline monotonicity violation for case_id %: new timestamp % is earlier than latest timestamp %',
            NEW.case_id, NEW.occurred_at, max_occurred;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_case_timeline_monotonicity
    BEFORE INSERT ON case_timeline
    FOR EACH ROW EXECUTE FUNCTION enforce_timeline_monotonicity();

-- ============================================================================
-- 5. DECISION SUPERSEDING TRIGGER (§7.4, §9.3, §14.2)
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_supersede_decisions()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE decisions
    SET status = 'SUPERSEDED'
    WHERE case_id = NEW.case_id
      AND status = 'PENDING'
      AND id <> NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_decisions_auto_supersede
    AFTER INSERT ON decisions
    FOR EACH ROW EXECUTE FUNCTION auto_supersede_decisions();

-- ============================================================================
-- 6. BUSINESS CASE STATE MACHINE VALIDATION TRIGGER (§14.2, §25.2, §25.3)
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_case_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- If status is unchanged, allow
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Terminal states cannot transition to any other state (§25.3)
    IF OLD.status IN ('CLOSED_SUCCESS', 'CLOSED_REJECTED', 'CLOSED_FAILED') THEN
        RAISE EXCEPTION 'Forbidden transition: Terminal case status % cannot be changed to %', OLD.status, NEW.status;
    END IF;

    -- Validate allowed transitions (§25.2)
    CASE OLD.status
        WHEN 'DETECTED' THEN
            IF NEW.status NOT IN ('INVESTIGATING') THEN
                RAISE EXCEPTION 'Invalid transition from DETECTED to %', NEW.status;
            END IF;
        WHEN 'INVESTIGATING' THEN
            IF NEW.status NOT IN ('PLAN_GENERATED') THEN
                RAISE EXCEPTION 'Invalid transition from INVESTIGATING to %', NEW.status;
            END IF;
        WHEN 'PLAN_GENERATED' THEN
            IF NEW.status NOT IN ('AWAITING_APPROVAL') THEN
                RAISE EXCEPTION 'Invalid transition from PLAN_GENERATED to %', NEW.status;
            END IF;
        WHEN 'AWAITING_APPROVAL' THEN
            IF NEW.status NOT IN ('APPROVED', 'PLAN_GENERATED', 'CLOSED_REJECTED') THEN
                RAISE EXCEPTION 'Invalid transition from AWAITING_APPROVAL to %', NEW.status;
            END IF;
        WHEN 'APPROVED' THEN
            IF NEW.status NOT IN ('EXECUTING') THEN
                RAISE EXCEPTION 'Invalid transition from APPROVED to %', NEW.status;
            END IF;
        WHEN 'EXECUTING' THEN
            IF NEW.status NOT IN ('EXECUTION_FAILED', 'CLOSED_SUCCESS') THEN
                RAISE EXCEPTION 'Invalid transition from EXECUTING to %', NEW.status;
            END IF;
        WHEN 'EXECUTION_FAILED' THEN
            IF NEW.status NOT IN ('CLOSED_FAILED') THEN
                RAISE EXCEPTION 'Invalid transition from EXECUTION_FAILED to %', NEW.status;
            END IF;
        ELSE
            RAISE EXCEPTION 'Unknown case status transition from % to %', OLD.status, NEW.status;
    END CASE;

    -- Maintain closed_at timestamp (§7.1)
    IF NEW.status IN ('CLOSED_SUCCESS', 'CLOSED_REJECTED', 'CLOSED_FAILED') AND NEW.closed_at IS NULL THEN
        NEW.closed_at = CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bc_status_transition
    BEFORE UPDATE OF status ON business_cases
    FOR EACH ROW EXECUTE FUNCTION validate_case_status_transition();
