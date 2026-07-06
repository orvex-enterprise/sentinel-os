import time
import json
import logging
from typing import Dict, Any, Optional

# Authoritative Structured JSON Logger & Metrics Tracker (§22.2, Phase 10)
# Enforces correlation ID and W3C traceparent propagation across agent nodes

class StructuredJSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(record.created)),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "correlation_id": getattr(record, "correlation_id", "none"),
            "traceparent": getattr(record, "traceparent", "none"),
        }
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)

def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(StructuredJSONFormatter())
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger

class MetricsTracker:
    def __init__(self):
        self.total_cases = 0
        self.successful_actions = 0
        self.failed_actions = 0
        self.total_cycle_time_sec = 0.0

    def record_case_completion(self, cycle_time_sec: float, success: bool, correlation_id: str = "none", traceparent: str = "none") -> None:
        self.total_cases += 1
        self.total_cycle_time_sec += cycle_time_sec
        if success:
            self.successful_actions += 1
        else:
            self.failed_actions += 1
        
        logger = get_logger("sentinel.metrics")
        logger.info("Case completed", extra={
            "correlation_id": correlation_id,
            "traceparent": traceparent,
            "cycle_time_sec": round(cycle_time_sec, 3),
            "precision_rate": self.get_precision_rate(),
            "action_success_rate": self.get_success_rate(),
            "avg_cycle_time_sec": self.get_avg_cycle_time()
        })

    def get_precision_rate(self) -> float:
        if self.total_cases == 0:
            return 1.0
        return round(self.successful_actions / float(self.total_cases), 4)

    def get_success_rate(self) -> float:
        total_actions = self.successful_actions + self.failed_actions
        if total_actions == 0:
            return 1.0
        return round(self.successful_actions / float(total_actions), 4)

    def get_avg_cycle_time(self) -> float:
        if self.total_cases == 0:
            return 0.0
        return round(self.total_cycle_time_sec / float(self.total_cases), 3)

metrics_tracker = MetricsTracker()
