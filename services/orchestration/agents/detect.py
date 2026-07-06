from typing import Dict, Any
from graph.state import GraphState, CaseStatusPy
from tools.baseline_engine import compute_anomaly

def run_node(state: GraphState) -> Dict[str, Any]:
    """
    Authoritative Detect Agent Node (§22.2)
    Computes rolling statistics and Z-score anomaly probability.
    """
    print(f"[Agent Node: detect] Running anomaly detection on SKU {state.sku}")
    metrics = state.raw_event.get("metrics", {}) if isinstance(state.raw_event, dict) else {}
    current_stock = metrics.get("current_stock", 12)
    reorder_point = metrics.get("reorder_point", 50)

    z_score, anomaly_score, context = compute_anomaly(state.sku, current_stock, reorder_point)
    print(f"[Agent Node: detect] SKU {state.sku} -> Z-Score: {z_score}, Anomaly Score: {anomaly_score}")

    new_status = state.status
    if z_score >= 2.50 or anomaly_score >= 0.70:
        new_status = CaseStatusPy.INVESTIGATING

    return {
        "z_score": z_score,
        "anomaly_score": anomaly_score,
        "baseline_context": context,
        "status": new_status,
    }
