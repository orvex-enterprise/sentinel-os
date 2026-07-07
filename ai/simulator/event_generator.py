#!/usr/bin/env python3
import os
import sys
import time
import json
import uuid
import argparse
from typing import Dict, Any, List

# Authoritative Turnkey Stream Simulator (§25.1, task.md Phase 4)
# Generates WMS stock updates and anomaly scenarios into Redis stream or API Gateway

SCENARIOS: List[Dict[str, Any]] = [
    {
        "name": "Stockout Risk Detected: SKU-9942",
        "sku": "SKU-9942",
        "domain": "INVENTORY",
        "z_score": 3.84,
        "anomaly_score": 0.92,
        "payload": {
            "sku": "SKU-9942",
            "event_type": "wms.stock_update",
            "warehouse_id": "WH-001",
            "metrics": {
                "current_stock": 15,
                "reorder_point": 150,
                "daily_demand": 45,
                "supplier_lead_time_days": 12,
            },
            "root_cause_hint": "Apex Logistics 5-day delivery delay combined with demand surge."
        }
    },
    {
        "name": "Supplier SLA Violation: SKU-7821",
        "sku": "SKU-7821",
        "domain": "INVENTORY",
        "z_score": 2.95,
        "anomaly_score": 0.81,
        "payload": {
            "sku": "SKU-7821",
            "event_type": "wms.stock_update",
            "warehouse_id": "WH-002",
            "metrics": {
                "current_stock": 40,
                "reorder_point": 50,
                "daily_demand": 10,
                "supplier_lead_time_days": 14,
            },
            "root_cause_hint": "Supplier missed SLA window by 4 days."
        }
    },
    {
        "name": "Demand Spike Anomaly: SKU-3341",
        "sku": "SKU-3341",
        "domain": "INVENTORY",
        "z_score": 3.10,
        "anomaly_score": 0.86,
        "payload": {
            "sku": "SKU-3341",
            "event_type": "wms.stock_update",
            "warehouse_id": "WH-001",
            "metrics": {
                "current_stock": 120,
                "reorder_point": 200,
                "daily_demand": 110,
                "supplier_lead_time_days": 5,
            },
            "root_cause_hint": "Viral social media marketing campaign caused 300% daily order spike."
        }
    },
    {
        "name": "Normal Baseline Tick: SKU-1002",
        "sku": "SKU-1002",
        "domain": "INVENTORY",
        "z_score": 0.45,
        "anomaly_score": 0.12,
        "payload": {
            "sku": "SKU-1002",
            "event_type": "wms.stock_update",
            "warehouse_id": "WH-001",
            "metrics": {
                "current_stock": 290,
                "reorder_point": 100,
                "daily_demand": 25,
                "supplier_lead_time_days": 3,
            },
            "root_cause_hint": "Normal inventory operation within standard deviation."
        }
    }
]

def publish_via_redis(envelope: Dict[str, Any], redis_url: str) -> bool:
    try:
        import redis
        r = redis.Redis.from_url(redis_url)
        payload_str = json.dumps(envelope)
        msg_id = r.xadd("sentinel:events:inventory", {"payload": payload_str})
        print(f"[Redis Stream] Published event {envelope['event_type']} ({envelope['event_id']}) -> ID: {msg_id}")
        return True
    except Exception as err:
        print(f"[Redis Stream] Redis publish failed ({err})")
        return False

def publish_via_http(envelope: Dict[str, Any], gateway_url: str) -> bool:
    try:
        import urllib.request
        url = f"{gateway_url}/api/v1/cases/{envelope['correlation_id']}/events"
        req = urllib.request.Request(
            url,
            data=json.dumps(envelope).encode("utf-8"),
            headers={"Content-Type": "application/json", "Authorization": "Bearer tok_live_demo_8849201948210"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as res:
            if res.status == 200:
                print(f"[HTTP Gateway] Published event {envelope['event_type']} to API Gateway -> Case: {envelope['correlation_id']}")
                return True
    except Exception as err:
        print(f"[HTTP Gateway] HTTP publish failed ({err})")
    return False

def main():
    parser = argparse.ArgumentParser(description="Sentinel OS Turnkey Stream Simulator (§25.1)")
    parser.add_argument("--mode", choices=["redis", "http", "auto"], default="auto", help="Publishing mode")
    parser.add_argument("--redis-url", default=os.getenv("REDIS_URL", "redis://localhost:6379"), help="Redis URL")
    parser.add_argument("--gateway-url", default=os.getenv("GATEWAY_URL", "http://localhost:4000"), help="API Gateway URL")
    parser.add_argument("--interval", type=float, default=30.0, help="Interval between events in seconds")
    parser.add_argument("--count", type=int, default=0, help="Number of events to generate (0 = infinite)")
    args = parser.parse_args()

    print(f"==========================================================")
    print(f"[Sentinel Stream Simulator] Initializing Anomaly Generator")
    print(f"[Sentinel Stream Simulator] Mode: {args.mode.upper()}")
    print(f"==========================================================")

    generated = 0
    idx = 0
    while True:
        scenario = SCENARIOS[idx % len(SCENARIOS)]
        case_id = str(uuid.uuid4())
        envelope = {
            "event_id": str(uuid.uuid4()),
            "event_type": scenario["payload"]["event_type"],
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "source_system": "simulator:wms:v1",
            "correlation_id": case_id,
            "domain": scenario["domain"],
            "sku": scenario["sku"],
            "payload": {
                **scenario["payload"],
                "z_score": scenario["z_score"],
                "anomaly_score": scenario["anomaly_score"],
            },
            "version": "1.0"
        }

        print(f"\n[Simulator] Dispatching Scenario: {scenario['name']} (SKU: {scenario['sku']})")
        
        success = False
        if args.mode in ("redis", "auto"):
            success = publish_via_redis(envelope, args.redis_url)
        
        if not success and args.mode in ("http", "auto"):
            success = publish_via_http(envelope, args.gateway_url)

        if not success:
            print(f"[Simulator] Could not publish event via Redis or HTTP. Please check local services.")

        generated += 1
        idx += 1
        if args.count > 0 and generated >= args.count:
            break
        
        time.sleep(args.interval)

if __name__ == "__main__":
    main()
