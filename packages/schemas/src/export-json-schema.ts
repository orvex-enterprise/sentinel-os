import fs from 'fs';
import path from 'path';
import { zodToJsonSchema } from 'zod-to-json-schema';
import * as schemas from './index';

const outputDir = path.resolve(__dirname, '../../generated/json-schema');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const schemaMap: Record<string, any> = {
  EventEnvelope: schemas.EventEnvelopeSchema,
  InventoryStockoutEvent: schemas.InventoryStockoutEventSchema,
  ReceivingDiscrepancyEvent: schemas.ReceivingDiscrepancyEventSchema,
  SupplierDelayEvent: schemas.SupplierDelayEventSchema,
  CaseStatus: schemas.CaseStatusSchema,
  AnomalyEvent: schemas.AnomalyEventSchema,
  RootCauseAnalysis: schemas.RootCauseAnalysisSchema,
  Action: schemas.ActionSchema,
  ExecutionPlan: schemas.ExecutionPlanSchema,
  AuditRecord: schemas.AuditRecordSchema,
  BusinessCase: schemas.BusinessCaseSchema,
  ApprovalRequest: schemas.ApprovalRequestSchema,
  RejectionRequest: schemas.RejectionRequestSchema,
  CreateEventRequest: schemas.CreateEventRequestSchema,
  CaseListResponse: schemas.CaseListResponseSchema,
  CaseDetailResponse: schemas.CaseDetailResponseSchema,
  HealthResponse: schemas.HealthResponseSchema
};

for (const [name, schema] of Object.entries(schemaMap)) {
  const jsonSchema = zodToJsonSchema(schema, name);
  const filePath = path.join(outputDir, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(jsonSchema, null, 2), 'utf-8');
  console.log(`Exported JSON Schema: ${name}.json`);
}
