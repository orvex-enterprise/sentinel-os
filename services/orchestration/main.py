import os
import time
import json
import asyncio
from fastapi import FastAPI
import uvicorn
from graph.workflow import build_inventory_workflow, get_checkpointer
from graph.state import GraphState, CaseStatusPy

app = FastAPI(title="Sentinel OS Orchestration Service", version="1.0.0")
workflow_app = build_inventory_workflow().compile(checkpointer=get_checkpointer())

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "sentinel-orchestration",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "workflow": "compiled"
    }

@app.post("/api/v1/orchestrate")
def trigger_orchestration(payload: dict):
    """
    Direct endpoint to trigger LangGraph workflow execution for a case or event
    """
    case_id = payload.get("case_id", f"case_{int(time.time())}")
    sku = payload.get("sku", "SKU-9942")
    
    initial_state = GraphState(
        case_id=case_id,
        sku=sku,
        status=CaseStatusPy.DETECTED,
        anomaly_score=payload.get("anomaly_score", 0.85),
        z_score=payload.get("z_score", 3.20),
        raw_event=payload.get("raw_event", {"sku": sku, "metrics": {"current_stock": 10, "reorder_point": 50}})
    )
    
    print(f"[Orchestration API] Triggering workflow for Case {case_id} (SKU: {sku})")
    result = workflow_app.invoke(initial_state)
    return {
        "success": True,
        "case_id": case_id,
        "final_status": result.get("status"),
        "result": result
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    print(f"==========================================================")
    print(f"[Sentinel Orchestration Engine] Starting on port {port}")
    print(f"[Sentinel Orchestration Engine] LangGraph Workflow: Active")
    print(f"==========================================================")
    uvicorn.run(app, host="0.0.0.0", port=port)
