import http from 'http';
import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authMiddleware } from './middleware/auth';
import { idempotencyMiddleware } from './middleware/idempotency';
import { errorHandler } from './middleware/error';
import { casesRouter } from './routes/cases';
import { initWsServer, broadcastCaseStateUpdate } from './ws/hub';
import { redisClient } from './redis/client';
import { initConsumerGroup, consumeEvents, publishEvent } from './redis/stream';
import { getCaseById, createCaseFromEvent } from './services/db';
import { mockAgentResponder } from './services/mock-agent';

const PORT = process.env.PORT || 4000;
const app = express();

// Security and parser middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Idempotency middleware (§12.4)
app.use(idempotencyMiddleware);

// Health check endpoint (unauthenticated per §23.1 / docker-compose.yml)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: '@sentinel/api-gateway',
    timestamp: new Date().toISOString(),
    redis: redisClient.status === 'ready' ? 'connected' : 'disconnected',
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: '@sentinel/api-gateway',
    timestamp: new Date().toISOString(),
  });
});

// Authentication middleware (§12.2)
app.use('/api/v1', authMiddleware);

// Routes (§23.1)
app.use('/api/v1/cases', casesRouter);

// Global Simulation State for Demo
export let isSystemSimulationActive = true;

app.post('/api/v1/system/simulation', (req, res) => {
  isSystemSimulationActive = req.body.active === true;
  console.log(`[System] Simulation active state changed to: ${isSystemSimulationActive}`);
  res.status(200).json({ success: true, active: isSystemSimulationActive });
});

// Error handling middleware
app.use(errorHandler);

const server = http.createServer(app);

// Initialize WebSocket Hub (§23.2)
initWsServer(server);

// Start HTTP Server
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, async () => {
    console.log(`==========================================================`);
    console.log(`[Sentinel API Gateway] Running on port ${PORT}`);
    console.log(`[Sentinel API Gateway] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[Sentinel API Gateway] WebSocket Hub: ws://localhost:${PORT}/ws`);
    console.log(`==========================================================`);

    // Initialize Redis Stream Consumer Group (§15.1, Day 17-18)
    try {
      await initConsumerGroup(redisClient);
      
      // Start background event consumption loop
      consumeEvents(redisClient, async (messageId, envelope) => {
        
        // If simulation is paused, drop auto-generated simulator events to prevent spam
        if (!isSystemSimulationActive && envelope.source_system === 'simulator:wms:v1') {
          // Returning early without throwing will cause xack to run in consumeEvents, dropping it safely.
          return;
        }

        console.log(`[Stream Consumer] Processing event ${messageId} (${envelope.event_type}) from ${envelope.source_system}`);
        
        const caseId = envelope.correlation_id;
        let existing = await getCaseById(caseId);
        if (!existing) {
          const createdId = await createCaseFromEvent(envelope);
          existing = await getCaseById(createdId);
        }

        // Broadcast WebSocket notification to UI
        if (existing) {
          broadcastCaseStateUpdate({
            caseId: existing.id,
            previousStatus: 'DETECTED',
            newStatus: existing.status,
            nodeCompleted: 'monitor_detect',
          });

          // Trigger mock agent loop if standalone
          mockAgentResponder.onEventIngested(existing.id, existing.sku);
        }
      }).catch((err) => {
        console.error('[Stream Consumer] Loop terminated with error:', err.message);
      });
      
      // Embedded Auto-Simulator for Demo
      setInterval(async () => {
        if (!isSystemSimulationActive) return;
        
        try {
          const skus = ['SKU-9942', 'SKU-3101', 'SKU-7821', 'SKU-4410', 'SKU-8829'];
          const randomSku = skus[Math.floor(Math.random() * skus.length)];
          const mockEnvelope = {
            event_id: crypto.randomUUID(),
            event_type: 'simulator.auto.event',
            timestamp: new Date().toISOString(),
            source_system: 'simulator:embedded',
            correlation_id: crypto.randomUUID(),
            payload: {
              sku: randomSku,
              z_score: 2.0 + Math.random() * 2.5,
              root_cause_hint: `Auto-generated simulation event for ${randomSku}`
            }
          };
          
          await publishEvent(redisClient, mockEnvelope);
        } catch (e: any) {
          console.warn('[Embedded Simulator] Failed to publish:', e.message);
        }
      }, 30000); // Every 30 seconds

    } catch (err: any) {
      console.warn('[Stream Consumer] Redis stream initialization skipped (Redis offline):', err.message);
    }
  });
}

export default app;
export { server };
