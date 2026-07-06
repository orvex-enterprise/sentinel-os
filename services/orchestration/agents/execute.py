from typing import Dict, Any
from graph.state import GraphState, CaseStatusPy
from tools.business_system_write import execute_action_write

def run_node(state: GraphState) -> Dict[str, Any]:
    """
    Authoritative Execute Agent Node (§22.2)
    Dispatches tool writes with idempotency when plan is explicitly APPROVED.
    """
    print(f"[Agent Node: execute] Executing approved plan for Case {state.case_id}")
    if state.status not in (CaseStatusPy.APPROVED, "APPROVED", CaseStatusPy.EXECUTING, "EXECUTING"):
        print(f"[Agent Node: execute] Execution aborted: Case status is {state.status}, expected APPROVED")
        return {"status": CaseStatusPy.EXECUTION_FAILED}

    if not state.execution_plan or not state.execution_plan.actions:
        print("[Agent Node: execute] No action items found in execution plan.")
        return {"status": CaseStatusPy.RESOLVED}

    all_success = True
    for action in state.execution_plan.actions:
        success, res = execute_action_write(action.action_key, action.action_type, action.target_sku, action.parameters)
        if not success:
            all_success = False

    new_status = CaseStatusPy.RESOLVED if all_success else CaseStatusPy.EXECUTION_FAILED
    return {
        "status": new_status,
    }
