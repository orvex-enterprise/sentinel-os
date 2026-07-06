from langgraph.graph import StateGraph, END
from graph.state import GraphState
from agents import monitor, detect, investigate, plan, execute, record, improve


def build_inventory_workflow() -> StateGraph:
    """
    Authoritative LangGraph State Machine Architecture (§22.1)
    Enforces cyclical multi-agent execution pipeline with conditional routing.
    """
    workflow = StateGraph(GraphState)

    # Register Nodes (§22.2)
    workflow.add_node("monitor", monitor.run_node)
    workflow.add_node("detect", detect.run_node)
    workflow.add_node("investigate", investigate.run_node)
    workflow.add_node("plan", plan.run_node)
    workflow.add_node("execute", execute.run_node)
    workflow.add_node("record", record.run_node)
    workflow.add_node("improve", improve.run_node)

    # Define Edges & Routing Logic
    workflow.set_entry_point("monitor")
    workflow.add_edge("monitor", "detect")

    def route_after_detect(state: GraphState) -> str:
        # Route to investigation if Z-score >= 2.50 or probability score >= 0.70 (§22.1)
        if state.anomaly_score >= 0.70 or state.z_score >= 2.50:
            return "investigate"
        return END

    workflow.add_conditional_edges("detect", route_after_detect, {
        "investigate": "investigate",
        END: END
    })

    workflow.add_edge("investigate", "plan")

    def route_after_plan(state: GraphState) -> str:
        # Checkpoint graph state and yield execution to human operator (§22.1)
        if state.status in ("PENDING_APPROVAL", "AWAITING_APPROVAL", "PLAN_GENERATED"):
            return END
        return "execute"

    workflow.add_conditional_edges("plan", route_after_plan, {
        END: END,
        "execute": "execute"
    })

    workflow.add_edge("execute", "record")
    workflow.add_edge("record", "improve")
    workflow.add_edge("improve", END)

    return workflow


def get_checkpointer():
    """
    Authoritative Checkpointer Factory (§21.1, §22.1)
    Returns Postgres checkpointer if available, with resilient MemorySaver fallback.
    """
    try:
        from langgraph.checkpoint.postgres import PostgresSaver
        import os
        db_url = os.getenv("DATABASE_URL", "")
        if db_url:
            return PostgresSaver.from_conn_string(db_url)
    except Exception:
        pass
    from langgraph.checkpoint.memory import MemorySaver
    return MemorySaver()
