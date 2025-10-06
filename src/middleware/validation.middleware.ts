import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

export const validateBody = (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    res.status(422).json({ success: false, message: 'Validation error', details: error.details });
    return;
  }
  req.body = value;
  next();
};

export const validateQuery = (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) {
    res.status(422).json({ success: false, message: 'Validation error', details: error.details });
    return;
  }
  req.query = value as any;
  next();
};
