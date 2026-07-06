import os
import psycopg2
from typing import Dict, Any, List, Optional

DATABASE_URL = os.getenv("DATABASE_URL", "postgres://sentinel:sentinel_secret@localhost:5432/sentinel_db")

# Authoritative Read Tools & Knowledge Search (§22.2, Phase 6)
# Connects to PostgreSQL inventory ledger with fallback simulation data

_MOCK_INVENTORY = {
    "SKU-7821": {"sku": "SKU-7821", "name": "Microcontroller Unit MCU-32", "warehouse": "WH-001", "current_stock": 40, "reorder_point": 50, "unit_cost_usd": 12.50},
    "SKU-8821": {"sku": "SKU-8821", "name": "Li-Ion Battery Pack 5000mAh", "warehouse": "WH-001", "current_stock": 80, "reorder_point": 30, "unit_cost_usd": 24.00},
    "SKU-1002": {"sku": "SKU-1002", "name": "Optical Sensor Assembly", "warehouse": "WH-002", "current_stock": 290, "reorder_point": 100, "unit_cost_usd": 45.00},
    "SKU-3341": {"sku": "SKU-3341", "name": "Power Supply Module 24V", "warehouse": "WH-001", "current_stock": 120, "reorder_point": 200, "unit_cost_usd": 38.00},
    "SKU-9942": {"sku": "SKU-9942", "name": "Industrial Servo Motor Pro", "warehouse": "WH-001", "current_stock": 15, "reorder_point": 150, "unit_cost_usd": 150.00},
}

_MOCK_POS = [
    {"po_id": "PO-4491", "sku": "SKU-9942", "supplier_id": "SUP-001", "qty": 200, "status": "IN_TRANSIT", "expected_delivery": "2026-07-10"},
    {"po_id": "PO-4492", "sku": "SKU-7821", "supplier_id": "SUP-002", "qty": 500, "status": "IN_TRANSIT", "expected_delivery": "2026-07-08"},
]

_MOCK_SLAS = {
    "SUP-001": {"supplier_id": "SUP-001", "name": "Apex Logistics & Manufacturing", "lead_time_days": 7, "on_time_delivery_rate": 0.94, "expedite_available": True},
    "SUP-002": {"supplier_id": "SUP-002", "name": "Global Tech Components", "lead_time_days": 10, "on_time_delivery_rate": 0.88, "expedite_available": False},
}


def get_inventory_item(sku: str) -> Optional[Dict[str, Any]]:
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("SELECT sku, name, current_stock, reorder_point, unit_cost_usd FROM inventory_items WHERE sku = %s", (sku,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return {"sku": row[0], "name": row[1], "current_stock": row[2], "reorder_point": row[3], "unit_cost_usd": float(row[4])}
    except Exception:
        pass
    return _MOCK_INVENTORY.get(sku)


def get_open_purchase_orders(sku: Optional[str] = None) -> List[Dict[str, Any]]:
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        query = "SELECT po_id, supplier_id, status, expected_delivery FROM purchase_orders WHERE status != 'DELIVERED'"
        params = []
        if sku:
            query += " AND po_id IN (SELECT po_id FROM purchase_order_items WHERE sku = %s)"
            params.append(sku)
        cur.execute(query, params)
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [{"po_id": r[0], "supplier_id": r[1], "status": r[2], "expected_delivery": str(r[3])} for r in rows]
    except Exception:
        pass
    if sku:
        return [p for p in _MOCK_POS if p["sku"] == sku]
    return _MOCK_POS


def get_supplier_sla(supplier_id: str) -> Optional[Dict[str, Any]]:
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("SELECT supplier_id, supplier_name, lead_time_days, on_time_delivery_rate FROM supplier_slas WHERE supplier_id = %s", (supplier_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return {"supplier_id": row[0], "name": row[1], "lead_time_days": row[2], "on_time_delivery_rate": float(row[3])}
    except Exception:
        pass
    return _MOCK_SLAS.get(supplier_id)


def search_knowledge_records(query: str, domain: str = "INVENTORY") -> List[Dict[str, Any]]:
    """
    Retrieves historical resolutions and RCA knowledge records (§22.2 investigate node)
    """
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("SELECT title, root_cause_summary, resolution_strategy FROM knowledge_records WHERE domain = %s LIMIT 5", (domain,))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [{"title": r[0], "root_cause_summary": r[1], "resolution": r[2]} for r in rows]
    except Exception:
        pass
    return [
        {
            "title": "Historical Stockout Resolution for SKU-9942",
            "root_cause_summary": "Apex Logistics experienced port delays during peak season.",
            "resolution": "Expedited air freight delivery and reallocated buffer stock from Warehouse Beta."
        }
    ]


def simulate_action_cost(action_type: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Cost simulation engine for financial impact estimation (§22.2 plan node)
    """
    base_cost = 0.0
    if action_type == "PO_EXPEDITE":
        base_cost = float(parameters.get("expedite_fee_usd", 450.0)) + 500.0
    elif action_type == "SAFETY_STOCK_ADJUST":
        qty = int(parameters.get("qty", 100))
        base_cost = float(qty) * 15.0  # Transfer and handling fee per unit
    return {
        "action_type": action_type,
        "estimated_cost_usd": base_cost,
        "currency": "USD",
        "confidence": 0.95
    }
