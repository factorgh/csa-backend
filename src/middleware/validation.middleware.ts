import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

export const validateBody = (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction): void => {
  // Mark res as intentionally unused to satisfy noUnusedParameters
  void res;
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    next(Object.assign(new Error('Validation error'), { status: 422, details: error.details }));
    return;
  }
  req.body = value;
  next();
};

export const validateQuery = (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction): void => {
  // Mark res as intentionally unused to satisfy noUnusedParameters
  void res;
  const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) {
    next(Object.assign(new Error('Validation error'), { status: 422, details: error.details }));
    return;
  }
  req.query = value as any;
  next();
};
