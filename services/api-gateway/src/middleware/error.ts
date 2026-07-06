import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Authoritative Express Error Handler Middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error(`[API Gateway Error] ${req.method} ${req.url}:`, err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.format(),
    });
    return;
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
}
