-- ============================================================================
-- Sentinel OS — System & Core Seed Data (03_seed_data.sql)
-- Governing Specs: 04_DATABASE.md §18, §20, §21; 13_DEMO_SCRIPT.md
-- Purpose: Authoritative baseline seed data for warehouses, users, sequences, and templates
-- ============================================================================

-- 1. ID SEQUENCES (§20.3)
INSERT INTO id_sequences (entity_type, last_value) VALUES
    ('CASE', 1),
    ('EVENT', 42),
    ('DECISION', 7),
    ('EXECUTION', 3),
    ('ACTION', 15),
    ('WAREHOUSE', 2),
    ('USER', 4)
ON CONFLICT (entity_type) DO UPDATE SET last_value = EXCLUDED.last_value;

-- 2. WAREHOUSES (§7.9)
INSERT INTO warehouses (id, public_id, name, location, timezone, metadata) VALUES
    ('11111111-1111-1111-1111-111111111111', 'WH-001', 'Warehouse Alpha', 'Austin, TX', 'America/Chicago', '{"facility_type": "PRIMARY_DISTRIBUTION", "sq_ft": 250000}'::jsonb),
    ('22222222-2222-2222-2222-222222222222', 'WH-002', 'Warehouse Beta', 'Reno, NV', 'America/Los_Angeles', '{"facility_type": "REGIONAL_HUB", "sq_ft": 150000}'::jsonb)
ON CONFLICT (public_id) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    timezone = EXCLUDED.timezone,
    metadata = EXCLUDED.metadata;

-- 3. USERS (§7.10)
INSERT INTO users (id, public_id, display_name, email, role) VALUES
    ('33333333-3333-3333-3333-333333333331', 'USR-001', 'operator@sentinel.ai', 'operator@sentinel.ai', 'APPROVER'),
    ('33333333-3333-3333-3333-333333333332', 'USR-002', 'admin@sentinel.ai', 'admin@sentinel.ai', 'ADMIN'),
    ('33333333-3333-3333-3333-333333333333', 'USR-003', 'viewer@sentinel.ai', 'viewer@sentinel.ai', 'VIEWER')
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role;

-- 4. SCENARIO TEMPLATES (§7.11)
INSERT INTO scenario_templates (id, name, domain, anomaly_type, description, event_sequence, expected_outcome, is_active) VALUES
    (
        '44444444-4444-4444-4444-444444444441',
        'SCEN-001-STOCKOUT-RISK',
        'INVENTORY',
        'STOCKOUT_RISK',
        'Simulates an imminent stockout risk on SKU-7821 (High-Capacity Industrial Pump) caused by a supplier delivery delay on PO-4491 at Warehouse Alpha.',
        '[
            {"step": 1, "event": "inventory.stock_level_dropped", "payload": {"sku": "SKU-7821", "current_stock": 12, "reserved_stock": 10, "reorder_point": 50}},
            {"step": 2, "event": "procurement.po_delivery_overdue", "payload": {"po_id": "PO-4491", "supplier_id": "SUP-001", "days_overdue": 7}}
        ]'::jsonb,
        '{"expected_status": "CLOSED_SUCCESS", "expected_actions": ["REORDER_STOCK", "ESCALATE_SUPPLIER", "ADJUST_SAFETY_STOCK"]}'::jsonb,
        TRUE
    ),
    (
        '44444444-4444-4444-4444-444444444442',
        'SCEN-002-RECEIVING-DISCREPANCY',
        'INVENTORY',
        'RECEIVING_DISCREPANCY',
        'Simulates a receiving discrepancy on SKU-1002 (Digital Pressure Sensor) where damaged goods exceed acceptable thresholds upon dock arrival.',
        '[
            {"step": 1, "event": "warehouse.receipt_discrepancy", "payload": {"po_id": "PO-4492", "sku": "SKU-1002", "quantity_received": 100, "quantity_damaged": 15}}
        ]'::jsonb,
        '{"expected_status": "CLOSED_SUCCESS", "expected_actions": ["QUARANTINE_STOCK", "ISSUE_VENDOR_CLAIM", "REQUEST_REPLACEMENT"]}'::jsonb,
        TRUE
    ),
    (
        '44444444-4444-4444-4444-444444444443',
        'SCEN-003-SUPPLIER-DELAY',
        'PROCUREMENT',
        'SUPPLIER_DELAY',
        'Simulates an unannounced supplier delay from Apex Logistics impacting multiple downstream production schedules.',
        '[
            {"step": 1, "event": "supplier.asn_delayed", "payload": {"supplier_id": "SUP-001", "affected_pos": ["PO-4491"], "delay_days": 14}}
        ]'::jsonb,
        '{"expected_status": "CLOSED_SUCCESS", "expected_actions": ["EXPEDITE_PO", "REALLOCATE_INVENTORY"]}'::jsonb,
        TRUE
    )
ON CONFLICT (name) DO UPDATE SET
    domain = EXCLUDED.domain,
    anomaly_type = EXCLUDED.anomaly_type,
    description = EXCLUDED.description,
    event_sequence = EXCLUDED.event_sequence,
    expected_outcome = EXCLUDED.expected_outcome,
    is_active = EXCLUDED.is_active;
