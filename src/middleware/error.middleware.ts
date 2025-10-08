import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
};

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || undefined;
  const payload: any = {
    success: false,
    message,
    details,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  };
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('ErrorHandler:', err);
    if (err.stack) payload.stack = err.stack;
  }
  res.status(status).json(payload);
};
