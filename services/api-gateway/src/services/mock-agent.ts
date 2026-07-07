import { updateCaseStatus, getCaseById } from './db';
import { broadcastCaseStateUpdate } from '../ws/hub';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Authoritative Mock/LLM Agent Responder
 * Uses Gemini if GEMINI_API_KEY is present, else falls back to mock logic.
 */
export class MockAgentResponder {
  public async onPlanApproved(caseId: string, approvedBy: string, comment?: string): Promise<void> {
    console.log(`[Agent] Plan approved for case ${caseId} by ${approvedBy}. Starting execution...`);

    setTimeout(async () => {
      try {
        const caseData = await getCaseById(caseId);
        if (!caseData || !caseData.executionPlan || !caseData.executionPlan.actions) return;

        let updated = await updateCaseStatus(caseId, 'EXECUTING', {
          actor: 'agent:execute:v1',
          actionPerformed: 'DISPATCHED_EXECUTION_PLAN',
          comment: `Executing ${caseData.executionPlan.actions.length} actions for case ${caseId}`,
        });

        if (updated) {
          broadcastCaseStateUpdate({
            caseId,
            previousStatus: 'APPROVED',
            newStatus: 'EXECUTING',
            nodeCompleted: 'execute_start',
            executionPlanSummary: updated.executionPlan,
          });
        }

        // Loop through actions to simulate agentic execution loop
        for (const action of caseData.executionPlan.actions) {
          // Simulate action delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          updated = await updateCaseStatus(caseId, 'EXECUTING', {
            actor: 'agent:execute:v1',
            actionPerformed: 'EXECUTED_ACTION',
            comment: `API Call Sent: [${action.actionType}] ${action.description} -> Expected: ${action.expectedOutcome}`,
          });

          if (updated) {
            broadcastCaseStateUpdate({
              caseId,
              previousStatus: 'EXECUTING',
              newStatus: 'EXECUTING',
              nodeCompleted: 'execute_step',
            });
          }
        }

        // Final completion step
        setTimeout(async () => {
          try {
            const resolved = await updateCaseStatus(caseId, 'CLOSED_SUCCESS', {
              actor: 'agent:record:v1',
              actionPerformed: 'VERIFIED_EXECUTION_SUCCESS',
              comment: `All action items executed and verified. Restored SLA.`,
            });

            if (resolved) {
              broadcastCaseStateUpdate({
                caseId,
                previousStatus: 'EXECUTING',
                newStatus: 'CLOSED_SUCCESS',
                nodeCompleted: 'record',
                executionPlanSummary: resolved.executionPlan,
              });
              console.log(`[Agent] Case ${caseId} transitioned to CLOSED_SUCCESS.`);
            }
          } catch (err: any) {
            console.error(`[Agent] Error resolving case ${caseId}:`, err.message);
          }
        }, 1500);
      } catch (err: any) {
        console.error(`[Agent] Error executing case ${caseId}:`, err.message);
      }
    }, 1000);
  }

  public async onEventIngested(caseId: string, sku: string): Promise<void> {
    console.log(`[Agent] Event ingested for SKU ${sku} (Case: ${caseId}).`);

    setTimeout(async () => {
      try {
        const caseData = await getCaseById(caseId);
        if (!caseData) return;

        let rca = caseData.rootCauseSummary || `### Root Cause Identified: Supplier Shipment Delay\n\n**Telemetry Analysis:** WMS sensors detected an unexpected drop in inbound receiving rates for **${sku}**.`;
        let plan = caseData.executionPlan || {
          planId: `PLAN-${Math.floor(1000 + Math.random() * 9000)}`,
          caseId,
          generatedBy: 'agent:plan:v1',
          timestamp: new Date().toISOString(),
          actions: [
            { actionKey: 'ACT-001', actionType: 'REALLOCATE', description: 'Reallocate 50 units from primary hub', riskLevel: 'LOW', expectedOutcome: 'Restores SLA instantly', requiresHumanApproval: false },
            { actionKey: 'ACT-002', actionType: 'EXPEDITE', description: 'Expedite incoming PO via air freight', riskLevel: 'MEDIUM', expectedOutcome: 'Replenishes buffer in 24h', requiresHumanApproval: true },
          ],
          contingencyStrategy: 'Reallocate stock from secondary distribution center',
          estimatedFinancialImpactUsd: 4250.00,
        };

        if (genAI) {
          try {
            console.log(`[Agent] Calling Gemini 1.5 Flash for Case ${caseId}...`);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
            const prompt = `You are an autonomous supply chain agent. An anomaly has been detected for SKU ${sku}. 
The statistical Z-Score indicates a ${caseData.severity} severity issue.
Generate a JSON response containing two fields:
1. "rootCauseSummary": A markdown formatted string explaining a realistic, highly technical root cause (e.g. ship stuck at port, hurricane, local strike). Make it sound professional and data-driven.
2. "executionPlan": An object containing:
   - "actions": an array of exactly 3 actionable steps. Each object must have: actionKey (string), actionType (string), description (string), riskLevel ('LOW'|'MEDIUM'|'HIGH'), expectedOutcome (string), requiresHumanApproval (boolean).
   - "contingencyStrategy": a string describing the backup plan.
   - "estimatedFinancialImpactUsd": a realistic number for the financial impact.`;
            
            const result = await model.generateContent(prompt);
            const jsonResult = JSON.parse(result.response.text());
            rca = jsonResult.rootCauseSummary;
            plan = {
              planId: `PLAN-GEN-${Math.floor(1000 + Math.random() * 9000)}`,
              caseId,
              generatedBy: 'agent:gemini:1.5-flash',
              timestamp: new Date().toISOString(),
              actions: jsonResult.executionPlan.actions,
              contingencyStrategy: jsonResult.executionPlan.contingencyStrategy,
              estimatedFinancialImpactUsd: jsonResult.executionPlan.estimatedFinancialImpactUsd
            };
            console.log(`[Agent] Gemini successfully generated plan for Case ${caseId}.`);
          } catch(e) {
            console.error("[Agent] Gemini LLM Error, falling back to mock data.", e);
          }
        } else {
            console.log("[Agent] No GEMINI_API_KEY found, using fallback simulated plan.");
        }

        // Transition DETECTED -> INVESTIGATING
        await updateCaseStatus(caseId, 'INVESTIGATING', {
          actor: 'agent:detect:v1',
          actionPerformed: 'STARTED_INVESTIGATION',
          comment: `Investigating telemetry for ${sku}`,
        });

        // Transition INVESTIGATING -> PLAN_GENERATED
        await updateCaseStatus(caseId, 'PLAN_GENERATED', {
          actor: 'agent:plan:v1',
          actionPerformed: 'GENERATED_EXECUTION_PLAN',
          comment: `Generated execution plan for ${sku}`,
          rootCauseSummary: rca,
          executionPlan: plan,
        });

        // Transition PLAN_GENERATED -> AWAITING_APPROVAL
        const updated = await updateCaseStatus(caseId, 'AWAITING_APPROVAL', {
          actor: 'agent:plan:v1',
          actionPerformed: 'GENERATED_EXECUTION_PLAN',
          comment: `Execution plan requires approval for ${sku}`,
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
              actionCount: plan.actions?.length || 0,
              riskLevel: 'MEDIUM',
              estimatedFinancialImpactUsd: plan.estimatedFinancialImpactUsd || 0,
            },
          });
        }
      } catch (err: any) {
        console.error(`[Agent] Error planning case ${caseId}:`, err.message);
      }
    }, 1500);
  }
}

export const mockAgentResponder = new MockAgentResponder();
