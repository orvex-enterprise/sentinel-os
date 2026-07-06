import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
  token?: string;
}

let wss: WebSocketServer | null = null;

/**
 * Initialize WebSocket broadcast hub on HTTP server
 */
export function initWsServer(server: http.Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: ExtendedWebSocket, req) => {
    ws.isAlive = true;

    // Parse token from query string
    const url = req.url || '';
    const tokenMatch = url.match(/[?&]token=([^&]+)/);
    if (tokenMatch) {
      ws.token = tokenMatch[1];
    }

    console.log(`[WebSocket] Client connected (Token: ${ws.token || 'none'}, Total clients: ${wss?.clients.size})`);

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Math.floor(Date.now() / 1000) }));
        }
      } catch (e) {
        // Ignore malformed client frames
      }
    });

    ws.on('close', () => {
      console.log(`[WebSocket] Client disconnected (Total clients: ${wss?.clients.size || 0})`);
    });
  });

  // Heartbeat interval (15s per §23.2)
  const interval = setInterval(() => {
    if (!wss) return;
    wss.clients.forEach((ws) => {
      const extWs = ws as ExtendedWebSocket;
      if (!extWs.isAlive) {
        return extWs.terminate();
      }
      extWs.isAlive = false;
      extWs.ping();
    });
  }, 15000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log('[WebSocket] Hub initialized on path /ws');
  return wss;
}

/**
 * Authoritative helper to broadcast case state update to all connected UI clients (§23.2)
 */
export function broadcastCaseStateUpdate(data: {
  caseId: string;
  previousStatus: string;
  newStatus: string;
  nodeCompleted?: string;
  executionPlanSummary?: Record<string, any>;
}): void {
  if (!wss) {
    console.warn('[WebSocket] Cannot broadcast: WebSocket server not initialized');
    return;
  }

  const frame = JSON.stringify({
    event: 'CASE_STATE_UPDATED',
    timestamp: new Date().toISOString(),
    data,
  });

  let sentCount = 0;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(frame);
      sentCount++;
    }
  });

  console.log(`[WebSocket] Broadcast CASE_STATE_UPDATED for case ${data.caseId} (${data.previousStatus} -> ${data.newStatus}) to ${sentCount} clients`);
}
