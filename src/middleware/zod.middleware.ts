import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateZodBody = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.errors.map((e: any) => ({ path: e.path.join('.'), message: e.message }));
    return res.status(422).json({ success: false, message: 'Validation error', details });
  }
  req.body = result.data as any;
  return next();
};
