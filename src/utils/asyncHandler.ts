import { Request, Response, NextFunction, RequestHandler } from 'express';

// Wrap an async route/controller function and forward errors to next()
export function asyncHandler<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
>(
  fn: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => Promise<any>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return (req, res, next) => {
    Promise.resolve(fn(req as any, res as any, next)).catch(next);
  };
}
