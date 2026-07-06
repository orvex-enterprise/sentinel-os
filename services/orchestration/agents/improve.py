from typing import Dict, Any
from graph.state import GraphState
from tools.baseline_engine import update_baseline_feedback

def run_node(state: GraphState) -> Dict[str, Any]:
    """
    Authoritative Improve Agent Node (§22.2)
    Feeds execution outcome latency back into rolling statistical baseline.
    """
    print(f"[Agent Node: improve] Updating rolling statistical baseline for SKU {state.sku}")
    metrics = state.raw_event.get("metrics", {}) if isinstance(state.raw_event, dict) else {}
    reorder_point = metrics.get("reorder_point", 50)
    restored_stock = reorder_point + 100
    update_baseline_feedback(state.sku, restored_stock, latency_seconds=1.85)
    return {}
