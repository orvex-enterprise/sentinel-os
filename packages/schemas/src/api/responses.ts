import { z } from 'zod';
import { BusinessCaseSchema } from '../business-case';

export const CaseListResponseSchema = z.object({
  cases: z.array(BusinessCaseSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive()
});

export type CaseListResponse = z.infer<typeof CaseListResponseSchema>;

export const CaseDetailResponseSchema = z.object({
  case: BusinessCaseSchema
});

export type CaseDetailResponse = z.infer<typeof CaseDetailResponseSchema>;

export const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'error']),
  timestamp: z.string().datetime(),
  services: z.record(z.string(), z.string())
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
