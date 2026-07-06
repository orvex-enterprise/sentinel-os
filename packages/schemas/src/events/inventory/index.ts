import { z } from 'zod';

export const InventoryStockoutEventSchema = z.object({
  sku: z.string().min(1),
  warehouse_id: z.string().min(1),
  current_stock: z.number().int().nonnegative(),
  safety_stock_threshold: z.number().int().positive(),
  timestamp: z.string().datetime()
});

export type InventoryStockoutEvent = z.infer<typeof InventoryStockoutEventSchema>;

export const ReceivingDiscrepancyEventSchema = z.object({
  po_number: z.string().min(1),
  sku: z.string().min(1),
  expected_quantity: z.number().int().positive(),
  received_quantity: z.number().int().nonnegative(),
  discrepancy_percentage: z.number(),
  warehouse_id: z.string().min(1),
  timestamp: z.string().datetime()
});

export type ReceivingDiscrepancyEvent = z.infer<typeof ReceivingDiscrepancyEventSchema>;

export const SupplierDelayEventSchema = z.object({
  po_number: z.string().min(1),
  supplier_id: z.string().min(1),
  sku: z.string().min(1),
  original_delivery_date: z.string(),
  revised_delivery_date: z.string(),
  delay_days: z.number().int().positive(),
  timestamp: z.string().datetime()
});

export type SupplierDelayEvent = z.infer<typeof SupplierDelayEventSchema>;
