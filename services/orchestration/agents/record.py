import hashlib
import json
from typing import Dict, Any
from graph.state import GraphState

def run_node(state: GraphState) -> Dict[str, Any]:
    """
    Authoritative Record Agent Node (§22.2)
    Computes SHA-256 cryptographic hash of state transitions for audit trail.
    """
    print(f"[Agent Node: record] Recording cryptographic audit trail for Case {state.case_id}")
    state_dict = state.model_dump()
    state_str = json.dumps(state_dict, sort_keys=True, default=str)
    crypto_hash = hashlib.sha256(state_str.encode("utf-8")).hexdigest()
    print(f"[Agent Node: record] Case {state.case_id} -> SHA-256 Hash: {crypto_hash}")
    return {}
