from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class CaseStatusPy(str, Enum):
    # Authoritative statuses from 04_DATABASE.md §25 & Master Plan §21.3
    OPEN = "OPEN"
    DETECTED = "DETECTED"
    INVESTIGATING = "INVESTIGATING"
    PLAN_GENERATED = "PLAN_GENERATED"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXECUTING = "EXECUTING"
    EXECUTION_FAILED = "EXECUTION_FAILED"
    RESOLVED = "RESOLVED"
    CLOSED_SUCCESS = "CLOSED_SUCCESS"
    CLOSED_REJECTED = "CLOSED_REJECTED"
    CLOSED_FAILED = "CLOSED_FAILED"
    FAILED = "FAILED"
    ESCALATED = "ESCALATED"


class ActionItemPy(BaseModel):
    action_key: str = Field(..., description="Unique idempotency identifier for this action")
    action_type: str = Field(..., description="Categorical action type")
    description: str = Field(..., description="Detailed human-readable action description")
    target_sku: str = Field(..., description="Target stock keeping unit")
    parameters: Dict[str, Any] = Field(default_factory=dict)
    risk_level: str = Field(..., description="Risk assessment: LOW, MEDIUM, or HIGH")
    expected_outcome: str = Field(..., description="Expected operational outcome")
    requires_human_approval: bool = Field(default=True)


class ExecutionPlanPy(BaseModel):
    plan_id: str
    case_id: str
    generated_by: str
    timestamp: str
    actions: List[ActionItemPy]
    contingency_strategy: str
    estimated_financial_impact_usd: float


class GraphState(BaseModel):
    case_id: str
    sku: str
    status: CaseStatusPy
    anomaly_score: float
    z_score: float
    raw_event: Dict[str, Any]
    baseline_context: Dict[str, Any] = Field(default_factory=dict)
    rca_hypothesis: Optional[str] = None
    execution_plan: Optional[ExecutionPlanPy] = None
    approval_token: Optional[str] = None
    error_trace: Optional[str] = None
    retry_count: int = 0
