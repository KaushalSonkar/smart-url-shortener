import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Unhandled server error:', err.stack || err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected error occurred on the server.';

  res.status(status).json({
    success: false,
    message,
    // Only expose stack trace in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
