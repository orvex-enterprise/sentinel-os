import { z } from 'zod';

export const ApprovalRequestSchema = z.object({
  operator_id: z.string().min(1),
  notes: z.string().optional()
});

export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;

export const RejectionRequestSchema = z.object({
  operator_id: z.string().min(1),
  reason: z.string().min(1),
  request_replanning: z.boolean().default(false)
});

export type RejectionRequest = z.infer<typeof RejectionRequestSchema>;

export const CreateEventRequestSchema = z.object({
  event_type: z.string().min(1),
  source_system: z.string().min(1),
  payload: z.record(z.any())
});

export type CreateEventRequest = z.infer<typeof CreateEventRequestSchema>;
