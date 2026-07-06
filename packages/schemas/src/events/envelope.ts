import { z } from 'zod';

export const EventEnvelopeSchema = z.object({
  event_id: z.string().uuid(),
  event_type: z.string().min(1),
  timestamp: z.string().datetime(),
  source_system: z.string().min(1),
  correlation_id: z.string().uuid(),
  payload: z.record(z.any()),
  version: z.string().default('1.0')
});

export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;
