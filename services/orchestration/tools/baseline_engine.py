import math
from typing import Dict, Any, Tuple

# Authoritative statistical baseline engine (§22.2)
# Maintains rolling 30-day statistics and calculates Z-scores

_SKU_BASELINES: Dict[str, Dict[str, float]] = {
    "SKU-7821": {"mean": 150.0, "std": 20.0, "reorder_point": 50.0},
    "SKU-8821": {"mean": 80.0, "std": 15.0, "reorder_point": 30.0},
    "SKU-1002": {"mean": 300.0, "std": 35.0, "reorder_point": 100.0},
    "SKU-3341": {"mean": 1000.0, "std": 120.0, "reorder_point": 200.0},
    "SKU-9942": {"mean": 200.0, "std": 25.0, "reorder_point": 150.0},
    "SKU-1088": {"mean": 450.0, "std": 40.0, "reorder_point": 200.0},
    "SKU-4402": {"mean": 120.0, "std": 18.0, "reorder_point": 40.0},
    "SKU-7711": {"mean": 500.0, "std": 45.0, "reorder_point": 100.0},
}


def get_sku_baseline(sku: str) -> Dict[str, float]:
    if sku not in _SKU_BASELINES:
        _SKU_BASELINES[sku] = {"mean": 200.0, "std": 30.0, "reorder_point": 50.0}
    return _SKU_BASELINES[sku]


def compute_anomaly(sku: str, current_stock: int, reorder_point: int) -> Tuple[float, float, Dict[str, Any]]:
    """
    Computes Z-score and probability anomaly score.
    Z = (mean - current_stock) / std
    """
    baseline = get_sku_baseline(sku)
    mean = baseline["mean"]
    std = max(baseline["std"], 1.0)

    # In inventory anomaly detection, lower stock than mean produces positive anomaly Z-score
    z_score = (mean - float(current_stock)) / std
    z_score = round(max(z_score, 0.0), 4)

    # Probability anomaly score using sigmoid approximation over Z-score
    anomaly_score = round(1.0 / (1.0 + math.exp(-1.5 * (z_score - 2.0))), 4)

    context = {
        "sku": sku,
        "current_stock": current_stock,
        "reorder_point": reorder_point,
        "rolling_mean": mean,
        "rolling_std": std,
        "calculated_z_score": z_score,
        "calculated_anomaly_score": anomaly_score,
    }
    return z_score, anomaly_score, context


def update_baseline_feedback(sku: str, restored_stock: int, latency_seconds: float) -> None:
    """
    Feeds execution outcome back into rolling statistical window (§22.2 improve node)
    """
    baseline = get_sku_baseline(sku)
    # Exponential moving average adjustment (alpha = 0.1)
    baseline["mean"] = round(0.9 * baseline["mean"] + 0.1 * float(restored_stock), 2)
    print(f"[Baseline Engine] Updated baseline for {sku} -> New Mean: {baseline['mean']} (Latency: {latency_seconds}s)")
