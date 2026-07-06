import Redis from 'ioredis';
import { EventEnvelopeSchema, EventEnvelope } from '@sentinel/schemas';

export const STREAM_NAME = 'sentinel:events:inventory';
export const CONSUMER_GROUP = 'sentinel-stream-group';
export const CONSUMER_NAME = `gateway-worker-${process.pid || '1'}`;

/**
 * Authoritative helper to publish an event envelope into Redis Stream
 */
export async function publishEvent(client: Redis, envelope: EventEnvelope): Promise<string> {
  // Enforce Zod validation on outbound envelope
  const validated = EventEnvelopeSchema.parse(envelope);
  const payloadStr = JSON.stringify(validated);
  
  const messageId = await client.xadd(STREAM_NAME, '*', 'payload', payloadStr);
  console.log(`[Redis Stream] Published event ${validated.event_type} (${validated.event_id}) -> ID: ${messageId}`);
  return messageId || 'unknown_stream_id';
}

/**
 * Authoritative helper to initialize Redis consumer group
 */
export async function initConsumerGroup(client: Redis): Promise<void> {
  try {
    await client.xgroup('CREATE', STREAM_NAME, CONSUMER_GROUP, '$', 'MKSTREAM');
    console.log(`[Redis Stream] Created consumer group ${CONSUMER_GROUP} on ${STREAM_NAME}`);
  } catch (err: any) {
    if (err.message && err.message.includes('BUSYGROUP')) {
      // Consumer group already exists, which is normal on restarts
      console.log(`[Redis Stream] Consumer group ${CONSUMER_GROUP} already exists.`);
    } else {
      console.error(`[Redis Stream] Failed to init consumer group:`, err.message);
    }
  }
}

/**
 * Authoritative helper to consume events from Redis Stream
 */
export async function consumeEvents(
  client: Redis,
  onMessage: (messageId: string, envelope: EventEnvelope) => Promise<void>,
  shouldContinue: () => boolean = () => true
): Promise<void> {
  while (shouldContinue()) {
    try {
      const response = await client.xreadgroup(
        'GROUP',
        CONSUMER_GROUP,
        CONSUMER_NAME,
        'COUNT',
        10,
        'BLOCK',
        2000,
        'STREAMS',
        STREAM_NAME,
        '>'
      ) as any;

      if (!response || response.length === 0) {
        continue;
      }

      for (const stream of response) {
        const messages = stream[1];
        for (const message of messages) {
          const messageId = message[0];
          const fields = message[1];
          
          let payloadStr = '';
          for (let i = 0; i < fields.length; i += 2) {
            if (fields[i] === 'payload') {
              payloadStr = fields[i + 1];
              break;
            }
          }

          if (!payloadStr) {
            console.warn(`[Redis Stream] Message ${messageId} missing payload field. Acknowledging and skipping.`);
            await client.xack(STREAM_NAME, CONSUMER_GROUP, messageId);
            continue;
          }

          try {
            const rawJson = JSON.parse(payloadStr);
            const parseResult = EventEnvelopeSchema.safeParse(rawJson);
            
            if (!parseResult.success) {
              console.error(`[Redis Stream] Message ${messageId} failed Zod envelope validation:`, parseResult.error.format());
              // Move to DLQ or acknowledge to avoid poison pill loop (§15.1)
              await client.xack(STREAM_NAME, CONSUMER_GROUP, messageId);
              continue;
            }

            await onMessage(messageId, parseResult.data);
            await client.xack(STREAM_NAME, CONSUMER_GROUP, messageId);
          } catch (handlerErr: any) {
            console.error(`[Redis Stream] Error processing message ${messageId}:`, handlerErr.message);
            // Leave unacknowledged for retry/DLQ worker
          }
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Connection is closed')) {
        break;
      }
      console.error('[Redis Stream] Consumer loop error:', err.message);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
