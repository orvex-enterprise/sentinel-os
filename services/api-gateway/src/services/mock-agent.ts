import { updateCaseStatus } from './db';
import { broadcastCaseStateUpdate } from '../ws/hub';

/**
 * Authoritative Mock Agent Responder (§15.1, task.md Phase 3)
 * Simulates LangGraph orchestration node execution when running standalone or in integration tests
 */
export class MockAgentResponder {
  /**
   * Called when operator approves an execution plan via POST /api/v1/cases/:id/approve
   * Simulates execute -> record -> improve nodes per §22.2
   */
  public async onPlanApproved(caseId: string, approvedBy: string, comment?: string): Promise<void> {
    console.log(`[Mock Agent] Plan approved for case ${caseId} by ${approvedBy}. Starting execution simulation...`);

    // Step 1: Transition to EXECUTING (after 1000ms delay simulating worker pickup)
    setTimeout(async () => {
      try {
        const updated = await updateCaseStatus(caseId, 'EXECUTING', {
          actor: 'agent:execute:v1',
          actionPerformed: 'DISPATCHED_EXECUTION_PLAN',
          comment: `Executing actions for case ${caseId}`,
        });

        if (updated) {
          broadcastCaseStateUpdate({
            caseId,
            previousStatus: 'APPROVED',
            newStatus: 'EXECUTING',
            nodeCompleted: 'execute_start',
            executionPlanSummary: updated.executionPlan,
          });
          console.log(`[Mock Agent] Case ${caseId} transitioned to EXECUTING.`);
        }

        // Step 2: Transition to CLOSED_SUCCESS (after another 2000ms simulating tool I/O)
        setTimeout(async () => {
          try {
            const resolved = await updateCaseStatus(caseId, 'CLOSED_SUCCESS', {
              actor: 'agent:record:v1',
              actionPerformed: 'VERIFIED_EXECUTION_SUCCESS',
              comment: `All action items executed and verified. Restored inventory SLA.`,
            });

            if (resolved) {
              broadcastCaseStateUpdate({
                caseId,
                previousStatus: 'EXECUTING',
                newStatus: 'CLOSED_SUCCESS',
                nodeCompleted: 'record',
                executionPlanSummary: resolved.executionPlan,
              });
              console.log(`[Mock Agent] Case ${caseId} transitioned to CLOSED_SUCCESS.`);
            }
          } catch (err: any) {
            console.error(`[Mock Agent] Error resolving case ${caseId}:`, err.message);
          }
        }, 2000);
      } catch (err: any) {
        console.error(`[Mock Agent] Error executing case ${caseId}:`, err.message);
      }
    }, 1000);
  }

  /**
   * Called when a new anomaly event arrives via Redis stream or POST /api/v1/cases/:id/events
   * Simulates detect -> investigate -> plan nodes per §22.2
   */
  public async onEventIngested(caseId: string, sku: string): Promise<void> {
    console.log(`[Mock Agent] Event ingested for SKU ${sku} (Case: ${caseId}). Simulating investigate -> plan...`);

    setTimeout(async () => {
      try {
        const rca = `### Root Cause Identified: Supplier Shipment Delay\n\n**Telemetry Analysis:** WMS sensors detected an unexpected drop in inbound receiving rates for **${sku}**. Historical transit data indicates a **94.2% probability** of stockout within 48 hours without intervention.\n\n* **Primary Factor:** Carrier bottleneck at regional sorting facility.\n* **Secondary Factor:** Demand spike (+18% above seasonal baseline).\n\n**Recommended Action:** Execute emergency PO expedite and re-route safety stock from secondary distribution center.`;

        const plan = {
          planId: `PLAN-${Math.floor(1000 + Math.random() * 9000)}`,
          caseId,
          generatedBy: 'agent:plan:v1',
          timestamp: new Date().toISOString(),
          actions: [
            {
              actionKey: `act_${sku}_expedite`,
              actionType: 'PO_EXPEDITE',
              description: `Expedite emergency replenishment order for ${sku}`,
              targetSku: sku,
              parameters: { poId: `PO-${Math.floor(1000 + Math.random() * 9000)}`, expediteFeeUsd: 450 },
              riskLevel: 'MEDIUM',
              expectedOutcome: 'Delivery advanced by 3 days',
              requiresHumanApproval: true,
            },
            {
              actionKey: `act_${sku}_reallocate`,
              actionType: 'SAFETY_STOCK_ADJUST',
              description: `Re-route backup inventory from Regional Hub Beta for ${sku}`,
              targetSku: sku,
              parameters: { sourceWarehouse: 'WH-002', qty: 50 },
              riskLevel: 'LOW',
              expectedOutcome: 'Safety stock buffered',
              requiresHumanApproval: false,
            },
          ],
          contingencyStrategy: 'Reallocate stock from secondary distribution center',
          estimatedFinancialImpactUsd: 4250.00,
        };

        // Step 1: Transition DETECTED -> INVESTIGATING
        await updateCaseStatus(caseId, 'INVESTIGATING', {
          actor: 'agent:detect:v1',
          actionPerformed: 'STARTED_INVESTIGATION',
          comment: `Investigating telemetry for ${sku}`,
        });

        // Step 2: Transition INVESTIGATING -> PLAN_GENERATED
        await updateCaseStatus(caseId, 'PLAN_GENERATED', {
          actor: 'agent:plan:v1',
          actionPerformed: 'GENERATED_EXECUTION_PLAN',
          comment: `Generated emergency PO expedite plan for ${sku}`,
          rootCauseSummary: rca,
          executionPlan: plan,
        });

        // Step 3: Transition PLAN_GENERATED -> AWAITING_APPROVAL
        const updated = await updateCaseStatus(caseId, 'AWAITING_APPROVAL', {
          actor: 'agent:plan:v1',
          actionPerformed: 'GENERATED_EXECUTION_PLAN',
          comment: `Generated emergency PO expedite plan for ${sku}`,
          rootCauseSummary: rca,
          executionPlan: plan,
        });

        if (updated) {
          broadcastCaseStateUpdate({
            caseId,
            previousStatus: 'DETECTED',
            newStatus: 'AWAITING_APPROVAL',
            nodeCompleted: 'plan',
            executionPlanSummary: {
              actionCount: 2,
              riskLevel: 'MEDIUM',
              estimatedFinancialImpactUsd: 4250.00,
            },
          });
          console.log(`[Mock Agent] Case ${caseId} transitioned to AWAITING_APPROVAL with execution plan.`);
        }
      } catch (err: any) {
        console.error(`[Mock Agent] Error planning case ${caseId}:`, err.message);
      }
    }, 1500);
  }
}

export const mockAgentResponder = new MockAgentResponder();
