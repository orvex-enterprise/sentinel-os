import { z } from 'zod';

export const CaseStatusSchema = z.enum([
  'DETECTED',
  'INVESTIGATING',
  'PLAN_GENERATED',
  'AWAITING_APPROVAL',
  'APPROVED',
  'EXECUTING',
  'EXECUTION_FAILED',
  'CLOSED_SUCCESS',
  'CLOSED_REJECTED',
  'CLOSED_FAILED'
]);

export type CaseStatus = z.infer<typeof CaseStatusSchema>;
