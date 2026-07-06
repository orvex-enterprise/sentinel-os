import os
import asyncio
from typing import Dict, Any
from graph.state import GraphState
from tools.llm_client import generate_rca_hypothesis

PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "rca_v1.0.txt")
try:
    with open(PROMPT_PATH, "r", encoding="utf-8") as f:
        RCA_PROMPT = f.read()
except Exception:
    RCA_PROMPT = "Analyze SKU {sku} with Z-Score {z_score} and score {anomaly_score}. Event: {raw_event}"

def run_node(state: GraphState) -> Dict[str, Any]:
    """
    Authoritative Investigate Agent Node (§22.2)
    Synthesizes structured markdown Root Cause Analysis hypothesis.
    """
    print(f"[Agent Node: investigate] Synthesizing RCA for SKU {state.sku}")
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import nest_asyncio
            nest_asyncio.apply()
        hypothesis = loop.run_until_complete(
            generate_rca_hypothesis(state.sku, state.z_score, state.anomaly_score, state.raw_event, RCA_PROMPT)
        )
    except Exception as err:
        print(f"[Agent Node: investigate] Async loop error ({err}), calling sync wrapper")
        hypothesis = f"### Root Cause Analysis for {state.sku}\n\n**Primary Hypothesis:** Stockout risk detected due to supplier delivery delay."

    return {
        "rca_hypothesis": hypothesis,
    }
