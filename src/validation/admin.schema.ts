import Joi from 'joi';

export const reviewSchema = Joi.object({
  notes: Joi.string().allow('', null).optional()
});

export const approveSchema = Joi.object({
  expiresAt: Joi.date().optional()
});

export const rejectSchema = Joi.object({
  comment: Joi.string().required()
});

export const requestDocsSchema = Joi.object({
  docs: Joi.array().items(Joi.string()).required()
});

export const listAppsSchema = Joi.object({
  type: Joi.string().valid('PROVIDER', 'PROFESSIONAL', 'ESTABLISHMENT').optional(),
  status: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional()
});
