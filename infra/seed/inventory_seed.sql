-- ============================================================================
-- Sentinel OS — Simulation Inventory Seed Data (inventory_seed.sql)
-- Governing Specs: 04_DATABASE.md §18, §21; 08_AGENT_SPECIFICATIONS.md §15.2
-- Purpose: Authoritative baseline ERP/WMS simulation inventory ledger data
-- ============================================================================

-- 1. SUPPLIER SLAS (§18.3, §15.2)
INSERT INTO supplier_slas (supplier_id, supplier_name, contact_email, contracted_lead_time_days, on_time_delivery_rate, expedite_fee_usd) VALUES
    ('SUP-001', 'Apex Logistics & Manufacturing', 'dispatch@apexlogistics.com', 5, 0.88, 450.00),
    ('SUP-002', 'Global Tech Components', 'orders@globaltech.com', 10, 0.95, 1200.00),
    ('SUP-003', 'Midwest Packaging Corp', 'sales@midwestpkg.com', 3, 0.99, 150.00)
ON CONFLICT (supplier_id) DO UPDATE SET
    supplier_name = EXCLUDED.supplier_name,
    contact_email = EXCLUDED.contact_email,
    contracted_lead_time_days = EXCLUDED.contracted_lead_time_days,
    on_time_delivery_rate = EXCLUDED.on_time_delivery_rate,
    expedite_fee_usd = EXCLUDED.expedite_fee_usd;

-- 2. INVENTORY ITEMS (§18.3, §15.2)
INSERT INTO inventory_items (sku, item_name, category, current_stock, reserved_stock, reorder_point, reorder_quantity, unit_cost, supplier_id, lead_time_days) VALUES
    ('SKU-7821', 'High-Capacity Industrial Pump', 'Hydraulics', 12, 10, 50, 100, 340.00, 'SUP-001', 5),
    ('SKU-8821', 'Precision Valve Assembly', 'Hydraulics', 8, 5, 30, 60, 120.00, 'SUP-001', 5),
    ('SKU-1002', 'Digital Pressure Sensor', 'Electronics', 150, 20, 100, 200, 85.50, 'SUP-002', 10),
    ('SKU-3341', 'Heavy-Duty Flange Gasket', 'Hardware', 500, 50, 200, 500, 4.25, 'SUP-003', 3),
    ('SKU-9901', 'Industrial Controller Module', 'Electronics', 45, 15, 40, 80, 650.00, 'SUP-002', 10)
ON CONFLICT (sku) DO UPDATE SET
    item_name = EXCLUDED.item_name,
    category = EXCLUDED.category,
    current_stock = EXCLUDED.current_stock,
    reserved_stock = EXCLUDED.reserved_stock,
    reorder_point = EXCLUDED.reorder_point,
    reorder_quantity = EXCLUDED.reorder_quantity,
    unit_cost = EXCLUDED.unit_cost,
    supplier_id = EXCLUDED.supplier_id,
    lead_time_days = EXCLUDED.lead_time_days;

-- 3. PURCHASE ORDERS & ITEMS (§18.3, §15.2)
-- Note: PO-4491 is deliberately seeded as overdue to support SCEN-001 (Stockout Risk demo scenario)
INSERT INTO purchase_orders (po_id, supplier_id, warehouse_id, status, order_date, expected_delivery, actual_delivery) VALUES
    ('55555555-5555-5555-5555-555555554491', 'SUP-001', '11111111-1111-1111-1111-111111111111', 'OPEN', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '3 days', NULL),
    ('55555555-5555-5555-5555-555555554492', 'SUP-002', '11111111-1111-1111-1111-111111111111', 'PARTIALLY_RECEIVED', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '5 days', NULL),
    ('55555555-5555-5555-5555-555555554493', 'SUP-003', '22222222-2222-2222-2222-222222222222', 'CLOSED', CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '17 days', CURRENT_TIMESTAMP - INTERVAL '17 days')
ON CONFLICT (po_id) DO UPDATE SET
    status = EXCLUDED.status,
    expected_delivery = EXCLUDED.expected_delivery,
    actual_delivery = EXCLUDED.actual_delivery;

INSERT INTO purchase_order_items (id, po_id, sku, ordered_quantity, received_quantity, unit_price_usd) VALUES
    ('66666666-6666-6666-6666-666666660001', '55555555-5555-5555-5555-555555554491', 'SKU-7821', 100, 0, 340.00),
    ('66666666-6666-6666-6666-666666660002', '55555555-5555-5555-5555-555555554492', 'SKU-1002', 200, 100, 85.50),
    ('66666666-6666-6666-6666-666666660003', '55555555-5555-5555-5555-555555554493', 'SKU-3341', 500, 500, 4.25)
ON CONFLICT DO NOTHING;

-- 4. WAREHOUSE RECEIPTS (§18.3, §15.2)
INSERT INTO warehouse_receipts (receipt_id, po_id, warehouse_id, sku, quantity_received, quantity_damaged, dock_timestamp, operator_badge) VALUES
    ('77777777-7777-7777-7777-777777770001', '55555555-5555-5555-5555-555555554492', '11111111-1111-1111-1111-111111111111', 'SKU-1002', 100, 2, CURRENT_TIMESTAMP - INTERVAL '1 day', 'OP-9921'),
    ('77777777-7777-7777-7777-777777770002', '55555555-5555-5555-5555-555555554493', '22222222-2222-2222-2222-222222222222', 'SKU-3341', 500, 0, CURRENT_TIMESTAMP - INTERVAL '17 days', 'OP-8812')
ON CONFLICT (receipt_id) DO UPDATE SET
    quantity_received = EXCLUDED.quantity_received,
    quantity_damaged = EXCLUDED.quantity_damaged;
