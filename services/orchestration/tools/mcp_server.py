import json
from typing import Dict, Any, Callable
from tools.read_tools import get_inventory_item, get_open_purchase_orders, get_supplier_sla, search_knowledge_records, simulate_action_cost
from tools.business_system_write import execute_action_write

# Authoritative MCP-Compatible Tool Registry (§15.1, task.md Phase 6)
# Exposes read and write tools over standardized JSON-RPC 2.0 / MCP interface

class MCPServer:
    def __init__(self):
        self.tools: Dict[str, Callable] = {}
        self.register_tool("get_inventory_item", get_inventory_item)
        self.register_tool("get_open_purchase_orders", get_open_purchase_orders)
        self.register_tool("get_supplier_sla", get_supplier_sla)
        self.register_tool("search_knowledge_records", search_knowledge_records)
        self.register_tool("simulate_action_cost", simulate_action_cost)
        self.register_tool("execute_action_write", execute_action_write)

    def register_tool(self, name: str, func: Callable) -> None:
        self.tools[name] = func

    def list_tools(self) -> List[str]:
        return list(self.tools.keys())

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if tool_name not in self.tools:
            raise ValueError(f"Tool not registered in MCP Server: {tool_name}")
        return self.tools[tool_name](**kwargs)

    def handle_jsonrpc(self, request_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handles MCP JSON-RPC 2.0 request frame
        """
        req_id = request_payload.get("id", 1)
        method = request_payload.get("method")
        params = request_payload.get("params", {})

        if method == "tools/list":
            return {"jsonrpc": "2.0", "id": req_id, "result": {"tools": self.list_tools()}}
        elif method == "tools/call":
            tool_name = params.get("name")
            tool_args = params.get("arguments", {})
            try:
                res = self.execute_tool(tool_name, **tool_args)
                return {"jsonrpc": "2.0", "id": req_id, "result": {"content": [{"type": "text", "text": json.dumps(res, default=str)}]}}
            except Exception as err:
                return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32603, "message": str(err)}}
        else:
            return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32601, "message": f"Method not found: {method}"}}

mcp_server = MCPServer()
