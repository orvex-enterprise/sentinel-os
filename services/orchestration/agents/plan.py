import os
import asyncio
from typing import Dict, Any
from graph.state import GraphState, CaseStatusPy
from tools.llm_client import generate_execution_plan

PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "plan_v1.0.txt")
try:
    with open(PROMPT_PATH, "r", encoding="utf-8") as f:
        PLAN_PROMPT = f.read()
except Exception:
    PLAN_PROMPT = "Generate plan for Case {case_id}, SKU {sku}, RCA: {rca_hypothesis}"

def run_node(state: GraphState) -> Dict[str, Any]:
    """
    Authoritative Plan Agent Node (§22.2)
    Generates structured JSON ExecutionPlanPy and checkpoints state for approval.
    """
    print(f"[Agent Node: plan] Generating execution plan for Case {state.case_id}")
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import nest_asyncio
            nest_asyncio.apply()
        plan = loop.run_until_complete(
            generate_execution_plan(state.case_id, state.sku, state.rca_hypothesis or "", PLAN_PROMPT)
        )
    except Exception as err:
        print(f"[Agent Node: plan] Error generating plan ({err})")
        plan = None

    return {
        "execution_plan": plan,
        "status": CaseStatusPy.PENDING_APPROVAL if plan else state.status,
    }
