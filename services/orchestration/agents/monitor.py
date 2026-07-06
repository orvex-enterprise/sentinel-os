from typing import Dict, Any
from graph.state import GraphState, CaseStatusPy

def run_node(state: GraphState) -> Dict[str, Any]:
    """
    Authoritative Monitor Agent Node (§22.2)
    Ingests raw Redis WMS event and initializes case state.
    """
    print(f"[Agent Node: monitor] Processing event for SKU {state.sku} (Case: {state.case_id})")
    return {
        "status": CaseStatusPy.DETECTED,
        "raw_event": state.raw_event or {"sku": state.sku, "event_type": "wms.stock_update"},
    }
